import { ADAPTER_CATALOG } from "@/lib/evidence-infrastructure/adapters/catalog";
import { CONNECTOR_CATALOG } from "@/lib/evidence-infrastructure/connectors/catalog";
import { NORMALIZER_CATALOG } from "@/lib/evidence-infrastructure/normalizers/catalog";
import { OFFICIAL_EVIDENCE_SOURCES } from "@/lib/evidence-infrastructure/sources/catalog";
import type { EvidenceInfrastructureRegistry } from "@/lib/evidence-infrastructure/types";
import { INFRASTRUCTURE_VERSION } from "@/lib/evidence-infrastructure/types";

/** Unified evidence infrastructure registry — single source registration. */
export const EVIDENCE_INFRASTRUCTURE_REGISTRY: EvidenceInfrastructureRegistry = {
  version: INFRASTRUCTURE_VERSION,
  sources: OFFICIAL_EVIDENCE_SOURCES,
  connectors: CONNECTOR_CATALOG,
  adapters: ADAPTER_CATALOG,
  normalizers: NORMALIZER_CATALOG,
};

export function getInfrastructureSummary() {
  return {
    version: INFRASTRUCTURE_VERSION,
    sourceCount: OFFICIAL_EVIDENCE_SOURCES.length,
    connectedSources: OFFICIAL_EVIDENCE_SOURCES.filter(
      (s) => s.connectionStatus === "connected",
    ).length,
    plannedSources: OFFICIAL_EVIDENCE_SOURCES.filter(
      (s) => s.connectionStatus === "planned",
    ).length,
    connectorCount: CONNECTOR_CATALOG.length,
    adapterCount: ADAPTER_CATALOG.length,
    normalizerCount: NORMALIZER_CATALOG.length,
    verifiedSources: OFFICIAL_EVIDENCE_SOURCES.filter(
      (s) => s.verificationStatus === "verified",
    ).length,
  };
}

export function getSourceAdapterChain(sourceSlug: string) {
  const source = OFFICIAL_EVIDENCE_SOURCES.find((s) => s.slug === sourceSlug);
  const connectors = CONNECTOR_CATALOG.filter(
    (c) => c.metadata.sourceSlug === sourceSlug,
  );
  const adapters = ADAPTER_CATALOG.filter((a) => a.sourceSlug === sourceSlug);
  return { source, connectors, adapters };
}
