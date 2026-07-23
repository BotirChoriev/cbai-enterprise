/**
 * Official connector framework — types for verified observations only.
 * No invented values. Failed validation never publishes.
 */

export const OFFICIAL_CONNECTOR_FRAMEWORK_VERSION = "1.0.0" as const;

export type ConnectorFailureClass =
  | "timeout"
  | "rate_limit"
  | "http_error"
  | "malformed_response"
  | "validation_failed"
  | "unsupported_jurisdiction"
  | "stale_data"
  | "awaiting_credentials"
  | "network_error"
  | "not_implemented";

export type FreshnessStatus = "fresh" | "stale" | "unknown" | "not_checked";

export type ObservationVerificationState =
  | "verified"
  | "validation_failed"
  | "pending"
  | "rejected";

export type OfficialSourceSlug =
  | "world-bank"
  | "united-nations"
  | "oecd"
  | "us-census"
  | "us-bea"
  | "us-bls"
  | "us-sec"
  | "cbai-local-registry";

export type ProvenanceRecord = {
  readonly sourceSlug: OfficialSourceSlug;
  readonly sourceName: string;
  readonly sourceUrl: string;
  readonly publicationDate: string | null;
  readonly retrievedAt: string;
  readonly lastCheckedAt: string;
  readonly updateFrequency: string;
  readonly jurisdiction: string;
  readonly license: string;
  readonly connectorId: string;
  readonly connectorVersion: string;
};

export type VerifiedObservation = {
  readonly id: string;
  readonly indicatorCode: string;
  readonly indicatorName: string;
  readonly value: number | string;
  readonly unit: string;
  readonly referencePeriod: string;
  readonly entityType: "country" | "company";
  readonly entityId: string;
  readonly entityLabel: string;
  readonly officialSource: string;
  readonly provenance: ProvenanceRecord;
  readonly verificationState: ObservationVerificationState;
  readonly transformationNotes: string;
  readonly freshnessStatus: FreshnessStatus;
  readonly confidenceBasis: string;
  readonly cbaiIndicatorSlug: string | null;
};

export type ConnectorAttemptResult =
  | {
      readonly ok: true;
      readonly observations: readonly VerifiedObservation[];
      readonly checkedAt: string;
      readonly durationMs: number;
    }
  | {
      readonly ok: false;
      readonly failureClass: ConnectorFailureClass;
      readonly message: string;
      readonly checkedAt: string;
      readonly durationMs: number;
      readonly httpStatus?: number;
    };

export type ConnectorHealthSnapshot = {
  readonly connectorId: string;
  readonly sourceSlug: OfficialSourceSlug;
  readonly status: "healthy" | "degraded" | "unavailable" | "unknown" | "planned";
  readonly lastCheckedAt: string | null;
  readonly lastSuccessAt: string | null;
  readonly message: string;
  readonly liveCapable: boolean;
};

export type AuditLogEntry = {
  readonly at: string;
  readonly connectorId: string;
  readonly action: "fetch" | "validate" | "publish" | "reject" | "cache_hit" | "cache_miss";
  readonly detail: string;
  readonly failureClass?: ConnectorFailureClass;
};
