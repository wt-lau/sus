# Sus

Sus is a source-checking game where five source cards look credible, but one is lying.

This first pass is a public remote MCP server on Cloudflare Workers using `McpAgent`. It is intentionally local and self-contained: the starter rounds are bundled in code, so Exa, Fal, and R2 are not required yet.

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
3. `start_round`
4. `guess_sus_source`
5. `ask_question` when a truthful card is cleared

## MCP Tools

- `get_rules` - game rules and starter-mode note.
- `list_topics` - bundled topics available without external APIs.
- `start_round` - starts a five-card round.
- `get_round` - shows current visible game state.
- `guess_sus_source` - guesses the lying card.
- `ask_question` - asks one clue question after clearing a truthful card.
- `reveal_round` - reveals the answer.
- `reset_game` - clears the active round and optionally the score.

## Next Integrations

- Exa API server-side source search and citation collection.
- Fal image and clip generation from the selected topic.
- Cloudflare R2 storage for generated round assets.
- ChatGPT Apps SDK UI resource once the MCP game contract is stable.
