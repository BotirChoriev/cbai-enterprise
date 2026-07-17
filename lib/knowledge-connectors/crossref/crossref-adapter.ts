import type { CrossrefSearchResponse, CrossrefWorkItem } from "@/lib/knowledge-connectors/crossref/crossref-types";
import type {
  CanonicalKnowledgeSource,
  ConnectorSearchResult,
  KnowledgeSearchQuery,
} from "@/lib/knowledge-connectors/types";

const CROSSREF_API = "https://api.crossref.org/works";

function formatAuthors(item: CrossrefWorkItem): string[] {
  if (!item.author) return [];
  return item.author.map((author) => {
    if (author.name) return author.name;
    return [author.given, author.family].filter(Boolean).join(" ");
  });
}

function formatDate(parts: number[][] | undefined): string | null {
  const dateParts = parts?.[0];
  if (!dateParts || dateParts.length === 0) return null;
  const [year, month = 1, day = 1] = dateParts;
  return new Date(Date.UTC(year, month - 1, day)).toISOString().slice(0, 10);
}

export function parseCrossrefSearchResponse(
  raw: unknown,
  query: KnowledgeSearchQuery,
  retrievedAt: string,
): ConnectorSearchResult {
  const response = raw as CrossrefSearchResponse;
  const items = response.message?.items ?? [];
  const total = response.message?.["total-results"] ?? null;

  const records: CanonicalKnowledgeSource[] = items.map((item, index) => {
    const doi = item.DOI ?? null;
    const id = doi ?? `crossref-${index}-${Date.now()}`;
    return {
      id,
      canonicalId: doi,
      provider: "crossref",
      sourceType: item.type ?? "work",
      title: item.title?.[0] ?? "Untitled work",
      subtitle: item.subtitle?.[0] ?? null,
      authors: formatAuthors(item),
      publicationDate:
        formatDate(item["published-online"]?.["date-parts"]) ??
        formatDate(item.published?.["date-parts"]),
      retrievedAt,
      landingPageUrl: item.URL ?? (doi ? `https://doi.org/${doi}` : null),
      openAccessUrl: item.license?.[0]?.URL ?? null,
      identifiers: doi ? [{ scheme: "doi", value: doi }] : [],
      provenance: {
        provider: "crossref",
        providerRecordId: doi,
        originalSourceName: "Crossref",
        originalSourceUrl: doi ? `https://doi.org/${doi}` : CROSSREF_API,
        retrievedAt,
        providerUpdatedAt: null,
        retrievalMethod: "api",
        license: item.license?.[0]?.URL ?? null,
        attributionRequired: true,
        dataCompleteness: doi ? "partial" : "unknown",
        provenanceLimitations: [
          "Metadata only — not reviewed evidence.",
          "Abstract may be truncated or absent per publisher policy.",
        ],
      },
      trustState: "retrieved",
      abstract: item.abstract?.replace(/<[^>]+>/g, " ").trim() || null,
      limitations: ["Search result — human review required before use in decisions."],
      connectionState: "available",
    };
  });

  return {
    provider: "crossref",
    retrievedAt,
    query: query.query,
    totalResults: total,
    records,
    limitations: [
      "Crossref returns bibliographic metadata only.",
      "Results are not automatically verified evidence.",
    ],
    connectionState: "available",
  };
}

export async function fetchCrossrefSearch(
  query: KnowledgeSearchQuery,
): Promise<{ ok: true; raw: unknown } | { ok: false; error: string; detail?: string }> {
  const limit = Math.min(query.limit ?? 10, 20);
  const url = new URL(CROSSREF_API);
  url.searchParams.set("query", query.query);
  url.searchParams.set("rows", String(limit));
  if (query.offset) url.searchParams.set("offset", String(query.offset));

  try {
    const response = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
        "User-Agent": "CBAI-Enterprise/1.0 (mailto:support@checkbalanceai.global)",
      },
      signal: AbortSignal.timeout(12_000),
    });

    if (response.status === 429) {
      return { ok: false, error: "rate_limited", detail: "Crossref rate limit reached." };
    }
    if (!response.ok) {
      return { ok: false, error: "provider_unavailable", detail: `HTTP ${response.status}` };
    }

    const raw: unknown = await response.json();
    return { ok: true, raw };
  } catch (err) {
    const message = err instanceof Error ? err.message : "network_failure";
    return { ok: false, error: "network_failure", detail: message };
  }
}

export async function searchCrossref(query: KnowledgeSearchQuery): Promise<ConnectorSearchResult> {
  const retrievedAt = new Date().toISOString();
  const fetched = await fetchCrossrefSearch(query);

  if (!fetched.ok) {
    return {
      provider: "crossref",
      retrievedAt,
      query: query.query,
      totalResults: null,
      records: [],
      limitations: [fetched.detail ?? fetched.error],
      connectionState: fetched.error === "rate_limited" ? "rate_limited" : "unavailable",
      errorCategory: fetched.error,
    };
  }

  return parseCrossrefSearchResponse(fetched.raw, query, retrievedAt);
}
