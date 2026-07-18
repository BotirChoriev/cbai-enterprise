/**
 * Open Science Provider Registry — honest connection status from connector registry.
 */

import {
  listConnectorRegistrations,
  PRIORITY_OPEN_SCIENCE_PROVIDERS,
} from "@/lib/knowledge-connectors/connector-registry";
import type { ConnectorRegistration, KnowledgeProviderId } from "@/lib/knowledge-connectors/types";

export type OpenScienceProviderRecord = {
  readonly id: string;
  readonly name: string;
  readonly providerType: string;
  readonly officialUrl: string;
  readonly apiCapability: string;
  readonly openAccessScope: string;
  readonly authenticationRequired: boolean;
  readonly rateLimitNote: string;
  readonly licenseNote: string;
  readonly connectionStatus: ConnectorRegistration["connectionState"];
  readonly limitation: string;
};

const PROVIDER_META: Record<
  KnowledgeProviderId,
  { name: string; officialUrl: string; providerType: string; openAccessScope: string }
> = {
  crossref: {
    name: "Crossref",
    officialUrl: "https://www.crossref.org",
    providerType: "metadata",
    openAccessScope: "Bibliographic metadata",
  },
  openalex: {
    name: "OpenAlex",
    officialUrl: "https://openalex.org",
    providerType: "metadata",
    openAccessScope: "Open bibliographic metadata",
  },
  europepmc: {
    name: "Europe PMC",
    officialUrl: "https://europepmc.org",
    providerType: "biomedical_metadata",
    openAccessScope: "Biomedical abstracts/metadata",
  },
  datacite: {
    name: "DataCite",
    officialUrl: "https://datacite.org",
    providerType: "dataset_metadata",
    openAccessScope: "Dataset DOI metadata",
  },
  arxiv: {
    name: "arXiv",
    officialUrl: "https://arxiv.org",
    providerType: "preprint",
    openAccessScope: "Preprint metadata",
  },
  pubmed: {
    name: "PubMed",
    officialUrl: "https://pubmed.ncbi.nlm.nih.gov",
    providerType: "biomedical_metadata",
    openAccessScope: "Biomedical metadata",
  },
  catalog: {
    name: "CBAI Catalog",
    officialUrl: "",
    providerType: "internal",
    openAccessScope: "Internal catalog",
  },
};

function toRecord(reg: ConnectorRegistration): OpenScienceProviderRecord {
  const meta = PROVIDER_META[reg.provider];
  return {
    id: reg.provider,
    name: meta.name,
    providerType: meta.providerType,
    officialUrl: meta.officialUrl,
    apiCapability: reg.capabilities.join(", ") || "none",
    openAccessScope: meta.openAccessScope,
    authenticationRequired: false,
    rateLimitNote: "Provider rate limits apply — browser CORS may block in some environments.",
    licenseNote: reg.licenseNotes ?? "",
    connectionStatus: reg.connectionState,
    limitation:
      reg.connectionState === "configured"
        ? "Metadata only — not verified evidence. CORS/backend may affect live browser requests."
        : "Not connected in this build.",
  };
}

export function listOpenScienceProviders(): OpenScienceProviderRecord[] {
  const registered = new Set(listConnectorRegistrations().map((c) => c.provider));
  return PRIORITY_OPEN_SCIENCE_PROVIDERS.filter((p) => registered.has(p))
    .map((p) => listConnectorRegistrations().find((c) => c.provider === p)!)
    .map(toRecord);
}

export function getConnectedProviders(): OpenScienceProviderRecord[] {
  return listOpenScienceProviders().filter(
    (p) => p.connectionStatus === "configured" || p.connectionStatus === "available",
  );
}
