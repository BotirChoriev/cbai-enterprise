/**
 * Honest adapter contracts for Domain / Country Intelligence.
 * Adapters return provenance + explicit unsupported/unavailable states.
 * No live scraping or fabricated payloads.
 */

import type { ProvenancedClaim } from "@/lib/domain-intelligence/evidence-provenance";
import { unavailableClaim } from "@/lib/domain-intelligence/evidence-provenance";

export type AdapterAvailability =
  | "connected"
  | "configured_unverified"
  | "planned"
  | "unsupported"
  | "unavailable";

export type AdapterCapabilityReport = {
  readonly adapterId: string;
  readonly title: string;
  readonly availability: AdapterAvailability;
  readonly supportsLiveFetch: boolean;
  readonly supportsSearch: boolean;
  readonly lastVerifiedAt: string | null;
  readonly unsupportedReasons: readonly string[];
  readonly provenanceNote: string;
};

export type DomainAdapterKind =
  | "academic_registry"
  | "publication_index"
  | "dataset_registry"
  | "country_indicator_source"
  | "official_government_source"
  | "laws_standards_source"
  | "organization_registry";

export type DomainAdapter = {
  readonly kind: DomainAdapterKind;
  readonly capability: AdapterCapabilityReport;
  /** Fetch a claim by key — must never invent values. */
  readonly getClaim: (key: string, geographicScope?: string) => ProvenancedClaim;
};

function plannedAdapter(
  kind: DomainAdapterKind,
  title: string,
  reasons: readonly string[],
): DomainAdapter {
  return {
    kind,
    capability: {
      adapterId: `adapter:${kind}`,
      title,
      availability: "planned",
      supportsLiveFetch: false,
      supportsSearch: false,
      lastVerifiedAt: null,
      unsupportedReasons: reasons,
      provenanceNote:
        "Contract only — no live connector is implemented. Empty/unavailable claims are returned honestly.",
    },
    getClaim: (key, geographicScope) =>
      unavailableClaim({
        id: `adapter:${kind}:${key}`,
        displayLabel: key,
        geographicCoverage: geographicScope,
        limitations: reasons,
      }),
  };
}

function localRegistryOrganizationAdapter(): DomainAdapter {
  return {
    kind: "organization_registry",
    capability: {
      adapterId: "adapter:organization_registry:local",
      title: "CBAI local organization registry",
      availability: "connected",
      supportsLiveFetch: false,
      supportsSearch: true,
      lastVerifiedAt: null,
      unsupportedReasons: [
        "Only seed companies and universities are available — no ministries or research institutes.",
      ],
      provenanceNote: "Local seed catalogs in lib/companies.ts and lib/universities.ts.",
    },
    getClaim: (key, geographicScope) =>
      unavailableClaim({
        id: `adapter:organization_registry:${key}`,
        displayLabel: key,
        geographicCoverage: geographicScope,
        limitations: [
          "Organization claim values are not stored as indicators — use entity registries for names.",
        ],
      }),
  };
}

/** All domain adapters — mostly planned; local organization registry is connected (names only). */
export const DOMAIN_ADAPTERS: readonly DomainAdapter[] = [
  plannedAdapter("academic_registry", "Academic registry (faculty / department / researcher)", [
    "Faculty, department, and researcher instance records are not populated.",
  ]),
  plannedAdapter("publication_index", "Publication index", [
    "No live publication index is connected. Knowledge connectors may exist separately for literature search but do not populate this domain graph.",
  ]),
  plannedAdapter("dataset_registry", "Dataset registry", [
    "Dataset instance records are readiness shells only.",
  ]),
  plannedAdapter("country_indicator_source", "Country indicator source (e.g. World Bank)", [
    "World Bank and peer connectors are declared as planned — no live time-series ingest.",
  ]),
  plannedAdapter("official_government_source", "Official government source", [
    "Official websites may be linked on country records; structured government datasets are not ingested.",
  ]),
  plannedAdapter("laws_standards_source", "Laws and standards source", [
    "No laws/standards corpus is connected. Legal conclusions are never automated.",
  ]),
  localRegistryOrganizationAdapter(),
];

export function getDomainAdapter(kind: DomainAdapterKind): DomainAdapter | undefined {
  return DOMAIN_ADAPTERS.find((a) => a.kind === kind);
}

export function listAdapterCapabilityMatrix(): readonly AdapterCapabilityReport[] {
  return DOMAIN_ADAPTERS.map((a) => a.capability);
}
