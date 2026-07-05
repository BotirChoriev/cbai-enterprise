/**
 * Organizational trust tier per CBAI Intelligence Specification §5.2.
 *
 * Trust governs whether intelligence may drive automated action,
 * agent dispatch, or executive decisions — distinct from confidence.
 */
export type TrustTier =
  | "unverified"
  | "exploratory"
  | "operational"
  | "authoritative"
  | "human-authored";

/**
 * Producer identity for an intelligence product per Domain Model §6
 * and Intelligence Specification §5.4.
 */
export type IntelligenceProducerType =
  | "reasoning-engine"
  | "agent"
  | "human"
  | "ingestion-pipeline";

/**
 * Source trust classification for document and feed origins
 * per Intelligence Specification §5.5.
 */
export type SourceTrustLevel =
  | "verified"
  | "curated"
  | "aggregated"
  | "unverified";

/**
 * Identifies who or what produced an intelligence artifact.
 */
export interface IntelligenceProducer {
  /** Producer category. */
  type: IntelligenceProducerType;
  /** Stable producer identifier (agent ID, engine version slug, user ID). */
  id: string;
  /** Display name (e.g. "Research Agent", "Reasoning Engine"). */
  name: string;
  /** Optional model identifier when a model backend is involved (Phase 2+). */
  modelId?: string;
  /** Optional model or engine version string for audit traces. */
  version?: string;
}

/**
 * Organizational willingness to rely on an intelligence product.
 *
 * Derived from producer trust, source provenance, confidence band,
 * audit history, and human verification status.
 *
 * @see docs/CBAI-Intelligence-Specification-v1.md §5
 */
export interface TrustAssessment {
  /** Derived organizational trust tier. */
  tier: TrustTier;
  /** Identity of the intelligence producer. */
  producer: IntelligenceProducer;
  /** Highest source trust level among cited document/feed evidence. */
  sourceTrustLevel?: SourceTrustLevel;
  /** Trust caps applied (e.g. open contradiction, stale intelligence). */
  capsApplied: string[];
  /** Whether human verification elevated or authored this intelligence. */
  humanVerified: boolean;
}
