import { getIndicatorById } from "@/lib/indicator-framework";
import type { IndicatorDefinition } from "@/lib/indicator-framework";
import { OFFICIAL_EVIDENCE_SOURCES } from "@/lib/evidence-infrastructure/sources/catalog";
import type { EvidenceSourceRecord } from "@/lib/evidence-infrastructure/types";
import type {
  EvidenceCoverageReport,
  EvidenceCoverageSlot,
  EvidenceSlotStatus,
  SourceCoverageEntry,
} from "@/lib/decision-intelligence/decision-types";

const SOURCE_BY_ID = new Map(
  OFFICIAL_EVIDENCE_SOURCES.map((source) => [source.id, source]),
);

function resolveSourceIdsForIndicator(indicator: IndicatorDefinition): string[] {
  const slugs = new Set([
    ...indicator.requiredEvidenceSources,
    ...indicator.optionalEvidenceSources,
  ]);

  return OFFICIAL_EVIDENCE_SOURCES.filter((source) =>
    source.supportedIndicators.some((supportedSlug) => slugs.has(supportedSlug)),
  ).map((source) => source.id);
}

function evidenceIdForIndicator(indicator: IndicatorDefinition): string {
  return `evidence-${indicator.slug}`;
}

function slotStatusForIndicator(indicator: IndicatorDefinition): EvidenceSlotStatus {
  if (indicator.status === "connected") return "available";
  if (indicator.status === "planned") return "planned";
  return "missing";
}

function buildSlot(indicator: IndicatorDefinition): EvidenceCoverageSlot {
  const sourceIds = resolveSourceIdsForIndicator(indicator);
  const connectedSourceIds = sourceIds.filter((id) => {
    const source = SOURCE_BY_ID.get(id);
    return source?.connectionStatus === "connected";
  });
  const missingSourceIds = sourceIds.filter((id) => !connectedSourceIds.includes(id));

  return {
    evidenceId: evidenceIdForIndicator(indicator),
    indicatorId: indicator.id,
    indicatorTitle: indicator.title,
    status: slotStatusForIndicator(indicator),
    sourceIds,
    connectedSourceIds,
    missingSourceIds,
  };
}

function toSourceEntry(source: EvidenceSourceRecord): SourceCoverageEntry {
  return {
    sourceId: source.id,
    sourceName: source.name,
    connectionStatus: source.connectionStatus,
    verificationStatus: source.verificationStatus,
    officialWebsite: source.officialWebsite,
  };
}

/** Build factual evidence coverage from indicator IDs — no scores or conclusions. */
export function buildEvidenceCoverage(indicatorIds: readonly string[]): EvidenceCoverageReport {
  const uniqueIds = [...new Set(indicatorIds)];
  const slots: EvidenceCoverageSlot[] = [];

  for (const indicatorId of uniqueIds) {
    const indicator = getIndicatorById(indicatorId);
    if (!indicator) continue;
    slots.push(buildSlot(indicator));
  }

  const available = slots.filter((slot) => slot.status === "available");
  const missing = slots.filter((slot) => slot.status === "missing");
  const planned = slots.filter((slot) => slot.status === "planned");
  const totalRequired = slots.length;

  const sourceIdSet = new Set<string>();
  for (const slot of slots) {
    for (const sourceId of slot.sourceIds) {
      sourceIdSet.add(sourceId);
    }
  }

  const officialSources = [...sourceIdSet]
    .map((id) => SOURCE_BY_ID.get(id))
    .filter((source): source is EvidenceSourceRecord => source !== undefined)
    .map(toSourceEntry)
    .sort((a, b) => a.sourceName.localeCompare(b.sourceName));

  const coverageRatio =
    totalRequired === 0 ? 0 : available.length / totalRequired;

  return {
    totalRequired,
    availableCount: available.length,
    missingCount: missing.length,
    plannedCount: planned.length,
    coverageRatio,
    available,
    missing,
    planned,
    officialSources,
  };
}

/** Collect evidence anchor IDs from indicator IDs. */
export function collectEvidenceIds(indicatorIds: readonly string[]): string[] {
  return indicatorIds
    .map((id) => getIndicatorById(id))
    .filter((indicator): indicator is IndicatorDefinition => indicator !== undefined)
    .map((indicator) => evidenceIdForIndicator(indicator));
}

/** Collect unique source IDs referenced by indicators. */
export function collectSourceIds(indicatorIds: readonly string[]): string[] {
  const sourceIds = new Set<string>();

  for (const indicatorId of indicatorIds) {
    const indicator = getIndicatorById(indicatorId);
    if (!indicator) continue;
    for (const sourceId of resolveSourceIdsForIndicator(indicator)) {
      sourceIds.add(sourceId);
    }
  }

  return [...sourceIds].sort();
}
