import {
  buildIndicatorExplorerCatalog,
  buildIndicatorExplorerRecord,
  listDecisionIntelligenceIndicatorIds,
} from "@/lib/indicator-explorer/indicator-explorer.builder";
import type {
  IndicatorExplorerCatalog,
  IndicatorExplorerCoverageStatus,
  IndicatorExplorerRecord,
} from "@/lib/indicator-explorer/indicator-explorer.types";

let cachedCatalog: IndicatorExplorerCatalog | null = null;

export function getIndicatorExplorerCatalog(): IndicatorExplorerCatalog {
  if (!cachedCatalog) {
    cachedCatalog = buildIndicatorExplorerCatalog();
  }
  return cachedCatalog;
}

export function rebuildIndicatorExplorerCatalog(): IndicatorExplorerCatalog {
  cachedCatalog = buildIndicatorExplorerCatalog();
  return cachedCatalog;
}

export function getIndicatorExplorerRecord(
  indicatorId: string,
): IndicatorExplorerRecord | null {
  return buildIndicatorExplorerRecord(indicatorId);
}

export function listIndicatorsByDomain(
  domainId: string,
): readonly IndicatorExplorerRecord[] {
  return getIndicatorExplorerCatalog().byDomain[domainId] ?? [];
}

export function getDecisionIntelligenceIndicatorRecords(): IndicatorExplorerRecord[] {
  return listDecisionIntelligenceIndicatorIds()
    .map((id) => buildIndicatorExplorerRecord(id))
    .filter((record): record is IndicatorExplorerRecord => record !== null);
}

export function coverageStatusLabel(status: IndicatorExplorerCoverageStatus): string {
  switch (status) {
    case "connected":
      return "Connected";
    case "planned":
      return "Planned";
    case "partial":
      return "Partial";
    case "not_available":
      return "Not available";
  }
}

export function coverageStatusClass(status: IndicatorExplorerCoverageStatus): string {
  switch (status) {
    case "connected":
      return "text-cyan-400 bg-cyan-500/10 border-cyan-500/20";
    case "planned":
      return "text-violet-400 bg-violet-500/10 border-violet-500/20";
    case "partial":
      return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    case "not_available":
      return "text-zinc-400 bg-zinc-800/50 border-zinc-700/50";
  }
}
