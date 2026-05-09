import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpAgent } from "agents/mcp";
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
  getRemainingCards,
  listTopics,
  normalizeCardId,
  revealRound,
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

const gameViewOutputSchema = z.object({}).passthrough();
const WORKERS_AI_IMAGE_MODEL = "@cf/black-forest-labs/flux-1-schnell";
const susWidgetResourceMeta = {
  ui: {
    prefersBorder: true,
    csp: {
      connectDomains: [],
      resourceDomains: []
    }
  },
  "openai/widgetDescription":
    "Interactive Sus game board for choosing a topic, comparing five source cards, accusing the false spin, asking earned clue questions, and reviewing the reveal.",
  "openai/widgetPrefersBorder": true,
  "openai/widgetCSP": {
    connect_domains: [],
    resource_domains: []
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

function noRoundResponse() {
  return jsonResponse({
    status: "idle",
    message: "No game is active. Call start_game to begin.",
    nextActions: ["list_topics", "start_game"]
  });
}

function welcomeResponse(state: GameState, prefillTopic?: string) {
  return jsonResponse({
    status: "welcome",
    message: "Sus is ready. Enter a topic to open a new case file.",
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

export class SusGameMcp extends McpAgent<
  Env,
  GameState,
  Record<string, never>
> {
  server = new McpServer({
    name: "sus-source-checking-game",
    version: "0.1.0"
  });

  initialState: GameState = createInitialGameState();

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
        _meta: dataToolMeta("Loading rules", "Rules ready")
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
            "If you pick a truthful card, that card is cleared and you must ask one question before guessing again.",
            "Use ask_question to get source-quality clues about the remaining cards.",
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
        _meta: dataToolMeta("Loading topics", "Topics ready")
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
        _meta: widgetToolMeta("Opening Sus", "Sus ready")
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
            nextActions: this.state.pendingQuestion
              ? ["Call ask_question before guessing again."]
              : ["Call guess_sus_source with the card ID you think is lying."]
          });
        }

        const freshSession = restart === true || !this.state.session;
        const session = freshSession ? createSession() : this.state.session;
        const previousScore = freshSession
          ? createInitialGameState().score
          : this.state.score;
        const nextState: GameState = {
          ...createInitialGameState(),
          session,
          status: "welcome",
          score: previousScore
        };

        this.setState(nextState);

        return welcomeResponse(nextState, topic);
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
        _meta: widgetToolMeta("Opening board", "Board ready")
      },
      async () => {
        if (!this.state.round) {
          if (this.state.session && this.state.status === "welcome") {
            return welcomeResponse(this.state);
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
          nextActions: this.state.pendingQuestion
            ? ["Ask one question from the widget before guessing again."]
            : ["Select the card you think is lying."]
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
        _meta: widgetToolMeta("Dealing round", "Round ready")
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
        const previousScore =
          this.state?.score ?? createInitialGameState().score;
        const nextState: GameState = {
          ...createInitialGameState(),
          session,
          status: "active",
          round,
          score: {
            ...previousScore,
            roundsStarted: previousScore.roundsStarted + 1
          }
        };

        this.setState(nextState);

        return jsonResponse({
          status: "active",
          message: `Round started: ${round.topic}`,
          session,
          round: toPublicRound(round, nextState),
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
        _meta: widgetToolMeta("Generating asset", "Asset ready")
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
        description:
          "Show the active round, remaining cards, guesses, and whether a question is required.",
        inputSchema: {},
        outputSchema: gameViewOutputSchema,
        annotations: {
          readOnlyHint: true,
          destructiveHint: false,
          openWorldHint: false,
          idempotentHint: true
        },
        _meta: dataToolMeta("Loading round", "Round loaded")
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
          nextActions: this.state.pendingQuestion
            ? ["Call ask_question before guessing again."]
            : ["Call guess_sus_source when you are ready."]
        });
      }
    );

    this.server.registerTool(
      "guess_sus_source",
      {
        title: "Guess the lie",
        description:
          "Use this when the user selects a source card. If the card is truthful, clear it and require one question before another guess.",
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
        _meta: dataToolMeta("Checking card", "Card checked")
      },
      async ({ cardId }) => {
        const round = this.state.round;
        if (!round) return noRoundResponse();

        if (this.state.status !== "active") {
          return jsonResponse({
            status: this.state.status,
            message: "This round is already complete.",
            round: toPublicRound(round, this.state),
            reveal: revealRound(round, this.state)
          });
        }

        if (this.state.pendingQuestion) {
          return jsonResponse({
            status: "question-required",
            message:
              "You cleared a truthful source on the previous guess. Ask one question before guessing again.",
            round: toPublicRound(round, this.state),
            nextActions: ["ask_question"]
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
            validCardIds: round.cards.map((candidate) => candidate.id)
          });
        }

        if (this.state.eliminatedIds.includes(card.id)) {
          return jsonResponse({
            status: "already-cleared",
            message: `Card ${card.id} has already been cleared as truthful.`,
            round: toPublicRound(round, this.state)
          });
        }

        const guess = {
          cardId: card.id,
          sourceName: card.sourceName,
          result: card.verdict,
          guessedAt: new Date().toISOString()
        } as const;

        if (card.verdict === "lie") {
          const nextState: GameState = {
            ...this.state,
            status: "won",
            guesses: [...this.state.guesses, guess],
            pendingQuestion: false,
            score: {
              ...this.state.score,
              wins: this.state.score.wins + 1
            }
          };
          this.setState(nextState);

          return jsonResponse({
            status: "won",
            message: `Correct. Card ${card.id} is the sus source.`,
            session: nextState.session,
            round: toPublicRound(round, nextState),
            reveal: revealRound(round, nextState),
            score: nextState.score,
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
        const nextState: GameState = {
          ...this.state,
          status: solvedByElimination ? "won" : "active",
          eliminatedIds,
          guesses: [...this.state.guesses, guess],
          pendingQuestion: solvedByElimination ? false : true,
          score: {
            ...this.state.score,
            wins: this.state.score.wins + (solvedByElimination ? 1 : 0),
            wrongGuesses: this.state.score.wrongGuesses + 1
          }
        };
        this.setState(nextState);

        if (solvedByElimination) {
          return jsonResponse({
            status: "won",
            message:
              "That source checks out. It was the last truthful card, so the remaining card is the sus source.",
            session: nextState.session,
            round: toPublicRound(round, nextState),
            reveal: revealRound(round, nextState),
            score: nextState.score,
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
          round: toPublicRound(round, nextState),
          nextActions: ["Call ask_question before guessing again."]
        });
      }
    );

    this.server.registerTool(
      "ask_question",
      {
        title: "Ask a source-checking question",
        description:
          "Ask one question after clearing a truthful card. The answer gives clues about the remaining cards.",
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
        _meta: dataToolMeta("Answering question", "Question answered")
      },
      async ({ question }) => {
        const round = this.state.round;
        if (!round) return noRoundResponse();

        if (this.state.status !== "active") {
          return jsonResponse({
            status: this.state.status,
            message: "This round is already complete.",
            round: toPublicRound(round, this.state),
            reveal: revealRound(round, this.state)
          });
        }

        if (!this.state.pendingQuestion) {
          return jsonResponse({
            status: "no-question-earned",
            message:
              "Questions unlock only after you guess a truthful source. Make a guess first.",
            round: toPublicRound(round, this.state),
            nextActions: ["guess_sus_source"]
          });
        }

        const answer = await answerRoundQuestion(
          round,
          question,
          this.state.eliminatedIds,
          this.env.EXA_API_KEY
        );
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
              askedAt: new Date().toISOString()
            }
          ]
        };
        this.setState(nextState);

        return jsonResponse({
          status: "question-answered",
          answer,
          round: toPublicRound(round, nextState),
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
        _meta: dataToolMeta("Revealing", "Revealed")
      },
      async () => {
        const round = this.state.round;
        if (!round) return noRoundResponse();

        const nextState: GameState = {
          ...this.state,
          status: this.state.status === "won" ? "won" : "revealed",
          pendingQuestion: false
        };
        this.setState(nextState);

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
          nextActions: [
            "Review the summary.",
            "Use Play again to start another round."
          ]
        });
      }
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
        _meta: dataToolMeta("Resetting", "Reset")
      },
      async ({ clearScore }) => {
        const previousScore = this.state.score;
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
          suggestedTopics: listTopics(),
          nextActions: nextState.session
            ? ["Enter a topic in the widget.", "Or call start_round."]
            : ["list_topics", "start_game"]
        });
      }
    );
  }
}

const mcpHandler = SusGameMcp.serve("/mcp", { binding: "SusGameMcp" });
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
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url);

    if (url.pathname === "/") {
      return new Response(APP_HTML, {
        headers: { "content-type": "text/html; charset=utf-8" }
      });
    }

    return mcpHandler.fetch(request, env, ctx);
  }
} satisfies ExportedHandler<Env>;
