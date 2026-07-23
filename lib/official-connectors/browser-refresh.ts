/**
 * Browser-safe refresh for keyless official sources when Pages Function is unavailable.
 * Never calls credentialed Census/BEA from the client.
 */

import { clearObservations, listObservations, observationCount, listConnectorHealth } from "@/lib/official-connectors/store";
import { fetchWorldBankForCountry } from "@/lib/official-connectors/sources/world-bank";
import { fetchUsBlsUnemployment } from "@/lib/official-connectors/sources/us-bls";
import { fetchUsSecRegistryMatches } from "@/lib/official-connectors/sources/us-sec";
import { fetchUnitedNationsConnectivity } from "@/lib/official-connectors/sources/united-nations";
import { fetchOecdForCountry } from "@/lib/official-connectors/sources/oecd";
import { generateEvidenceReport, generateExecutiveSummary } from "@/lib/official-connectors/reports";
import type { OfficialSourceSlug } from "@/lib/official-connectors/types";

export async function refreshOfficialConnectorsInBrowser(entityId = "usa") {
  clearObservations();
  await fetchWorldBankForCountry(entityId);
  await fetchUnitedNationsConnectivity();
  await fetchOecdForCountry(entityId);
  if (entityId === "usa") {
    await fetchUsBlsUnemployment();
  }
  await fetchUsSecRegistryMatches();

  const observations = entityId ? listObservations({ entityId }) : listObservations();
  const retrievedSources = [
    ...new Set(observations.map((item) => item.provenance.sourceSlug)),
  ] as OfficialSourceSlug[];

  return {
    ok: true as const,
    observationCount: observationCount(),
    // Never claim connected from browser path — Pages Function only.
    connectedSources: [] as const,
    retrievedSources,
    health: listConnectorHealth(),
    observations,
    mode: "browser-keyless" as const,
  };
}

export function browserEvidenceReport(entityId?: string) {
  return generateEvidenceReport(entityId);
}

export function browserExecutiveSummary(entityId?: string) {
  return generateExecutiveSummary(entityId);
}
