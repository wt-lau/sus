# Sus

**Four truths. One lie. Find the sus source.**

Sus is a ChatGPT-hosted source-checking game. A player chooses a topic, Sus
deals five plausible source cards, and one card quietly bends the source claim
with a small but material false spin. The player wins by finding the card whose
wording overreaches the evidence.

The game is built as a remote MCP server on Cloudflare Workers. ChatGPT hosts
the conversation and renders the widget; the Worker owns the game rules, source
generation, scoring, authentication, and leaderboard persistence.

## What Is Implemented

- Remote MCP endpoint at `/mcp`, routed through `src/server.ts`.
- Interactive HTML widget registered as the `ui://widget/sus-source-cards-v8.html`
  MCP resource from `src/widget.ts`.
- Per-player game state in the `SusGameMcp` Cloudflare Agent, backed by the
  `SusGameMcp` Durable Object binding.
- Topic-based rounds using Exa Search when `EXA_API_KEY` is configured.
- Bundled starter rounds for local demos without live search.
- Custom rounds from exactly five provided source cards.
- Workers AI source-spin generation with a local fallback if model output fails.
- Optional Workers AI round image generation through `generate_round_asset`.
- Clerk/OAuth protected-resource metadata at
  `/.well-known/oauth-protected-resource`.
- D1-backed completed-round results and leaderboard tables.
- Static app shell and icons from `public/`.

Not implemented yet: R2 storage for generated assets, generated clips, or a
separate public web game outside the MCP widget.

## Architecture

```text
ChatGPT / MCP client
  -> /mcp on Cloudflare Worker
  -> resolve player identity
  -> user-scoped SusGameMcp Agent / Durable Object
  -> MCP tools + widget resource
  -> Exa, Workers AI, and D1 as needed
```

Key files:

- `src/server.ts` - Worker entrypoint, MCP tools, auth routing, AI calls.
- `src/game.ts` - round creation, starter packs, scoring, public state shape.
- `src/widget.ts` - self-contained ChatGPT widget HTML/CSS/JS.
- `src/exa.ts` - Exa Search and Exa Answer adapters.
- `src/auth.ts` - Clerk/OAuth token handling and protected-resource metadata.
- `src/leaderboard.ts` - D1 persistence and leaderboard reads.
- `migrations/0001_leaderboard.sql` - D1 schema.
- `wrangler.jsonc` - Worker, assets, Durable Object, AI, D1, and auth bindings.

## Game Loop

1. `start_game` creates or reuses a session and renders the welcome screen.
2. The player enters a topic in the widget.
3. The widget calls `start_round` with that topic.
4. Sus asks Exa for source material, normalizes five cards, and spins one claim.
5. The player compares the five cards and selects the suspected lie.
6. `guess_sus_source` clears truthful cards or ends the round when the lie is
   found.
7. `ask_question` is optional and costs score. It uses Exa Answer when available
   and local clue hints otherwise.
8. `reveal_round` gives up, reveals all cards, and records a zero-point reveal.
9. Completed wins and reveals are written to D1 when the database is available.

For local or offline demos, call `start_round` without a topic to use one of the
bundled starter packs, or pass exactly five custom source cards.

## MCP Tools

- `get_rules` - explains the rules and starter behavior.
- `list_topics` - returns bundled starter topics.
- `start_game` - opens the welcome UI and optionally prefills a topic.
- `render_source_cards` - returns the current widget-ready game state.
- `start_round` - starts a topic, starter, or custom-source round.
- `get_round` - returns the current public round state.
- `generate_round_asset` - creates a Workers AI image for the active round.
- `guess_sus_source` - evaluates a card accusation.
- `ask_question` - files an optional clue question.
- `reveal_round` - reveals the current round.
- `get_leaderboard` - returns top D1 leaderboard entries and current rank.
- `reset_game` - returns to welcome or clears score.

## Source Input Shape

`start_round` supports three modes:

- `topic` with no `sources` - search Exa for five source cards.
- no `topic` and no `sources` - use a bundled starter pack.
- exactly five `sources` - use the provided cards and spin one into the lie.

Each custom source card should match this shape:

```json
{
  "sourceName": "Nutrition Evidence Review",
  "sourceType": "Systematic review",
  "headline": "Moderate coffee intake is often associated with lower risk markers",
  "claim": "Several observational studies associate moderate coffee consumption with lower risk for some outcomes, but causality is not guaranteed.",
  "excerpt": "Residual confounding and differences in preparation method mean the evidence should not be read as a prescription.",
  "published": "2024-06-20",
  "credibilitySignal": "Uses careful causal language and flags limits of observational evidence.",
  "url": "https://example.com/source"
}
```

## Local Development

Install dependencies:

```bash
bun install
```

For a no-auth local MCP Inspector run, create `.dev.vars` with local overrides:

```bash
printf 'SUS_AUTH_REQUIRED="false"\n' >> .dev.vars
printf 'EXA_API_KEY="your-exa-api-key"\n' >> .dev.vars
```

`EXA_API_KEY` is required for arbitrary topic rounds. Bundled starter rounds and
custom-source rounds can run without Exa.

For deployment, set the required secret in Cloudflare:

```bash
npx wrangler secret put EXA_API_KEY
```

Start the Worker:

```bash
bun run dev
```

The MCP endpoint is:

```text
http://localhost:8787/mcp
```

In another terminal, launch MCP Inspector:

```bash
bun run inspect
```

Connect the inspector to `http://localhost:8787/mcp`, then call:

1. `get_rules`
2. `list_topics`
3. `start_game`
4. `start_round` with a topic, no topic, or five custom sources
5. `guess_sus_source`
6. `ask_question` if you want a clue
7. `reveal_round` or `reset_game`

## D1 Leaderboard

The deployed Worker is configured with the `SUS_DB` D1 binding. For a fresh
Cloudflare account or local setup, create the database and apply migrations:

```bash
npx wrangler d1 create sus
npx wrangler d1 migrations apply sus --local
npx wrangler d1 migrations apply sus --remote
```

If the generated `database_id` changes, update `wrangler.jsonc` and then run:

```bash
bun run types
```

## Auth Configuration

`wrangler.jsonc` currently configures Clerk as the OAuth provider and requires
auth by default:

```text
SUS_AUTH_ISSUER=https://ultimate-beagle-31.clerk.accounts.dev
SUS_AUTH_AUDIENCE=
SUS_AUTH_JWKS_URL=https://ultimate-beagle-31.clerk.accounts.dev/.well-known/jwks.json
SUS_AUTH_RESOURCE=https://sus.wt-lau.workers.dev
SUS_AUTH_SCOPE=openid profile email
SUS_AUTH_REQUIRED=true
SUS_AUTH_USERINFO_URL=https://ultimate-beagle-31.clerk.accounts.dev/oauth/userinfo
```

Leave `SUS_AUTH_AUDIENCE` blank for Clerk dynamic-client registration. When auth
is disabled locally, Sus falls back to a dev user from `?user=...`,
`x-sus-user-id`, or the MCP session.

## Workers AI

The Worker uses the `AI` binding in `wrangler.jsonc`.

- Source-card false spins use `openai/gpt-5.4-mini` through AI Gateway `default`.
- Round images use `@cf/black-forest-labs/flux-1-schnell`.
- Generated images are kept as data URIs in the active Agent state.

## Scripts

```bash
bun run dev      # wrangler dev
bun run inspect  # MCP Inspector
bun run deploy   # wrangler deploy
bun run types    # regenerate env.d.ts from wrangler.jsonc
bun run lint     # oxlint src/
bun run format   # oxfmt --write .
bun run check    # format check, lint, and TypeScript
```

## Hackathon Demo Path

1. Open Sus in ChatGPT and call `start_game`.
2. Enter a topic such as `ocean plastic`, `teen sleep`, or `battery recycling`.
3. Let the widget deal five source cards.
4. Select a suspicious card.
5. If the guess is truthful, show how the card is cleared and the suspect pool
   narrows.
6. Find or reveal the lie and show the exact false spin.
7. Open the leaderboard to show persisted results.
