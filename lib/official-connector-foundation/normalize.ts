/**
 * Normalization + provenance construction.
 * Does not invent evidence values — only maps validated payloads.
 */

import type {
  ConnectorHealthState,
  FreshnessState,
  NormalizedObservationDraft,
  ProvenanceMetadata,
  VerificationState,
} from "@/lib/official-connector-foundation/types";
import type { OfficialSourceRecord } from "@/lib/official-connector-foundation/types";

export type NormalizeInput = {
  readonly source: OfficialSourceRecord;
  readonly indicatorCode: string;
  readonly indicatorName: string;
  readonly value: number | string;
  readonly unit: string;
  readonly referencePeriod: string;
  readonly entityType: "country" | "company" | "university";
  readonly entityId: string;
  readonly entityLabel: string;
  readonly datasetOrEndpoint: string;
  readonly jurisdiction: string;
  readonly retrievedAt: string;
  readonly lastCheckedAt: string;
  readonly publicationDate: string | null;
  readonly transformationNotes: string;
  readonly verificationState?: VerificationState;
  readonly freshnessState?: FreshnessState;
  readonly connectorHealth?: ConnectorHealthState;
};

export function buildProvenance(input: NormalizeInput): ProvenanceMetadata {
  return {
    sourceName: input.source.sourceName,
    sourceType: input.source.sourceType,
    officialSourceUrl: input.source.officialSourceUrl,
    datasetOrEndpoint: input.datasetOrEndpoint,
    indicatorName: input.indicatorName,
    jurisdiction: input.jurisdiction,
    referencePeriod: input.referencePeriod,
    retrievedAt: input.retrievedAt,
    lastCheckedAt: input.lastCheckedAt,
    publicationDate: input.publicationDate,
    unit: input.unit,
    transformationNotes: input.transformationNotes,
    verificationState: input.verificationState ?? "unverified",
    freshnessState: input.freshnessState ?? "not_checked",
    connectorHealth: input.connectorHealth ?? input.source.defaultHealth,
  };
}

export function normalizeValidatedObservation(input: NormalizeInput): NormalizedObservationDraft {
  return {
    indicatorCode: input.indicatorCode,
    indicatorName: input.indicatorName,
    value: input.value,
    unit: input.unit,
    referencePeriod: input.referencePeriod,
    entityType: input.entityType,
    entityId: input.entityId,
    entityLabel: input.entityLabel,
    provenance: buildProvenance(input),
  };
}

/** Derive freshness from lastCheckedAt vs max age. */
export function deriveFreshnessState(
  lastCheckedAt: string | null,
  maxAgeMs: number,
  nowMs = Date.now()
): FreshnessState {
  if (!lastCheckedAt) return "not_checked";
  const checked = Date.parse(lastCheckedAt);
  if (!Number.isFinite(checked)) return "unknown";
  const age = nowMs - checked;
  if (age < 0) return "unknown";
  return age <= maxAgeMs ? "fresh" : "stale";
}
