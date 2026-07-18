import type { ConnectorRegistration, KnowledgeProviderId } from "@/lib/knowledge-connectors/types";
import { searchCrossref } from "@/lib/knowledge-connectors/crossref/crossref-adapter";
import { searchOpenAlex } from "@/lib/knowledge-connectors/openalex/openalex-adapter";
import { searchEuropePmc } from "@/lib/knowledge-connectors/europepmc/europepmc-adapter";
import { searchDataCite } from "@/lib/knowledge-connectors/datacite/datacite-adapter";

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
    enabled: true,
    configured: true,
    capabilities: ["metadata_search", "metadata_retrieve", "abstract_retrieve"],
    connectionState: "configured",
    termsUrl: "https://openalex.org/license",
    licenseNotes: "OpenAlex bibliographic metadata — polite pool recommended.",
  },
  {
    provider: "europepmc",
    enabled: true,
    configured: true,
    capabilities: ["metadata_search", "abstract_retrieve"],
    connectionState: "configured",
    termsUrl: "https://europepmc.org/TermsOfUse",
    licenseNotes: "Europe PMC metadata — biomedical publications.",
  },
  {
    provider: "datacite",
    enabled: true,
    configured: true,
    capabilities: ["metadata_search", "metadata_retrieve"],
    connectionState: "configured",
    termsUrl: "https://datacite.org/policies",
    licenseNotes: "DataCite DOI metadata for datasets and related works.",
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
  const q = { query, limit };
  switch (provider) {
    case "crossref":
      return searchCrossref(q);
    case "openalex":
      return searchOpenAlex(q);
    case "europepmc":
      return searchEuropePmc(q);
    case "datacite":
      return searchDataCite(q);
    default:
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
}

export const PRIORITY_OPEN_SCIENCE_PROVIDERS: readonly KnowledgeProviderId[] = [
  "crossref",
  "openalex",
  "europepmc",
  "datacite",
];
