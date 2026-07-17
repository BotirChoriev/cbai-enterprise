/** BUILD-028 — Canonical knowledge connector contracts. */

export type KnowledgeProviderId =
  | "crossref"
  | "openalex"
  | "arxiv"
  | "pubmed"
  | "catalog";

export type ConnectorConnectionState =
  | "not_implemented"
  | "not_configured"
  | "configured"
  | "available"
  | "degraded"
  | "rate_limited"
  | "unavailable"
  | "authentication_failed"
  | "disabled";

export type ConnectorCapability =
  | "metadata_search"
  | "metadata_retrieve"
  | "abstract_retrieve"
  | "full_text"
  | "citation_export";

export type KnowledgeTrustState =
  | "unknown"
  | "unverified"
  | "source_available"
  | "retrieved"
  | "needs_review"
  | "partially_supported"
  | "supported"
  | "contradicted"
  | "outdated"
  | "superseded"
  | "rejected"
  | "archived"
  | "unavailable"
  | "error";

export type ExternalIdentifier = {
  readonly scheme: string;
  readonly value: string;
};

export type ProvenanceRecord = {
  readonly provider: KnowledgeProviderId;
  readonly providerRecordId: string | null;
  readonly originalSourceName: string;
  readonly originalSourceUrl: string | null;
  readonly retrievedAt: string;
  readonly providerUpdatedAt: string | null;
  readonly retrievalMethod: "api" | "official_feed" | "user_upload" | "manual_entry" | "internal_record";
  readonly license: string | null;
  readonly attributionRequired: boolean;
  readonly dataCompleteness: "complete" | "partial" | "unknown";
  readonly provenanceLimitations: readonly string[];
};

export type CanonicalKnowledgeSource = {
  readonly id: string;
  readonly canonicalId: string | null;
  readonly provider: KnowledgeProviderId;
  readonly sourceType: string;
  readonly title: string;
  readonly subtitle: string | null;
  readonly authors: readonly string[];
  readonly publicationDate: string | null;
  readonly retrievedAt: string;
  readonly landingPageUrl: string | null;
  readonly openAccessUrl: string | null;
  readonly identifiers: readonly ExternalIdentifier[];
  readonly provenance: ProvenanceRecord;
  readonly trustState: KnowledgeTrustState;
  readonly abstract: string | null;
  readonly limitations: readonly string[];
  readonly connectionState: ConnectorConnectionState;
};

export type KnowledgeSearchQuery = {
  readonly query: string;
  readonly limit?: number;
  readonly offset?: number;
};

export type ConnectorSearchResult = {
  readonly provider: KnowledgeProviderId;
  readonly retrievedAt: string;
  readonly query: string;
  readonly totalResults: number | null;
  readonly records: readonly CanonicalKnowledgeSource[];
  readonly limitations: readonly string[];
  readonly connectionState: ConnectorConnectionState;
  readonly errorCategory?: string;
};

export type ConnectorRegistration = {
  readonly provider: KnowledgeProviderId;
  readonly enabled: boolean;
  readonly configured: boolean;
  readonly capabilities: readonly ConnectorCapability[];
  readonly connectionState: ConnectorConnectionState;
  readonly termsUrl: string | null;
  readonly licenseNotes: string | null;
};

export type Result<T, E extends string = string> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E; readonly detail?: string };

export interface KnowledgeConnector {
  readonly provider: KnowledgeProviderId;
  readonly capabilities: readonly ConnectorCapability[];
  search(query: KnowledgeSearchQuery): Promise<Result<ConnectorSearchResult>>;
}
