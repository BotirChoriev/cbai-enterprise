/**
 * Open Science Provider Registry — honest connection status.
 */

import { listConnectorRegistrations } from "@/lib/knowledge-connectors/connector-registry";
import type { ConnectorRegistration } from "@/lib/knowledge-connectors/types";

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

const EXTENDED_PROVIDERS: readonly OpenScienceProviderRecord[] = [
  {
    id: "openalex",
    name: "OpenAlex",
    providerType: "metadata",
    officialUrl: "https://openalex.org",
    apiCapability: "metadata_search",
    openAccessScope: "Open bibliographic metadata",
    authenticationRequired: false,
    rateLimitNote: "Polite pool recommended",
    licenseNote: "https://openalex.org/license",
    connectionStatus: "not_implemented",
    limitation: "Connector not implemented — use Crossref or manual DOI import.",
  },
  {
    id: "datacite",
    name: "DataCite",
    providerType: "dataset_metadata",
    officialUrl: "https://datacite.org",
    apiCapability: "doi_metadata",
    openAccessScope: "Dataset DOI metadata",
    authenticationRequired: false,
    rateLimitNote: "Public API limits apply",
    licenseNote: "Metadata only",
    connectionStatus: "not_implemented",
    limitation: "Connector not implemented in this build.",
  },
  {
    id: "europepmc",
    name: "Europe PMC",
    providerType: "biomedical_metadata",
    officialUrl: "https://europepmc.org",
    apiCapability: "metadata_search",
    openAccessScope: "Biomedical abstracts/metadata",
    authenticationRequired: false,
    rateLimitNote: "Public API",
    licenseNote: "Metadata — not full text",
    connectionStatus: "not_implemented",
    limitation: "Connector not implemented — Crossref may overlap for DOIs.",
  },
];

export function listOpenScienceProviders(): OpenScienceProviderRecord[] {
  const connected = listConnectorRegistrations().map((c) => ({
    id: c.provider,
    name: c.provider.charAt(0).toUpperCase() + c.provider.slice(1),
    providerType: "metadata",
    officialUrl: c.termsUrl ?? "",
    apiCapability: c.capabilities.join(", ") || "none",
    openAccessScope: "Metadata via registered connector",
    authenticationRequired: false,
    rateLimitNote: "Provider rate limits apply",
    licenseNote: c.licenseNotes ?? "",
    connectionStatus: c.connectionState,
    limitation: c.connectionState === "configured" ? "Metadata only — not verified evidence." : "Not connected.",
  }));
  return [...connected, ...EXTENDED_PROVIDERS];
}

export function getConnectedProviders(): OpenScienceProviderRecord[] {
  return listOpenScienceProviders().filter((p) => p.connectionStatus === "configured" || p.connectionStatus === "available");
}
