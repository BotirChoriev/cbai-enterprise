/**
 * Official Connector Foundation — Phase 1.
 * Architecture only: no live external source connections, no invented evidence,
 * no connector marked live.
 */

export const OFFICIAL_CONNECTOR_FOUNDATION_VERSION = "1.0.0-phase1" as const;

/** Connection lifecycle — Phase 1 keeps every official source non-live. */
export type FoundationConnectionStatus =
  | "planned"
  | "missing"
  | "ready"
  | "connected"
  | "live"
  | "deprecated"
  | "disabled";

export type FoundationSourceType =
  | "international_org"
  | "national_statistics"
  | "regulator"
  | "platform_registry"
  | "other";

export type VerificationState =
  | "unverified"
  | "validated"
  | "rejected"
  | "awaiting_source";

export type FreshnessState =
  | "not_checked"
  | "fresh"
  | "stale"
  | "unknown";

export type ConnectorHealthState =
  | "unknown"
  | "healthy"
  | "degraded"
  | "unavailable"
  | "planned";

export type FailureClass =
  | "timeout"
  | "rate_limit"
  | "http_error"
  | "malformed_response"
  | "validation_failed"
  | "unsupported_jurisdiction"
  | "missing_source"
  | "network_error"
  | "duplicate_rejected";

/**
 * Required provenance on every future observation.
 * Phase 1 defines the contract; values are never invented here.
 */
export type ProvenanceMetadata = {
  readonly sourceName: string;
  readonly sourceType: FoundationSourceType;
  readonly officialSourceUrl: string;
  readonly datasetOrEndpoint: string;
  readonly indicatorName: string;
  readonly jurisdiction: string;
  readonly referencePeriod: string;
  readonly retrievedAt: string;
  readonly lastCheckedAt: string;
  readonly publicationDate: string | null;
  readonly unit: string;
  readonly transformationNotes: string;
  readonly verificationState: VerificationState;
  readonly freshnessState: FreshnessState;
  readonly connectorHealth: ConnectorHealthState;
};

export type OfficialSourceRecord = {
  readonly id: string;
  readonly slug: string;
  readonly sourceName: string;
  readonly sourceType: FoundationSourceType;
  readonly officialSourceUrl: string;
  readonly organization: string;
  readonly jurisdictionScope: string;
  readonly updateFrequency: string;
  readonly license: string;
  readonly connectionStatus: FoundationConnectionStatus;
  readonly defaultHealth: ConnectorHealthState;
};

export type ConnectorContract = {
  readonly connectorId: string;
  readonly sourceSlug: string;
  readonly title: string;
  readonly description: string;
  readonly version: string;
  readonly supportedEntities: readonly ("country" | "company" | "university")[];
  readonly supportedIndicatorCodes: readonly string[];
  /** True only after verified live retrieval for that connector. */
  readonly liveEnabled: boolean;
  readonly health: {
    readonly state: ConnectorHealthState;
    readonly lastCheckedAt: string | null;
    readonly message: string;
  };
};

export type NormalizedObservationDraft = {
  readonly indicatorCode: string;
  readonly indicatorName: string;
  readonly value: number | string;
  readonly unit: string;
  readonly referencePeriod: string;
  readonly entityType: "country" | "company" | "university";
  readonly entityId: string;
  readonly entityLabel: string;
  readonly provenance: ProvenanceMetadata;
};

export type ValidatedObservation = NormalizedObservationDraft & {
  readonly id: string;
  readonly verificationState: "validated";
};

export type AuditAction =
  | "fetch"
  | "validate"
  | "normalize"
  | "publish"
  | "reject"
  | "cache_hit"
  | "cache_miss"
  | "missing_source";

export type AuditLogEntry = {
  readonly at: string;
  readonly connectorId: string;
  readonly action: AuditAction;
  readonly detail: string;
  readonly failureClass?: FailureClass;
};

export type MissingSourceFallback = {
  readonly status: "Missing" | "Planned" | "Awaiting official source" | "Not checked";
  readonly reason: string;
  readonly expectedSource: string;
  readonly nextStep: string;
};
