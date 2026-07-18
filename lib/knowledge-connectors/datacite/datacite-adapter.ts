import type { DataCiteRecord, DataCiteSearchResponse } from "@/lib/knowledge-connectors/datacite/datacite-types";
import type {
  CanonicalKnowledgeSource,
  ConnectorSearchResult,
  KnowledgeSearchQuery,
} from "@/lib/knowledge-connectors/types";

const DATACITE_API = "https://api.datacite.org/dois";

function toRecord(item: DataCiteRecord, retrievedAt: string): CanonicalKnowledgeSource {
  const attrs = item.attributes ?? {};
  const doi = item.id?.replace("https://doi.org/", "") ?? null;
  const title = attrs.titles?.[0]?.title ?? "Untitled dataset";
  const authors = attrs.creators?.map((c) => c.name).filter(Boolean) as string[] | undefined ?? [];
  const abstract = attrs.descriptions?.[0]?.description ?? null;
  return {
    id: doi ?? item.id ?? title,
    canonicalId: doi,
    provider: "datacite",
    sourceType: item.type ?? "dataset",
    title,
    subtitle: null,
    authors,
    publicationDate: attrs.publicationYear ? `${attrs.publicationYear}-01-01` : null,
    retrievedAt,
    landingPageUrl: attrs.url ?? (doi ? `https://doi.org/${doi}` : null),
    openAccessUrl: attrs.url ?? null,
    identifiers: doi ? [{ scheme: "doi", value: doi }] : [],
    provenance: {
      provider: "datacite",
      providerRecordId: doi,
      originalSourceName: "DataCite",
      originalSourceUrl: "https://datacite.org",
      retrievedAt,
      providerUpdatedAt: null,
      retrievalMethod: "api",
      license: null,
      attributionRequired: true,
      dataCompleteness: "partial",
      provenanceLimitations: ["Dataset DOI metadata — not dataset contents."],
    },
    trustState: "retrieved",
    abstract,
    limitations: ["DataCite metadata — dataset registration, not laboratory measurement."],
    connectionState: "available",
  };
}

export function parseDataCiteSearchResponse(
  raw: unknown,
  query: KnowledgeSearchQuery,
  retrievedAt: string,
): ConnectorSearchResult {
  const response = raw as DataCiteSearchResponse;
  const items = response.data ?? [];
  const records = items.map((item) => toRecord(item, retrievedAt));
  return {
    provider: "datacite",
    retrievedAt,
    query: query.query,
    totalResults: response.meta?.total ?? records.length,
    records,
    limitations: ["DataCite returns dataset/publication DOI metadata only."],
    connectionState: "available",
  };
}

export async function fetchDataCiteSearch(
  query: KnowledgeSearchQuery,
): Promise<{ ok: true; raw: unknown } | { ok: false; error: string; detail?: string }> {
  const limit = Math.min(query.limit ?? 10, 25);
  const url = new URL(DATACITE_API);
  url.searchParams.set("query", query.query);
  url.searchParams.set("page[size]", String(limit));

  try {
    const response = await fetch(url.toString(), {
      headers: { Accept: "application/vnd.api+json" },
      signal: AbortSignal.timeout(12_000),
    });
    if (response.status === 429) return { ok: false, error: "rate_limited", detail: "DataCite rate limit." };
    if (!response.ok) return { ok: false, error: "provider_unavailable", detail: `HTTP ${response.status}` };
    return { ok: true, raw: await response.json() };
  } catch (err) {
    return { ok: false, error: "network_failure", detail: err instanceof Error ? err.message : "network_failure" };
  }
}

export async function searchDataCite(query: KnowledgeSearchQuery): Promise<ConnectorSearchResult> {
  const retrievedAt = new Date().toISOString();
  const fetched = await fetchDataCiteSearch(query);
  if (!fetched.ok) {
    return {
      provider: "datacite",
      retrievedAt,
      query: query.query,
      totalResults: null,
      records: [],
      limitations: [fetched.detail ?? fetched.error],
      connectionState: "unavailable",
      errorCategory: fetched.error,
    };
  }
  return parseDataCiteSearchResponse(fetched.raw, query, retrievedAt);
}
