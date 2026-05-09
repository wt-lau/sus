import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpAgent } from "agents/mcp";
import { z } from "zod";
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

function jsonResponse(value: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(value, null, 2)
      }
    ]
  };
}

function noRoundResponse() {
  return jsonResponse({
    status: "idle",
    message: "No round is active. Call start_round to begin.",
    nextActions: ["list_topics", "start_round"]
  });
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
    this.server.registerTool(
      "get_rules",
      {
        title: "Get Sus rules",
        description: "Explain how to play Sus, the source-checking game.",
        inputSchema: {}
      },
      async () =>
        jsonResponse({
          name: "Sus",
          tagline: "Four truths. One lie. Find the sus source.",
          rules: [
            "Each round starts with one topic and five source cards.",
            "Four cards are truthful. One card is the lie.",
            "Guess the lie with guess_sus_source.",
            "If you pick a truthful card, that card is cleared and you must ask one question before guessing again.",
            "Use ask_question to get source-quality clues about the remaining cards."
          ],
          starterNote:
            "This first local version uses bundled starter rounds. Exa, Fal, and R2 are intentionally not required yet."
        })
    );

    this.server.registerTool(
      "list_topics",
      {
        title: "List starter topics",
        description: "Show the bundled Sus starter topics available locally.",
        inputSchema: {}
      },
      async () =>
        jsonResponse({
          topics: listTopics(),
          note: "Pass one of these topics to start_round. Unknown topics use the first starter pack until live topic generation is added."
        })
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
            .describe("Optional starter topic, for example 'Ocean plastic'.")
        }
      },
      async ({ topic }) => {
        const round = createRound(topic);
        const previousScore =
          this.state?.score ?? createInitialGameState().score;
        const nextState: GameState = {
          ...createInitialGameState(),
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
          round: toPublicRound(round, nextState),
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
        inputSchema: {}
      },
      async () => {
        if (!this.state.round) return noRoundResponse();

        return jsonResponse({
          status: this.state.status,
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
          "Pick the source card you think is lying. If the card is truthful, it is cleared and you earn one question.",
        inputSchema: {
          cardId: z
            .string()
            .min(1)
            .max(8)
            .describe("The visible card ID, such as A, B, C, D, or E.")
        }
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
        }
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
        inputSchema: {}
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
        }
      },
      async ({ clearScore }) => {
        const previousScore = this.state.score;
        const nextState = createInitialGameState();
        if (!clearScore) {
          nextState.score = previousScore;
        }
        this.setState(nextState);

        return jsonResponse({
          status: "idle",
          score: nextState.score,
          nextActions: ["list_topics", "start_round"]
        });
      }
    );
  }
}

const mcpHandler = SusGameMcp.serve("/mcp", { binding: "SusGameMcp" });

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url);

    if (url.pathname === "/") {
      return new Response(
        "Sus MCP server is running. Connect an MCP client to /mcp.",
        {
          headers: { "content-type": "text/plain; charset=utf-8" }
        }
      );
    }

    return mcpHandler.fetch(request, env, ctx);
  }
} satisfies ExportedHandler<Env>;
