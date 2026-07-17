import type { ConnectorRegistration, KnowledgeProviderId } from "@/lib/knowledge-connectors/types";
import { searchCrossref } from "@/lib/knowledge-connectors/crossref/crossref-adapter";

const REGISTRY: readonly ConnectorRegistration[] = [
  {
    provider: "crossref",
    enabled: true,
    configured: true,
    capabilities: ["metadata_search", "metadata_retrieve", "abstract_retrieve"],
    connectionState: "configured",
    termsUrl: "https://www.crossref.org/terms/",
    licenseNotes: "Metadata via Crossref REST API — attribution required.",
  },
  {
    provider: "openalex",
    enabled: false,
    configured: false,
    capabilities: [],
    connectionState: "not_implemented",
    termsUrl: "https://openalex.org/license",
    licenseNotes: null,
  },
  {
    provider: "arxiv",
    enabled: false,
    configured: false,
    capabilities: [],
    connectionState: "not_implemented",
    termsUrl: "https://info.arxiv.org/help/api/index.html",
    licenseNotes: null,
  },
  {
    provider: "pubmed",
    enabled: false,
    configured: false,
    capabilities: [],
    connectionState: "not_implemented",
    termsUrl: "https://www.ncbi.nlm.nih.gov/home/about/policies/",
    licenseNotes: null,
  },
] as const;

export function listConnectorRegistrations(): readonly ConnectorRegistration[] {
  return REGISTRY;
}

export function getConnectorRegistration(provider: KnowledgeProviderId): ConnectorRegistration | null {
  return REGISTRY.find((entry) => entry.provider === provider) ?? null;
}

export async function searchKnowledgeProvider(
  provider: KnowledgeProviderId,
  query: string,
  limit = 10,
) {
  if (provider === "crossref") {
    return searchCrossref({ query, limit });
  }
  return {
    provider,
    retrievedAt: new Date().toISOString(),
    query,
    totalResults: null,
    records: [],
    limitations: [`Provider "${provider}" is not implemented yet.`],
    connectionState: "not_implemented" as const,
    errorCategory: "not_implemented",
  };
}
