import type { SourceCard, SourceSeed } from "./game";

const EXA_SEARCH_URL = "https://api.exa.ai/search";
const EXA_ANSWER_URL = "https://api.exa.ai/answer";
const SOURCE_COUNT = 5;

export type ExaSourceSearch = {
  query: string;
  requestId?: string;
  sources: SourceSeed[];
};

export class ExaSourceSearchError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly details?: string
  ) {
    super(message);
    this.name = "ExaSourceSearchError";
  }
}

export type ExaAnswerCitation = {
  id?: string;
  title: string;
  url: string;
  author?: string;
  published?: string;
  snippet?: string;
  image?: string;
  favicon?: string;
};

export type ExaQuestionAnswer = {
  query: string;
  answer: string;
  citations: ExaAnswerCitation[];
};

export class ExaAnswerError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly details?: string
  ) {
    super(message);
    this.name = "ExaAnswerError";
  }
}

export async function searchTopicSourcesWithExa(
  topic: string,
  apiKey: string
): Promise<ExaSourceSearch> {
  const cleanedTopic = topic.trim();
  if (!cleanedTopic) {
    throw new ExaSourceSearchError("A topic is required for Exa search.");
  }

  const query = [
    `Find credible source material about ${cleanedTopic}.`,
    "Prioritize public agencies, research institutions, data-heavy explainers, and careful reporting.",
    "Favor bounded factual claims with caveats, mechanisms, dates, and source-specific evidence."
  ].join(" ");

  const response = await fetch(EXA_SEARCH_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey
    },
    body: JSON.stringify({
      query,
      type: "auto",
      numResults: 10,
      contents: {
        highlights: {
          query: `Specific, source-backed claims about ${cleanedTopic}. Include limits, caveats, mechanisms, or evidence quality.`,
          maxCharacters: 900
        },
        livecrawlTimeout: 8000,
        maxAgeHours: 24
      }
    })
  });

  if (!response.ok) {
    throw new ExaSourceSearchError(
      `Exa search failed with HTTP ${response.status}.`,
      response.status,
      await readResponseDetails(response)
    );
  }

  const payload = asRecord(await response.json());
  const results = Array.isArray(payload.results) ? payload.results : [];
  const sources = results
    .map((result) => sourceSeedFromResult(result, cleanedTopic))
    .filter((source): source is SourceSeed => Boolean(source))
    .slice(0, SOURCE_COUNT);

  if (sources.length !== SOURCE_COUNT) {
    throw new ExaSourceSearchError(
      `Exa returned ${sources.length} usable source cards; ${SOURCE_COUNT} are required.`
    );
  }

  return {
    query,
    requestId: readString(payload.requestId),
    sources
  };
}

export async function answerQuestionWithExa(
  args: {
    topic: string;
    question: string;
    remainingCards: SourceCard[];
  },
  apiKey: string
): Promise<ExaQuestionAnswer> {
  const cleanedTopic = args.topic.trim();
  const cleanedQuestion = args.question.trim();

  if (!cleanedTopic) {
    throw new ExaAnswerError("A topic is required for Exa Answer.");
  }

  if (!cleanedQuestion) {
    throw new ExaAnswerError("A question is required for Exa Answer.");
  }

  const query = buildAnswerQuery({
    topic: cleanedTopic,
    question: cleanedQuestion,
    remainingCards: args.remainingCards
  });

  const response = await fetch(EXA_ANSWER_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey
    },
    body: JSON.stringify({
      query,
      text: true
    })
  });

  if (!response.ok) {
    throw new ExaAnswerError(
      `Exa Answer failed with HTTP ${response.status}.`,
      response.status,
      await readResponseDetails(response)
    );
  }

  const payload = asRecord(await response.json());
  const answer = readAnswer(payload.answer);
  if (!answer) {
    throw new ExaAnswerError("Exa Answer returned an empty answer.");
  }

  const citations = Array.isArray(payload.citations)
    ? payload.citations
        .map(citationFromResult)
        .filter((citation): citation is ExaAnswerCitation => Boolean(citation))
    : [];

  return {
    query,
    answer: truncate(answer, 1200),
    citations
  };
}

async function readResponseDetails(response: Response) {
  try {
    return truncate(await response.text(), 700);
  } catch {
    return undefined;
  }
}

function buildAnswerQuery(args: {
  topic: string;
  question: string;
  remainingCards: SourceCard[];
}) {
  const cardContext = args.remainingCards
    .map((card) =>
      [
        `Card ${card.id}: ${card.headline}`,
        `Source: ${card.sourceName} (${card.sourceType})`,
        `Claim: ${truncate(card.claim, 260)}`,
        `Excerpt: ${truncate(card.excerpt, 260)}`,
        card.url ? `URL: ${card.url}` : null
      ]
        .filter(Boolean)
        .join("\n")
    )
    .join("\n\n");

  return [
    `Topic: ${args.topic}`,
    `Player question: ${args.question}`,
    "Answer as a source-checking clue for a game with five credible source cards and one subtle false spin.",
    "Use current web evidence and the source-card context below.",
    "Help the player compare caveats, mechanisms, causal language, absolute wording, dates, and evidence quality.",
    "Do not directly name the lie unless the evidence makes the answer unavoidable.",
    "Keep the answer concise and cite the evidence Exa used.",
    "Remaining source-card context:",
    cardContext || "No remaining card context was available."
  ].join("\n");
}

function sourceSeedFromResult(
  result: unknown,
  topic: string
): SourceSeed | null {
  const record = asRecord(result);
  const url = readString(record.url);
  const host = url ? hostnameForUrl(url) : null;
  const headline = readString(record.title);
  const highlights = readHighlights(record.highlights);
  const bodyText = readString(record.text);
  const excerpt = firstPresent(highlights[0], bodyText, headline);

  if (!url || !host || !headline || !excerpt) {
    return null;
  }

  const claim = firstSentence(excerpt) ?? excerpt;
  const publishedDate = readString(record.publishedDate);

  return {
    sourceName: sourceNameForResult(record, host),
    sourceType: sourceTypeForHost(host),
    headline: truncate(headline, 180),
    claim: truncate(claim, 420),
    excerpt: truncate(excerpt, 520),
    published: publishedDate ? publishedDate.slice(0, 10) : undefined,
    credibilitySignal: truncate(
      `Found by Exa for "${topic}" with source URL ${url}`,
      280
    ),
    url
  };
}

function citationFromResult(result: unknown): ExaAnswerCitation | null {
  const record = asRecord(result);
  const url = readString(record.url) ?? readString(record.id);
  if (!url) return null;

  const title =
    firstPresent(readString(record.title), hostnameForUrl(url), url) ?? url;
  const snippet = firstPresent(
    readString(record.text),
    readString(record.summary),
    readHighlights(record.highlights)[0]
  );

  return {
    id: readString(record.id),
    title: truncate(title, 180),
    url,
    author: truncateOptional(readString(record.author), 120),
    published: readString(record.publishedDate)?.slice(0, 10),
    snippet: snippet ? truncate(snippet, 360) : undefined,
    image: readString(record.image),
    favicon: readString(record.favicon)
  };
}

function sourceNameForResult(record: Record<string, unknown>, host: string) {
  const author = readString(record.author);
  if (author && author.length <= 80) return author;

  return host.replace(/^www\./, "");
}

function sourceTypeForHost(host: string) {
  const lowerHost = host.toLowerCase();

  if (lowerHost.endsWith(".gov") || lowerHost.includes(".gov.")) {
    return "Public agency web source";
  }

  if (lowerHost.endsWith(".edu") || lowerHost.includes(".edu.")) {
    return "Academic web source";
  }

  if (
    lowerHost.includes("arxiv") ||
    lowerHost.includes("pubmed") ||
    lowerHost.includes("nature.com") ||
    lowerHost.includes("science.org")
  ) {
    return "Research source";
  }

  if (
    lowerHost.includes("reuters") ||
    lowerHost.includes("apnews") ||
    lowerHost.includes("bbc") ||
    lowerHost.includes("news")
  ) {
    return "Reporting source";
  }

  return "Web source found by Exa";
}

function readHighlights(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value
    .map((highlight) => {
      if (typeof highlight === "string") return highlight.trim();

      const record = asRecord(highlight);
      return readString(record.text) ?? readString(record.highlight) ?? "";
    })
    .filter(Boolean);
}

function hostnameForUrl(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

function firstSentence(text: string) {
  const normalized = text.replace(/\s+/g, " ").trim();
  const match = normalized.match(/^(.+?[.!?])\s/);
  return match?.[1] ?? (normalized || null);
}

function firstPresent(...values: Array<string | undefined | null>) {
  return values.find((value) => value && value.trim())?.trim() ?? null;
}

function readString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function readAnswer(value: unknown) {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  if (value && typeof value === "object") {
    return JSON.stringify(value);
  }

  return undefined;
}

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return {};
}

function truncate(value: string, maxLength: number) {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;

  return `${normalized.slice(0, maxLength - 1).trimEnd()}...`;
}

function truncateOptional(value: string | undefined, maxLength: number) {
  return value ? truncate(value, maxLength) : undefined;
}
