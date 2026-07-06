/**
 * CBAI Evidence Watch Foundation — core type system.
 * Official evidence change transparency — not prediction, alerts, or notifications.
 */

import type { EntityId } from "@/lib/registry";

export const WATCH_RECORD_VERSION = "1.0.0" as const;

/** Branded watch record identifier — format `watch-{changeType}-{sourceOrConnectorId}`. */
export type EvidenceWatchId = string & { readonly __brand: "EvidenceWatchId" };

export type EvidenceWatchChangeType =
  | "new_source_connected"
  | "new_dataset_available"
  | "dataset_updated"
  | "methodology_updated"
  | "connector_verified"
  | "connector_deprecated"
  | "verification_status_changed";

export type EvidenceWatchMethodologyReference = {
  standardReference: string;
  description: string;
  registryVersion: string;
};

/** Canonical evidence watch record — describes official evidence posture change. */
export type EvidenceWatchRecord = {
  watchId: EvidenceWatchId;
  sourceId: string;
  connectorId: string | null;
  entityIds: readonly EntityId[];
  indicatorIds: readonly string[];
  changeType: EvidenceWatchChangeType;
  changeTimestamp: string;
  affectedReports: readonly string[];
  affectedMissions: readonly string[];
  affectedWorkspaces: readonly string[];
  methodologyReference: EvidenceWatchMethodologyReference;
  limitations: readonly string[];
  humanReviewRequired: true;
  version: typeof WATCH_RECORD_VERSION;
};

export type EvidenceWatchCatalog = {
  version: string;
  watchRecordVersion: typeof WATCH_RECORD_VERSION;
  registrySnapshotAt: string;
  watchCount: number;
  records: readonly EvidenceWatchRecord[];
  byChangeType: Readonly<Record<EvidenceWatchChangeType, readonly EvidenceWatchRecord[]>>;
};

export type EvidenceWatchSummarySectionId =
  | "change-description"
  | "affected-entities"
  | "affected-indicators"
  | "affected-reports"
  | "affected-missions"
  | "methodology"
  | "limitations"
  | "human-review";

export type EvidenceWatchSummarySection = {
  id: EvidenceWatchSummarySectionId;
  heading: string;
  content: readonly string[];
};

export type EvidenceWatchSummary = {
  watchId: EvidenceWatchId;
  changeType: EvidenceWatchChangeType;
  changeTypeLabel: string;
  changeTimestamp: string;
  sections: readonly EvidenceWatchSummarySection[];
  limitations: readonly string[];
  humanReviewRequired: true;
  version: typeof WATCH_RECORD_VERSION;
};

export type EvidenceWatchValidationIssueCode =
  | "unknown_source"
  | "unknown_connector"
  | "prohibited_language"
  | "invalid_watch_id"
  | "human_review_not_required"
  | "fabricated_timestamp";

export type EvidenceWatchValidationIssue = {
  code: EvidenceWatchValidationIssueCode;
  severity: "error" | "warning";
  message: string;
  watchId?: EvidenceWatchId;
  reference?: string;
};

export type EvidenceWatchValidationReport = {
  valid: boolean;
  issueCount: number;
  errors: readonly EvidenceWatchValidationIssue[];
  warnings: readonly EvidenceWatchValidationIssue[];
};

export const EVIDENCE_WATCH_CHANGE_TYPES: readonly EvidenceWatchChangeType[] = [
  "new_source_connected",
  "new_dataset_available",
  "dataset_updated",
  "methodology_updated",
  "connector_verified",
  "connector_deprecated",
  "verification_status_changed",
] as const;
