import type { EntityType } from "@/lib/entity/entity.types";

/**
 * Evidence source class per CBAI Intelligence Specification §3.3.
 * Declares the origin category of a supporting datum.
 */
export type EvidenceSourceClass =
  | "entity-profile"
  | "search"
  | "knowledge-graph"
  | "document"
  | "agent-output"
  | "human-input"
  | "external-feed";

/**
 * Provenance strength of an evidence source per Intelligence Specification §3.4.
 */
export type ProvenanceStrength = "verified" | "inferred" | "unverified";

/**
 * Freshness indicator for an evidence item per Intelligence Specification §3.4.
 */
export type EvidenceStaleness = "fresh" | "aging" | "stale";

/**
 * Contradiction state for an evidence set per Intelligence Specification §7.4.
 */
export type ContradictionState =
  | "none"
  | "detected"
  | "resolved-auto"
  | "resolved-human"
  | "deferred"
  | "unresolvable";

/**
 * Claim type that determines evidence sufficiency thresholds
 * per Intelligence Specification §3.6.
 */
export type EvidenceClaimType =
  | "descriptive"
  | "relational"
  | "comparative"
  | "strategic"
  | "high-stakes";

/**
 * Sufficiency status of an {@link EvidenceCollection}
 * relative to claim-type minimums.
 */
export type EvidenceSufficiencyStatus =
  | "insufficient"
  | "minimum"
  | "partial"
  | "adequate"
  | "strong";

/**
 * Declared provenance for a single evidence item.
 *
 * Binds an excerpt to its origin class, optional reference identifier,
 * and provenance metadata required for trust tier derivation.
 *
 * @see docs/CBAI-Intelligence-Specification-v1.md §3.2–§3.3
 */
export interface EvidenceSource {
  /** Origin category of the supporting datum. */
  class: EvidenceSourceClass;
  /** Optional document ID, URL, ingestion record, or agent run ID. */
  ref?: string;
  /** Human-readable source label (e.g. collection name, feed name). */
  label?: string;
  /** Trustworthiness of the origin chain. */
  provenanceStrength?: ProvenanceStrength;
  /** ISO-8601 timestamp when the evidence was collected. */
  retrievedAt?: string;
}

/**
 * Atomic unit of justification in CBAI.
 *
 * Every intelligence claim must decompose to one or more evidence items.
 * Evidence without provenance is anecdote, not evidence.
 *
 * Uses entity references rather than full Entity objects to keep the
 * intelligence layer decoupled from adapter payloads.
 *
 * @see docs/CBAI-Intelligence-Specification-v1.md §3.1–§3.2
 * @see docs/build-034-report.md
 */
export interface Evidence {
  /** Unique identifier for this evidence item within a reasoning run. */
  id: string;
  /** Domain-scoped entity identifier the evidence supports. */
  entityId: string;
  /** Ontology class of the referenced entity. */
  entityType: EntityType;
  /** Canonical display name of the referenced entity at collection time. */
  entityName: string;
  /** Declared provenance and source metadata. */
  source: EvidenceSource;
  /** Strength of support for the active claim, 0–100 inclusive. */
  relevance: number;
  /** Quoted or summarized supporting text shown in explainability surfaces. */
  excerpt: string;
  /** Graph edge label when source class is relational (`knowledge-graph`). */
  relationshipLabel?: string;
  /** Freshness indicator relative to the intelligence validity horizon. */
  staleness?: EvidenceStaleness;
  /** Per-item quality assessment — attached after collection (BUILD-034). */
  quality?: import("@/lib/intelligence/evidence/quality/quality.types").EvidenceQualityAssessment;
  /** Optional explicit conflict metadata declared by source adapters (BUILD-037). */
  conflict?: EvidenceConflictMetadata;
}

/**
 * Explicit conflict metadata on an evidence item (BUILD-037).
 *
 * Adapters may declare objective conflicts without semantic inference.
 */
export interface EvidenceConflictMetadata {
  /** When true, this item explicitly declares a conflict. */
  flagged?: boolean;
  /** Property or facet the conflict concerns. */
  property?: string;
  /** Evidence item IDs this item conflicts with. */
  relatedEvidenceIds?: string[];
}

/**
 * Aggregated, ordered evidence set produced during the Reason stage.
 *
 * Carries sufficiency evaluation and contradiction state so downstream
 * confidence and trust assessments can apply specification caps.
 *
 * @see docs/CBAI-Intelligence-Specification-v1.md §3.5–§3.6, §7
 */
export interface EvidenceCollection {
  /** Evidence items ordered by relevance, provenance, and recency. */
  items: Evidence[];
  /** Claim type used to evaluate minimum evidence thresholds. */
  claimType: EvidenceClaimType;
  /** Whether the collection meets specification minimums for the claim type. */
  sufficiencyStatus: EvidenceSufficiencyStatus;
  /** Detected or resolved contradiction state across the collection. */
  contradictionState: ContradictionState;
  /** Mean relevance score across all items, 0–100. */
  meanRelevance: number;
  /** Count of distinct {@link EvidenceSourceClass} values present. */
  sourceClassCount: number;
  /** Optional collector metadata describing provenance of the collection itself. */
  metadata?: EvidenceCollectionMetadata;
  /** Collection-level quality summary (BUILD-034). */
  quality?: import("@/lib/intelligence/evidence/quality/quality.types").EvidenceCollectionQualitySummary;
  /** Detected contradictions from BUILD-037 — attached after detection stage. */
  contradictions?: import("@/lib/intelligence/contradictions/types").EvidenceContradiction[];
  /** Aggregated contradiction counts (BUILD-037). */
  contradictionSummary?: import("@/lib/intelligence/contradictions/types").ContradictionSummary;
  /** Contradiction detection run metadata (BUILD-037). */
  contradictionDetection?: import("@/lib/intelligence/contradictions/types").ContradictionDetectionMetadata;
}

/**
 * Status of an evidence collection run from the Evidence Layer.
 */
export type EvidenceCollectionStatus =
  | "no-sources-connected"
  | "collected"
  | "partial"
  | "failed";

/**
 * Metadata describing how an {@link EvidenceCollection} was produced.
 *
 * Distinguishes an intentionally empty collection (no sources connected)
 * from a future collection with real evidence items.
 */
export interface EvidenceCollectionMetadata {
  /** Stable collector identifier. */
  collectorId: string;
  /** Collector semantic version. */
  collectorVersion: string;
  /** Overall collection run status. */
  status: EvidenceCollectionStatus;
  /** Human-readable explanation of the collection outcome. */
  message: string;
  /** All source adapter IDs registered at collection time. */
  registeredSourceIds: readonly string[];
  /** Source adapter IDs attempted during this collection run. */
  attemptedSourceIds: readonly string[];
  /** ISO-8601 timestamp when collection completed. */
  collectedAt: string;
  /** Non-fatal warnings from source adapters during collection (BUILD-030). */
  warnings?: string[];
}
