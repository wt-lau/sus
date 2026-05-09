export const SUS_WIDGET_URI = "ui://widget/sus-source-cards-v1.html";
export const SUS_WIDGET_MIME_TYPE = "text/html;profile=mcp-app";

export const SUS_WIDGET_HTML = `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      :root {
        color-scheme: light;
        font-family:
          Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
          "Segoe UI", sans-serif;
      }

      * {
        box-sizing: border-box;
      }

      body {
        background: #f7f4ee;
        color: #151515;
        margin: 0;
      }

      button,
      input {
        font: inherit;
      }

      button {
        background: #151515;
        border: 1px solid #151515;
        border-radius: 6px;
        color: #ffffff;
        cursor: pointer;
        font-weight: 750;
        min-height: 38px;
        padding: 8px 12px;
      }

      button.secondary {
        background: #ffffff;
        color: #151515;
      }

      button:disabled {
        cursor: not-allowed;
        opacity: 0.55;
      }

      input {
        background: #ffffff;
        border: 1px solid #d9d2c5;
        border-radius: 6px;
        color: #151515;
        min-height: 38px;
        padding: 8px 10px;
        width: 100%;
      }

      .shell {
        display: grid;
        gap: 16px;
        margin: 0 auto;
        max-width: 980px;
        padding: 18px;
      }

      .topbar,
      .question,
      .reveal {
        background: #ffffff;
        border: 1px solid #ddd6ca;
        border-radius: 8px;
        padding: 14px;
      }

      .heading {
        align-items: start;
        display: flex;
        gap: 12px;
        justify-content: space-between;
      }

      .eyebrow {
        color: #646156;
        font-size: 12px;
        font-weight: 850;
        letter-spacing: 0;
        margin: 0 0 6px;
        text-transform: uppercase;
      }

      h1,
      h2,
      h3,
      p {
        margin: 0;
      }

      h1 {
        font-size: 28px;
        line-height: 1.1;
      }

      h2 {
        font-size: 18px;
        line-height: 1.25;
      }

      h3 {
        font-size: 15px;
        line-height: 1.25;
      }

      .muted {
        color: #5d5a50;
      }

      .message {
        color: #2f2d28;
        line-height: 1.45;
        margin-top: 10px;
      }

      .controls,
      .question-row {
        display: grid;
        gap: 8px;
        grid-template-columns: minmax(0, 1fr) auto auto;
        margin-top: 14px;
      }

      .cards {
        display: grid;
        gap: 12px;
        grid-template-columns: repeat(5, minmax(0, 1fr));
      }

      .card {
        background: #ffffff;
        border: 1px solid #d8d2c5;
        border-radius: 8px;
        display: grid;
        gap: 10px;
        min-height: 310px;
        padding: 14px;
      }

      .card.cleared {
        background: #f3f1ec;
        color: #777267;
      }

      .card.truth {
        background: #f0f8f0;
        border-color: #b7dcb8;
      }

      .card.lie {
        background: #fff1ea;
        border-color: #f0b69f;
      }

      .card-id {
        align-items: center;
        background: #f4d35e;
        border-radius: 999px;
        color: #151515;
        display: inline-flex;
        font-size: 12px;
        font-weight: 900;
        height: 28px;
        justify-content: center;
        width: 28px;
      }

      .meta,
      .claim,
      .excerpt,
      .signal,
      .reveal-list {
        font-size: 13px;
        line-height: 1.4;
      }

      .claim {
        font-weight: 750;
      }

      .excerpt {
        color: #4a473f;
      }

      .signal {
        color: #625e53;
      }

      .card-footer {
        align-self: end;
      }

      .status {
        border-radius: 999px;
        display: inline-flex;
        font-size: 12px;
        font-weight: 850;
        padding: 5px 8px;
      }

      .status.active {
        background: #e8f1ff;
        color: #173b74;
      }

      .status.won {
        background: #dff4df;
        color: #205922;
      }

      .status.revealed {
        background: #ffe4dc;
        color: #7b2b15;
      }

      .reveal-list {
        display: grid;
        gap: 8px;
        margin-top: 10px;
      }

      @media (max-width: 840px) {
        .cards {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .controls,
        .question-row {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 520px) {
        .cards {
          grid-template-columns: 1fr;
        }

        .heading {
          display: grid;
        }
      }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script>
      const root = document.getElementById("root");
      const state = {
        game: window.openai && window.openai.toolOutput ? window.openai.toolOutput : null,
        topic: "",
        question: "",
        busy: "",
        error: ""
      };

      function getStructuredContent(result) {
        if (!result) return null;
        if (result.structuredContent) return result.structuredContent;
        if (result.result && result.result.structuredContent) {
          return result.result.structuredContent;
        }
        return result;
      }

      function html(value) {
        return String(value ?? "")
          .replaceAll("&", "&amp;")
          .replaceAll("<", "&lt;")
          .replaceAll(">", "&gt;")
          .replaceAll('"', "&quot;")
          .replaceAll("'", "&#039;");
      }

      function callBridge(method, params) {
        return new Promise((resolve, reject) => {
          const id = "sus-" + Math.random().toString(36).slice(2);
          const timeout = window.setTimeout(() => {
            window.removeEventListener("message", onMessage);
            reject(new Error("Timed out waiting for " + method));
          }, 30000);

          function onMessage(event) {
            if (event.source !== window.parent) return;
            const message = event.data;
            if (!message || message.jsonrpc !== "2.0" || message.id !== id) {
              return;
            }
            window.clearTimeout(timeout);
            window.removeEventListener("message", onMessage);
            if (message.error) {
              reject(new Error(message.error.message || "Tool call failed"));
              return;
            }
            resolve(message.result);
          }

          window.addEventListener("message", onMessage);
          window.parent.postMessage(
            { jsonrpc: "2.0", id, method, params },
            "*"
          );
        });
      }

      async function callTool(name, args) {
        if (window.openai && typeof window.openai.callTool === "function") {
          return getStructuredContent(await window.openai.callTool(name, args));
        }
        return getStructuredContent(
          await callBridge("tools/call", { name, arguments: args })
        );
      }

      async function runTool(name, args, label) {
        state.busy = label || name;
        state.error = "";
        render();

        try {
          const nextGame = await callTool(name, args || {});
          if (nextGame) state.game = nextGame;
        } catch (error) {
          state.error = error.message || String(error);
        } finally {
          state.busy = "";
          render();
        }
      }

      function render() {
        const game = state.game || {};
        const round = game.round;
        const cards = round && Array.isArray(round.cards) ? round.cards : [];
        const revealCards =
          game.reveal && Array.isArray(game.reveal.cards) ? game.reveal.cards : [];
        const status = game.status || "idle";
        const isComplete = status === "won" || status === "revealed";
        const pendingQuestion = Boolean(round && round.pendingQuestion);
        const remainingCount = cards.filter(
          (card) => card.status === "remaining"
        ).length;

        root.innerHTML = [
          '<main class="shell">',
          renderHeader(
            game,
            round,
            status,
            pendingQuestion,
            remainingCount,
            isComplete
          ),
          round ? renderCards(cards, pendingQuestion, isComplete) : "",
          round && pendingQuestion && !isComplete ? renderQuestion() : "",
          revealCards.length ? renderReveal(revealCards) : "",
          "</main>"
        ].join("");

        bindEvents();
      }

      function renderHeader(
        game,
        round,
        status,
        pendingQuestion,
        remainingCount,
        isComplete
      ) {
        return [
          '<section class="topbar">',
          '<div class="heading">',
          "<div>",
          '<p class="eyebrow">Sus source check</p>',
          "<h1>" + html(round ? round.topic : "Start a session") + "</h1>",
          '<p class="message">' +
            html(game.message || "Pick the one card that added a subtle false spin.") +
            "</p>",
          "</div>",
          '<span class="status ' + html(status) + '">' + html(status) + "</span>",
          "</div>",
          '<div class="controls">',
          '<input data-topic value="' +
            html(state.topic) +
            '" placeholder="Topic, e.g. solar storms" aria-label="Topic" />',
          '<button data-action="new-session"' +
            (state.busy ? " disabled" : "") +
            ">New session</button>",
          '<button class="secondary" data-action="reveal"' +
            (state.busy || !round ? " disabled" : "") +
            ">Reveal</button>",
          "</div>",
          round
            ? '<p class="message muted">' +
                html(
                  String(remainingCount) +
                    " cards remain. " +
                    (pendingQuestion
                      ? "Ask one question before your next guess."
                      : isComplete
                        ? "Round complete."
                        : "Select the card you think is lying.")
                ) +
              "</p>"
            : "",
          state.error ? '<p class="message" role="alert">' + html(state.error) + "</p>" : "",
          "</section>"
        ].join("");
      }

      function renderCards(cards, pendingQuestion, isComplete) {
        return (
          '<section class="cards">' +
          cards
            .map(
              (card) =>
                '<article class="card ' +
                html(card.status) +
                '">' +
                '<span class="card-id">' +
                html(card.id) +
                "</span>" +
                "<div><h2>" +
                html(card.headline) +
                "</h2></div>" +
                '<p class="meta muted">' +
                html(card.sourceName + " - " + card.sourceType + " - " + card.published) +
                "</p>" +
                '<p class="claim">' +
                html(card.claim) +
                "</p>" +
                '<p class="excerpt">' +
                html(card.excerpt) +
                "</p>" +
                '<p class="signal">' +
                html(card.credibilitySignal) +
                "</p>" +
                '<div class="card-footer"><button data-action="guess" data-card-id="' +
                html(card.id) +
                '"' +
                (state.busy ||
                card.status !== "remaining" ||
                pendingQuestion ||
                isComplete
                  ? " disabled"
                  : "") +
                ">" +
                (card.status === "cleared" ? "Cleared" : "Select") +
                "</button></div>" +
                "</article>"
            )
            .join("") +
          "</section>"
        );
      }

      function renderQuestion() {
        return [
          '<section class="question">',
          "<h3>Ask a question</h3>",
          '<div class="question-row">',
          '<input data-question value="' +
            html(state.question) +
            '" placeholder="What wording or evidence should I compare next?" aria-label="Question" />',
          '<button data-action="ask"' +
            (state.busy || state.question.trim().length < 3 ? " disabled" : "") +
            ">Ask</button>",
          "</div>",
          "</section>"
        ].join("");
      }

      function renderReveal(cards) {
        return (
          '<section class="reveal"><h3>Reveal</h3><div class="reveal-list">' +
          cards
            .map(
              (card) =>
                "<p><strong>" +
                html(card.id + " - " + card.verdict + ": ") +
                "</strong>" +
                html(card.explanation) +
                "</p>"
            )
            .join("") +
          "</div></section>"
        );
      }

      function bindEvents() {
        const topicInput = root.querySelector("[data-topic]");
        if (topicInput) {
          topicInput.addEventListener("input", (event) => {
            state.topic = event.target.value;
          });
        }

        const questionInput = root.querySelector("[data-question]");
        if (questionInput) {
          questionInput.addEventListener("input", (event) => {
            state.question = event.target.value;
            render();
          });
        }

        root.querySelectorAll("[data-action]").forEach((button) => {
          button.addEventListener("click", async () => {
            const action = button.getAttribute("data-action");
            if (action === "new-session") {
              await runTool(
                "start_game",
                { topic: state.topic || undefined, restart: true },
                "Starting"
              );
            }
            if (action === "reveal") {
              await runTool("reveal_round", {}, "Revealing");
            }
            if (action === "guess") {
              await runTool(
                "guess_sus_source",
                { cardId: button.getAttribute("data-card-id") },
                "Checking"
              );
            }
            if (action === "ask") {
              const question = state.question;
              await runTool("ask_question", { question }, "Answering");
              state.question = "";
              render();
            }
          });
        });
      }

      window.addEventListener(
        "openai:set_globals",
        (event) => {
          const nextOutput =
            event.detail && event.detail.globals && event.detail.globals.toolOutput;
          if (nextOutput) {
            state.game = nextOutput;
            render();
          }
        },
        { passive: true }
      );

      window.addEventListener(
        "message",
        (event) => {
          if (event.source !== window.parent) return;
          const message = event.data;
          if (
            !message ||
            message.jsonrpc !== "2.0" ||
            message.method !== "ui/notifications/tool-result"
          ) {
            return;
          }
          const nextOutput = getStructuredContent(message.params);
          if (nextOutput) {
            state.game = nextOutput;
            render();
          }
        },
        { passive: true }
      );

      render();
    </script>
  </body>
</html>
`.trim();
