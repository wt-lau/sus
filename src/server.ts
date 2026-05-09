import { Agent, getAgentByName } from "agents";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  createMcpHandler,
  WorkerTransport,
  type TransportState
} from "agents/mcp";
import { z } from "zod";
import {
  ExaAnswerError,
  ExaSourceSearchError,
  answerQuestionWithExa,
  searchTopicSourcesWithExa,
  type ExaAnswerCitation,
  type ExaSourceSearch
} from "./exa";
import {
  answerQuestion,
  createInitialGameState,
  createRound,
  finishScoredRound,
  getRemainingCards,
  listTopics,
  normalizeScore,
  normalizeCardId,
  recordScoreQuestion,
  recordWrongGuess,
  revealRound,
  startScoredRound,
  toPublicRound,
  type CardId,
  type GeneratedImageAsset,
  type GameState,
  type Round
} from "./game";
import {
  SUS_WIDGET_HTML,
  SUS_WIDGET_MIME_TYPE,
  SUS_WIDGET_URI
} from "./widget";
import {
  AuthChallengeError,
  AuthConfigurationError,
  OAUTH_PROTECTED_RESOURCE_PATH,
  createAuthErrorResponse,
  createProtectedResourceMetadataResponse,
  getToolSecuritySchemes,
  playerDurableObjectName,
  readTrustedPlayerIdentity,
  requestWithPlayerIdentity,
  resolvePlayerIdentity,
  type PlayerIdentity
} from "./auth";
import {
  getLeaderboard,
  persistCompletedRoundScore,
  type PersistedRoundScore
} from "./leaderboard";

const gameViewOutputSchema = z.object({}).passthrough();
const MCP_PATH = "/mcp";
const MCP_TRANSPORT_STATE_KEY = "mcp-transport-state";
const PLAYER_IDENTITY_STATE_KEY = "player-identity";
const WORKERS_AI_IMAGE_MODEL = "@cf/black-forest-labs/flux-1-schnell";
const susWidgetResourceMeta = {
  ui: {
    prefersBorder: true,
    csp: {
      connectDomains: [],
      resourceDomains: [
        "https://fonts.googleapis.com",
        "https://fonts.gstatic.com"
      ]
    }
  },
  "openai/widgetDescription":
    "Interactive Sus game board for choosing a topic, comparing five source cards, accusing the false spin, and reviewing the reveal.",
  "openai/widgetPrefersBorder": true,
  "openai/widgetCSP": {
    connect_domains: [],
    resource_domains: [
      "https://fonts.googleapis.com",
      "https://fonts.gstatic.com"
    ]
  }
};

const sourceSeedSchema = z.object({
  sourceName: z.string().min(1).max(120),
  sourceType: z.string().min(1).max(120),
  headline: z.string().min(1).max(180),
  claim: z.string().min(1).max(420),
  excerpt: z.string().min(1).max(520),
  published: z.string().min(1).max(80).optional(),
  credibilitySignal: z.string().min(1).max(280).optional(),
  url: z.string().url().max(500).optional()
});
const sourcesInputSchema = z
  .array(sourceSeedSchema)
  .length(5)
  .optional()
  .describe(
    "Exactly five source cards gathered for the topic. Sus will keep four truthful and add a minor false spin to one."
  );

function jsonResponse(value: Record<string, unknown>, text?: string) {
  return {
    structuredContent: value,
    content: [
      {
        type: "text" as const,
        text: text ?? JSON.stringify(value, null, 2)
      }
    ]
  };
}

function widgetToolMeta(invoking: string, invoked: string) {
  return {
    ui: {
      resourceUri: SUS_WIDGET_URI,
      visibility: ["model", "app"]
    },
    "openai/outputTemplate": SUS_WIDGET_URI,
    "openai/widgetAccessible": true,
    "openai/toolInvocation/invoking": invoking,
    "openai/toolInvocation/invoked": invoked
  };
}

function dataToolMeta(invoking: string, invoked: string) {
  return {
    ui: {
      visibility: ["model", "app"]
    },
    "openai/widgetAccessible": true,
    "openai/toolInvocation/invoking": invoking,
    "openai/toolInvocation/invoked": invoked
  };
}

function appOnlyDataToolMeta(invoking: string, invoked: string) {
  return {
    ...dataToolMeta(invoking, invoked),
    ui: {
      visibility: ["app"]
    }
  };
}

function withToolSecuritySchemes(env: Env, meta: Record<string, unknown>) {
  return {
    ...meta,
    securitySchemes: getToolSecuritySchemes(env)
  };
}

function noRoundResponse() {
  return jsonResponse({
    status: "idle",
    message: "No game is active. Call start_game to begin.",
    nextActions: ["list_topics", "start_game"]
  });
}

function publicPlayerProfile(player?: PlayerIdentity | null) {
  if (!player) return null;

  return {
    displayName: player.displayName,
    source: player.source,
    signedIn: player.source === "oauth"
  };
}

function welcomeResponse(
  state: GameState,
  prefillTopic?: string,
  player?: PlayerIdentity | null
) {
  const playerProfile = publicPlayerProfile(player);
  const welcomeName =
    playerProfile && playerProfile.source !== "session"
      ? playerProfile.displayName
      : "";

  return jsonResponse({
    status: "welcome",
    message: welcomeName
      ? `Welcome, ${welcomeName}. Enter a topic to open a new case file.`
      : "Sus is ready. Enter a topic to open a new case file.",
    player: playerProfile,
    session: state.session,
    score: state.score,
    prefillTopic: prefillTopic?.trim() || "",
    suggestedTopics: listTopics(),
    nextActions: [
      "Enter a topic in the widget.",
      "Or call start_round with a topic."
    ]
  });
}

function createSession() {
  return {
    id: crypto.randomUUID(),
    startedAt: new Date().toISOString()
  };
}

function isMcpPath(pathname: string) {
  return pathname === MCP_PATH || pathname.startsWith(`${MCP_PATH}/`);
}

async function isMcpInitializeRequest(request: Request) {
  if (request.method !== "POST") return false;

  try {
    const payload = await request.clone().json();
    const messages = Array.isArray(payload) ? payload : [payload];
    return messages.some((message) => message?.method === "initialize");
  } catch {
    return false;
  }
}

type RoundPreparation =
  | {
      round: ReturnType<typeof createRound>;
      sourceSearch: {
        mode: "starter-pack" | "provided-sources";
      };
    }
  | {
      round: ReturnType<typeof createRound>;
      sourceSearch: {
        mode: "exa";
        requestId?: string;
        query: string;
      };
    };

async function prepareRound(
  topic: string | undefined,
  sources: z.infer<typeof sourcesInputSchema>,
  env: Env
): Promise<RoundPreparation> {
  if (sources) {
    return {
      round: createRound(topic, sources),
      sourceSearch: { mode: "provided-sources" }
    };
  }

  const requestedTopic = topic?.trim();
  if (!requestedTopic) {
    return {
      round: createRound(),
      sourceSearch: { mode: "starter-pack" }
    };
  }

  const apiKey = env.EXA_API_KEY?.trim();
  if (!apiKey) {
    throw new ExaSourceSearchError(
      "EXA_API_KEY is not configured. Add it as a Cloudflare secret or local .dev.vars value before starting topic-based rounds."
    );
  }

  const sourceSearch = await searchTopicSourcesWithExa(requestedTopic, apiKey);

  return {
    round: createRound(requestedTopic, sourceSearch.sources, "exa"),
    sourceSearch: exaSearchMeta(sourceSearch)
  };
}

function exaSearchMeta(sourceSearch: ExaSourceSearch) {
  return {
    mode: "exa" as const,
    requestId: sourceSearch.requestId,
    query: sourceSearch.query
  };
}

function exaErrorResponse(error: unknown, topic?: string) {
  if (error instanceof ExaSourceSearchError) {
    return jsonResponse({
      status: "exa-search-failed",
      message: error.message,
      topic: topic?.trim() || null,
      exa: {
        status: error.status,
        details: error.details
      },
      nextActions: [
        "Set EXA_API_KEY and retry the topic.",
        "Or pass exactly five source cards with the sources input."
      ]
    });
  }

  throw error;
}

async function answerRoundQuestion(
  round: Round,
  question: string,
  eliminatedIds: CardId[],
  apiKey: string | undefined
) {
  const localAnswer = answerQuestion(round, question, eliminatedIds);
  const remainingCards = getRemainingCards(round, eliminatedIds);

  if (!apiKey?.trim()) {
    return localAnswer;
  }

  try {
    const exaAnswer = await answerQuestionWithExa(
      {
        topic: round.requestedTopic ?? round.topic,
        question,
        remainingCards
      },
      apiKey
    );

    return {
      ...localAnswer,
      summary: exaAnswer.answer,
      source: "exa-answer" as const,
      citations: exaAnswer.citations,
      exa: {
        query: exaAnswer.query,
        citationCount: exaAnswer.citations.length
      }
    };
  } catch (error) {
    return {
      ...localAnswer,
      source: "exa-answer-fallback" as const,
      exa: exaAnswerErrorMeta(error)
    };
  }
}

function exaAnswerErrorMeta(error: unknown) {
  if (error instanceof ExaAnswerError) {
    return {
      status: error.status,
      details: error.details,
      message: error.message
    };
  }

  return {
    message: error instanceof Error ? error.message : "Unknown Exa Answer error"
  };
}

function questionCitationRecords(citations?: ExaAnswerCitation[]) {
  return citations?.slice(0, 5).map((citation) => ({
    title: citation.title,
    url: citation.url,
    published: citation.published
  }));
}

function normalizeAssetPrompt(value: string) {
  return value.replace(/\s+/g, " ").trim().slice(0, 2048);
}

function buildRoundImagePrompt(
  round: Round,
  state: GameState,
  customPrompt?: string
) {
  const remainingCards = getRemainingCards(round, state.eliminatedIds);
  return normalizeAssetPrompt(
    [
      "Create a custom illustration for Sus, a source-checking game where five credible source cards hide one subtle false spin.",
      `Topic: ${round.topic}.`,
      `Round direction: ${customPrompt?.trim() || round.artPrompt}.`,
      `Current state: ${state.status}; ${remainingCards.length} suspect cards remain.`,
      "Show an investigative tabletop board with five paper source cards, evidence marks, and one visually suspicious card.",
      "Do not include readable body text, real logos, public figures, or photorealistic documents."
    ].join(" ")
  );
}

type WorkersAiImageResponse = {
  image?: string;
};

async function generateRoundImageAsset(
  round: Round,
  state: GameState,
  env: Env,
  customPrompt?: string
): Promise<GeneratedImageAsset> {
  const prompt = buildRoundImagePrompt(round, state, customPrompt);
  const seed = Math.floor(Math.random() * 1_000_000_000);
  const result = (await env.AI.run(WORKERS_AI_IMAGE_MODEL, {
    prompt,
    seed,
    steps: 4
  })) as WorkersAiImageResponse;

  if (!result.image) {
    throw new Error("Workers AI did not return an image payload.");
  }

  return {
    id: crypto.randomUUID(),
    type: "image",
    url: `data:image/jpeg;charset=utf-8;base64,${result.image}`,
    mimeType: "image/jpeg",
    model: WORKERS_AI_IMAGE_MODEL,
    prompt,
    seed,
    generatedAt: new Date().toISOString()
  };
}

function assetErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Unknown Workers AI image generation error";
}

export class SusGameMcp extends Agent<Env, GameState> {
  server = this.createServer();

  initialState: GameState = createInitialGameState();
  private toolsRegistered = false;
  private transport = this.createTransport();
  private playerIdentity: PlayerIdentity | null = null;

  private createServer() {
    return new McpServer({
      name: "sus-source-checking-game",
      version: "0.1.0"
    });
  }

  private createTransport() {
    return new WorkerTransport({
      sessionIdGenerator: () => this.name,
      storage: {
        get: () =>
          this.ctx.storage.get<TransportState>(MCP_TRANSPORT_STATE_KEY),
        set: (state) => this.ctx.storage.put(MCP_TRANSPORT_STATE_KEY, state)
      }
    });
  }

  private async prepareTransportForRequest(request: Request) {
    if (!(await isMcpInitializeRequest(request))) return;

    const transportState = await this.ctx.storage.get<TransportState>(
      MCP_TRANSPORT_STATE_KEY
    );
    if (!transportState?.initialized) return;

    await this.ctx.storage.delete(MCP_TRANSPORT_STATE_KEY);
    this.server = this.createServer();
    this.toolsRegistered = false;
    this.transport = this.createTransport();
  }

  private dataToolMeta(invoking: string, invoked: string) {
    return withToolSecuritySchemes(this.env, dataToolMeta(invoking, invoked));
  }

  private appOnlyDataToolMeta(invoking: string, invoked: string) {
    return withToolSecuritySchemes(
      this.env,
      appOnlyDataToolMeta(invoking, invoked)
    );
  }

  private widgetToolMeta(invoking: string, invoked: string) {
    return withToolSecuritySchemes(this.env, widgetToolMeta(invoking, invoked));
  }

  private async syncPlayerIdentity(request: Request) {
    const requestPlayer = readTrustedPlayerIdentity(request);
    if (requestPlayer) {
      this.playerIdentity = requestPlayer;
      await this.ctx.storage.put(PLAYER_IDENTITY_STATE_KEY, requestPlayer);
      return requestPlayer;
    }

    if (!this.playerIdentity) {
      this.playerIdentity =
        (await this.ctx.storage.get<PlayerIdentity>(
          PLAYER_IDENTITY_STATE_KEY
        )) ?? null;
    }

    return this.playerIdentity;
  }

  private async getPlayerIdentity() {
    if (this.playerIdentity) return this.playerIdentity;

    this.playerIdentity = (await this.ctx.storage.get<PlayerIdentity>(
      PLAYER_IDENTITY_STATE_KEY
    )) ?? {
      id: this.name,
      displayName: "Guest player",
      source: "session"
    };

    return this.playerIdentity;
  }

  private async persistScore(score: GameState["score"]) {
    try {
      const player = await this.getPlayerIdentity();
      return await persistCompletedRoundScore(this.env.SUS_DB, player, score);
    } catch (error) {
      return {
        persisted: false,
        reason:
          error instanceof Error
            ? error.message
            : "Leaderboard score could not be persisted."
      } satisfies PersistedRoundScore;
    }
  }

  private async leaderboardResponse(limit?: number) {
    const player = await this.getPlayerIdentity();

    try {
      const leaderboard = await getLeaderboard(
        this.env.SUS_DB,
        player.id,
        limit
      );

      return jsonResponse({
        status: "leaderboard-ready",
        view: "leaderboard",
        message: "Leaderboard widget is ready.",
        player,
        score: normalizeScore(this.state.score),
        suggestedTopics: listTopics(),
        leaderboard,
        nextActions: ["Start another round to climb the leaderboard."]
      });
    } catch (error) {
      return jsonResponse({
        status: "leaderboard-unavailable",
        view: "leaderboard",
        message:
          error instanceof Error
            ? error.message
            : "Leaderboard is unavailable.",
        player,
        score: normalizeScore(this.state.score),
        suggestedTopics: listTopics(),
        nextActions: [
          "Apply the D1 migrations.",
          "Then finish a round to create a leaderboard entry."
        ]
      });
    }
  }

  async onRequest(request: Request) {
    await this.syncPlayerIdentity(request);
    await this.prepareTransportForRequest(request);

    if (!this.toolsRegistered) {
      await this.init();
      this.toolsRegistered = true;
    }

    return createMcpHandler(this.server, {
      route: MCP_PATH,
      transport: this.transport
    })(request, this.env, this.ctx as unknown as ExecutionContext);
  }

  async init() {
    this.server.registerResource(
      "sus-source-card-widget",
      SUS_WIDGET_URI,
      {
        title: "Sus source cards",
        description: "Interactive HTML UI for the Sus source-card game.",
        mimeType: SUS_WIDGET_MIME_TYPE,
        _meta: susWidgetResourceMeta
      },
      async () => ({
        contents: [
          {
            uri: SUS_WIDGET_URI,
            mimeType: SUS_WIDGET_MIME_TYPE,
            text: SUS_WIDGET_HTML,
            _meta: susWidgetResourceMeta
          }
        ]
      })
    );

    this.server.registerTool(
      "get_rules",
      {
        title: "Get Sus rules",
        description: "Explain how to play Sus, the source-checking game.",
        inputSchema: {},
        outputSchema: gameViewOutputSchema,
        annotations: {
          readOnlyHint: true,
          destructiveHint: false,
          openWorldHint: false,
          idempotentHint: true
        },
        _meta: this.dataToolMeta("Loading rules", "Rules ready")
      },
      async () =>
        jsonResponse({
          name: "Sus",
          tagline: "Four truths. One lie. Find the sus source.",
          rules: [
            "Start with start_game. It creates a stateful game session and renders the welcome screen.",
            "Choose a topic from the welcome screen, then start_round deals five source cards.",
            "Four cards are truthful. One card is the lie.",
            "Guess the lie with guess_sus_source.",
            "If you pick a truthful card, that card is cleared and you can keep guessing.",
            "Use ask_question only when you want an optional source-quality clue.",
            "Use start_round for another round inside the same session."
          ],
          starterNote:
            "Topic-based rounds search Exa server-side. Bundled starters remain available when no topic is supplied."
        })
    );

    this.server.registerTool(
      "list_topics",
      {
        title: "List starter topics",
        description: "Show the bundled Sus starter topics available locally.",
        inputSchema: {},
        outputSchema: gameViewOutputSchema,
        annotations: {
          readOnlyHint: true,
          destructiveHint: false,
          openWorldHint: false,
          idempotentHint: true
        },
        _meta: this.dataToolMeta("Loading topics", "Topics ready")
      },
      async () =>
        jsonResponse({
          topics: listTopics(),
          note: "Use these as suggested welcome topics, or pass any topic to start_round to search Exa. Calling start_round without a topic is reserved for local starter-pack demos."
        })
    );

    this.server.registerTool(
      "start_game",
      {
        title: "Start Sus game",
        description:
          "Use this when the user asks ChatGPT to create a Sus session. Start a stateful game and render the welcome UI where the user chooses a topic. Do not deal source cards from this tool.",
        inputSchema: {
          topic: z
            .string()
            .min(1)
            .max(80)
            .optional()
            .describe(
              "Optional topic to prefill in the welcome screen. This does not start a round."
            ),
          restart: z
            .boolean()
            .optional()
            .describe(
              "Set true to abandon the active session and start a fresh game."
            )
        },
        outputSchema: gameViewOutputSchema,
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: false
        },
        _meta: this.widgetToolMeta("Opening Sus", "Sus ready")
      },
      async ({ restart, topic }) => {
        if (
          this.state.session &&
          this.state.round &&
          this.state.status === "active" &&
          !restart
        ) {
          return jsonResponse({
            status: "already-active",
            message:
              "A Sus game session is already active for this MCP client.",
            session: this.state.session,
            round: toPublicRound(this.state.round, this.state),
            score: this.state.score,
            nextActions: [
              "Call guess_sus_source with the card ID you think is lying."
            ]
          });
        }

        const freshSession = restart === true || !this.state.session;
        const session = freshSession ? createSession() : this.state.session;
        const previousScore = freshSession
          ? createInitialGameState().score
          : normalizeScore(this.state.score);
        const nextState: GameState = {
          ...createInitialGameState(),
          session,
          status: "welcome",
          score: previousScore
        };

        this.setState(nextState);

        return welcomeResponse(
          nextState,
          topic,
          await this.getPlayerIdentity()
        );
      }
    );

    this.server.registerTool(
      "render_source_cards",
      {
        title: "Render source cards",
        description:
          "Use this after start_game or get_round to show the interactive HTML UI for selecting source cards.",
        inputSchema: {},
        outputSchema: gameViewOutputSchema,
        annotations: {
          readOnlyHint: true,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: false
        },
        _meta: this.widgetToolMeta("Opening board", "Board ready")
      },
      async () => {
        if (!this.state.round) {
          if (this.state.session && this.state.status === "welcome") {
            return welcomeResponse(
              this.state,
              undefined,
              await this.getPlayerIdentity()
            );
          }

          return jsonResponse({
            status: "idle",
            message: "No game is active. Start a session from the widget.",
            session: this.state.session,
            score: this.state.score,
            nextActions: ["start_game"]
          });
        }

        return jsonResponse({
          status: this.state.status,
          message: "Interactive source cards are ready.",
          session: this.state.session,
          round: toPublicRound(this.state.round, this.state),
          guesses: this.state.guesses,
          questions: this.state.questions,
          score: this.state.score,
          nextActions: ["Select the card you think is lying."]
        });
      }
    );

    this.server.registerTool(
      "start_round",
      {
        title: "Start a Sus round",
        description:
          "Start a new source-checking round with five source cards: four truths and one lie.",
        inputSchema: {
          topic: z
            .string()
            .min(1)
            .max(80)
            .optional()
            .describe("Optional starter topic, for example 'Ocean plastic'."),
          sources: sourcesInputSchema
        },
        outputSchema: gameViewOutputSchema,
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: true
        },
        // The widget calls this internally after it is already mounted.
        // Data-only metadata avoids a host iframe remount after "Open case".
        _meta: this.dataToolMeta("Dealing round", "Round ready")
      },
      async ({ topic, sources }) => {
        let preparedRound: RoundPreparation;
        try {
          preparedRound = await prepareRound(topic, sources, this.env);
        } catch (error) {
          return exaErrorResponse(error, topic);
        }

        const { round, sourceSearch } = preparedRound;
        const session = this.state?.session ?? createSession();
        const previousScore = normalizeScore(this.state?.score);
        const nextState: GameState = {
          ...createInitialGameState(),
          session,
          status: "active",
          round,
          score: startScoredRound(previousScore, round)
        };

        this.setState(nextState);

        return jsonResponse({
          status: "active",
          message: `Round started: ${round.topic}`,
          session,
          round: toPublicRound(round, nextState),
          score: nextState.score,
          sourceSearch,
          nextActions: [
            "Review the five cards.",
            "Call guess_sus_source with the card ID you think is lying."
          ]
        });
      }
    );

    this.server.registerTool(
      "generate_round_asset",
      {
        title: "Generate round asset",
        description:
          "Generate a custom Workers AI image for the active Sus round from the current game state and visual prompt.",
        inputSchema: {
          prompt: z
            .string()
            .min(1)
            .max(700)
            .optional()
            .describe(
              "Optional visual direction to blend with the active round state."
            ),
          force: z
            .boolean()
            .optional()
            .describe("Set true to regenerate even when an image exists.")
        },
        outputSchema: gameViewOutputSchema,
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: true
        },
        _meta: this.widgetToolMeta("Generating asset", "Asset ready")
      },
      async ({ prompt, force }) => {
        const round = this.state.round;
        if (!round) return noRoundResponse();

        const currentAssets =
          this.state.assets ?? createInitialGameState().assets;
        if (currentAssets.image && force !== true) {
          return jsonResponse({
            status: "asset-ready",
            message: "Round image already exists.",
            session: this.state.session,
            round: toPublicRound(round, this.state),
            asset: currentAssets.image,
            nextActions: ["Use force true to regenerate the round image."]
          });
        }

        try {
          const image = await generateRoundImageAsset(
            round,
            this.state,
            this.env,
            prompt
          );
          const nextState: GameState = {
            ...this.state,
            assets: {
              image,
              imageError: null
            }
          };
          this.setState(nextState);

          return jsonResponse({
            status: "asset-generated",
            message: "Workers AI generated a custom image for this round.",
            session: nextState.session,
            round: toPublicRound(round, nextState),
            asset: image,
            nextActions: ["Review the source cards.", "Guess the sus source."]
          });
        } catch (error) {
          const nextState: GameState = {
            ...this.state,
            assets: {
              ...currentAssets,
              imageError: assetErrorMessage(error)
            }
          };
          this.setState(nextState);

          return jsonResponse({
            status: "asset-generation-failed",
            message: nextState.assets.imageError,
            session: nextState.session,
            round: toPublicRound(round, nextState),
            nextActions: [
              "Retry generate_round_asset.",
              "Continue playing without generated art."
            ]
          });
        }
      }
    );

    this.server.registerTool(
      "get_round",
      {
        title: "Get current round",
        description: "Show the active round, remaining cards, and guesses.",
        inputSchema: {},
        outputSchema: gameViewOutputSchema,
        annotations: {
          readOnlyHint: true,
          destructiveHint: false,
          openWorldHint: false,
          idempotentHint: true
        },
        _meta: this.dataToolMeta("Loading round", "Round loaded")
      },
      async () => {
        if (!this.state.round) return noRoundResponse();

        return jsonResponse({
          status: this.state.status,
          session: this.state.session,
          round: toPublicRound(this.state.round, this.state),
          guesses: this.state.guesses,
          questions: this.state.questions,
          score: this.state.score,
          nextActions: ["Call guess_sus_source when you are ready."]
        });
      }
    );

    this.server.registerTool(
      "guess_sus_source",
      {
        title: "Guess the lie",
        description:
          "Use this when the user selects a source card. If the card is truthful, clear it and let the user keep guessing.",
        inputSchema: {
          cardId: z
            .string()
            .min(1)
            .max(8)
            .describe("The visible card ID, such as A, B, C, D, or E.")
        },
        outputSchema: gameViewOutputSchema,
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: false
        },
        _meta: this.dataToolMeta("Checking card", "Card checked")
      },
      async ({ cardId }) => {
        const round = this.state.round;
        if (!round) return noRoundResponse();

        if (this.state.status !== "active") {
          return jsonResponse({
            status: this.state.status,
            message: "This round is already complete.",
            round: toPublicRound(round, this.state),
            reveal: revealRound(round, this.state),
            score: normalizeScore(this.state.score)
          });
        }

        const normalizedCardId = normalizeCardId(cardId);
        const card = normalizedCardId
          ? round.cards.find((candidate) => candidate.id === normalizedCardId)
          : undefined;

        if (!card) {
          return jsonResponse({
            status: "invalid-card",
            message: `Card '${cardId}' is not in this round.`,
            round: toPublicRound(round, this.state),
            score: normalizeScore(this.state.score),
            validCardIds: round.cards.map((candidate) => candidate.id)
          });
        }

        if (this.state.eliminatedIds.includes(card.id)) {
          return jsonResponse({
            status: "already-cleared",
            message: `Card ${card.id} has already been cleared as truthful.`,
            round: toPublicRound(round, this.state),
            score: normalizeScore(this.state.score)
          });
        }

        const guess = {
          cardId: card.id,
          sourceName: card.sourceName,
          result: card.verdict,
          guessedAt: new Date().toISOString()
        } as const;

        if (card.verdict === "lie") {
          const score = finishScoredRound(
            this.state.score,
            round,
            "direct-win",
            guess.guessedAt
          );
          const nextState: GameState = {
            ...this.state,
            status: "won",
            guesses: [...this.state.guesses, guess],
            pendingQuestion: false,
            score
          };
          this.setState(nextState);
          const leaderboard = await this.persistScore(nextState.score);

          return jsonResponse({
            status: "won",
            message: `Correct. Card ${card.id} is the sus source. +${score.lastRound?.points ?? 0} points.`,
            session: nextState.session,
            round: toPublicRound(round, nextState),
            reveal: revealRound(round, nextState),
            score: nextState.score,
            leaderboard,
            nextActions: [
              "Review the summary.",
              "Use Play again to start another round."
            ]
          });
        }

        const eliminatedIds = [...this.state.eliminatedIds, card.id];
        const remainingCards = getRemainingCards(round, eliminatedIds);
        const solvedByElimination =
          remainingCards.length === 1 && remainingCards[0]?.verdict === "lie";
        const scoreAfterWrongGuess = recordWrongGuess(
          this.state.score,
          round,
          guess.guessedAt
        );
        const score = solvedByElimination
          ? finishScoredRound(
              scoreAfterWrongGuess,
              round,
              "elimination-win",
              guess.guessedAt
            )
          : scoreAfterWrongGuess;
        const nextState: GameState = {
          ...this.state,
          status: solvedByElimination ? "won" : "active",
          eliminatedIds,
          guesses: [...this.state.guesses, guess],
          pendingQuestion: false,
          score
        };
        this.setState(nextState);

        if (solvedByElimination) {
          const leaderboard = await this.persistScore(nextState.score);

          return jsonResponse({
            status: "won",
            message: `That source checks out. It was the last truthful card, so the remaining card is the sus source. +${score.lastRound?.points ?? 0} points.`,
            session: nextState.session,
            round: toPublicRound(round, nextState),
            reveal: revealRound(round, nextState),
            score: nextState.score,
            leaderboard,
            nextActions: [
              "Review the summary.",
              "Use Play again to start another round."
            ]
          });
        }

        return jsonResponse({
          status: "truth-cleared",
          message: `Card ${card.id} checks out and has been removed from the suspect pool.`,
          clearedCard: {
            id: card.id,
            sourceName: card.sourceName,
            explanation: card.explanation
          },
          session: nextState.session,
          round: toPublicRound(round, nextState),
          score: nextState.score,
          nextActions: ["Call guess_sus_source with your next suspect."]
        });
      }
    );

    this.server.registerTool(
      "ask_question",
      {
        title: "Ask an optional source-checking question",
        description:
          "Ask an optional question for clues about the remaining cards.",
        inputSchema: {
          question: z
            .string()
            .min(3)
            .max(240)
            .describe("A source-checking question about the remaining cards.")
        },
        outputSchema: gameViewOutputSchema,
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: true
        },
        _meta: this.dataToolMeta("Answering question", "Question answered")
      },
      async ({ question }) => {
        const round = this.state.round;
        if (!round) return noRoundResponse();

        if (this.state.status !== "active") {
          return jsonResponse({
            status: this.state.status,
            message: "This round is already complete.",
            round: toPublicRound(round, this.state),
            reveal: revealRound(round, this.state),
            score: normalizeScore(this.state.score)
          });
        }

        const answer = await answerRoundQuestion(
          round,
          question,
          this.state.eliminatedIds,
          this.env.EXA_API_KEY
        );
        const askedAt = new Date().toISOString();
        const nextState: GameState = {
          ...this.state,
          pendingQuestion: false,
          questions: [
            ...this.state.questions,
            {
              question,
              answer: answer.summary,
              answerSource: answer.source,
              citations: questionCitationRecords(answer.citations),
              askedAt
            }
          ],
          score: recordScoreQuestion(this.state.score, round, askedAt)
        };
        this.setState(nextState);

        return jsonResponse({
          status: "question-answered",
          answer,
          session: nextState.session,
          round: toPublicRound(round, nextState),
          score: nextState.score,
          nextActions: ["Call guess_sus_source with your next suspect."]
        });
      }
    );

    this.server.registerTool(
      "reveal_round",
      {
        title: "Reveal the current round",
        description: "Give up and reveal which card was lying.",
        inputSchema: {},
        outputSchema: gameViewOutputSchema,
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: false
        },
        _meta: this.dataToolMeta("Revealing", "Revealed")
      },
      async () => {
        const round = this.state.round;
        if (!round) return noRoundResponse();

        const score =
          this.state.status === "won" || this.state.status === "revealed"
            ? normalizeScore(this.state.score)
            : finishScoredRound(this.state.score, round, "revealed");
        const nextState: GameState = {
          ...this.state,
          status: this.state.status === "won" ? "won" : "revealed",
          pendingQuestion: false,
          score
        };
        this.setState(nextState);
        const leaderboard =
          nextState.status === "revealed"
            ? await this.persistScore(nextState.score)
            : {
                persisted: false,
                reason: "Round was already solved before reveal."
              };

        return jsonResponse({
          status: nextState.status,
          session: nextState.session,
          round: toPublicRound(round, nextState),
          message:
            nextState.status === "won"
              ? "Case solved. The source board is revealed."
              : "Round revealed. Review the false spin before starting another case.",
          reveal: revealRound(round, nextState),
          score: nextState.score,
          leaderboard,
          nextActions: [
            "Review the summary.",
            "Use Play again to start another round."
          ]
        });
      }
    );

    this.server.registerTool(
      "render_leaderboard",
      {
        title: "Render Sus leaderboard",
        description:
          "Use this when the user asks to show, open, see, display, or get the Sus leaderboard widget. Reads D1 standings and renders the leaderboard UI.",
        inputSchema: {
          limit: z
            .number()
            .int()
            .min(1)
            .max(50)
            .optional()
            .describe("Maximum number of top players to show.")
        },
        outputSchema: gameViewOutputSchema,
        annotations: {
          readOnlyHint: true,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: false
        },
        _meta: this.widgetToolMeta("Opening leaderboard", "Leaderboard ready")
      },
      async ({ limit }) => this.leaderboardResponse(limit)
    );

    this.server.registerTool(
      "get_leaderboard",
      {
        title: "Get Sus leaderboard data",
        description:
          "Use this when ChatGPT needs raw Sus standings data without rendering a widget. If the user asks to show, open, see, display, or get the leaderboard, use render_leaderboard instead.",
        inputSchema: {
          limit: z
            .number()
            .int()
            .min(1)
            .max(50)
            .optional()
            .describe("Maximum number of top players to return.")
        },
        outputSchema: gameViewOutputSchema,
        annotations: {
          readOnlyHint: true,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: false
        },
        _meta: this.appOnlyDataToolMeta(
          "Loading leaderboard",
          "Leaderboard ready"
        )
      },
      async ({ limit }) => this.leaderboardResponse(limit)
    );

    this.server.registerTool(
      "reset_game",
      {
        title: "Reset Sus",
        description: "Clear the current round. Optionally clear the score too.",
        inputSchema: {
          clearScore: z
            .boolean()
            .optional()
            .describe(
              "Set true to reset wins, wrong guesses, and rounds started."
            )
        },
        outputSchema: gameViewOutputSchema,
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: false
        },
        _meta: this.dataToolMeta("Resetting", "Reset")
      },
      async ({ clearScore }) => {
        const previousScore = normalizeScore(this.state.score);
        const previousSession = this.state.session;
        const nextState = createInitialGameState();
        if (!clearScore) {
          nextState.session = previousSession;
          nextState.score = previousScore;
          if (previousSession) nextState.status = "welcome";
        }
        this.setState(nextState);

        return jsonResponse({
          status: nextState.status,
          message: nextState.session
            ? "Returned to the welcome screen."
            : "Sus has been reset.",
          session: nextState.session,
          score: nextState.score,
          player: publicPlayerProfile(await this.getPlayerIdentity()),
          suggestedTopics: listTopics(),
          nextActions: nextState.session
            ? ["Enter a topic in the widget.", "Or call start_round."]
            : ["list_topics", "start_game"]
        });
      }
    );
  }
}

const APP_HTML = `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Sus source-checking game" />
    <title>Sus</title>
    <link rel="icon" href="/favicon.ico" sizes="any" />
    <link rel="icon" href="/icons/sus-app-icon-192.png" type="image/png" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <link rel="manifest" href="/manifest.webmanifest" />
  </head>
  <body>
    <main style="font-family: system-ui, sans-serif; padding: 32px;">
      <h1>Sus MCP server</h1>
      <p>Connect an MCP client to <code>/mcp</code>.</p>
      <p>The source-card interface is served as an MCP widget resource.</p>
    </main>
  </body>
</html>
`.trim();

export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext) {
    const url = new URL(request.url);

    if (url.pathname === "/") {
      return new Response(APP_HTML, {
        headers: { "content-type": "text/html; charset=utf-8" }
      });
    }

    if (url.pathname === OAUTH_PROTECTED_RESOURCE_PATH) {
      return createProtectedResourceMetadataResponse(request, env);
    }

    if (isMcpPath(url.pathname)) {
      try {
        const player = await resolvePlayerIdentity(request, env);
        const agent = await getAgentByName(
          env.SusGameMcp,
          playerDurableObjectName(player)
        );
        return agent.fetch(requestWithPlayerIdentity(request, player));
      } catch (error) {
        if (
          error instanceof AuthChallengeError ||
          error instanceof AuthConfigurationError
        ) {
          return createAuthErrorResponse(request, env, error);
        }

        throw error;
      }
    }

    return new Response("Not Found", { status: 404 });
  }
} satisfies ExportedHandler<Env>;
