import type { SourceSeed } from "./game";

const EXA_SEARCH_URL = "https://api.exa.ai/search";
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

async function readResponseDetails(response: Response) {
  try {
    return truncate(await response.text(), 700);
  } catch {
    return undefined;
  }
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
