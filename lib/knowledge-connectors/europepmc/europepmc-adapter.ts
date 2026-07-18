import type { EuropePmcSearchResponse, EuropePmcResult } from "@/lib/knowledge-connectors/europepmc/europepmc-types";
import type {
  CanonicalKnowledgeSource,
  ConnectorSearchResult,
  KnowledgeSearchQuery,
} from "@/lib/knowledge-connectors/types";

const EUROPEPMC_API = "https://www.ebi.ac.uk/europepmc/webservices/rest/search";

function parseAuthors(authorString?: string): string[] {
  if (!authorString?.trim()) return [];
  return authorString.split(",").map((a) => a.trim()).filter(Boolean);
}

function toRecord(item: EuropePmcResult, index: number, retrievedAt: string): CanonicalKnowledgeSource {
  const doi = item.doi ?? null;
  const id = doi ?? item.id ?? `epmc-${index}`;
  return {
    id,
    canonicalId: doi,
    provider: "europepmc",
    sourceType: item.source ?? "publication",
    title: item.title ?? "Untitled work",
    subtitle: item.journalTitle ?? null,
    authors: parseAuthors(item.authorString),
    publicationDate: item.pubYear ? `${item.pubYear}-01-01` : null,
    retrievedAt,
    landingPageUrl: doi ? `https://doi.org/${doi}` : `https://europepmc.org/search?query=EXT_ID:${item.id}`,
    openAccessUrl: null,
    identifiers: doi ? [{ scheme: "doi", value: doi }] : [],
    provenance: {
      provider: "europepmc",
      providerRecordId: item.id ?? doi,
      originalSourceName: "Europe PMC",
      originalSourceUrl: "https://europepmc.org",
      retrievedAt,
      providerUpdatedAt: null,
      retrievalMethod: "api",
      license: null,
      attributionRequired: true,
      dataCompleteness: "partial",
      provenanceLimitations: ["Abstract/metadata when returned — not full text unless open access link present."],
    },
    trustState: "retrieved",
    abstract: item.abstractText ?? null,
    limitations: ["Europe PMC metadata — biomedical scope."],
    connectionState: "available",
  };
}

export function parseEuropePmcSearchResponse(
  raw: unknown,
  query: KnowledgeSearchQuery,
  retrievedAt: string,
): ConnectorSearchResult {
  const response = raw as EuropePmcSearchResponse;
  const items = response.resultList?.result ?? [];
  const records = items.map((item, i) => toRecord(item, i, retrievedAt));
  return {
    provider: "europepmc",
    retrievedAt,
    query: query.query,
    totalResults: response.hitCount ?? records.length,
    records,
    limitations: ["Europe PMC metadata search — no paywall bypass."],
    connectionState: "available",
  };
}

export async function fetchEuropePmcSearch(
  query: KnowledgeSearchQuery,
): Promise<{ ok: true; raw: unknown } | { ok: false; error: string; detail?: string }> {
  const limit = Math.min(query.limit ?? 10, 25);
  const url = new URL(EUROPEPMC_API);
  url.searchParams.set("query", query.query);
  url.searchParams.set("format", "json");
  url.searchParams.set("pageSize", String(limit));
  url.searchParams.set("resultType", "core");

  try {
    const response = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(12_000),
    });
    if (!response.ok) return { ok: false, error: "provider_unavailable", detail: `HTTP ${response.status}` };
    return { ok: true, raw: await response.json() };
  } catch (err) {
    return { ok: false, error: "network_failure", detail: err instanceof Error ? err.message : "network_failure" };
  }
}

export async function searchEuropePmc(query: KnowledgeSearchQuery): Promise<ConnectorSearchResult> {
  const retrievedAt = new Date().toISOString();
  const fetched = await fetchEuropePmcSearch(query);
  if (!fetched.ok) {
    return {
      provider: "europepmc",
      retrievedAt,
      query: query.query,
      totalResults: null,
      records: [],
      limitations: [fetched.detail ?? fetched.error],
      connectionState: "unavailable",
      errorCategory: fetched.error,
    };
  }
  return parseEuropePmcSearchResponse(fetched.raw, query, retrievedAt);
}
