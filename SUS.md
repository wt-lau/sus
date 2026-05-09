# Sus Current Game Flow

Sus is a source-checking game where ChatGPT hosts the conversation, the Sus MCP
server owns the rules, and the rendered widget lets the player inspect five
source cards. Each round has four truthful cards and one card with a subtle
false spin.

This document describes the current implementation in `src/`, not future scope.

## Runtime Boundaries

- `src/server.ts` is the Cloudflare Worker entrypoint.
- `/mcp` and `/mcp/*` are handled by the Worker before static assets.
- `/.well-known/oauth-protected-resource` exposes OAuth protected-resource
  metadata when auth is configured.
- `/` returns a minimal HTML app shell telling clients to connect to `/mcp`.
- Static files in `public/` provide icons, the manifest, and source-card art.

## State Boundaries

- `SusGameMcp` extends the Cloudflare `Agent` class.
- The `SusGameMcp` Durable Object binding gives each resolved player a scoped
  Agent instance.
- The Agent stores MCP transport state, player identity, active game state,
  score, generated image data, guesses, and clue history.
- D1 stores completed round results and aggregate leaderboard rows.

## External Services

- Exa Search is used for arbitrary topic rounds when `EXA_API_KEY` is present.
- Exa Answer is used for optional clue questions when `EXA_API_KEY` is present.
- Local starter packs and local clue hints are available without Exa.
- Workers AI generates the selected source-card spin for Exa/custom rounds.
- If Workers AI spin generation fails, `src/game.ts` applies a local wording
  spin.
- Workers AI can generate an optional round image through `generate_round_asset`.

## Primary Flow

1. The user asks ChatGPT to start Sus.
2. ChatGPT calls `start_game`.
3. The server creates a session if needed and returns welcome-state tool output.
4. The widget renders the welcome screen with topic input and starter
   suggestions.
5. The user enters a topic or chooses a suggested topic.
6. The widget calls `start_round` with the topic.
7. The server asks Exa for candidate sources.
8. The server asks Workers AI to spin one source claim into a subtle lie.
9. The server creates a shuffled five-card round and starts scoring.
10. The widget renders the source-card board.
11. The user selects a card.
12. The widget calls `guess_sus_source` with the visible card ID.
13. If the card is truthful, the server marks it cleared and records a wrong
    guess.
14. If only the lie remains after a truthful guess, the player wins by
    elimination.
15. If the selected card is the lie, the player wins directly.
16. On win or reveal, the server returns full reveal data and persists the score
    result to D1 when possible.
17. The widget renders the round summary.
18. The user can start a new case through `reset_game`.

## Round Modes

`start_round` supports three implemented modes:

- Topic round: `topic` is present and `sources` is omitted. Sus uses Exa Search,
  then spins one source with Workers AI or the local fallback.
- Starter round: `topic` and `sources` are omitted. Sus uses one bundled starter
  pack from `src/game.ts`.
- Custom round: exactly five `sources` are provided. Sus keeps four cards
  truthful and spins one into the lie.

The widget path always starts topic rounds because its welcome form requires a
topic. Starter rounds are mainly for Inspector and local demo calls.

## Widget Screens

### Welcome

The welcome screen shows:

- Sus branding.
- Optional signed-in display name.
- Topic input.
- Start button.
- Suggested starter topics from `list_topics`.
- Compact score panel.
- Short play pattern: compare, accuse, reveal.

### Case Loader

While `start_round` is running, the widget renders a case-building loader. This
is local UI state while the MCP tool call is in flight.

### Source Card Board

The board shows a carousel of five cards. Each card includes:

- Card ID.
- Current status.
- Source name.
- Source type.
- Published date.
- Headline.
- Claim.
- Excerpt.
- Credibility signal or action text.
- Source link when a URL exists.

Remaining cards are selectable. Cleared cards stay visible but disabled.

### Card Result

When a card is selected, the widget flips the card and calls
`guess_sus_source`.

Truth result:

- The card is cleared.
- The card explanation is exposed.
- The player can keep guessing.
- Score tracks the wrong guess.

Lie result:

- The round is won.
- Full reveal data is returned.
- The score result is persisted to D1.
- The summary shows the false spin and all card explanations.

### Optional Clue

`ask_question` is not part of the main click flow. It can be called by ChatGPT or
an MCP client when the player explicitly wants a clue.

The answer uses Exa Answer when available. If Exa fails or is not configured,
Sus returns local clue hints from the remaining cards.

### Summary

The summary shows:

- Case status.
- Topic.
- Points and grade for wins.
- Wrong-guess count.
- Question count.
- Cards reviewed.
- Earned badges.
- The sus source.
- Explanation for every card.
- New case action.
- Close action.

## Game State

The implemented `GameState` contains:

- `session`.
- `status`: `idle`, `welcome`, `active`, `won`, `revealed`, or `quit`.
- `round`.
- `eliminatedIds`.
- `pendingQuestion`.
- `guesses`.
- `questions`.
- `assets`.
- `score`.

The current tools set `idle`, `welcome`, `active`, `won`, and `revealed`. The
`quit` status exists in the type but no current tool sets it.

## Scoring

Scoring is implemented in `src/game.ts`.

- Base win: 1000 points.
- Wrong guess penalty: 220 points.
- Question penalty: 80 points.
- Clean read bonus: 350 points.
- No-clue bonus: 150 points.
- Streak bonus: 125 points per current streak, capped at 500.
- Comeback bonus: 120 points after two or more mistakes.
- Minimum win score: 150 points.
- Reveal outcome: 0 points and streak reset.

Ranks are:

- New Investigator.
- Caveat Spotter.
- Source Sleuth.
- Signal Analyst.
- Truth Editor.

Badges are awarded for first case, clean reads, no-clue solves, perfect reads,
comebacks, elimination wins, hot streaks, and clue-heavy wins.

## MCP Tool Responsibilities

- `get_rules` returns rules and starter behavior.
- `list_topics` returns bundled starter topic names and aliases.
- `start_game` starts or resumes a session and returns welcome state.
- `render_source_cards` returns widget-ready state for the current session.
- `start_round` creates a topic, starter, or custom round.
- `get_round` returns the active public round, guesses, questions, and score.
- `generate_round_asset` creates or reuses a Workers AI image for the round.
- `guess_sus_source` evaluates a card accusation.
- `ask_question` records a clue question and answer.
- `reveal_round` reveals the answer and records a zero-point reveal if unsolved.
- `get_leaderboard` reads D1 standings.
- `reset_game` returns to welcome and can optionally clear score.

## Persistence

D1 tables are defined in `migrations/0001_leaderboard.sql`:

- `players`.
- `round_results`.
- `player_scores`.

Completed wins and reveals are persisted. Active in-progress state remains in
the Agent/Durable Object state, not in D1.

## Current Non-Goals

- The generated image is stored in Agent state as a data URI, not R2.
- `futureAssets.clipUrl` is always `null`.
- There is no standalone browser game route beyond the minimal `/` shell.
- The source-card widget is the primary product surface.
