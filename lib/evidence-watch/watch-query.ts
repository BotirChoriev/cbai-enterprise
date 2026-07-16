import {
  buildEvidenceWatchCatalog,
  buildEvidenceWatchRecord,
  buildEvidenceWatchRecordsForEntity,
  buildEvidenceWatchRecordsForSource,
} from "@/lib/evidence-watch/watch-builder";
import type {
  EvidenceWatchCatalog,
  EvidenceWatchChangeType,
  EvidenceWatchRecord,
} from "@/lib/evidence-watch/watch-types";
import type { EntityId } from "@/lib/registry";

let cachedCatalog: EvidenceWatchCatalog | null = null;

export function getEvidenceWatchCatalog(): EvidenceWatchCatalog {
  if (!cachedCatalog) {
    cachedCatalog = buildEvidenceWatchCatalog();
  }
  return cachedCatalog;
}

export function rebuildEvidenceWatchCatalog(): EvidenceWatchCatalog {
  cachedCatalog = buildEvidenceWatchCatalog();
  return cachedCatalog;
}

export function getEvidenceWatchRecord(watchId: string): EvidenceWatchRecord | null {
  return buildEvidenceWatchRecord(watchId);
}

export function getEvidenceWatchRecordsForEntity(
  entityId: EntityId,
): EvidenceWatchRecord[] {
  return buildEvidenceWatchRecordsForEntity(entityId);
}

export function getEvidenceWatchRecordsForSource(sourceId: string): EvidenceWatchRecord[] {
  return buildEvidenceWatchRecordsForSource(sourceId);
}

export function listEvidenceWatchByChangeType(
  changeType: EvidenceWatchChangeType,
): readonly EvidenceWatchRecord[] {
  return getEvidenceWatchCatalog().byChangeType[changeType];
}

export function changeTypeLabel(changeType: EvidenceWatchChangeType): string {
  switch (changeType) {
    case "new_source_connected":
      return "New source connected";
    case "new_dataset_available":
      return "New dataset available";
    case "dataset_updated":
      return "Dataset updated";
    case "methodology_updated":
      return "Methodology updated";
    case "connector_verified":
      return "Connector verified";
    case "connector_deprecated":
      return "Connector deprecated";
    case "verification_status_changed":
      return "Verification status changed";
  }
}

export function changeTypeClass(changeType: EvidenceWatchChangeType): string {
  switch (changeType) {
    case "new_source_connected":
    case "connector_verified":
    case "new_dataset_available":
      return "text-teal-400 bg-teal-500/10 border-teal-500/20";
    case "verification_status_changed":
    case "dataset_updated":
    case "methodology_updated":
      return "text-violet-400 bg-violet-500/10 border-violet-500/20";
    case "connector_deprecated":
      return "text-zinc-400 bg-zinc-800/50 border-zinc-700/50";
  }
}
