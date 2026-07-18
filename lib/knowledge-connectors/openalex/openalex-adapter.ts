import type { OpenAlexSearchResponse, OpenAlexWork } from "@/lib/knowledge-connectors/openalex/openalex-types";
import type {
  CanonicalKnowledgeSource,
  ConnectorSearchResult,
  KnowledgeSearchQuery,
} from "@/lib/knowledge-connectors/types";

const OPENALEX_API = "https://api.openalex.org/works";

function decodeAbstract(index: Record<string, readonly number[]> | null | undefined): string | null {
  if (!index) return null;
  const positions: Array<{ word: string; pos: number }> = [];
  for (const [word, idxs] of Object.entries(index)) {
    for (const pos of idxs) positions.push({ word, pos });
  }
  if (positions.length === 0) return null;
  positions.sort((a, b) => a.pos - b.pos);
  return positions.map((p) => p.word).join(" ");
}

function toRecord(item: OpenAlexWork, index: number, retrievedAt: string): CanonicalKnowledgeSource {
  const doi = item.doi?.replace("https://doi.org/", "") ?? null;
  const id = doi ?? item.id ?? `openalex-${index}`;
  const authors =
    item.authorships?.map((a) => a.author?.display_name).filter(Boolean) as string[] | undefined ?? [];
  return {
    id,
    canonicalId: doi,
    provider: "openalex",
    sourceType: item.type ?? "work",
    title: item.title ?? "Untitled work",
    subtitle: null,
    authors,
    publicationDate: item.publication_date ?? null,
    retrievedAt,
    landingPageUrl: item.primary_location?.landing_page_url ?? (doi ? `https://doi.org/${doi}` : item.id ?? null),
    openAccessUrl: item.open_access?.oa_url ?? null,
    identifiers: doi ? [{ scheme: "doi", value: doi }] : [],
    provenance: {
      provider: "openalex",
      providerRecordId: item.id ?? doi,
      originalSourceName: "OpenAlex",
      originalSourceUrl: item.id ?? "https://openalex.org",
      retrievedAt,
      providerUpdatedAt: null,
      retrievalMethod: "api",
      license: item.primary_location?.license ?? null,
      attributionRequired: true,
      dataCompleteness: doi ? "partial" : "unknown",
      provenanceLimitations: ["OpenAlex metadata — not verified evidence."],
    },
    trustState: "retrieved",
    abstract: decodeAbstract(item.abstract_inverted_index ?? null),
    limitations: ["Bibliographic metadata — human review required."],
    connectionState: "available",
  };
}

export function parseOpenAlexSearchResponse(
  raw: unknown,
  query: KnowledgeSearchQuery,
  retrievedAt: string,
): ConnectorSearchResult {
  const response = raw as OpenAlexSearchResponse;
  const items = response.results ?? [];
  const records = items.map((item, i) => toRecord(item, i, retrievedAt));
  return {
    provider: "openalex",
    retrievedAt,
    query: query.query,
    totalResults: response.meta?.count ?? records.length,
    records,
    limitations: [
      "OpenAlex returns bibliographic metadata only.",
      "Project success/failure is not inferred from titles.",
    ],
    connectionState: "available",
  };
}

export async function fetchOpenAlexSearch(
  query: KnowledgeSearchQuery,
): Promise<{ ok: true; raw: unknown } | { ok: false; error: string; detail?: string }> {
  const limit = Math.min(query.limit ?? 10, 25);
  const url = new URL(OPENALEX_API);
  url.searchParams.set("search", query.query);
  url.searchParams.set("per-page", String(limit));
  if (query.offset) url.searchParams.set("page", String(Math.floor(query.offset / limit) + 1));

  try {
    const response = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(12_000),
    });
    if (response.status === 429) return { ok: false, error: "rate_limited", detail: "OpenAlex rate limit." };
    if (!response.ok) return { ok: false, error: "provider_unavailable", detail: `HTTP ${response.status}` };
    return { ok: true, raw: await response.json() };
  } catch (err) {
    return { ok: false, error: "network_failure", detail: err instanceof Error ? err.message : "network_failure" };
  }
}

export async function searchOpenAlex(query: KnowledgeSearchQuery): Promise<ConnectorSearchResult> {
  const retrievedAt = new Date().toISOString();
  const fetched = await fetchOpenAlexSearch(query);
  if (!fetched.ok) {
    return {
      provider: "openalex",
      retrievedAt,
      query: query.query,
      totalResults: null,
      records: [],
      limitations: [fetched.detail ?? fetched.error],
      connectionState:
        fetched.error === "network_failure" ? "unavailable" : fetched.error === "rate_limited" ? "rate_limited" : "unavailable",
      errorCategory: fetched.error,
    };
  }
  return parseOpenAlexSearchResponse(fetched.raw, query, retrievedAt);
}
