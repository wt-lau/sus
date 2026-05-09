import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpAgent } from "agents/mcp";
import { z } from "zod";
import {
  ExaSourceSearchError,
  searchTopicSourcesWithExa,
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
  type GameState
} from "./game";
import {
  SUS_WIDGET_HTML,
  SUS_WIDGET_MIME_TYPE,
  SUS_WIDGET_URI
} from "./widget";

const gameViewOutputSchema = z.object({}).passthrough();
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
    round: createRound(requestedTopic, sourceSearch.sources),
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
        _meta: {
          ui: {
            prefersBorder: true,
            csp: {
              connectDomains: [],
              resourceDomains: []
            }
          }
        }
      },
      async () => ({
        contents: [
          {
            uri: SUS_WIDGET_URI,
            mimeType: SUS_WIDGET_MIME_TYPE,
            text: SUS_WIDGET_HTML,
            _meta: {
              ui: {
                prefersBorder: true,
                csp: {
                  connectDomains: [],
                  resourceDomains: []
                }
              }
            }
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
        annotations: { readOnlyHint: true, destructiveHint: false },
        _meta: dataToolMeta("Loading rules", "Rules ready")
      },
      async () =>
        jsonResponse({
          name: "Sus",
          tagline: "Four truths. One lie. Find the sus source.",
          rules: [
            "Start with start_game. It creates a stateful game session for this MCP client and starts the first round.",
            "Each round has one topic and five source cards.",
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
        annotations: { readOnlyHint: true, destructiveHint: false },
        _meta: dataToolMeta("Loading topics", "Topics ready")
      },
      async () =>
        jsonResponse({
          topics: listTopics(),
          note: "Pass any topic to start_game or start_round to search Exa. Calling either tool without a topic uses the bundled starter pack."
        })
    );

    this.server.registerTool(
      "start_game",
      {
        title: "Start Sus game",
        description:
          "Use this when the user asks ChatGPT to create a Sus session. Start a stateful game and deal five source cards for the requested topic.",
        inputSchema: {
          topic: z
            .string()
            .min(1)
            .max(80)
            .optional()
            .describe("Optional starter topic, for example 'Ocean plastic'."),
          restart: z
            .boolean()
            .optional()
            .describe(
              "Set true to abandon the active session and start a fresh game."
            ),
          sources: sourcesInputSchema
        },
        outputSchema: gameViewOutputSchema,
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: false
        },
        _meta: widgetToolMeta("Dealing sources", "Source cards ready")
      },
      async ({ restart, topic, sources }) => {
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

        let preparedRound: RoundPreparation;
        try {
          preparedRound = await prepareRound(topic, sources, this.env);
        } catch (error) {
          return exaErrorResponse(error, topic);
        }

        const { round, sourceSearch } = preparedRound;
        const freshSession = restart === true || !this.state.session;
        const session = freshSession ? createSession() : this.state.session;
        const previousScore = freshSession
          ? createInitialGameState().score
          : this.state.score;
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
          status: freshSession ? "started" : "round-started",
          message: freshSession
            ? `Game started. First round: ${round.topic}`
            : `Round started in the current game session: ${round.topic}`,
          session,
          stateful: {
            host: "Cloudflare McpAgent session",
            note: "This MCP client keeps the game state across subsequent tool calls."
          },
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
          openWorldHint: false
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
      "get_round",
      {
        title: "Get current round",
        description:
          "Show the active round, remaining cards, guesses, and whether a question is required.",
        inputSchema: {},
        outputSchema: gameViewOutputSchema,
        annotations: { readOnlyHint: true, destructiveHint: false },
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
            reveal: revealRound(round, this.state)
          });
        }

        if (this.state.pendingQuestion) {
          return jsonResponse({
            status: "question-required",
            message:
              "You cleared a truthful source on the previous guess. Ask one question before guessing again.",
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
            reveal: revealRound(round, nextState),
            nextActions: ["start_round"]
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
            reveal: revealRound(round, nextState),
            nextActions: ["start_round"]
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
          openWorldHint: false
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
            reveal: revealRound(round, this.state)
          });
        }

        if (!this.state.pendingQuestion) {
          return jsonResponse({
            status: "no-question-earned",
            message:
              "Questions unlock only after you guess a truthful source. Make a guess first.",
            nextActions: ["guess_sus_source"]
          });
        }

        const answer = answerQuestion(
          round,
          question,
          this.state.eliminatedIds
        );
        const nextState: GameState = {
          ...this.state,
          pendingQuestion: false,
          questions: [
            ...this.state.questions,
            {
              question,
              answer: answer.summary,
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
          reveal: revealRound(round, nextState),
          nextActions: ["start_round"]
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
        }
        this.setState(nextState);

        return jsonResponse({
          status: "idle",
          session: nextState.session,
          score: nextState.score,
          nextActions: nextState.session
            ? ["list_topics", "start_round"]
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
