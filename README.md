# Sus

**Four truths. One lie. Find the sus source.**

Sus is a source-checking game built for the moment when a claim looks credible
until one word bends the truth. Every round deals five source cards about a
topic. Four cards preserve what the evidence says. One card adds a subtle but
material spin: `may` becomes `always`, `some` becomes `all`, or an association
quietly turns into a guarantee.

The player is not hunting for silly fake news. The best lies in Sus look
reasonable. They borrow the shape of a real source, keep the right vocabulary,
and hide the problem in overconfidence. To win, players read like skeptical
analysts: compare caveats, check mechanisms, watch dates, and distrust claims
that become too absolute too quickly.

## The Story

In Sus, the internet is an evidence board and one source has been tampered with.
ChatGPT plays the narrator and game master. The Cloudflare Worker is the game
engine. The interactive widget is the table where the five cards land.

A round starts with a case file such as `Ocean plastic`, `Coffee and health`, or
`Solar storms`. The board fills with source cards that all look plausible:
agency explainers, research notes, reporting, policy briefs, or historical
records. One of them has been poisoned by a tiny false spin.

Pick the liar and the case closes. Pick a truthful card and it gets cleared from
the suspect pool, but the game gives you one source-checking question before
your next guess. That question is the clue phase: ask what wording to compare,
which caveats matter, or where the claim overreaches. When the round ends, Sus
reveals the exact false move so the player learns the pattern, not just the
answer.

## Why It Works as a Hackathon Game

- The premise is instant: five credible cards, one is lying.
- The interaction is visual: players select, clear, question, and reveal from a
  source-card board.
- The game loop teaches a real skill: spotting exaggeration, absolute language,
  missing mechanisms, and fake certainty.
- The demo can start safely with bundled starter packs, then become live and
  open-ended with Exa-powered topic rounds.
- The architecture shows the ChatGPT Apps pattern clearly: ChatGPT narrates, the
  widget visualizes, and the MCP server owns state and rules.

## Current Build

This first hackathon pass is a public remote MCP server on Cloudflare Workers
using `McpAgent`.

`start_game` now opens the rendered welcome screen first. The user picks a
topic in the widget, and only then does `start_round` deal the five-card board.
That keeps the ChatGPT entry point aligned with the MVP loop instead of dumping
the bundled sample round immediately.

The round engine supports three modes:

- Topic round: pass a topic and Sus searches Exa server-side for five source
  cards.
- Starter round: omit the topic and Sus uses a bundled demo pack.
- Custom round: pass exactly five source cards and Sus spins one into the lie.

The active session keeps score, cleared cards, clue questions, and reveal state
across MCP tool calls. Scoring now awards points for clean reads, streaks,
comebacks, and no-clue solves while tracking round grades, rank progress, and
earned badges.
Each ChatGPT app user is routed to a user-scoped Durable Object when OAuth is
configured, while completed round results are written to D1 for the shared
leaderboard.
When a player earns a question, `ask_question` uses Exa Answer when
`EXA_API_KEY` is configured and falls back to the source-card evidence if Exa is
unavailable.
Each active round can also generate one custom case image through Workers AI.
The image prompt is derived from the round topic, current state, and optional
visual direction from the widget, then returned as a session-scoped data URI.

## Local MCP

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
3. `start_game` to render the welcome UI
4. Enter a topic in the widget, or call `start_round` with a topic
5. `guess_sus_source`
6. `ask_question` when a truthful card is cleared
7. `reveal_round` if you want to expose the answer

## Judge Demo Script

For a quick demo, start with the welcome flow:

1. Call `start_game`.
2. Use the widget topic input, or call `start_round` with `Ocean plastic`.
3. Select the card that sounds too absolute.
4. If the guess is wrong, ask: `What wording should I compare next?`
5. Guess again, then reveal the round explanation.

For the live-search moment, start a new round with a topic such as `battery
recycling`, `teen sleep`, or `volcanic eruptions`. Sus asks Exa for source-like
material, normalizes the results into five cards, and introduces one small false
spin for the player to catch.

## MCP Tools

- `get_rules` - explains the rules and starter-mode behavior.
- `list_topics` - lists bundled topics available for no-topic local demos.
- `start_game` - creates a stateful session and renders the welcome UI.
- `render_source_cards` - returns the interactive HTML source-card widget for
  ChatGPT Apps.
- `start_round` - starts another five-card round inside the current session.
- `get_round` - shows the current visible game state.
- `generate_round_asset` - generates or regenerates a Workers AI image for the
  active round.
- `guess_sus_source` - selects the card suspected of being the lie.
- `ask_question` - asks one clue question after clearing a truthful card.
- `reveal_round` - reveals the answer and every card explanation.
- `get_leaderboard` - returns the D1-backed standings and the current player's
  rank.
- `reset_game` - clears the active round and optionally the score.

## Source Input Shape

`start_round` can run in three modes:

- `topic` and no `sources` - search Exa for source cards.
- No `topic` and no `sources` - use one of the bundled starter packs.
- Exactly five `sources` - use the provided source cards and spin one into a
  lie.

Each source needs:

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

## Exa Secret

Local development reads the key from `.dev.vars`:

```bash
printf 'EXA_API_KEY="your-exa-api-key"\n' >> .dev.vars
```

Set the deployed Worker secret with Wrangler:

```bash
npx wrangler secret put EXA_API_KEY
```

## Player Identity and Leaderboard

Sus uses two storage layers:

- Durable Objects keep the live MCP transport and active game state scoped to
  one resolved player.
- D1 stores completed round results and aggregate leaderboard rows across
  players.

For local development, Sus falls back to `?user=...`, `x-sus-user-id`, or the
MCP session ID when OAuth is disabled. For the ChatGPT app, Clerk is configured
as the OAuth provider so ChatGPT sends `Authorization: Bearer <token>` to
`/mcp`; the Worker verifies the token with Clerk's JWKS, reads profile data from
Clerk userinfo when available, and derives a stable hashed player ID from
`iss + sub`.

Configure these environment variables in `wrangler.jsonc` or the Cloudflare
dashboard:

```text
SUS_AUTH_ISSUER=https://ultimate-beagle-31.clerk.accounts.dev
SUS_AUTH_AUDIENCE=
SUS_AUTH_JWKS_URL=https://ultimate-beagle-31.clerk.accounts.dev/.well-known/jwks.json
SUS_AUTH_RESOURCE=https://sus.wt-lau.workers.dev
SUS_AUTH_SCOPE=openid profile email
SUS_AUTH_REQUIRED=true
SUS_AUTH_USERINFO_URL=https://ultimate-beagle-31.clerk.accounts.dev/oauth/userinfo
```

Leave `SUS_AUTH_AUDIENCE` blank for Clerk dynamic-client registration. If you
switch to a fixed Clerk OAuth client and know the expected token audience, set
it and Sus will enforce it.
Sus accepts Clerk JWT access tokens through JWKS verification and Clerk opaque
OAuth access tokens through the userinfo endpoint.

The Worker exposes OAuth protected resource metadata at:

```text
/.well-known/oauth-protected-resource
```

Create the D1 database, update `wrangler.jsonc` with the generated
`database_id` if needed for deploys, then apply migrations:

```bash
npx wrangler d1 create sus
npx wrangler d1 migrations apply sus --local
npx wrangler d1 migrations apply sus --remote
```

## Workers AI Assets

The Worker has an `AI` binding in `wrangler.jsonc`. `generate_round_asset`
uses `@cf/black-forest-labs/flux-1-schnell` to create the round image and keeps
the latest generated data URI in the `McpAgent` state for the current session.

## Next Integrations

- Cloudflare R2 storage for generated round assets.
- Clip generation from the selected topic.
