export const SUS_WIDGET_URI = "ui://widget/sus-source-cards-v9.html";
export const SUS_WIDGET_MIME_TYPE = "text/html;profile=mcp-app";

export const SUS_WIDGET_HTML = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,500;1,6..72,600&family=Inter:wght@400;450;500;600;700&display=swap"
    />
    <style>
      :root {
        color-scheme: light dark;

        --surface-page: #faf8f3;
        --surface-card: #ffffff;
        --surface-subtle: #f1efe7;
        --surface-sunken: #ebe8df;

        --border-hairline: rgba(20, 20, 20, 0.08);
        --border-soft: rgba(20, 20, 20, 0.12);
        --border-firm: rgba(20, 20, 20, 0.22);

        --ink-primary: #16181a;
        --ink-secondary: #4a4a47;
        --ink-tertiary: #7a766c;
        --ink-inverse: #faf8f3;

        --accent: #a8312f;
        --accent-hover: #8c2825;
        --accent-soft: rgba(168, 49, 47, 0.08);
        --accent-strong: rgba(168, 49, 47, 0.18);

        --truth: #2c6e49;
        --truth-soft: rgba(44, 110, 73, 0.08);
        --truth-border: rgba(44, 110, 73, 0.28);
        --lie: #a8312f;
        --lie-soft: rgba(168, 49, 47, 0.08);
        --lie-border: rgba(168, 49, 47, 0.30);

        --shadow-sm: 0 1px 2px rgba(20, 18, 14, 0.04);
        --shadow-md: 0 4px 14px rgba(20, 18, 14, 0.06);
        --shadow-lg: 0 12px 36px rgba(20, 18, 14, 0.10);
        --shadow-card-hover: 0 6px 20px rgba(20, 18, 14, 0.08);

        --radius-sm: 6px;
        --radius-md: 10px;
        --radius-lg: 14px;

        --font-display: "Newsreader", "Iowan Old Style", "Palatino Linotype",
          Georgia, serif;
        --font-sans: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
          Roboto, sans-serif;

        font-family: var(--font-sans);
        font-feature-settings: "ss01", "cv11";
        color: var(--ink-primary);
        background: var(--surface-page);
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }

      @media (prefers-color-scheme: dark) {
        :root {
          --surface-page: #131316;
          --surface-card: #1d1d22;
          --surface-subtle: #1a1a1e;
          --surface-sunken: #101013;

          --border-hairline: rgba(255, 255, 255, 0.06);
          --border-soft: rgba(255, 255, 255, 0.10);
          --border-firm: rgba(255, 255, 255, 0.18);

          --ink-primary: #f3f1ec;
          --ink-secondary: #b6b2a8;
          --ink-tertiary: #84807a;
          --ink-inverse: #131316;

          --accent: #ec605c;
          --accent-hover: #f3766f;
          --accent-soft: rgba(236, 96, 92, 0.10);
          --accent-strong: rgba(236, 96, 92, 0.20);

          --truth: #74c69d;
          --truth-soft: rgba(116, 198, 157, 0.10);
          --truth-border: rgba(116, 198, 157, 0.30);
          --lie: #ec605c;
          --lie-soft: rgba(236, 96, 92, 0.10);
          --lie-border: rgba(236, 96, 92, 0.30);
        }
      }

      *,
      *::before,
      *::after {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        background: var(--surface-page);
        color: var(--ink-primary);
        font-family: var(--font-sans);
        font-size: 15px;
        line-height: 1.55;
      }

      h1,
      h2,
      h3,
      h4,
      p {
        margin: 0;
      }

      button {
        font: inherit;
        cursor: pointer;
        border: 1px solid transparent;
        border-radius: var(--radius-sm);
        padding: 11px 18px;
        background: var(--ink-primary);
        color: var(--ink-inverse);
        font-weight: 500;
        letter-spacing: -0.005em;
        transition: background 140ms ease, border-color 140ms ease,
          color 140ms ease, transform 140ms ease;
        text-align: center;
        white-space: nowrap;
      }

      button:hover {
        background: var(--ink-secondary);
      }

      button:focus-visible {
        outline: 2px solid var(--accent);
        outline-offset: 2px;
      }

      button:disabled {
        cursor: not-allowed;
        opacity: 0.5;
      }

      .btn-secondary {
        background: var(--surface-card);
        color: var(--ink-primary);
        border-color: var(--border-firm);
      }

      .btn-secondary:hover {
        background: var(--surface-subtle);
        border-color: var(--ink-primary);
      }

      .btn-pill {
        background: var(--surface-card);
        color: var(--ink-secondary);
        border: 1px solid var(--border-soft);
        border-radius: 999px;
        padding: 6px 13px;
        font-size: 13px;
        font-weight: 450;
      }

      .btn-pill:hover {
        border-color: var(--ink-primary);
        color: var(--ink-primary);
        background: var(--surface-card);
      }

      input {
        font: inherit;
        background: var(--surface-card);
        border: 1px solid var(--border-soft);
        border-radius: var(--radius-sm);
        padding: 11px 14px;
        color: var(--ink-primary);
        width: 100%;
        outline: none;
        transition: border-color 140ms ease, box-shadow 140ms ease;
      }

      input::placeholder {
        color: var(--ink-tertiary);
      }

      input:focus {
        border-color: var(--ink-primary);
        box-shadow: 0 0 0 3px var(--accent-soft);
      }

      a {
        color: var(--accent);
        text-decoration: none;
      }

      a:hover {
        text-decoration: underline;
      }

      /* Layout shell */
      .shell {
        max-width: 980px;
        margin: 0 auto;
        padding: 24px;
        display: grid;
        gap: 22px;
      }

      .shell-welcome {
        padding: 36px 24px 48px;
      }

      .kicker {
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: var(--ink-tertiary);
      }

      .kicker-accent {
        color: var(--accent);
      }

      .form-label {
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.10em;
        text-transform: uppercase;
        color: var(--ink-tertiary);
      }

      .error {
        background: var(--lie-soft);
        border: 1px solid var(--lie-border);
        color: var(--lie);
        border-radius: var(--radius-sm);
        padding: 10px 14px;
        font-size: 13px;
        line-height: 1.5;
      }

      /* Welcome */
      .welcome {
        display: grid;
        gap: 36px;
        max-width: 640px;
        margin: 0 auto;
      }

      .welcome-mark {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .welcome-user {
        color: var(--accent);
        font-size: 13px;
        font-weight: 600;
        line-height: 1.4;
        margin-bottom: 10px;
        overflow-wrap: anywhere;
      }

      .welcome-user span {
        color: var(--ink-primary);
      }

      .brand-mark {
        width: 44px;
        height: 44px;
        border-radius: 10px;
        overflow: hidden;
        background: var(--surface-card);
        border: 1px solid var(--border-soft);
        flex-shrink: 0;
      }

      .brand-mark img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        display: block;
      }

      .welcome-hero h1 {
        font-family: var(--font-display);
        font-weight: 500;
        font-size: clamp(36px, 6vw, 56px);
        line-height: 1.04;
        letter-spacing: -0.022em;
        margin-bottom: 18px;
        text-wrap: balance;
      }

      .welcome-hero h1 em {
        color: var(--accent);
        font-style: italic;
        font-weight: 500;
      }

      .welcome-hero .lede {
        color: var(--ink-secondary);
        font-size: 17px;
        line-height: 1.55;
        max-width: 560px;
      }

      .topic-form {
        display: grid;
        gap: 10px;
      }

      .form-row {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 8px;
      }

      .form-row input {
        font-size: 16px;
        padding: 13px 16px;
      }

      .form-row button {
        padding: 13px 22px;
      }

      .suggestions-block {
        display: grid;
        gap: 10px;
      }

      .suggestions {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }

      .how-it-works {
        border-top: 1px solid var(--border-hairline);
        padding-top: 28px;
      }

      .steps {
        display: grid;
        gap: 16px;
        margin: 0;
        padding: 0;
        list-style: none;
        counter-reset: step;
      }

      .steps li {
        display: grid;
        grid-template-columns: 30px minmax(0, 1fr);
        gap: 14px;
        align-items: baseline;
        counter-increment: step;
      }

      .steps li::before {
        content: counter(step, decimal-leading-zero);
        font-family: var(--font-display);
        font-size: 14px;
        font-weight: 500;
        color: var(--accent);
        font-feature-settings: "tnum", "lnum";
        line-height: 1.4;
      }

      .steps strong {
        font-weight: 600;
        color: var(--ink-primary);
        margin-right: 6px;
      }

      .steps span {
        color: var(--ink-secondary);
        font-size: 14px;
        line-height: 1.55;
      }

      /* Case loader */
      .case-loader {
        min-height: 520px;
        display: grid;
        align-content: center;
        gap: 28px;
      }

      .case-loader-header {
        display: grid;
        gap: 16px;
        max-width: 620px;
      }

      .case-loader-title {
        font-family: var(--font-display);
        font-size: clamp(34px, 6vw, 54px);
        font-weight: 500;
        line-height: 1.04;
        letter-spacing: -0.022em;
        text-wrap: balance;
      }

      .case-loader-topic {
        color: var(--accent);
        font-style: italic;
      }

      .case-loader-copy {
        color: var(--ink-secondary);
        font-size: 16px;
        line-height: 1.6;
        max-width: 540px;
      }

      .case-loader-track {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 12px;
      }

      .loader-card {
        background: var(--surface-card);
        border: 1px solid var(--border-soft);
        border-radius: var(--radius-md);
        min-height: 170px;
        padding: 18px;
        display: grid;
        grid-template-rows: auto 1fr auto;
        gap: 18px;
        overflow: hidden;
        position: relative;
      }

      .loader-card::after {
        content: "";
        position: absolute;
        inset: 0;
        transform: translateX(-120%);
        background: linear-gradient(
          90deg,
          transparent,
          rgba(255, 255, 255, 0.22),
          transparent
        );
        animation: loader-sweep 1.45s ease-in-out infinite;
      }

      .loader-card:nth-child(2)::after {
        animation-delay: 180ms;
      }

      .loader-card:nth-child(3)::after {
        animation-delay: 360ms;
      }

      .loader-line {
        display: block;
        height: 10px;
        border-radius: 999px;
        background: var(--surface-sunken);
      }

      .loader-line.short {
        width: 42%;
      }

      .loader-line.medium {
        width: 68%;
      }

      .loader-line.long {
        width: 88%;
      }

      .loader-status {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .loader-status span {
        border: 1px solid var(--border-soft);
        border-radius: 999px;
        color: var(--ink-tertiary);
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.10em;
        padding: 6px 10px;
        text-transform: uppercase;
      }

      @keyframes loader-sweep {
        100% {
          transform: translateX(120%);
        }
      }

      /* Round header */
      .round-header {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 24px;
        align-items: start;
        padding-bottom: 20px;
        border-bottom: 1px solid var(--border-hairline);
      }

      .round-context {
        display: grid;
        gap: 8px;
        min-width: 0;
      }

      .round-topic {
        font-family: var(--font-display);
        font-weight: 500;
        font-size: clamp(28px, 4vw, 42px);
        line-height: 1.08;
        letter-spacing: -0.022em;
        text-wrap: balance;
        margin-top: 2px;
      }

      .round-message {
        color: var(--ink-secondary);
        font-size: 14px;
        line-height: 1.55;
        max-width: 640px;
      }

      .round-actions {
        display: flex;
        gap: 8px;
        flex-shrink: 0;
      }

      .round-actions button {
        padding: 9px 16px;
        font-size: 14px;
      }

      /* Round meta */
      .round-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 28px;
        align-items: baseline;
      }

      .meta-stat {
        color: var(--ink-tertiary);
        font-size: 13px;
        font-feature-settings: "tnum";
      }

      .meta-stat strong {
        color: var(--ink-primary);
        font-family: var(--font-display);
        font-size: 20px;
        font-weight: 500;
        margin-right: 7px;
        font-feature-settings: "tnum", "lnum";
      }

      .meta-stat.phase {
        margin-left: auto;
        color: var(--accent);
        font-weight: 600;
        font-size: 11px;
        letter-spacing: 0.10em;
        text-transform: uppercase;
      }

      .score-panel {
        background: var(--surface-card);
        border: 1px solid var(--border-soft);
        border-radius: var(--radius-md);
        padding: 16px;
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 16px;
        align-items: center;
      }

      .score-panel.compact {
        grid-template-columns: 1fr;
        padding: 14px 16px;
      }

      .score-main {
        display: flex;
        flex-wrap: wrap;
        gap: 18px;
        align-items: baseline;
      }

      .score-stat {
        display: grid;
        gap: 2px;
        min-width: 72px;
      }

      .score-value {
        font-family: var(--font-display);
        font-size: 28px;
        font-weight: 500;
        line-height: 1;
        font-feature-settings: "tnum", "lnum";
      }

      .score-label {
        color: var(--ink-tertiary);
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.10em;
        text-transform: uppercase;
      }

      .score-rank {
        display: grid;
        gap: 4px;
        justify-items: end;
        text-align: right;
      }

      .rank-label {
        color: var(--ink-primary);
        font-size: 13px;
        font-weight: 600;
      }

      .rank-progress {
        color: var(--ink-tertiary);
        font-size: 12px;
        line-height: 1.4;
      }

      .score-note {
        color: var(--ink-secondary);
        font-size: 13px;
        grid-column: 1 / -1;
        line-height: 1.5;
      }

      .badge-list {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        grid-column: 1 / -1;
      }

      .badge {
        background: var(--accent-soft);
        border: 1px solid var(--accent-strong);
        border-radius: 999px;
        color: var(--accent);
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.08em;
        padding: 5px 9px;
        text-transform: uppercase;
      }

      /* Cards */
      .card-carousel {
        display: grid;
        gap: 10px;
      }

      .carousel-toolbar {
        display: flex;
        justify-content: flex-end;
      }

      .carousel-actions {
        display: flex;
        gap: 6px;
      }

      .carousel-button {
        width: 36px;
        height: 36px;
        padding: 0;
        border-radius: 999px;
        background: var(--surface-card);
        border-color: var(--border-soft);
        color: var(--ink-primary);
        font-family: var(--font-display);
        font-size: 24px;
        font-weight: 500;
        line-height: 1;
      }

      .carousel-button:hover {
        background: var(--surface-subtle);
        border-color: var(--ink-primary);
      }

      .cards-carousel-track {
        display: flex;
        gap: 12px;
        margin: -2px;
        overflow-x: auto;
        overscroll-behavior-x: contain;
        padding: 2px 2px 12px;
        scroll-padding: 2px;
        scroll-snap-type: x mandatory;
        scrollbar-width: thin;
        -webkit-overflow-scrolling: touch;
      }

      .card {
        position: relative;
        perspective: 1400px;
        background: transparent;
        border: 0;
        padding: 0;
        text-align: left;
        display: block;
        flex: 0 0 min(86vw, 430px);
        min-height: 320px;
        scroll-snap-align: start;
        scroll-snap-stop: always;
      }

      .card.selectable {
        cursor: pointer;
      }

      .card-inner {
        position: relative;
        width: 100%;
        min-height: 340px;
        display: grid;
        grid-template-areas: "stack";
        transform-style: preserve-3d;
        transition: transform 520ms cubic-bezier(0.4, 0, 0.2, 1);
      }

      .card.flipped .card-inner {
        transform: rotateY(180deg);
      }

      .card-face {
        grid-area: stack;
        background: var(--surface-card);
        border: 1px solid var(--border-soft);
        border-radius: var(--radius-md);
        padding: 18px;
        display: grid;
        grid-template-rows: auto 1fr auto;
        gap: 14px;
        backface-visibility: hidden;
        -webkit-backface-visibility: hidden;
        min-height: 340px;
        transition: border-color 200ms ease, box-shadow 200ms ease,
          transform 200ms ease;
      }

      .card-back {
        transform: rotateY(180deg);
      }

      .card.selectable:hover .card-face,
      .card.selectable:focus-visible .card-face {
        border-color: var(--ink-primary);
        box-shadow: var(--shadow-card-hover);
        transform: translateY(-2px);
      }

      .card.lie .card-face {
        border-color: var(--lie-border);
        background: linear-gradient(
          180deg,
          var(--surface-card),
          var(--lie-soft)
        );
      }

      .card.truth .card-face,
      .card.cleared .card-face {
        border-color: var(--truth-border);
        background: linear-gradient(
          180deg,
          var(--surface-card),
          var(--truth-soft)
        );
      }

      .card.cleared:not(.flipped) .card-face {
        opacity: 0.62;
      }

      .card-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }

      .card-id {
        font-family: var(--font-display);
        font-weight: 500;
        font-size: 24px;
        line-height: 1;
        color: var(--ink-primary);
        font-feature-settings: "tnum";
      }

      .card-status-tag {
        font-size: 10px;
        font-weight: 600;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--ink-tertiary);
      }

      .card.lie .card-status-tag {
        color: var(--lie);
      }

      .card.truth .card-status-tag,
      .card.cleared .card-status-tag {
        color: var(--truth);
      }

      .card-body {
        display: grid;
        gap: 8px;
        min-width: 0;
      }

      .card-source {
        font-size: 11px;
        font-weight: 500;
        color: var(--ink-tertiary);
        letter-spacing: 0.02em;
        line-height: 1.45;
        overflow-wrap: anywhere;
      }

      .card-headline {
        font-family: var(--font-display);
        font-weight: 500;
        font-size: 17px;
        line-height: 1.25;
        color: var(--ink-primary);
        letter-spacing: -0.011em;
        text-wrap: balance;
      }

      .card-claim {
        font-size: 13px;
        line-height: 1.5;
        color: var(--ink-secondary);
      }

      .card-evidence {
        font-size: 12px;
        line-height: 1.5;
        color: var(--ink-tertiary);
        border-top: 1px solid var(--border-hairline);
        padding-top: 10px;
      }

      .card-bottom {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
      }

      .card-cta {
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.10em;
        text-transform: uppercase;
        color: var(--accent);
      }

      .card.selectable:not(.flipped) .card-face .card-cta::after {
        content: " →";
        margin-left: 2px;
      }

      .card:not(.selectable) .card-cta {
        color: var(--ink-tertiary);
      }

      .card-link {
        background: transparent;
        color: var(--ink-tertiary);
        border: 1px solid var(--border-soft);
        border-radius: 999px;
        padding: 4px 10px;
        font-size: 11px;
        font-weight: 500;
        text-transform: none;
        letter-spacing: 0;
      }

      .card-link:hover {
        color: var(--ink-primary);
        border-color: var(--ink-primary);
        background: var(--surface-card);
      }

      .card-back-body {
        display: grid;
        gap: 10px;
        min-width: 0;
      }

      .card-back-title {
        font-family: var(--font-display);
        font-weight: 500;
        font-size: 19px;
        line-height: 1.2;
        letter-spacing: -0.011em;
      }

      .card.lie .card-back-title {
        color: var(--lie);
      }

      .card.truth .card-back-title,
      .card.cleared .card-back-title {
        color: var(--truth);
      }

      .card-back-text {
        font-size: 13px;
        line-height: 1.55;
        color: var(--ink-secondary);
      }

      /* Verdict body — pull-quote of the claim */
      .verdict-quote {
        margin: 4px 0 0;
        padding: 0 0 0 12px;
        border-left: 1px solid var(--border-soft);
        font-family: var(--font-display);
        font-style: italic;
        font-weight: 400;
        font-size: 13.5px;
        line-height: 1.45;
        color: var(--ink-secondary);
        letter-spacing: -0.003em;
        text-wrap: balance;
        overflow-wrap: anywhere;
      }

      .card.lie .verdict-quote {
        border-left-color: var(--lie-border);
        color: var(--ink-primary);
      }

      .card.truth .verdict-quote,
      .card.cleared .verdict-quote {
        border-left-color: var(--truth-border);
      }

      /* The tell — credibilitySignal with numbered marker */
      .verdict-tell {
        display: grid;
        grid-template-columns: 18px minmax(0, 1fr);
        gap: 10px;
        align-items: baseline;
        font-size: 12px;
        line-height: 1.45;
        color: var(--ink-secondary);
        margin: 0;
        padding-top: 10px;
        border-top: 1px solid var(--border-hairline);
      }

      .verdict-tell .num {
        font-family: var(--font-display);
        font-style: italic;
        font-weight: 500;
        font-size: 14px;
        text-align: right;
        line-height: 1;
        color: var(--accent);
      }

      .card.truth .verdict-tell .num,
      .card.cleared .verdict-tell .num {
        color: var(--truth);
      }

      /* Spin-type tag */
      .spin-tag {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 10px;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        font-weight: 600;
        color: var(--accent);
        margin-top: 2px;
      }

      .spin-tag::before {
        content: "";
        width: 12px;
        height: 1px;
        background: currentColor;
      }

      .card.truth .spin-tag,
      .card.cleared .spin-tag {
        color: var(--truth);
      }

      /* Pending state — four-question lens */
      .pending-claim {
        font-family: var(--font-display);
        font-style: italic;
        font-size: 13.5px;
        line-height: 1.45;
        color: var(--ink-tertiary);
        border-left: 1px dashed var(--border-soft);
        padding-left: 12px;
        margin: 4px 0 0;
        text-wrap: balance;
        overflow-wrap: anywhere;
      }

      .lens-rule {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-top: 2px;
      }

      .lens-rule span {
        font-size: 10px;
        font-weight: 600;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: var(--accent);
      }

      .lens-rule::after {
        content: "";
        flex: 1;
        height: 1px;
        background: var(--border-hairline);
      }

      .lens-prompts {
        display: grid;
        gap: 7px;
        margin: 2px 0 0;
        padding: 0;
        list-style: none;
      }

      .lens-prompts li {
        display: grid;
        grid-template-columns: 14px minmax(0, 1fr);
        gap: 10px;
        align-items: baseline;
        font-size: 12px;
        line-height: 1.4;
        color: var(--ink-secondary);
      }

      .lens-prompts li::before {
        content: "";
        width: 6px;
        height: 6px;
        border-radius: 50%;
        border: 1px solid var(--ink-tertiary);
        margin-top: 5px;
      }

      .lens-prompts em {
        font-style: italic;
        color: var(--ink-primary);
        font-weight: 500;
      }

      /* Audit (checking) state */
      .card-back.auditing {
        overflow: hidden;
      }

      .card-back.auditing .card-back-body {
        gap: 14px;
        align-content: start;
      }

      .audit-source {
        font-size: 10px;
        font-weight: 600;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: var(--ink-tertiary);
        line-height: 1.4;
        overflow-wrap: anywhere;
      }

      .audit-claim {
        font-family: var(--font-display);
        font-style: italic;
        font-weight: 400;
        font-size: 15px;
        line-height: 1.4;
        color: var(--ink-secondary);
        letter-spacing: -0.005em;
        text-wrap: balance;
        position: relative;
        padding-left: 12px;
        border-left: 1px solid var(--border-soft);
      }

      .audit-rule {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-top: 4px;
      }

      .audit-rule span {
        font-size: 10px;
        font-weight: 600;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: var(--accent);
      }

      .audit-rule::after {
        content: "";
        flex: 1;
        height: 1px;
        background: var(--border-hairline);
      }

      .audit-steps {
        list-style: none;
        margin: 0;
        padding: 0;
        display: grid;
        gap: 9px;
      }

      .audit-step {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 12px;
        line-height: 1.4;
        color: var(--ink-tertiary);
        opacity: 0.45;
        animation: auditStepText 4.4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
      }

      .audit-step::before {
        content: "";
        width: 6px;
        height: 6px;
        border-radius: 50%;
        border: 1px solid var(--ink-tertiary);
        background: transparent;
        flex-shrink: 0;
        animation: auditStepDot 4.4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
      }

      .audit-step:nth-child(1),
      .audit-step:nth-child(1)::before { animation-delay: 0s; }
      .audit-step:nth-child(2),
      .audit-step:nth-child(2)::before { animation-delay: 1.1s; }
      .audit-step:nth-child(3),
      .audit-step:nth-child(3)::before { animation-delay: 2.2s; }
      .audit-step:nth-child(4),
      .audit-step:nth-child(4)::before { animation-delay: 3.3s; }

      @keyframes auditStepText {
        0%, 100% { color: var(--ink-tertiary); opacity: 0.45; }
        6% { color: var(--ink-primary); opacity: 1; }
        24%, 96% { color: var(--ink-secondary); opacity: 0.7; }
      }

      @keyframes auditStepDot {
        0%, 100% {
          background: transparent;
          border-color: var(--ink-tertiary);
          transform: scale(1);
        }
        6% {
          background: var(--accent);
          border-color: var(--accent);
          transform: scale(1.3);
        }
        24%, 96% {
          background: var(--ink-tertiary);
          border-color: var(--ink-tertiary);
          transform: scale(1);
        }
      }

      .audit-scanline {
        position: absolute;
        left: 18px;
        right: 18px;
        top: 0;
        height: 1px;
        background: linear-gradient(
          90deg,
          transparent,
          var(--accent-strong),
          transparent
        );
        pointer-events: none;
        animation: auditScanline 2.6s cubic-bezier(0.45, 0, 0.55, 1) infinite;
      }

      @keyframes auditScanline {
        0% { top: 14%; opacity: 0; }
        12% { opacity: 0.85; }
        88% { opacity: 0.85; }
        100% { top: 86%; opacity: 0; }
      }

      @media (prefers-reduced-motion: reduce) {
        .audit-step,
        .audit-step::before,
        .audit-scanline {
          animation: none;
        }
        .audit-step { opacity: 0.8; color: var(--ink-secondary); }
        .audit-scanline { display: none; }
      }

      /* Panels (question + answer) */
      .panel {
        background: var(--surface-card);
        border: 1px solid var(--border-soft);
        border-radius: var(--radius-md);
        padding: 20px;
        display: grid;
        gap: 14px;
      }

      .panel.accent {
        background: linear-gradient(
          180deg,
          var(--surface-card),
          var(--accent-soft)
        );
        border-color: var(--accent-strong);
      }

      .panel-header {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 12px;
      }

      .panel-title {
        font-family: var(--font-display);
        font-size: 20px;
        font-weight: 500;
        line-height: 1.2;
        letter-spacing: -0.012em;
      }

      .panel-pill {
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.10em;
        color: var(--ink-tertiary);
        text-transform: uppercase;
      }

      .panel-body {
        color: var(--ink-secondary);
        font-size: 14px;
        line-height: 1.6;
      }

      .clue-presets {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }

      .citation-list,
      .clue-list {
        display: grid;
        gap: 8px;
      }

      .citation,
      .clue {
        background: var(--surface-subtle);
        border-radius: var(--radius-sm);
        padding: 11px 13px;
        font-size: 13px;
        line-height: 1.5;
      }

      .citation a {
        color: var(--ink-primary);
        font-weight: 500;
        overflow-wrap: anywhere;
      }

      .citation a:hover {
        color: var(--accent);
      }

      .citation-meta {
        color: var(--ink-tertiary);
        font-size: 12px;
        margin-top: 4px;
      }

      .clue strong {
        font-family: var(--font-display);
        font-weight: 500;
        color: var(--ink-primary);
        font-size: 14px;
      }

      /* Summary */
      .summary {
        display: grid;
        gap: 28px;
      }

      .summary-hero {
        display: grid;
        gap: 14px;
        padding-bottom: 24px;
        border-bottom: 1px solid var(--border-hairline);
      }

      .summary-hero h1 {
        font-family: var(--font-display);
        font-weight: 500;
        font-size: clamp(28px, 4vw, 42px);
        line-height: 1.08;
        letter-spacing: -0.022em;
        text-wrap: balance;
      }

      .summary-hero .lede {
        color: var(--ink-secondary);
        font-size: 16px;
        line-height: 1.6;
      }

      .summary-stats {
        display: flex;
        flex-wrap: wrap;
        gap: 24px;
        margin-top: 4px;
      }

      .verdict-card {
        background: var(--surface-card);
        border: 1px solid var(--accent-strong);
        border-radius: var(--radius-md);
        padding: 22px 24px;
        display: grid;
        gap: 10px;
        position: relative;
        overflow: hidden;
      }

      .verdict-card::before {
        content: "";
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 3px;
        background: var(--accent);
      }

      .verdict-label {
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: var(--accent);
      }

      .verdict-source {
        font-family: var(--font-display);
        font-size: 22px;
        font-weight: 500;
        line-height: 1.2;
        letter-spacing: -0.012em;
      }

      .verdict-explanation {
        color: var(--ink-secondary);
        font-size: 14px;
        line-height: 1.6;
      }

      .reveal-list {
        display: grid;
        gap: 10px;
      }

      .reveal-card {
        background: var(--surface-subtle);
        border-left: 3px solid var(--border-soft);
        border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
        padding: 14px 16px;
        display: grid;
        gap: 6px;
      }

      .reveal-card.lie {
        border-left-color: var(--lie);
      }

      .reveal-card.truth,
      .reveal-card.cleared {
        border-left-color: var(--truth);
      }

      .reveal-card-head {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 8px;
      }

      .reveal-card-id {
        font-family: var(--font-display);
        font-size: 16px;
        font-weight: 500;
      }

      .reveal-card-verdict {
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.10em;
        text-transform: uppercase;
        color: var(--ink-tertiary);
      }

      .reveal-card.lie .reveal-card-verdict {
        color: var(--lie);
      }

      .reveal-card.truth .reveal-card-verdict,
      .reveal-card.cleared .reveal-card-verdict {
        color: var(--truth);
      }

      .reveal-card-text {
        font-size: 13px;
        line-height: 1.55;
        color: var(--ink-secondary);
      }

      .summary-actions {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      /* Responsive */
      @media (max-width: 720px) {
        .shell {
          padding: 18px;
          gap: 18px;
        }

        .shell-welcome {
          padding: 24px 18px 36px;
        }

        .welcome {
          gap: 28px;
        }

        .case-loader {
          min-height: 430px;
        }

        .case-loader-track {
          grid-template-columns: 1fr;
        }

        .loader-card {
          min-height: 128px;
        }

        .round-header {
          grid-template-columns: 1fr;
          gap: 16px;
        }

        .round-actions {
          flex-wrap: wrap;
        }

        .round-meta {
          gap: 18px;
        }

        .meta-stat.phase {
          margin-left: 0;
        }

        .score-panel {
          grid-template-columns: 1fr;
        }

        .score-rank {
          justify-items: start;
          text-align: left;
        }

        .form-row {
          grid-template-columns: 1fr;
        }

        .cards-carousel-track {
          margin-inline: -18px;
          padding-inline: 18px;
          scroll-padding-inline: 18px;
        }

        .card {
          flex-basis: min(86vw, 360px);
        }

        .panel-header {
          flex-wrap: wrap;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        *,
        *::before,
        *::after {
          animation-duration: 0.01ms !important;
          transition-duration: 0.01ms !important;
        }

        .loader-card::after {
          animation: none;
        }
      }

      /* Leaderboard — utility nav, hero, standing card, standings list */
      .shell-utility {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        padding-bottom: 4px;
      }

      .utility-link {
        background: transparent;
        border: 1px solid transparent;
        border-radius: 999px;
        padding: 7px 13px 7px 11px;
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--ink-primary);
        display: inline-flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        transition: background 140ms ease, color 140ms ease, border-color 140ms ease;
      }
      .utility-link:hover {
        background: var(--surface-card);
        border-color: var(--ink-primary);
      }
      .utility-link .glyph {
        font-family: var(--font-display);
        font-style: italic;
        font-weight: 500;
        font-size: 14px;
        line-height: 1;
        letter-spacing: 0;
        color: var(--accent);
        transform: translateY(-0.5px);
      }
      .utility-meta {
        font-size: 11px;
        font-weight: 500;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--ink-tertiary);
        font-feature-settings: "tnum";
      }

      .leaderboard {
        display: grid;
        gap: 32px;
        max-width: 720px;
        margin: 0 auto;
      }
      .leaderboard-hero h1 {
        font-family: var(--font-display);
        font-weight: 500;
        font-size: clamp(36px, 6vw, 56px);
        line-height: 1.04;
        letter-spacing: -0.022em;
        margin-bottom: 18px;
        text-wrap: balance;
      }
      .leaderboard-hero h1 em {
        color: var(--accent);
        font-style: italic;
        font-weight: 500;
      }
      .leaderboard-hero .lede {
        color: var(--ink-secondary);
        font-size: 17px;
        line-height: 1.55;
        max-width: 580px;
      }

      .standing-card {
        background: linear-gradient(
          180deg,
          var(--surface-card),
          var(--accent-soft)
        );
        border: 1px solid var(--accent-strong);
        border-radius: var(--radius-md);
        padding: 22px 24px;
        display: grid;
        gap: 14px;
      }
      .standing-card-top {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 16px;
        flex-wrap: wrap;
      }
      .standing-card-top .kicker {
        color: var(--accent);
      }
      .standing-card-grid {
        display: grid;
        grid-template-columns: auto minmax(0, 1fr) auto;
        gap: 22px;
        align-items: center;
      }
      .standing-rank {
        font-family: var(--font-display);
        font-weight: 500;
        font-style: italic;
        font-size: 56px;
        line-height: 0.92;
        color: var(--accent);
        font-feature-settings: "tnum", "lnum";
        letter-spacing: -0.02em;
      }
      .standing-rank .of {
        font-size: 14px;
        color: var(--ink-tertiary);
        font-style: normal;
        font-weight: 500;
        letter-spacing: 0.04em;
        margin-left: 6px;
      }
      .standing-name {
        font-family: var(--font-display);
        font-weight: 500;
        font-size: 26px;
        line-height: 1.15;
        letter-spacing: -0.012em;
      }
      .standing-meta {
        color: var(--ink-secondary);
        font-size: 13px;
        margin-top: 6px;
        line-height: 1.55;
      }
      .standing-points {
        font-family: var(--font-display);
        font-weight: 500;
        font-size: 38px;
        line-height: 1;
        font-feature-settings: "tnum", "lnum";
        letter-spacing: -0.018em;
        text-align: right;
      }
      .standing-points-label {
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--ink-tertiary);
        text-align: right;
        margin-top: 6px;
      }
      .standing-progress {
        border-top: 1px solid var(--accent-strong);
        padding-top: 14px;
        font-size: 13px;
        color: var(--ink-secondary);
        line-height: 1.5;
      }
      .standing-progress strong {
        font-family: var(--font-display);
        font-weight: 500;
        color: var(--ink-primary);
        font-feature-settings: "tnum", "lnum";
      }

      .standings {
        display: grid;
        gap: 0;
      }
      .standings-header {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 12px;
        padding-bottom: 12px;
        border-bottom: 1px solid var(--border-hairline);
        margin-bottom: 4px;
      }
      .standings-list {
        display: grid;
        gap: 0;
        list-style: none;
        margin: 0;
        padding: 0;
      }
      .standings-row {
        display: grid;
        grid-template-columns: 56px minmax(0, 1fr) auto;
        align-items: center;
        gap: 18px;
        padding: 16px 0;
        border-bottom: 1px solid var(--border-hairline);
        position: relative;
        transition: background 140ms ease;
      }
      .standings-row:hover {
        background: var(--surface-subtle);
      }
      .standings-row.is-current {
        background: var(--accent-soft);
        margin: 0 -16px;
        padding-left: 16px;
        padding-right: 16px;
        border-radius: var(--radius-md);
        border: 1px solid var(--accent-strong);
      }

      .standings-rank {
        font-family: var(--font-display);
        font-weight: 500;
        font-size: 26px;
        line-height: 1;
        color: var(--ink-tertiary);
        font-feature-settings: "tnum", "lnum";
        letter-spacing: -0.005em;
      }
      .standings-row.is-top .standings-rank,
      .standings-row.is-current .standings-rank {
        color: var(--accent);
        font-style: italic;
      }

      .standings-person {
        display: grid;
        gap: 4px;
        min-width: 0;
      }
      .standings-name {
        font-family: var(--font-display);
        font-weight: 500;
        font-size: 19px;
        line-height: 1.2;
        letter-spacing: -0.011em;
        color: var(--ink-primary);
        display: flex;
        align-items: baseline;
        gap: 10px;
        flex-wrap: wrap;
      }
      .standings-name .you-pill {
        font-family: var(--font-sans);
        font-style: normal;
        font-size: 10px;
        font-weight: 600;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: var(--accent);
        background: transparent;
        border: 1px solid var(--accent-strong);
        border-radius: 999px;
        padding: 2px 8px 3px;
        line-height: 1;
      }
      .standings-meta {
        color: var(--ink-tertiary);
        font-size: 12px;
        line-height: 1.45;
        font-feature-settings: "tnum";
        display: flex;
        flex-wrap: wrap;
        gap: 14px;
      }
      .standings-meta strong {
        color: var(--ink-secondary);
        font-weight: 600;
        font-feature-settings: "tnum", "lnum";
      }

      .standings-points-cell {
        text-align: right;
        display: grid;
        gap: 2px;
      }
      .standings-points {
        font-family: var(--font-display);
        font-weight: 500;
        font-size: 22px;
        line-height: 1;
        letter-spacing: -0.012em;
        font-feature-settings: "tnum", "lnum";
      }
      .standings-points-suffix {
        color: var(--ink-tertiary);
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.12em;
        text-transform: uppercase;
      }

      .standings-foot {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
        margin-top: 8px;
      }
      .standings-foot .meta {
        color: var(--ink-tertiary);
        font-size: 12px;
        font-style: italic;
        font-family: var(--font-display);
      }

      .standings-loading {
        padding: 40px 0;
        text-align: center;
        color: var(--ink-tertiary);
        font-style: italic;
        font-family: var(--font-display);
        font-size: 14px;
      }

      @media (max-width: 640px) {
        .standings-row {
          grid-template-columns: 40px minmax(0, 1fr) auto;
          gap: 12px;
        }
        .standing-card-grid {
          grid-template-columns: auto 1fr;
        }
        .standings-points {
          font-size: 19px;
        }
        .standing-rank {
          font-size: 44px;
        }
        .standing-points {
          font-size: 30px;
        }
      }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script>
      // All dynamic strings written into innerHTML are passed through the
      // html() escaper below, which encodes &, <, >, " and ' to entities.
      // This is the same pattern the original widget used.
      const root = document.getElementById("root");
      const savedUiState =
        (window.openai &&
          window.openai.widgetState &&
          (window.openai.widgetState.privateContent || window.openai.widgetState)) ||
        {};
      const state = {
        game: window.openai && window.openai.toolOutput ? window.openai.toolOutput : null,
        topic: savedUiState.topic || "",
        carouselCardId: savedUiState.carouselCardId || "",
        carouselScrollLeft:
          typeof savedUiState.carouselScrollLeft === "number"
            ? savedUiState.carouselScrollLeft
            : 0,
        flippingCardId: "",
        busy: "",
        error: "",
        // "" follows the game state; "leaderboard" overrides welcome
        // with the standings view. Only valid when no round is active.
        view: "",
        leaderboard: null,
        leaderboardError: "",
        leaderboardLoading: false
      };
      let gameSignature = serializeGame(state.game);
      let carouselPersistTimer = 0;

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

      function serializeGame(value) {
        try {
          return JSON.stringify(value || null);
        } catch (_) {
          return "";
        }
      }

      function setGame(nextGame) {
        const nextSignature = serializeGame(nextGame);
        if (nextSignature && nextSignature === gameSignature) {
          return false;
        }
        state.game = nextGame;
        gameSignature = nextSignature;
        return true;
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
            setGame(nextGame);
            if (
              name === "start_game" ||
              name === "start_round" ||
              name === "reset_game"
            ) {
              resetCarouselState();
            }
          }
        } catch (error) {
          state.error = error.message || String(error);
        } finally {
          state.busy = "";
          render();
        }
      }

      // Fetch the leaderboard snapshot without clobbering game state.
      // get_leaderboard returns the same shape as game tools but its job is
      // sideband — we keep it in state.leaderboard so the welcome/round
      // views remain untouched when the user is just peeking at standings.
      async function loadLeaderboard() {
        state.leaderboardLoading = true;
        state.leaderboardError = "";
        render();
        try {
          const result = await callTool("get_leaderboard", { limit: 10 });
          if (result && result.leaderboard) {
            state.leaderboard = result.leaderboard;
          } else if (result && result.status === "leaderboard-unavailable") {
            state.leaderboardError =
              result.message ||
              "Leaderboard is not available yet. Finish a round to create an entry.";
          } else {
            state.leaderboardError = "Could not load the standings.";
          }
        } catch (error) {
          state.leaderboardError = error.message || String(error);
        } finally {
          state.leaderboardLoading = false;
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
            carouselCardId: state.carouselCardId,
            carouselScrollLeft: state.carouselScrollLeft
          }
        });
      }

      function resetCarouselState() {
        state.carouselCardId = "";
        state.carouselScrollLeft = 0;
        state.flippingCardId = "";
        persistUiState();
      }

      function getCarouselCards(carousel) {
        return Array.from(carousel.querySelectorAll(".card[data-card-id]"));
      }

      function findCarouselCard(carousel, cardId) {
        if (!cardId) return null;
        return (
          getCarouselCards(carousel).find(
            (card) => card.getAttribute("data-card-id") === cardId
          ) || null
        );
      }

      function getMostVisibleCarouselCardId(carousel) {
        const carouselRect = carousel.getBoundingClientRect();
        let bestCardId = "";
        let bestVisibleWidth = 0;

        getCarouselCards(carousel).forEach((card) => {
          const rect = card.getBoundingClientRect();
          const visibleWidth = Math.max(
            0,
            Math.min(rect.right, carouselRect.right) -
              Math.max(rect.left, carouselRect.left)
          );

          if (visibleWidth > bestVisibleWidth) {
            bestVisibleWidth = visibleWidth;
            bestCardId = card.getAttribute("data-card-id") || "";
          }
        });

        return bestCardId;
      }

      function captureCarousel() {
        const carousel = root.querySelector("[data-card-carousel]");
        if (!carousel) {
          return {
            cardId: state.carouselCardId,
            scrollLeft: state.carouselScrollLeft
          };
        }

        const cardId =
          getMostVisibleCarouselCardId(carousel) || state.carouselCardId;
        return {
          cardId,
          scrollLeft: carousel.scrollLeft
        };
      }

      function rememberCarouselPosition(cardId) {
        const carousel = root.querySelector("[data-card-carousel]");
        if (carousel) {
          state.carouselScrollLeft = carousel.scrollLeft;
          state.carouselCardId =
            cardId || getMostVisibleCarouselCardId(carousel) || state.carouselCardId;
        } else if (cardId) {
          state.carouselCardId = cardId;
        }
        persistUiState();
      }

      function restoreCarousel(snapshot) {
        const carousel = root.querySelector("[data-card-carousel]");
        if (!carousel) return;

        const applyPosition = () => {
          const scrollLeft =
            snapshot && typeof snapshot.scrollLeft === "number"
              ? snapshot.scrollLeft
              : state.carouselScrollLeft;
          const cardId =
            (snapshot && snapshot.cardId) ||
            state.carouselCardId ||
            state.flippingCardId;

          if (typeof scrollLeft === "number") {
            carousel.scrollLeft = scrollLeft;
          }

          const card = findCarouselCard(carousel, cardId);
          if (!card) return;

          const carouselRect = carousel.getBoundingClientRect();
          const cardRect = card.getBoundingClientRect();
          const visibleWidth = Math.max(
            0,
            Math.min(cardRect.right, carouselRect.right) -
              Math.max(cardRect.left, carouselRect.left)
          );
          const requiredWidth = Math.min(cardRect.width, carouselRect.width) * 0.6;

          if (visibleWidth >= requiredWidth) return;

          const maxScrollLeft = Math.max(
            0,
            carousel.scrollWidth - carousel.clientWidth
          );
          carousel.scrollLeft = Math.min(
            Math.max(card.offsetLeft - carousel.offsetLeft, 0),
            maxScrollLeft
          );
        };

        applyPosition();
        if (typeof window.requestAnimationFrame === "function") {
          window.requestAnimationFrame(applyPosition);
        }
      }

      function getSuggestions(game) {
        const raw =
          game && Array.isArray(game.suggestedTopics) ? game.suggestedTopics : [];
        return raw
          .map((item) => (item && item.topic ? item.topic : item))
          .filter(Boolean)
          .slice(0, 5);
      }

      function getWelcomeName(game) {
        const player = game && game.player;
        const displayName =
          player && typeof player.displayName === "string"
            ? player.displayName.trim()
            : "";

        if (!displayName || player.source === "session") return "";
        return displayName;
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

      // Capture the currently focused input (if any) so we can restore
      // focus + cursor position after innerHTML replace. Without this, any
      // re-render while the user is typing destroys their input element
      // and they lose focus mid-keystroke.
      const FOCUS_INPUT_KEYS = ["data-topic"];
      function captureFocus() {
        const active = document.activeElement;
        if (!active || active.tagName !== "INPUT") return null;
        for (const key of FOCUS_INPUT_KEYS) {
          if (active.hasAttribute(key)) {
            return {
              key,
              selectionStart: active.selectionStart,
              selectionEnd: active.selectionEnd
            };
          }
        }
        return null;
      }

      function restoreFocus(snapshot) {
        if (!snapshot) return;
        const restored = root.querySelector("[" + snapshot.key + "]");
        if (!restored) return;
        restored.focus();
        if (
          snapshot.selectionStart != null &&
          typeof restored.setSelectionRange === "function"
        ) {
          try {
            restored.setSelectionRange(
              snapshot.selectionStart,
              snapshot.selectionEnd
            );
          } catch (_) {
            // setSelectionRange throws on non-text inputs; safe to ignore.
          }
        }
      }

      function render() {
        const focusSnapshot = captureFocus();
        const carouselSnapshot = captureCarousel();
        const game = state.game || {};
        syncPrefill(game);
        const reveal = game.reveal || null;
        const round = game.round || null;
        const status = game.status || (round ? "active" : "idle");

        if (!round && state.busy === "Building case") {
          root.innerHTML =
            '<main class="shell">' + renderCaseLoader() + "</main>";
          bindEvents();
          notifyHeight();
          return;
        }

        if (!round && reveal) {
          root.innerHTML =
            '<main class="shell">' + renderSummary(game, reveal, status) + "</main>";
          bindEvents();
          restoreFocus(focusSnapshot);
          notifyHeight();
          return;
        }

        if (!round) {
          const welcomeMarkup =
            state.view === "leaderboard"
              ? '<main class="shell">' + renderLeaderboard(game) + "</main>"
              : '<main class="shell shell-welcome">' +
                renderWelcome(game, status) +
                "</main>";
          root.innerHTML = welcomeMarkup;
          bindEvents();
          restoreFocus(focusSnapshot);
          notifyHeight();
          return;
        }

        const cards = Array.isArray(round.cards) ? round.cards : [];
        const isComplete = status === "won" || status === "revealed";
        const remainingCount = cards.filter(
          (card) => card.status === "remaining"
        ).length;

        root.innerHTML = [
          '<main class="shell">',
          renderRoundHeader(game, round, status, isComplete),
          renderRoundMeta(game, isComplete, remainingCount),
          renderScorePanel(game.score, false),
          state.error
            ? '<div class="error" role="alert">' + html(state.error) + "</div>"
            : "",
          renderCards(cards, isComplete),
          game.answer ? renderAnswer(game.answer) : "",
          reveal && isComplete ? renderSummary(game, reveal, status) : "",
          "</main>"
        ].join("");

        bindEvents();
        restoreFocus(focusSnapshot);
        restoreCarousel(carouselSnapshot);
        notifyHeight();
      }

      function renderWelcome(game, status) {
        const suggestions = getSuggestions(game);
        const welcomeName = getWelcomeName(game);
        const showError = state.error || status === "exa-search-failed";
        const errorText =
          state.error ||
          (status === "exa-search-failed" ? game.message || "" : "");

        return [
          '<div class="shell-utility">',
          '<span class="utility-meta">Sus · welcome</span>',
          '<button type="button" class="utility-link" data-action="open-leaderboard" aria-label="Open leaderboard">',
          'Leaderboard',
          '<span class="glyph" aria-hidden="true">↗</span>',
          '</button>',
          '</div>',
          '<div class="welcome">',
          '<header class="welcome-mark">',
          '<div class="brand-mark"><img src="data:image/png;base64,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" alt="" width="44" height="44" decoding="async" loading="eager" /></div>',
          '<p class="kicker">Sus · spot the spin</p>',
          "</header>",

          '<div class="welcome-hero">',
          welcomeName
            ? '<p class="welcome-user">Welcome, <span>' +
              html(welcomeName) +
              "</span></p>"
            : "",
          "<h1>Four sources are careful.<br />One is <em>bending the truth</em>.</h1>",
          '<p class="lede">Pick any topic. Sus deals five plausible source cards — four stay precise; one quietly turns a caveat into certainty. Read closely, then accuse.</p>',
          "</div>",

          renderScorePanel(game.score, true),

          showError
            ? '<div class="error" role="alert">' + html(errorText) + "</div>"
            : "",

          '<form class="topic-form" data-topic-form>',
          '<label class="form-label" for="topic-input">Begin a case</label>',
          '<div class="form-row">',
          '<input id="topic-input" data-topic value="' +
            html(state.topic) +
            '" placeholder="e.g. tariff policy, gut microbiome" aria-label="Topic" />',
          '<button data-action="start-topic" type="submit"' +
            (state.busy ? " disabled" : "") +
            ">",
          html(state.busy || "Open case"),
          "</button>",
          "</div>",
          "</form>",

          suggestions.length
            ? [
                '<div class="suggestions-block">',
                '<p class="form-label">Or try a starter case</p>',
                '<div class="suggestions">',
                suggestions
                  .map(
                    (topic) =>
                      '<button class="btn-pill" data-action="suggest-topic" data-topic-value="' +
                      html(topic) +
                      '" type="button">' +
                      html(topic) +
                      "</button>"
                  )
                  .join(""),
                "</div>",
                "</div>"
              ].join("")
            : "",

          '<div class="how-it-works">',
          '<ol class="steps">',
          renderStep(
            "Compare.",
            "Read every card with the same lens — caveats, scope, mechanism, certainty."
          ),
          renderStep(
            "Accuse.",
            "One card hides the spin. Wrong guesses clear truth, then you keep comparing."
          ),
          renderStep(
            "Reveal.",
            "Close the case to see every verdict — and the pattern you can carry forward."
          ),
          "</ol>",
          "</div>",
          "</div>"
        ].join("");
      }

      function formatPoints(value) {
        const n = Number(value || 0);
        if (!Number.isFinite(n)) return "0";
        return n.toLocaleString("en-US");
      }

      function pad2(n) {
        return String(n).padStart(2, "0");
      }

      function formatRelativeUpdated(iso) {
        if (!iso) return "";
        const then = Date.parse(iso);
        if (!Number.isFinite(then)) return "";
        const seconds = Math.max(0, Math.round((Date.now() - then) / 1000));
        if (seconds < 60) return "Updated just now";
        const minutes = Math.round(seconds / 60);
        if (minutes < 60) return "Updated " + minutes + " min ago";
        const hours = Math.round(minutes / 60);
        if (hours < 24) return "Updated " + hours + " hr ago";
        const days = Math.round(hours / 24);
        return "Updated " + days + " day" + (days === 1 ? "" : "s") + " ago";
      }

      function renderStandingMeta(entry) {
        const parts = [
          '<span><strong>' +
            html(String(entry.wins || 0)) +
            "</strong> " +
            html((entry.wins || 0) === 1 ? "win" : "wins") +
            "</span>",
          '<span>streak <strong>' +
            html(String(entry.bestStreak || 0)) +
            "</strong></span>"
        ];
        if (entry.perfectRounds && entry.perfectRounds > 0) {
          parts.push(
            '<span><strong>' +
              html(String(entry.perfectRounds)) +
              "</strong> clean read" +
              (entry.perfectRounds === 1 ? "" : "s") +
              "</span>"
          );
        }
        return parts.join("");
      }

      function renderStandingCard(snapshot, score) {
        const me = snapshot && snapshot.currentPlayer;
        if (!me) return "";

        const total = (snapshot.entries || []).length;
        const rank = me.rank || 0;
        const ofText = total > 0 ? "/" + total : "";
        const rankLabel =
          (score && score.rank && score.rank.label) || "";
        const nextLabel =
          (score && score.rank && score.rank.nextLabel) || "";
        const pointsToNext =
          (score && score.rank && score.rank.pointsToNext) || 0;

        const fullMeta = [
          (me.wins || 0) + " win" + ((me.wins || 0) === 1 ? "" : "s"),
          "streak " + (me.bestStreak || 0),
          (me.perfectRounds || 0) +
            " clean read" +
            ((me.perfectRounds || 0) === 1 ? "" : "s")
        ].join(" · ");

        const progressLine =
          nextLabel && pointsToNext > 0
            ? '<p class="standing-progress"><strong>' +
              html(formatPoints(pointsToNext)) +
              "</strong> points to <strong>" +
              html(nextLabel) +
              "</strong></p>"
            : nextLabel
              ? ""
              : '<p class="standing-progress"><strong>' +
                html(rankLabel || "Top rank") +
                "</strong> reached.</p>";

        return [
          '<article class="standing-card" aria-label="Your standing">',
          '<div class="standing-card-top">',
          '<p class="kicker">Your standing</p>',
          rankLabel
            ? '<p class="kicker">' + html(rankLabel) + "</p>"
            : "",
          "</div>",
          '<div class="standing-card-grid">',
          '<div class="standing-rank">',
          html(pad2(rank)),
          ofText
            ? '<span class="of">' + html(ofText) + "</span>"
            : "",
          "</div>",
          "<div>",
          '<p class="standing-name">' + html(me.displayName || "—") + "</p>",
          '<p class="standing-meta">' + html(fullMeta) + "</p>",
          "</div>",
          "<div>",
          '<p class="standing-points">' +
            html(formatPoints(me.totalPoints)) +
            "</p>",
          '<p class="standing-points-label">points</p>',
          "</div>",
          "</div>",
          progressLine,
          "</article>"
        ].join("");
      }

      function renderStandingsList(snapshot) {
        const entries = (snapshot && snapshot.entries) || [];
        if (!entries.length) {
          return (
            '<p class="standings-loading">No rounds finished yet — be the first.</p>'
          );
        }
        return [
          '<ol class="standings-list">',
          entries
            .map((entry) => {
              const classes = ["standings-row"];
              if (entry.rank && entry.rank <= 3) classes.push("is-top");
              if (entry.isCurrentPlayer) classes.push("is-current");
              return [
                '<li class="' + classes.join(" ") + '">',
                '<span class="standings-rank">' +
                  html(pad2(entry.rank || 0)) +
                  "</span>",
                '<div class="standings-person">',
                '<p class="standings-name">',
                html(entry.displayName || "—"),
                entry.isCurrentPlayer
                  ? '<span class="you-pill">You</span>'
                  : "",
                "</p>",
                '<p class="standings-meta">' + renderStandingMeta(entry) + "</p>",
                "</div>",
                '<div class="standings-points-cell">',
                '<span class="standings-points">' +
                  html(formatPoints(entry.totalPoints)) +
                  "</span>",
                '<span class="standings-points-suffix">pts</span>',
                "</div>",
                "</li>"
              ].join("");
            })
            .join(""),
          "</ol>"
        ].join("");
      }

      function renderLeaderboard(game) {
        const score = (game && game.score) || {};
        const snapshot = state.leaderboard;
        const updatedLine = snapshot
          ? formatRelativeUpdated(snapshot.updatedAt)
          : "";
        const limitLabel =
          snapshot && snapshot.entries && snapshot.entries.length
            ? "Top " + snapshot.entries.length + " · all time"
            : "Top investigators";

        let body;
        if (state.leaderboardLoading && !snapshot) {
          body =
            '<p class="standings-loading">Tallying the standings…</p>';
        } else if (state.leaderboardError) {
          body =
            '<div class="error" role="alert">' +
            html(state.leaderboardError) +
            "</div>";
        } else {
          body = [
            renderStandingCard(snapshot, score),
            '<section class="standings" aria-label="Top investigators">',
            '<header class="standings-header">',
            '<p class="kicker">' + html(limitLabel) + "</p>",
            updatedLine
              ? '<p class="utility-meta">' + html(updatedLine) + "</p>"
              : "",
            "</header>",
            renderStandingsList(snapshot),
            '<div class="standings-foot">',
            '<span class="meta">Refreshes after every solved case.</span>',
            '<button type="button" class="btn-secondary" data-action="open-welcome">← Back to welcome</button>',
            "</div>",
            "</section>"
          ].join("");
        }

        return [
          '<div class="shell-utility">',
          '<button type="button" class="utility-link" data-action="open-welcome" aria-label="Back to welcome">',
          '<span class="glyph" aria-hidden="true">←</span>',
          'Welcome',
          "</button>",
          '<span class="utility-meta">Sus · the standings</span>',
          "</div>",
          '<div class="leaderboard">',
          '<div class="leaderboard-hero">',
          '<p class="kicker kicker-accent">The standings</p>',
          "<h1>Who reads<br /><em>the closest?</em></h1>",
          '<p class="lede">The press box ranks every investigator by points earned across cases. Wins, then best streaks, break ties — careful reading compounds.</p>',
          "</div>",
          body,
          "</div>"
        ].join("");
      }

      function renderCaseLoader() {
        const topic = state.topic.trim();
        const title = topic
          ? 'Building <span class="case-loader-topic">' +
            html(topic) +
            "</span>"
          : "Building the case file";

        return [
          '<section class="case-loader" role="status" aria-live="polite" aria-busy="true">',
          '<div class="case-loader-header">',
          '<p class="kicker kicker-accent">Case building</p>',
          '<h1 class="case-loader-title">' + title + "</h1>",
          '<p class="case-loader-copy">Gathering source cards, checking the claims, and hiding one subtle spin.</p>',
          "</div>",
          '<div class="case-loader-track" aria-hidden="true">',
          renderLoaderCard("short", "long", "medium"),
          renderLoaderCard("medium", "long", "short"),
          renderLoaderCard("short", "medium", "long"),
          "</div>",
          '<div class="loader-status" aria-hidden="true">',
          "<span>Search</span>",
          "<span>Compare</span>",
          "<span>Deal</span>",
          "</div>",
          "</section>"
        ].join("");
      }

      function renderLoaderCard(first, second, third) {
        return [
          '<div class="loader-card">',
          '<span class="loader-line ' + html(first) + '"></span>',
          '<span class="loader-line ' + html(second) + '"></span>',
          '<span class="loader-line ' + html(third) + '"></span>',
          "</div>"
        ].join("");
      }

      function renderStep(title, body) {
        return (
          "<li><span><strong>" +
          html(title) +
          "</strong>" +
          html(body) +
          "</span></li>"
        );
      }

      function renderRoundHeader(game, round, status, isComplete) {
        const guidance = isComplete
          ? "Case closed. Read each verdict to spot the pattern."
          : game.message ||
            "Compare every card by caveats, scope, mechanism, and certainty.";

        return [
          '<header class="round-header">',
          '<div class="round-context">',
          '<p class="kicker' +
            (isComplete ? " kicker-accent" : "") +
            '">' +
            html(isComplete ? "Case closed" : "Case file") +
            "</p>",
          '<h1 class="round-topic">' + html(round.topic) + "</h1>",
          '<p class="round-message">' + html(guidance) + "</p>",
          "</div>",
          '<div class="round-actions">',
          '<button class="btn-secondary" data-action="welcome" type="button"' +
            (state.busy ? " disabled" : "") +
            ">New case</button>",
          '<button class="btn-secondary" data-action="reveal" type="button"' +
            (state.busy || isComplete ? " disabled" : "") +
            ">Reveal</button>",
          "</div>",
          "</header>"
        ].join("");
      }

      function renderRoundMeta(game, isComplete, remainingCount) {
        const score = game.score || {};
        const phase = isComplete
          ? "Case closed"
          : "Compare & accuse";

        return [
          '<div class="round-meta">',
          '<span class="meta-stat"><strong>' +
            html(String(remainingCount)) +
            "</strong>suspects</span>",
          '<span class="meta-stat"><strong>' +
            html(String(score.wrongGuesses || 0)) +
            "</strong>wrong</span>",
          '<span class="meta-stat"><strong>' +
            html(String(score.wins || 0)) +
            "</strong>wins</span>",
          '<span class="meta-stat phase">' + html(phase) + "</span>",
          "</div>"
        ].join("");
      }

      function renderScorePanel(score, compact) {
        if (!score) return "";
        const totalPoints = score.totalPoints || 0;
        const roundsStarted = score.roundsStarted || 0;
        if (compact && totalPoints === 0 && roundsStarted === 0) return "";

        const activeRound = score.activeRound || null;
        const lastRound = score.lastRound || null;
        const rank = score.rank || {};
        const badges =
          lastRound && Array.isArray(lastRound.badges) ? lastRound.badges : [];
        const note = activeRound
          ? "Active case: " +
            activeRound.mistakes +
            " wrong, " +
            activeRound.questions +
            " clue" +
            (activeRound.questions === 1 ? "" : "s") +
            " spent."
          : lastRound && lastRound.summary
            ? lastRound.summary
            : roundsStarted
              ? "Open another case to build your streak."
              : "";

        return [
          '<section class="score-panel' + (compact ? " compact" : "") + '">',
          '<div class="score-main">',
          renderScoreStat(totalPoints, "points"),
          renderScoreStat(score.currentStreak || 0, "streak"),
          renderScoreStat(score.bestStreak || 0, "best"),
          renderScoreStat(score.perfectRounds || 0, "perfect"),
          "</div>",
          '<div class="score-rank">',
          '<span class="rank-label">' +
            html(rank.label || "New Investigator") +
            "</span>",
          '<span class="rank-progress">' + html(renderRankProgress(rank)) + "</span>",
          "</div>",
          note ? '<p class="score-note">' + html(note) + "</p>" : "",
          badges.length
            ? '<div class="badge-list">' +
              badges
                .slice(0, 4)
                .map((badge) => '<span class="badge">' + html(badge.label) + "</span>")
                .join("") +
              "</div>"
            : "",
          "</section>"
        ].join("");
      }

      function renderScoreStat(value, label) {
        return [
          '<span class="score-stat">',
          '<span class="score-value">' + html(String(value || 0)) + "</span>",
          '<span class="score-label">' + html(label) + "</span>",
          "</span>"
        ].join("");
      }

      function renderRankProgress(rank) {
        if (!rank || !rank.nextLabel) return "Top rank reached";
        return (
          String(rank.pointsToNext || 0) +
          " points to " +
          String(rank.nextLabel)
        );
      }

      function renderCards(cards, isComplete) {
        return [
          '<section class="card-carousel" aria-label="Source cards">',
          '<div class="carousel-toolbar">',
          '<div class="carousel-actions">',
          '<button class="carousel-button" data-action="carousel-prev" type="button" aria-label="Previous card">&lsaquo;</button>',
          '<button class="carousel-button" data-action="carousel-next" type="button" aria-label="Next card">&rsaquo;</button>',
          "</div>",
          "</div>",
          '<div class="cards-carousel-track" data-card-carousel tabindex="0">',
          cards
            .map((card) => {
              const selectable =
                !state.busy &&
                card.status === "remaining" &&
                !isComplete;
              const isFlipped =
                (state.busy === "Checking" && state.flippingCardId === card.id) ||
                card.status !== "remaining";
              const isChecking =
                state.busy === "Checking" && state.flippingCardId === card.id;

              const classes = ["card", card.status];
              if (selectable) classes.push("selectable");
              if (isFlipped) classes.push("flipped");

              return [
                '<article class="' +
                  classes.join(" ") +
                  '" data-card-id="' +
                  html(card.id) +
                  '"',
                selectable
                  ? ' role="button" tabindex="0" data-action="guess"'
                  : "",
                ' aria-label="Card ' +
                  html(card.id) +
                  ": " +
                  html(card.headline) +
                  '">',
                '<div class="card-inner">',
                renderCardFront(card, selectable),
                renderCardBack(card, isChecking),
                "</div>",
                "</article>"
              ].join("");
            })
            .join(""),
          "</div>",
          "</section>"
        ].join("");
      }

      function renderCardFront(card, selectable) {
        const ctaText = selectable
          ? "Accuse"
          : card.credibilitySignal
            ? card.credibilitySignal
            : cardStateLabel(card.status);

        return [
          '<div class="card-face card-front">',
          '<div class="card-top">',
          '<span class="card-id">' + html(card.id) + "</span>",
          '<span class="card-status-tag">' +
            html(cardStateLabel(card.status)) +
            "</span>",
          "</div>",
          '<div class="card-body">',
          '<p class="card-source">' +
            html(
              card.sourceName +
                " · " +
                card.sourceType +
                " · " +
                card.published
            ) +
            "</p>",
          '<h2 class="card-headline">' + html(card.headline) + "</h2>",
          '<p class="card-claim">' + html(card.claim) + "</p>",
          card.excerpt
            ? '<p class="card-evidence">' + html(card.excerpt) + "</p>"
            : "",
          "</div>",
          '<div class="card-bottom">',
          '<span class="card-cta">' + html(ctaText) + "</span>",
          renderSourceLink(card),
          "</div>",
          "</div>"
        ].join("");
      }

      function renderCardBack(card, isChecking) {
        const verdict =
          card.verdict || (card.status === "cleared" ? "truth" : card.status);
        const showAudit = isChecking && card.status === "remaining";

        if (showAudit) {
          return [
            '<div class="card-face card-back auditing">',
            '<div class="audit-scanline" aria-hidden="true"></div>',
            '<div class="card-top">',
            '<span class="card-id">' + html(card.id) + "</span>",
            '<span class="card-status-tag">Auditing</span>',
            "</div>",
            '<div class="card-back-body">',
            '<p class="audit-source">' +
              html(card.sourceName + " · " + card.sourceType) +
              "</p>",
            '<p class="audit-claim">' + html(card.claim) + "</p>",
            '<div class="audit-rule"><span>Auditing</span></div>',
            '<ul class="audit-steps" aria-live="polite">',
            '<li class="audit-step">Reading source</li>',
            '<li class="audit-step">Comparing wording</li>',
            '<li class="audit-step">Searching for caveats</li>',
            '<li class="audit-step">Cross-checking hidden answer</li>',
            "</ul>",
            "</div>",
            '<div class="card-bottom">',
            '<span class="card-cta">' +
              html(cardStateLabel(card.status)) +
              "</span>",
            renderSourceLink(card),
            "</div>",
            "</div>"
          ].join("");
        }

        const isLie = card.status === "lie" || verdict === "lie";
        const isTruth =
          card.status === "cleared" || verdict === "truth";
        const isPending = !isLie && !isTruth;

        const title = isLie
          ? "Sus source"
          : isTruth
            ? "Careful claim"
            : "Read the claim again.";
        const lede = isPending
          ? "Run the four-question lens before you accuse."
          : card.explanation || "";
        const tag = isLie
          ? "Lie · accused"
          : isTruth
            ? "Truth · cleared"
            : "Pending";

        const verdictBody = isPending
          ? renderPendingBody(card)
          : renderVerdictBody(card, isLie);

        return [
          '<div class="card-face card-back">',
          '<div class="card-top">',
          '<span class="card-id">' + html(card.id) + "</span>",
          '<span class="card-status-tag">' + html(tag) + "</span>",
          "</div>",
          '<div class="card-back-body">',
          '<h2 class="card-back-title">' + html(title) + "</h2>",
          lede ? '<p class="card-back-text">' + html(lede) + "</p>" : "",
          verdictBody,
          "</div>",
          '<div class="card-bottom">',
          '<span class="card-cta">' +
            html(cardStateLabel(card.status)) +
            "</span>",
          renderSourceLink(card),
          "</div>",
          "</div>"
        ].join("");
      }

      function renderPendingBody(card) {
        const claim = typeof card.claim === "string" ? card.claim.trim() : "";
        return [
          claim
            ? '<p class="pending-claim">' + html(claim) + "</p>"
            : "",
          '<div class="lens-rule"><span>The lens</span></div>',
          '<ul class="lens-prompts">',
          '<li><span>Does it name a <em>caveat</em>, or speak in absolutes?</span></li>',
          '<li><span>Is the <em>scope</em> a study, a region, or a universal law?</span></li>',
          '<li><span>Does it offer a <em>mechanism</em>, or only an image?</span></li>',
          '<li><span>Is the <em>certainty</em> earned, or borrowed?</span></li>',
          "</ul>"
        ].join("");
      }

      function renderVerdictBody(card, isLie) {
        const claim = typeof card.claim === "string" ? card.claim.trim() : "";
        const tell =
          typeof card.credibilitySignal === "string"
            ? card.credibilitySignal.trim()
            : "";
        const spinTag = isLie ? "Subtle spin" : "Holds up";

        return [
          claim
            ? '<p class="verdict-quote">' + html(claim) + "</p>"
            : "",
          tell
            ? '<p class="verdict-tell"><span class="num">1</span><span>' +
              html(tell) +
              "</span></p>"
            : "",
          '<span class="spin-tag">' + html(spinTag) + "</span>"
        ].join("");
      }

      function renderSourceLink(card) {
        if (!card.url) return "<span></span>";
        return (
          '<button class="card-link" data-action="open-source" data-url="' +
          html(card.url) +
          '" type="button">Source ↗</button>'
        );
      }

      function renderAnswer(answer) {
        const clues = Array.isArray(answer.clues) ? answer.clues : [];
        const citations = Array.isArray(answer.citations) ? answer.citations : [];

        return [
          '<section class="panel">',
          '<header class="panel-header">',
          '<h2 class="panel-title">Clue filed</h2>',
          '<span class="panel-pill">' +
            html(answer.source || "source check") +
            "</span>",
          "</header>",
          '<p class="panel-body">' + html(answer.summary || "") + "</p>",
          citations.length
            ? '<div class="citation-list">' +
                citations
                  .slice(0, 5)
                  .map(
                    (c) =>
                      '<div class="citation"><a href="' +
                      html(c.url) +
                      '" target="_blank" rel="noreferrer">' +
                      html(c.title) +
                      "</a>" +
                      (c.published
                        ? '<div class="citation-meta">' +
                          html(c.published) +
                          "</div>"
                        : "") +
                      "</div>"
                  )
                  .join("") +
                "</div>"
            : "",
          clues.length
            ? '<div class="clue-list">' +
                clues
                  .map(
                    (c) =>
                      '<div class="clue"><strong>' +
                      html(c.cardId + " · " + c.sourceName) +
                      "</strong> " +
                      html(c.clue) +
                      "</div>"
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
        const isWon = status === "won";
        const score = game.score || {};
        const lastRound = score.lastRound || null;
        const roundBadges =
          lastRound && Array.isArray(lastRound.badges) ? lastRound.badges : [];

        return [
          '<section class="summary">',
          '<div class="summary-hero">',
          '<p class="kicker' +
            (isWon ? " kicker-accent" : "") +
            '">' +
            html(isWon ? "Case solved" : "Case revealed") +
            "</p>",
          "<h1>" + html(reveal.topic || "Case closed") + "</h1>",
          '<p class="lede">' +
            html(
              game.message ||
                (isWon
                  ? "You found the source spinning the truth. Read the rest to spot the pattern."
                  : "Here is the full source board with each verdict explained.")
            ) +
            "</p>",
          '<div class="summary-stats">',
          isWon && lastRound
            ? '<span class="meta-stat"><strong>' +
              html(String(lastRound.points || 0)) +
              "</strong>points</span>"
            : "",
          isWon && lastRound
            ? '<span class="meta-stat"><strong>' +
              html(lastRound.grade || "D") +
              "</strong>grade</span>"
            : "",
          '<span class="meta-stat"><strong>' +
            html(String(wrongGuesses)) +
            "</strong>wrong guesses</span>",
          '<span class="meta-stat"><strong>' +
            html(String(questions.length)) +
            "</strong>questions asked</span>",
          '<span class="meta-stat"><strong>' +
            html(String(cards.length)) +
            "</strong>cards reviewed</span>",
          "</div>",
          roundBadges.length
            ? '<div class="badge-list">' +
              roundBadges
                .map((badge) => '<span class="badge">' + html(badge.label) + "</span>")
                .join("") +
              "</div>"
            : "",
          "</div>",

          lie
            ? [
                '<div class="verdict-card">',
                '<p class="verdict-label">The sus source</p>',
                '<p class="verdict-source">Card ' +
                  html(lie.id) +
                  (lie.sourceName ? " · " + html(lie.sourceName) : "") +
                  "</p>",
                '<p class="verdict-explanation">' +
                  html(lie.explanation || "") +
                  "</p>",
                "</div>"
              ].join("")
            : "",

          '<div class="reveal-list">',
          cards
            .map(
              (card) =>
                '<div class="reveal-card ' +
                html(card.verdict || "") +
                '">' +
                '<div class="reveal-card-head">' +
                '<span class="reveal-card-id">' +
                html(
                  card.id +
                    (card.sourceName ? " · " + card.sourceName : "")
                ) +
                "</span>" +
                '<span class="reveal-card-verdict">' +
                html(card.verdict || "") +
                "</span>" +
                "</div>" +
                '<p class="reveal-card-text">' +
                html(card.explanation || "") +
                "</p>" +
                "</div>"
            )
            .join(""),
          "</div>",

          '<div class="summary-actions">',
          '<button data-action="welcome" type="button">New case</button>',
          '<button class="btn-secondary" data-action="close" type="button">Close</button>',
          "</div>",

          state.error
            ? '<div class="error" role="alert">' + html(state.error) + "</div>"
            : "",
          "</section>"
        ].join("");
      }

      function bindEvents() {
        const topicInput = root.querySelector("[data-topic]");
        if (topicInput) {
          topicInput.addEventListener("input", (event) => {
            state.topic = event.target.value;
          });
          topicInput.addEventListener("change", persistUiState);
          topicInput.addEventListener("blur", persistUiState);
        }

        const topicForm = root.querySelector("[data-topic-form]");
        if (topicForm) {
          topicForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            await startTopicRound();
          });
        }

        const cardCarousel = root.querySelector("[data-card-carousel]");
        if (cardCarousel) {
          cardCarousel.addEventListener("keydown", (event) => {
            if (event.key === "ArrowLeft") {
              event.preventDefault();
              scrollCards(-1);
            }
            if (event.key === "ArrowRight") {
              event.preventDefault();
              scrollCards(1);
            }
          });
          cardCarousel.addEventListener(
            "scroll",
            () => {
              if (carouselPersistTimer) {
                window.clearTimeout(carouselPersistTimer);
              }
              carouselPersistTimer = window.setTimeout(() => {
                rememberCarouselPosition();
                carouselPersistTimer = 0;
              }, 120);
            },
            { passive: true }
          );
        }

        root.querySelectorAll("[data-action]").forEach((element) => {
          element.addEventListener("click", async (event) => {
            const action = element.getAttribute("data-action");
            if (action === "carousel-prev") {
              event.preventDefault();
              scrollCards(-1);
              return;
            }
            if (action === "carousel-next") {
              event.preventDefault();
              scrollCards(1);
              return;
            }
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
            if (action === "guess") {
              const cardId = element.getAttribute("data-card-id") || "";
              state.flippingCardId = cardId;
              rememberCarouselPosition(cardId);
              await runTool(
                "guess_sus_source",
                { cardId },
                "Checking"
              );
            }
            if (action === "close") {
              if (window.openai && typeof window.openai.requestClose === "function") {
                await window.openai.requestClose();
                return;
              }
              await runTool("reset_game", { clearScore: true }, "Closing");
            }
            if (action === "open-leaderboard") {
              event.preventDefault();
              state.view = "leaderboard";
              state.leaderboardError = "";
              render();
              await loadLeaderboard();
            }
            if (action === "open-welcome") {
              event.preventDefault();
              state.view = "";
              state.leaderboardError = "";
              render();
            }
          });
        });

        root.querySelectorAll('[data-action="guess"]').forEach((card) => {
          card.addEventListener("keydown", async (event) => {
            if (event.key !== "Enter" && event.key !== " ") return;
            event.preventDefault();
            const cardId = card.getAttribute("data-card-id") || "";
            state.flippingCardId = cardId;
            rememberCarouselPosition(cardId);
            await runTool(
              "guess_sus_source",
              { cardId },
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

      function scrollCards(direction) {
        const carousel = root.querySelector("[data-card-carousel]");
        if (!carousel) return;

        const firstCard = carousel.querySelector(".card");
        const styles = window.getComputedStyle(carousel);
        const gap = Number.parseFloat(styles.columnGap || styles.gap || "0") || 0;
        const distance = firstCard
          ? firstCard.getBoundingClientRect().width + gap
          : carousel.clientWidth * 0.85;
        const prefersReducedMotion =
          window.matchMedia &&
          window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        carousel.scrollBy({
          left: distance * direction,
          behavior: prefersReducedMotion ? "auto" : "smooth"
        });
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
        if (
          window.openai &&
          typeof window.openai.notifyIntrinsicHeight === "function"
        ) {
          window.openai.notifyIntrinsicHeight();
        }
      }

      window.addEventListener(
        "openai:set_globals",
        (event) => {
          const nextOutput =
            event.detail && event.detail.globals && event.detail.globals.toolOutput;
          // Skip re-render when the host echoes back an unchanged toolOutput.
          // Without this, host global updates can tear down the DOM while a
          // draft input is focused.
          if (nextOutput && setGame(nextOutput)) {
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
          if (nextOutput && setGame(nextOutput)) {
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
