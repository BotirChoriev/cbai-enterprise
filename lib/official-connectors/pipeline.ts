/**
 * Official connector pipeline — refresh sources and expose runtime status.
 */

import { countries } from "@/lib/countries";
import { fetchWorldBankForCountry } from "@/lib/official-connectors/sources/world-bank";
import { fetchUnitedNationsConnectivity } from "@/lib/official-connectors/sources/united-nations";
import { fetchOecdForCountry } from "@/lib/official-connectors/sources/oecd";
import { fetchUsBlsUnemployment } from "@/lib/official-connectors/sources/us-bls";
import { fetchUsSecRegistryMatches } from "@/lib/official-connectors/sources/us-sec";
import { fetchUsCensus, fetchUsBea } from "@/lib/official-connectors/sources/us-census-bea";
import {
  connectedSourceSlugs,
  listConnectorHealth,
  listObservations,
  observationCount,
} from "@/lib/official-connectors/store";
import type { ConnectorAttemptResult, OfficialSourceSlug } from "@/lib/official-connectors/types";
import { getInfrastructureSummary } from "@/lib/evidence-infrastructure/registry";

export type RefreshOptions = {
  readonly countryId?: string;
  readonly censusApiKey?: string;
  readonly beaApiKey?: string;
};

export type RefreshReport = {
  readonly checkedAt: string;
  readonly results: Record<string, ConnectorAttemptResult>;
  readonly observationCount: number;
  readonly connectedSources: readonly OfficialSourceSlug[];
  readonly health: ReturnType<typeof listConnectorHealth>;
};

export async function refreshOfficialConnectors(
  options: RefreshOptions = {},
): Promise<RefreshReport> {
  const countryId = options.countryId ?? "usa";
  const results: Record<string, ConnectorAttemptResult> = {};

  results["world-bank"] = await fetchWorldBankForCountry(countryId);

  // Optionally refresh a small additional set for multi-country demos — not the full registry.
  const extras = countries.map((c) => c.id).filter((id) => id !== countryId).slice(0, 2);
  for (const id of extras) {
    results[`world-bank:${id}`] = await fetchWorldBankForCountry(id);
  }

  results["united-nations"] = await fetchUnitedNationsConnectivity();
  results.oecd = await fetchOecdForCountry(countryId);
  results["us-bls"] = await fetchUsBlsUnemployment();
  results["us-sec"] = await fetchUsSecRegistryMatches();
  results["us-census"] = await fetchUsCensus(options.censusApiKey);
  results["us-bea"] = await fetchUsBea(options.beaApiKey);

  return {
    checkedAt: new Date().toISOString(),
    results,
    observationCount: observationCount(),
    connectedSources: connectedSourceSlugs(),
    health: listConnectorHealth(),
  };
}

/** Runtime overlay for Global Status — merges catalog with live verified sources. */
export function buildRuntimeSourceStatus() {
  const infra = getInfrastructureSummary();
  const live = connectedSourceSlugs();
  const liveSet = new Set(live);
  const connected = new Set<string>([
    ...Array.from({ length: infra.connectedSources }, (_, i) => `catalog-${i}`),
  ]);

  // Prefer explicit live slugs for messaging.
  const connectedCount = new Set([
    "cbai-local-registry",
    ...live,
  ]).size;

  const totalSources = infra.sourceCount + 4; // + us-census, us-bea, us-bls, us-sec registered in runtime docs
  // Keep total honest: use infrastructure catalog size + newly registered US agency slots only if not already present
  const plannedBase = infra.plannedSources;
  const missing = Math.max(0, infra.sourceCount - connectedCount);

  return {
    connectedSources: connectedCount,
    missingSources: missing,
    plannedSources: plannedBase,
    totalSources: infra.sourceCount,
    liveSourceSlugs: live,
    liveSet,
    observationCount: observationCount(),
    health: listConnectorHealth(),
    observations: listObservations(),
    voidConnected: connected,
  };
}

export function observationsForEntity(entityId: string) {
  return listObservations({ entityId });
}
