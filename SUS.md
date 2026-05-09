# Sus Overall Game Flow

Sus is a source-checking game where ChatGPT hosts the session, the Sus Agent
MCP server owns the game state, and the rendered UI lets the player inspect and
guess from five source cards. Each round has four truthful cards and one
source-derived card with a subtle false spin.

## MVP Game Loop

1. The user asks ChatGPT to start a new session of Sus.
2. ChatGPT returns the Sus rendered UI.
3. The first screen is a welcome page that prompts the user to enter a topic.
4. The user enters a topic and starts the round.
5. The Sus Agent MCP server requests five relevant sources from Exa.
6. The server keeps four cards truthful and chooses one card to receive a minor
   but material spin, turning it into the lie.
7. ChatGPT returns an interactive source-card board with five cards.
8. The user selects the card they think is the lie.
9. The selected card flips over in the UI to reveal whether it is truth or lie.
10. If the selected card is the lie, the player wins the round.
11. If the selected card is truthful, the card is cleared from the suspect pool.
12. The player guesses again from the remaining uncleared cards.
13. The guess loop repeats until the lie is found.
14. When the lie is found, the UI reveals the false spin and the round summary.
15. The user returns to the welcome page and can start another round.
16. The user may quit the game.

## Primary Screens

### Welcome Page

The welcome page is the first rendered UI after ChatGPT starts Sus. It should
feel like the start of a case file, not a rules manual.

Required controls:

- Topic input.
- Start game button.
- Optional suggested topics.
- Quit or close action if the host supports it.

The welcome page should be reachable again after a completed round.

### Source Card Board

The board shows five source cards for the chosen topic. Each card should look
credible enough to inspect, compare, and challenge.

Each card should show:

- Source name.
- Source type.
- Headline.
- Main claim.
- Short excerpt.
- Credibility signal.
- Published date when available.
- Source link when available.

The lie should not look obviously fake. It should usually be a truthful source
with one small but meaningful distortion, such as:

- `may` becoming `always`.
- `some` becoming `all`.
- An association becoming a guarantee.
- A caveat being removed.
- A narrow finding being applied too broadly.

### Card Reveal Interaction

When the user selects a card, the UI should treat the card itself as the
interactive object. The preferred interaction is:

1. The user taps or clicks the card.
2. The card animates with a flip or spin.
3. The back of the card reveals the result.

Truth card back:

- Shows that the card is truthful.
- Explains why the claim is supported.
- Marks the card as cleared.
- Keeps the remaining suspect cards available for the next guess.

Lie card back:

- Shows that the card is the lie.
- Explains the exact false spin.
- Shows what the original evidence supported.
- Ends the round and opens the post-round summary.

### Optional Clue Questions

The main game loop should not force a search or question after a wrong guess.
If the player explicitly asks for a clue, the answer should help compare
remaining cards without directly naming the lie unless the evidence makes the
answer unavoidable.

Good question examples:

- What wording should I compare next?
- Which card has the strongest overclaim?
- Are any of these claims confusing association with causation?
- Which caveat matters most for this topic?
- What source detail should I verify before guessing?

The answer should come from Exa Answer or Exa-backed evidence, then the user
returns to the card board with cleared cards disabled.

### Round Summary

After the lie is found, Sus shows the round result.

The summary should include:

- The topic.
- The lie card.
- The exact false spin.
- Why the other cards were truthful.
- Number of wrong guesses.
- Number of questions asked.
- A play again action that returns to the welcome page.
- A quit action.

## State Model

Sus needs enough state to keep the board interactive across ChatGPT and MCP tool
calls.

Core session state:

- Session id.
- Current status: welcome, active, won, or quit.
- Current topic.
- Five source cards.
- Lie card id.
- Cleared card ids.
- Guess history.
- Question history.
- Round result.

Card states:

- `unselected`: card is still a suspect.
- `selected`: card is currently being evaluated.
- `cleared`: card was guessed and proven truthful.
- `lie-found`: card was guessed and proven to be the lie.

## MCP Responsibilities

ChatGPT should guide the player and render the UI, but the Sus Agent MCP server
should own the rules.

The server should:

- Start a session.
- Render the welcome UI.
- Accept the user's topic.
- Request sources from Exa.
- Normalize Exa results into five source cards.
- Choose one card to spin into the lie.
- Persist the round state.
- Evaluate guesses.
- Track cleared cards and remaining suspects.
- Answer optional clue questions when explicitly requested.
- Reveal the round once the lie is found.
- Reset to the welcome page for another game.
- Quit the session when requested.

## UX Rules

- The player should never need to memorize rules before starting.
- The board should make comparison easy: five cards, consistent fields, clear
  source signals.
- The lie should be subtle, not silly.
- Wrong guesses should feel useful because they narrow the suspect pool.
- The card flip should reveal the result without replacing the whole board.
- Cleared cards should stay visible but disabled, so the player can compare
  what has already been ruled out.
- The game should always offer a clear next action: guess again, play again, or
  quit.
