export const SUS_WIDGET_URI = "ui://widget/sus-source-cards-v5.html";
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
        --paper: #f7f8f4;
        --paper-deep: #dce7df;
        --ink: #171918;
        --muted: #66706d;
        --line: #ccd7d3;
        --panel: #ffffff;
        --accent: #b3342a;
        --accent-2: #0f766e;
        --gold: #c89b2f;
        --blue: #2f5f8a;
        --shadow: 0 14px 34px rgba(17, 31, 29, 0.1);
        font-family:
          "Avenir Next", "Segoe UI", ui-sans-serif, system-ui, sans-serif;
      }

      * {
        box-sizing: border-box;
      }

      body {
        background:
          linear-gradient(rgba(23, 25, 24, 0.035) 1px, transparent 1px),
          linear-gradient(90deg, rgba(23, 25, 24, 0.03) 1px, transparent 1px),
          linear-gradient(135deg, #fafbf7 0%, var(--paper) 48%, #edf3f5 100%);
        background-size: 22px 22px, 22px 22px, auto;
        color: var(--ink);
        margin: 0;
      }

      button,
      input {
        font: inherit;
      }

      button {
        align-items: center;
        background: var(--ink);
        border: 1px solid var(--ink);
        border-radius: 6px;
        color: #fbfffb;
        cursor: pointer;
        display: inline-flex;
        font-weight: 780;
        gap: 8px;
        justify-content: center;
        min-height: 40px;
        padding: 9px 13px;
      }

      button.secondary {
        background: rgba(255, 255, 255, 0.74);
        color: var(--ink);
      }

      button.ghost {
        background: transparent;
        border-color: transparent;
        color: var(--muted);
        min-height: 34px;
        padding-inline: 6px;
      }

      button:disabled {
        cursor: not-allowed;
        opacity: 0.48;
      }

      input {
        background: #fbfffb;
        border: 1px solid var(--line);
        border-radius: 6px;
        color: var(--ink);
        min-height: 42px;
        outline: none;
        padding: 10px 12px;
        width: 100%;
      }

      input:focus {
        border-color: var(--accent-2);
        box-shadow: 0 0 0 3px rgba(45, 111, 104, 0.14);
      }

      a {
        color: var(--blue);
      }

      h1,
      h2,
      h3,
      p {
        margin: 0;
      }

      h1,
      h2 {
        font-family:
          "Iowan Old Style", "Palatino Linotype", Georgia, serif;
        font-weight: 620;
        letter-spacing: 0;
        text-wrap: pretty;
      }

      h1 {
        font-size: clamp(30px, 6vw, 56px);
        line-height: 1;
      }

      h2 {
        font-size: 21px;
        line-height: 1.12;
      }

      h3 {
        font-size: 14px;
        letter-spacing: 0.08em;
        line-height: 1.2;
        text-transform: uppercase;
      }

      .shell {
        display: grid;
        gap: 16px;
        margin: 0 auto;
        max-width: 1120px;
        min-height: 100%;
        padding: 18px;
      }

      .welcome {
        align-items: stretch;
        display: grid;
        gap: 16px;
        grid-template-columns: minmax(0, 1fr) minmax(300px, 0.64fr);
      }

      .hero,
      .case-panel,
      .topbar,
      .focus-strip,
      .question,
      .answer,
      .summary {
        background: rgba(255, 255, 255, 0.9);
        border: 1px solid rgba(204, 215, 211, 0.88);
        border-radius: 8px;
        box-shadow: var(--shadow);
      }

      .hero {
        min-height: 430px;
        overflow: hidden;
        padding: 30px;
        position: relative;
      }

      .hero::before,
      .hero::after {
        content: "";
        position: absolute;
        pointer-events: none;
      }

      .hero::before {
        background:
          linear-gradient(90deg, transparent 0 42%, rgba(179, 52, 42, 0.22) 42% 43%, transparent 43%),
          linear-gradient(17deg, transparent 0 58%, rgba(15, 118, 110, 0.2) 58% 59%, transparent 59%);
        inset: 0;
        opacity: 0.55;
      }

      .hero::after {
        background:
          linear-gradient(90deg, transparent 0 28%, rgba(23, 25, 24, 0.08) 28% 29%, transparent 29%),
          linear-gradient(0deg, transparent 0 34%, rgba(23, 25, 24, 0.07) 34% 35%, transparent 35%);
        bottom: 26px;
        height: 120px;
        right: 30px;
        width: 220px;
      }

      .hero-content {
        display: grid;
        gap: 24px;
        max-width: 620px;
        position: relative;
        z-index: 1;
      }

      .case-mark {
        align-items: center;
        background: #fbfffb;
        border: 1px solid rgba(23, 25, 24, 0.14);
        border-radius: 8px;
        color: var(--accent);
        display: inline-flex;
        font-family:
          "Iowan Old Style", "Palatino Linotype", Georgia, serif;
        font-size: 15px;
        font-weight: 700;
        height: 72px;
        justify-content: center;
        letter-spacing: 0.08em;
        position: relative;
        text-transform: uppercase;
        width: 72px;
      }

      .case-mark::before {
        background: var(--gold);
        border: 2px solid var(--panel);
        border-radius: 999px;
        content: "";
        height: 12px;
        position: absolute;
        right: -3px;
        top: 7px;
        width: 12px;
      }

      .eyebrow {
        color: var(--accent);
        font-size: 12px;
        font-weight: 850;
        letter-spacing: 0.12em;
        text-transform: uppercase;
      }

      .lede {
        color: #35322c;
        font-size: 18px;
        line-height: 1.55;
        max-width: 560px;
      }

      .intro-flow {
        display: grid;
        gap: 8px;
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }

      .step {
        background: rgba(255, 255, 255, 0.76);
        border: 1px solid rgba(204, 215, 211, 0.86);
        border-radius: 8px;
        display: grid;
        gap: 5px;
        min-height: 92px;
        padding: 11px;
      }

      .step strong {
        font-size: 12px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .step span {
        color: #3b4542;
        font-size: 13px;
        line-height: 1.35;
      }

      .case-stack {
        bottom: 28px;
        display: grid;
        gap: 9px;
        left: 30px;
        max-width: 520px;
        position: absolute;
        right: 30px;
        z-index: 1;
      }

      .file-strip {
        align-items: center;
        background: rgba(255, 255, 255, 0.82);
        border: 1px solid rgba(204, 215, 211, 0.86);
        border-radius: 7px;
        display: grid;
        gap: 10px;
        grid-template-columns: 34px minmax(0, 1fr) auto;
        min-height: 52px;
        padding: 9px 11px;
      }

      .file-strip:nth-child(2) {
        transform: translateX(20px);
      }

      .file-strip:nth-child(3) {
        transform: translateX(8px);
      }

      .file-id {
        align-items: center;
        border: 1px solid var(--line);
        border-radius: 999px;
        color: var(--accent-2);
        display: flex;
        font-size: 12px;
        font-weight: 900;
        height: 32px;
        justify-content: center;
        width: 32px;
      }

      .file-title {
        font-size: 13px;
        font-weight: 760;
        min-width: 0;
      }

      .file-rule {
        background: currentColor;
        color: rgba(23, 25, 24, 0.26);
        height: 1px;
        width: 56px;
      }

      .case-panel {
        align-content: space-between;
        display: grid;
        gap: 22px;
        min-height: 430px;
        padding: 22px;
      }

      .case-panel-header {
        display: grid;
        gap: 8px;
      }

      .muted {
        color: var(--muted);
      }

      .message {
        color: #3c3831;
        line-height: 1.48;
      }

      .microcopy {
        color: var(--muted);
        font-size: 12px;
        line-height: 1.38;
      }

      .topic-form {
        display: grid;
        gap: 10px;
      }

      .topic-actions {
        display: grid;
        gap: 8px;
        grid-template-columns: minmax(0, 1fr) auto;
      }

      .suggestions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .suggestion {
        background: #fbfffb;
        border: 1px solid var(--line);
        border-radius: 999px;
        color: #38352f;
        min-height: 32px;
        padding: 6px 10px;
      }

      .dossier {
        border-top: 1px solid var(--line);
        display: grid;
        gap: 11px;
        padding-top: 16px;
      }

      .dossier-row {
        display: grid;
        gap: 10px;
        grid-template-columns: 90px minmax(0, 1fr);
      }

      .dossier-label {
        color: var(--muted);
        font-size: 12px;
        font-weight: 800;
        text-transform: uppercase;
      }

      .dossier-value {
        font-size: 13px;
        line-height: 1.42;
      }

      .error {
        background: #fff0eb;
        border: 1px solid #e6b7a6;
        border-radius: 7px;
        color: #7a2a17;
        line-height: 1.42;
        padding: 10px 12px;
      }

      .topbar {
        display: grid;
        gap: 12px;
        padding: 16px;
      }

      .heading {
        align-items: start;
        display: flex;
        gap: 14px;
        justify-content: space-between;
      }

      .round-title {
        display: grid;
        gap: 6px;
      }

      .round-title h1 {
        font-size: clamp(28px, 5vw, 48px);
      }

      .status {
        border: 1px solid rgba(23, 25, 24, 0.1);
        border-radius: 999px;
        display: inline-flex;
        font-size: 12px;
        font-weight: 850;
        padding: 6px 9px;
        white-space: nowrap;
      }

      .status.active,
      .status.question-answered {
        background: #e5f0ee;
        color: #1f5f58;
      }

      .status.welcome {
        background: #f5e7be;
        color: #6b5010;
      }

      .status.won {
        background: #e4f2da;
        color: #2f6425;
      }

      .status.revealed,
      .status.truth-cleared,
      .status.question-required {
        background: #f8dfd7;
        color: #7b2b15;
      }

      .toolbar {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .scorebar {
        color: var(--muted);
        display: flex;
        flex-wrap: wrap;
        font-size: 13px;
        gap: 12px;
      }

      .phase-line {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .phase-chip {
        align-items: center;
        background: #f4f8f6;
        border: 1px solid var(--line);
        border-radius: 999px;
        color: #34423f;
        display: inline-flex;
        font-size: 12px;
        font-weight: 780;
        gap: 6px;
        padding: 6px 9px;
      }

      .phase-chip.current {
        background: #e5f0ee;
        border-color: #9ec8c2;
        color: #145d55;
      }

      .focus-strip {
        display: grid;
        gap: 10px;
        grid-template-columns: minmax(190px, 0.55fr) minmax(0, 1fr);
        padding: 14px 16px;
      }

      .lens-list {
        display: grid;
        gap: 8px;
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }

      .lens {
        border-left: 2px solid var(--accent-2);
        color: #34423f;
        font-size: 12px;
        line-height: 1.35;
        padding-left: 9px;
      }

      .asset-panel {
        background: rgba(255, 255, 255, 0.86);
        border: 1px solid rgba(204, 215, 211, 0.88);
        border-radius: 8px;
        box-shadow: var(--shadow);
        display: grid;
        gap: 10px;
        padding: 12px;
      }

      .asset-preview {
        align-items: center;
        display: grid;
        gap: 12px;
        grid-template-columns: 96px minmax(0, 1fr);
      }

      .asset-image {
        aspect-ratio: 1;
        background:
          linear-gradient(135deg, rgba(15, 118, 110, 0.14), rgba(179, 52, 42, 0.08)),
          #eef4f1;
        border: 1px solid var(--line);
        border-radius: 7px;
        object-fit: cover;
        width: 100%;
      }

      .asset-copy {
        align-content: start;
        display: grid;
        gap: 8px;
      }

      .asset-form {
        display: grid;
        gap: 8px;
        grid-template-columns: minmax(0, 1fr) auto;
      }

      .asset-meta {
        color: var(--muted);
        font-size: 12px;
        line-height: 1.4;
        overflow-wrap: anywhere;
      }

      .cards {
        display: grid;
        gap: 10px;
        grid-template-columns: repeat(auto-fit, minmax(202px, 1fr));
      }

      .card {
        background: transparent;
        border: 0;
        display: block;
        min-height: 342px;
        padding: 0;
        perspective: 1200px;
        position: relative;
      }

      .card.selectable {
        cursor: pointer;
      }

      .card.selectable:hover .card-face,
      .card.selectable:focus .card-face {
        border-color: var(--accent-2);
        box-shadow:
          0 0 0 3px rgba(45, 111, 104, 0.12),
          0 18px 36px rgba(38, 30, 19, 0.14);
        outline: none;
      }

      .card-shell {
        height: 100%;
        min-height: 342px;
        position: relative;
        transform-style: preserve-3d;
        transition: transform 380ms ease;
      }

      .card.selectable:hover .card-shell,
      .card.selectable:focus .card-shell {
        transform: translateY(-2px);
      }

      .card.flipped .card-shell {
        transform: rotateY(180deg);
      }

      .card.selectable:hover.flipped .card-shell,
      .card.selectable:focus.flipped .card-shell {
        transform: rotateY(180deg) translateY(-2px);
      }

      .card-face {
        backface-visibility: hidden;
        background: rgba(255, 255, 255, 0.96);
        border: 1px solid var(--line);
        border-radius: 8px;
        box-shadow: 0 14px 32px rgba(38, 30, 19, 0.08);
        display: grid;
        gap: 10px;
        min-height: 342px;
        padding: 13px;
      }

      .card-back {
        inset: 0;
        position: absolute;
        transform: rotateY(180deg);
      }

      .card.cleared .card-face {
        background: #f0ece3;
        color: #777066;
      }

      .card.truth .card-face,
      .card.cleared .card-back {
        background: #eef7ed;
        border-color: #a8d0a6;
      }

      .card.lie .card-face {
        background: #fff0e9;
        border-color: #edab95;
      }

      .card-top {
        align-items: center;
        display: flex;
        gap: 8px;
        justify-content: space-between;
      }

      .card-id {
        align-items: center;
        background: #f4da90;
        border-radius: 999px;
        color: var(--ink);
        display: inline-flex;
        font-size: 12px;
        font-weight: 900;
        height: 30px;
        justify-content: center;
        width: 30px;
      }

      .card-state {
        color: var(--muted);
        font-size: 11px;
        font-weight: 850;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .meta,
      .claim,
      .excerpt,
      .signal,
      .reveal-list,
      .clue-list,
      .citation-list {
        font-size: 13px;
        line-height: 1.4;
      }

      .meta {
        color: var(--muted);
      }

      .claim {
        font-weight: 760;
      }

      .field-label {
        color: var(--muted);
        display: block;
        font-size: 10px;
        font-weight: 850;
        letter-spacing: 0.08em;
        margin-bottom: 4px;
        text-transform: uppercase;
      }

      .excerpt {
        color: #49453e;
      }

      .signal {
        border-top: 1px solid rgba(213, 200, 179, 0.76);
        color: #625c50;
        padding-top: 10px;
      }

      .card-footer {
        align-self: end;
        color: var(--accent-2);
        display: flex;
        flex-wrap: wrap;
        font-size: 12px;
        font-weight: 860;
        gap: 8px;
        justify-content: space-between;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .source-link {
        border-color: rgba(37, 76, 115, 0.28);
        color: var(--blue);
        min-height: 28px;
        padding: 4px 8px;
        text-decoration: none;
        text-transform: none;
      }

      .question,
      .answer,
      .summary {
        display: grid;
        gap: 12px;
        padding: 16px;
      }

      .answer-top {
        align-items: center;
        display: flex;
        gap: 8px;
        justify-content: space-between;
      }

      .source-pill {
        background: #edf4f7;
        border: 1px solid #c6dbe3;
        border-radius: 999px;
        color: #1d4655;
        font-size: 12px;
        font-weight: 850;
        padding: 4px 8px;
      }

      .question-row {
        display: grid;
        gap: 8px;
        grid-template-columns: minmax(0, 1fr) auto;
      }

      .clue-list,
      .citation-list,
      .reveal-list {
        display: grid;
        gap: 8px;
      }

      .clue,
      .citation,
      .reveal-card {
        background: rgba(255, 253, 248, 0.74);
        border: 1px solid rgba(213, 200, 179, 0.74);
        border-radius: 7px;
        padding: 10px 12px;
      }

      .citation a {
        color: var(--accent-2);
        font-weight: 760;
        overflow-wrap: anywhere;
        text-decoration: none;
      }

      .citation a:hover {
        text-decoration: underline;
      }

      .summary-grid {
        display: grid;
        gap: 12px;
        grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
      }

      .summary-hero {
        border: 1px solid var(--line);
        border-radius: 8px;
        display: grid;
        gap: 12px;
        padding: 16px;
      }

      @media (max-width: 980px) {
        .welcome,
        .focus-strip,
        .summary-grid {
          grid-template-columns: 1fr;
        }

        .hero,
        .case-panel {
          min-height: auto;
        }

        .case-stack {
          margin-top: 20px;
          position: relative;
          inset: auto;
        }

        .cards {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .lens-list {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }

      @media (max-width: 580px) {
        .shell {
          padding: 10px;
        }

        .hero,
        .case-panel,
        .topbar,
        .asset-panel,
        .question,
        .answer,
        .summary {
          border-radius: 6px;
          padding: 14px;
        }

        .topic-actions,
        .question-row,
        .asset-form,
        .asset-preview,
        .intro-flow,
        .lens-list {
          grid-template-columns: 1fr;
        }

        .heading {
          display: grid;
        }

        .cards {
          grid-template-columns: 1fr;
        }
      }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script>
      const root = document.getElementById("root");
      const savedUiState =
        (window.openai &&
          window.openai.widgetState &&
          (window.openai.widgetState.privateContent || window.openai.widgetState)) ||
        {};
      const state = {
        game: window.openai && window.openai.toolOutput ? window.openai.toolOutput : null,
        topic: savedUiState.topic || "",
        question: savedUiState.question || "",
        assetPrompt: savedUiState.assetPrompt || "",
        flippingCardId: "",
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
          }, 60000);

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
          if (nextGame) {
            state.game = nextGame;
            if (name === "start_game" || name === "start_round" || name === "reset_game") {
              state.flippingCardId = "";
            }
          }
        } catch (error) {
          state.error = error.message || String(error);
        } finally {
          state.busy = "";
          render();
        }
      }

      function syncPrefill(game) {
        if (!state.topic && game && game.prefillTopic) {
          state.topic = game.prefillTopic;
          persistUiState();
        }
      }

      function persistUiState() {
        if (!window.openai || typeof window.openai.setWidgetState !== "function") {
          return;
        }

        window.openai.setWidgetState({
          privateContent: {
            topic: state.topic,
            question: state.question,
            assetPrompt: state.assetPrompt
          }
        });
      }

      function getSuggestions(game) {
        const raw = game && Array.isArray(game.suggestedTopics) ? game.suggestedTopics : [];
        return raw
          .map((item) => (item && item.topic ? item.topic : item))
          .filter(Boolean)
          .slice(0, 5);
      }

      function render() {
        const game = state.game || {};
        syncPrefill(game);
        const reveal = game.reveal || null;
        const round = game.round || null;
        const status = game.status || (round ? "active" : "idle");

        if (!round && reveal) {
          root.innerHTML =
            '<main class="shell">' + renderSummary(game, reveal, status) + "</main>";
          bindEvents();
          notifyHeight();
          return;
        }

        if (!round) {
          root.innerHTML =
            '<main class="shell">' + renderWelcome(game, status) + "</main>";
          bindEvents();
          notifyHeight();
          return;
        }

        const cards = Array.isArray(round.cards) ? round.cards : [];
        const pendingQuestion = Boolean(round.pendingQuestion);
        const isComplete = status === "won" || status === "revealed";
        const remainingCount = cards.filter(
          (card) => card.status === "remaining"
        ).length;

        root.innerHTML = [
          '<main class="shell">',
          renderHeader(game, round, status, pendingQuestion, remainingCount, isComplete),
          renderFocusStrip(pendingQuestion, isComplete),
          renderAssetPanel(round),
          game.answer ? renderAnswer(game.answer) : "",
          renderCards(cards, pendingQuestion, isComplete),
          reveal && isComplete ? renderSummary(game, reveal, status) : "",
          pendingQuestion && !isComplete ? renderQuestion() : "",
          "</main>"
        ].join("");

        bindEvents();
        notifyHeight();
      }

      function renderWelcome(game, status) {
        const suggestions = getSuggestions(game);
        const message =
          game.message || "Start with a topic. Sus will build five source cards after you open the case.";
        const showError = state.error || status === "exa-search-failed";
        return [
          '<section class="welcome">',
          '<div class="hero">',
          '<div class="hero-content">',
          '<div class="case-mark">Sus</div>',
          '<p class="eyebrow">Four truths · one lie</p>',
          "<h1>Spot the tiny false spin.</h1>",
          '<p class="lede">Choose any topic. Sus deals five credible source cards; four stay careful, one quietly turns a caveat into certainty.</p>',
          '<div class="intro-flow" aria-label="How Sus works">',
          renderIntroStep("1", "Pick a case", "Start from a topic or one of the suggested cases."),
          renderIntroStep("2", "Compare wording", "Look for absolute claims, missing caveats, weak mechanisms, or broad scope."),
          renderIntroStep("3", "Accuse one card", "Wrong guesses clear truth and unlock one clue question."),
          "</div>",
          "</div>",
          '<div class="case-stack" aria-hidden="true">',
          renderFileStrip("A", "careful claim", "verified"),
          renderFileStrip("B", "missing caveat", "suspect"),
          renderFileStrip("C", "source signal", "compare"),
          "</div>",
          "</div>",
          '<aside class="case-panel">',
          '<div class="case-panel-header">',
          '<p class="eyebrow">New session</p>',
          "<h2>Choose a case file</h2>",
          '<p class="message">' + html(message) + "</p>",
          showError ? '<p class="error" role="alert">' + html(state.error || game.message) + "</p>" : "",
          "</div>",
          '<form class="topic-form" data-topic-form>',
          '<label class="dossier-label" for="topic-input">Topic</label>',
          '<input id="topic-input" data-topic value="' +
            html(state.topic) +
            '" placeholder="e.g. battery recycling" aria-label="Topic" />',
          '<div class="topic-actions">',
          '<button data-action="start-topic" type="submit"' +
            (state.busy ? " disabled" : "") +
            ">" +
            html(state.busy || "Start round") +
            "</button>",
          '<button class="secondary" data-action="fresh-session" type="button"' +
            (state.busy ? " disabled" : "") +
            ">Fresh session</button>",
          "</div>",
          "</form>",
          suggestions.length
            ? '<div><p class="microcopy">One-click starter cases</p><div class="suggestions">' +
                suggestions
                  .map(
                    (topic) =>
                      '<button class="suggestion" data-action="suggest-topic" data-topic-value="' +
                      html(topic) +
                      '" type="button">' +
                      html(topic) +
                      "</button>"
                  )
                  .join("") +
              "</div></div>"
            : "",
          '<div class="dossier">',
          renderDossierRow("Goal", "Find the one claim that quietly overreaches."),
          renderDossierRow("Move", "Read the cards side-by-side. Accuse only when the wording becomes too certain."),
          renderDossierRow("State", htmlStatus(status)),
          "</div>",
          "</aside>",
          "</section>"
        ].join("");
      }

      function renderIntroStep(id, title, text) {
        return (
          '<div class="step"><strong>' +
          html(id + " · " + title) +
          "</strong><span>" +
          html(text) +
          "</span></div>"
        );
      }

      function renderFileStrip(id, title, status) {
        return (
          '<div class="file-strip"><span class="file-id">' +
          html(id) +
          '</span><span class="file-title">' +
          html(title) +
          '</span><span class="file-rule"></span></div>'
        );
      }

      function renderDossierRow(label, value) {
        return (
          '<div class="dossier-row"><span class="dossier-label">' +
          html(label) +
          '</span><span class="dossier-value">' +
          value +
          "</span></div>"
        );
      }

      function renderHeader(
        game,
        round,
        status,
        pendingQuestion,
        remainingCount,
        isComplete
      ) {
        const score = game.score || {};
        return [
          '<section class="topbar">',
          '<div class="heading">',
          '<div class="round-title">',
          '<p class="eyebrow">Case board</p>',
          "<h1>" + html(round.topic) + "</h1>",
          '<p class="message">' +
            html(game.message || "Compare every card by caveats, scope, mechanism, and absolute language.") +
            "</p>",
          "</div>",
          '<span class="status ' + html(status) + '">' + htmlStatus(status) + "</span>",
          "</div>",
          renderPhaseLine(pendingQuestion, isComplete),
          '<div class="toolbar">',
          '<button class="secondary" data-action="welcome" type="button"' +
            (state.busy ? " disabled" : "") +
            ">New case</button>",
          '<button class="secondary" data-action="reveal" type="button"' +
            (state.busy || isComplete ? " disabled" : "") +
            ">Reveal</button>",
          "</div>",
          '<div class="scorebar">',
          "<span>" + html(String(remainingCount)) + " suspects remain</span>",
          "<span>" + html(String(score.wrongGuesses || 0)) + " wrong guesses</span>",
          "<span>" + html(String(score.wins || 0)) + " wins</span>",
          "<span>" +
            html(
              pendingQuestion
                ? "Question unlocked"
                : isComplete
                  ? "Round complete"
                  : "Select a card"
            ) +
            "</span>",
          "</div>",
          state.error ? '<p class="error" role="alert">' + html(state.error) + "</p>" : "",
          "</section>"
        ].join("");
      }

      function renderPhaseLine(pendingQuestion, isComplete) {
        const phase = pendingQuestion ? "question" : isComplete ? "summary" : "guess";
        return (
          '<div class="phase-line" aria-label="Round progress">' +
          renderPhaseChip("1", "Compare", phase === "guess") +
          renderPhaseChip("2", "Accuse", phase === "guess") +
          renderPhaseChip("3", "Ask clue", phase === "question") +
          renderPhaseChip("4", "Review spin", phase === "summary") +
          "</div>"
        );
      }

      function renderPhaseChip(number, label, current) {
        return (
          '<span class="phase-chip' +
          (current ? " current" : "") +
          '"><span>' +
          html(number) +
          "</span>" +
          html(label) +
          "</span>"
        );
      }

      function renderFocusStrip(pendingQuestion, isComplete) {
        const lead = isComplete
          ? "The case is closed. Read the reveal as a pattern you can use next round."
          : pendingQuestion
            ? "You earned a clue. Ask about the remaining cards before guessing again."
            : "Use the same lens on every card before you accuse one source.";

        return [
          '<section class="focus-strip" aria-label="Reading lens">',
          '<div><p class="eyebrow">Reading lens</p><p class="message">' +
            html(lead) +
            "</p></div>",
          '<div class="lens-list">',
          renderLens("Scope", "Does a narrow finding become universal?"),
          renderLens("Caveat", "Did an important limitation disappear?"),
          renderLens("Mechanism", "Is the causal path named or hand-waved?"),
          renderLens("Certainty", "Do words like all, always, or guarantees appear?"),
          "</div>",
          "</section>"
        ].join("");
      }

      function renderLens(title, text) {
        return (
          '<p class="lens"><strong>' +
          html(title) +
          "</strong><br />" +
          html(text) +
          "</p>"
        );
      }

      function renderAssetPanel(round) {
        const assets = round.assets || {};
        const image = assets.image || null;
        const hasImage = Boolean(image && image.url);
        const prompt =
          hasImage && image.prompt
            ? image.prompt
            : (round.futureAssets && round.futureAssets.artPrompt) || "";
        const buttonLabel = state.busy || (hasImage ? "Regenerate art" : "Generate art");

        return [
          '<section class="asset-panel">',
          '<div class="asset-preview">',
          hasImage
            ? '<img class="asset-image" src="' +
                html(image.url) +
                '" alt="' +
                html("Generated art for " + round.topic) +
                '" />'
            : '<div class="asset-image" role="img" aria-label="No generated art yet"></div>',
          '<div class="asset-copy">',
          '<p class="eyebrow">Optional case visual</p>',
          '<h2>' + html(hasImage ? "Case art ready" : "Generate a quick board image") + "</h2>",
          '<p class="microcopy">' + html(prompt) + "</p>",
          hasImage
            ? '<p class="asset-meta">' +
                html(image.model + " · seed " + image.seed) +
                "</p>"
            : "",
          assets.imageError
            ? '<p class="error" role="alert">' + html(assets.imageError) + "</p>"
            : "",
          '<div class="asset-form">',
          '<input data-asset-prompt value="' +
            html(state.assetPrompt) +
            '" placeholder="Optional visual direction" aria-label="Visual direction" />',
          '<button data-action="generate-asset" type="button"' +
            (state.busy ? " disabled" : "") +
            ">" +
            html(buttonLabel) +
            "</button>",
          "</div>",
          "</div>",
          "</div>",
          "</section>"
        ].join("");
      }

      function renderCards(cards, pendingQuestion, isComplete) {
        return (
          '<section class="cards" aria-label="Source cards">' +
          cards
            .map((card) => {
              const selectable =
                !state.busy &&
                card.status === "remaining" &&
                !pendingQuestion &&
                !isComplete;
              const isFlipped =
                state.flippingCardId === card.id || card.status !== "remaining";
              return (
                '<article class="card ' +
                html(card.status) +
                (selectable ? " selectable" : "") +
                (isFlipped ? " flipped" : "") +
                '"' +
                (selectable
                  ? ' role="button" tabindex="0" data-action="guess" data-card-id="' +
                    html(card.id) +
                    '"'
                  : "") +
                ' aria-label="Card ' +
                html(card.id) +
                ": " +
                html(card.headline) +
                '">' +
                '<div class="card-shell">' +
                '<div class="card-face card-front">' +
                '<div class="card-top"><span class="card-id">' +
                html(card.id) +
                '</span><span class="card-state">' +
                html(cardStateLabel(card.status)) +
                "</span></div>" +
                "<h2>" +
                html(card.headline) +
                "</h2>" +
                '<p class="meta">' +
                html(card.sourceName + " · " + card.sourceType + " · " + card.published) +
                "</p>" +
                '<p class="claim">' +
                '<span class="field-label">Claim</span>' +
                html(card.claim) +
                "</p>" +
                '<p class="excerpt">' +
                '<span class="field-label">Evidence note</span>' +
                html(card.excerpt) +
                "</p>" +
                '<p class="signal">' +
                '<span class="field-label">Credibility signal</span>' +
                html(card.credibilitySignal) +
                "</p>" +
                '<div class="card-footer">' +
                '<span>' +
                html(selectable ? "Click to accuse" : cardStateLabel(card.status)) +
                "</span>" +
                renderSourceLink(card) +
                "</div>" +
                "</div>" +
                renderCardBack(card, state.flippingCardId === card.id) +
                "</div>" +
                "</article>"
              );
            })
            .join("") +
          "</section>"
        );
      }

      function renderSourceLink(card) {
        if (!card.url) return "";

        return (
          '<button class="secondary source-link" data-action="open-source" data-url="' +
          html(card.url) +
          '" type="button">Open source</button>'
        );
      }

      function renderCardBack(card, isChecking) {
        const title =
          card.status === "lie"
            ? "Lie found"
            : card.status === "truth" || card.status === "cleared"
              ? "Truth checked"
              : "Checking";
        const body =
          card.explanation ||
          (isChecking
            ? "Checking this card against the hidden answer."
            : "This result is available after the card is checked.");
        const verdict = card.verdict || (card.status === "cleared" ? "truth" : card.status);

        return (
          '<div class="card-face card-back">' +
          '<div class="card-top"><span class="card-id">' +
          html(card.id) +
          '</span><span class="card-state">' +
          html(verdict === "lie" ? "Lie" : verdict === "truth" ? "Truth" : "Checking") +
          "</span></div>" +
          "<h2>" +
          html(title) +
          "</h2>" +
          '<p class="message">' +
          html(body) +
          "</p>" +
          '<p class="signal">' +
          html(
            verdict === "lie"
              ? "The round is solved. Review the summary to see the full source spin."
              : "This card leaves the suspect pool but stays visible for comparison."
          ) +
          "</p>" +
          '<div class="card-footer"><span>' +
          html(cardStateLabel(card.status)) +
          "</span>" +
          renderSourceLink(card) +
          "</div>" +
          "</div>"
        );
      }

      function renderQuestion() {
        return [
          '<section class="question">',
          "<h3>One clue question</h3>",
          '<p class="message muted">You cleared a truthful card. Ask one source-checking question before the next guess.</p>',
          '<div class="question-row">',
          '<input data-question value="' +
            html(state.question) +
            '" placeholder="What wording should I compare next?" aria-label="Question" />',
          '<button data-action="ask" type="button"' +
            (state.busy ? " disabled" : "") +
            ">" +
            html(state.busy || "Ask") +
            "</button>",
          "</div>",
          '<div class="suggestions" aria-label="Suggested clue questions">',
          renderQuestionPreset("What wording should I compare next?"),
          renderQuestionPreset("Which remaining card overclaims causation?"),
          renderQuestionPreset("Which caveat matters most here?"),
          "</div>",
          "</section>"
        ].join("");
      }

      function renderQuestionPreset(question) {
        return (
          '<button class="suggestion" data-action="preset-question" data-question-value="' +
          html(question) +
          '" type="button">' +
          html(question) +
          "</button>"
        );
      }

      function renderAnswer(answer) {
        const clues = Array.isArray(answer.clues) ? answer.clues : [];
        const citations = Array.isArray(answer.citations) ? answer.citations : [];
        return [
          '<section class="answer">',
          '<div class="answer-top">',
          "<h3>Clue filed</h3>",
          '<span class="source-pill">' +
            html(answer.source || "source check") +
            "</span>",
          "</div>",
          '<p class="message">' + html(answer.summary || "") + "</p>",
          citations.length
            ? '<div class="citation-list">' +
                citations
                  .slice(0, 5)
                  .map(
                    (citation) =>
                      '<p class="citation"><a href="' +
                      html(citation.url) +
                      '" target="_blank" rel="noreferrer">' +
                      html(citation.title) +
                      "</a>" +
                      html(citation.published ? " · " + citation.published : "") +
                      "</p>"
                  )
                  .join("") +
              "</div>"
            : "",
          clues.length
            ? '<div class="clue-list">' +
                clues
                  .map(
                    (clue) =>
                      '<p class="clue"><strong>' +
                      html(clue.cardId + " · " + clue.sourceName) +
                      ":</strong> " +
                      html(clue.clue) +
                      "</p>"
                  )
                  .join("") +
              "</div>"
            : "",
          "</section>"
        ].join("");
      }

      function renderSummary(game, reveal, status) {
        const cards = Array.isArray(reveal.cards) ? reveal.cards : [];
        const lie = cards.find((card) => card.verdict === "lie");
        const guesses = Array.isArray(reveal.guesses) ? reveal.guesses : [];
        const questions = Array.isArray(reveal.questions) ? reveal.questions : [];
        const wrongGuesses = guesses.filter(
          (guess) => guess && guess.result === "truth"
        ).length;
        return [
          '<section class="summary">',
          '<div class="heading">',
          '<div class="round-title">',
          '<p class="eyebrow">Round summary</p>',
          "<h1>" + html(reveal.topic || "Case closed") + "</h1>",
          '<p class="message">' +
            html(game.message || "The source board is revealed.") +
            "</p>",
          "</div>",
          '<span class="status ' + html(status) + '">' + htmlStatus(status) + "</span>",
          "</div>",
          '<div class="summary-grid">',
          '<div class="summary-hero">',
          "<h2>" + html(lie ? "Sus source: card " + lie.id : "Case revealed") + "</h2>",
          '<p class="message">' + html(lie ? lie.explanation : "Review each explanation before starting another case.") + "</p>",
          '<div class="scorebar">',
          "<span>" + html(String(wrongGuesses)) + " wrong guesses</span>",
          "<span>" + html(String(questions.length)) + " questions asked</span>",
          "<span>" + html(String(cards.length)) + " source cards reviewed</span>",
          "</div>",
          '<div class="toolbar">',
          '<button data-action="welcome" type="button">Play again</button>',
          '<button class="secondary" data-action="close" type="button">Quit</button>',
          "</div>",
          "</div>",
          '<div class="reveal-list">',
          cards
            .map(
              (card) =>
                '<div class="reveal-card"><p><strong>' +
                html(card.id + " · " + card.verdict) +
                "</strong></p><p>" +
                html(card.explanation) +
                "</p></div>"
            )
            .join(""),
          "</div>",
          "</div>",
          state.error ? '<p class="error" role="alert">' + html(state.error) + "</p>" : "",
          "</section>"
        ].join("");
      }

      function htmlStatus(status) {
        const labels = {
          idle: "Idle",
          welcome: "Welcome",
          active: "Active",
          won: "Solved",
          revealed: "Revealed",
          "truth-cleared": "Truth cleared",
          "question-required": "Question required",
          "question-answered": "Question answered",
          "exa-search-failed": "Search failed"
        };
        return labels[status] || status;
      }

      function cardStateLabel(status) {
        const labels = {
          remaining: "Suspect",
          cleared: "Cleared",
          truth: "Truth",
          lie: "Lie"
        };
        return labels[status] || status;
      }

      function bindEvents() {
        const topicInput = root.querySelector("[data-topic]");
        if (topicInput) {
          topicInput.addEventListener("input", (event) => {
            state.topic = event.target.value;
            persistUiState();
          });
        }

        const topicForm = root.querySelector("[data-topic-form]");
        if (topicForm) {
          topicForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            await startTopicRound();
          });
        }

        const questionInput = root.querySelector("[data-question]");
        if (questionInput) {
          questionInput.addEventListener("input", (event) => {
            state.question = event.target.value;
            persistUiState();
          });
        }

        const assetPromptInput = root.querySelector("[data-asset-prompt]");
        if (assetPromptInput) {
          assetPromptInput.addEventListener("input", (event) => {
            state.assetPrompt = event.target.value;
            persistUiState();
          });
        }

        root.querySelectorAll("[data-action]").forEach((element) => {
          element.addEventListener("click", async (event) => {
            const action = element.getAttribute("data-action");
            if (action === "start-topic") {
              event.preventDefault();
              await startTopicRound();
            }
            if (action === "suggest-topic") {
              state.topic = element.getAttribute("data-topic-value") || "";
              state.error = "";
              persistUiState();
              await startTopicRound();
            }
            if (action === "fresh-session") {
              await runTool("start_game", { restart: true }, "Opening");
            }
            if (action === "welcome") {
              await runTool("reset_game", {}, "Resetting");
            }
            if (action === "reveal") {
              await runTool("reveal_round", {}, "Revealing");
            }
            if (action === "open-source") {
              event.preventDefault();
              event.stopPropagation();
              await openSource(element.getAttribute("data-url"));
              return;
            }
            if (action === "generate-asset") {
              const round = state.game && state.game.round;
              const hasImage = Boolean(
                round && round.assets && round.assets.image
              );
              await runTool(
                "generate_round_asset",
                {
                  prompt: state.assetPrompt.trim() || undefined,
                  force: hasImage
                },
                "Generating art"
              );
            }
            if (action === "guess") {
              state.flippingCardId = element.getAttribute("data-card-id") || "";
              await runTool(
                "guess_sus_source",
                { cardId: element.getAttribute("data-card-id") },
                "Checking"
              );
            }
            if (action === "ask") {
              const question = state.question.trim();
              if (question.length < 3) {
                state.error = "Ask a source-checking question first.";
                render();
                return;
              }
              await runTool("ask_question", { question }, "Answering");
              state.question = "";
              persistUiState();
              render();
            }
            if (action === "preset-question") {
              const question = element.getAttribute("data-question-value") || "";
              state.question = question;
              persistUiState();
              await runTool("ask_question", { question }, "Answering");
              state.question = "";
              persistUiState();
              render();
            }
            if (action === "close") {
              if (window.openai && typeof window.openai.requestClose === "function") {
                await window.openai.requestClose();
                return;
              }
              await runTool("reset_game", { clearScore: true }, "Closing");
            }
          });
        });

        root.querySelectorAll('[data-action="guess"]').forEach((card) => {
          card.addEventListener("keydown", async (event) => {
            if (event.key !== "Enter" && event.key !== " ") return;
            event.preventDefault();
            state.flippingCardId = card.getAttribute("data-card-id") || "";
            await runTool(
              "guess_sus_source",
              { cardId: card.getAttribute("data-card-id") },
              "Checking"
            );
          });
        });
      }

      async function startTopicRound() {
        const topic = state.topic.trim();
        if (topic.length < 2) {
          state.error = "Enter a topic before starting the round.";
          render();
          return;
        }
        persistUiState();
        await runTool("start_round", { topic }, "Building case");
      }

      async function openSource(url) {
        if (!url) return;
        if (window.openai && typeof window.openai.openExternal === "function") {
          await window.openai.openExternal({ href: url, redirectUrl: false });
          return;
        }
        window.open(url, "_blank", "noopener,noreferrer");
      }

      function notifyHeight() {
        if (window.openai && typeof window.openai.notifyIntrinsicHeight === "function") {
          window.openai.notifyIntrinsicHeight();
        }
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
