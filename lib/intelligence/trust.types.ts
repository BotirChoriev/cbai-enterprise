/**
 * Organizational trust level for the Trust Assessment Layer (BUILD-025).
 *
 * Trust governs whether an organization may rely on an intelligence result
 * for recommendations, automation, or execution — distinct from confidence.
 */
export type TrustLevel =
  | "unverified"
  | "low"
  | "moderate"
  | "high"
  | "verified";

/**
 * Legacy trust tier used by agent trace records and memory entries.
 *
 * Separate from {@link TrustLevel} — agent contributions retain the
 * specification §5.2 tier taxonomy until unified in a future build.
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
 * Answers: "Should the organization rely on this result?" — not
 * "How certain is the reasoning?" (see {@link ConfidenceAssessment}).
 *
 * @see docs/CBAI-Intelligence-Specification-v1.md §5
 * @see docs/build-036-report.md
 */
export interface TrustAssessment {
  /** Derived organizational trust level. */
  trustLevel: TrustLevel;
  /** Evidence-grounded trust score, 0–100 inclusive — not copied from confidence. */
  trustScore: number;
  /** Whether automated agent dispatch is permitted. */
  allowAutomation: boolean;
  /** Whether the result may be shown as a recommendation. */
  allowRecommendation: boolean;
  /** Whether workflow or action execution is permitted. */
  allowExecution: boolean;
  /** Human-readable explanation of the trust decision. */
  reason: string;
  /** Identity of the trust assessor producer. */
  producer: IntelligenceProducer;
  /** Highest source trust level among cited document/feed evidence. */
  sourceTrustLevel?: SourceTrustLevel;
  /** Trust caps applied (e.g. no-evidence, contradiction-open). */
  capsApplied: string[];
  /** Whether human verification elevated or authored this intelligence. */
  humanVerified: boolean;
  /** Evidence quality gate outcome (BUILD-036). */
  qualityGate?: import("@/lib/intelligence/trust/quality-integration").TrustQualityGate;
  /** Governance permission gate outcome (BUILD-036). */
  governanceGate?: import("@/lib/intelligence/trust/governance-rules").TrustGovernanceGate;
  /** Trust-specific warnings from quality integration (BUILD-036). */
  trustWarnings?: string[];
}
