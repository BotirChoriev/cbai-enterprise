import type { ContradictionState } from "@/lib/intelligence/evidence.types";

/** Severity tier for a detected evidence contradiction. */
export type ContradictionSeverity = "critical" | "major" | "minor";

/**
 * A single objectively detected contradiction between two evidence items.
 */
export interface EvidenceContradiction {
  /** Stable deterministic identifier for audit traces. */
  id: string;
  /** Domain-scoped entity identifier shared by conflicting evidence. */
  entityId: string;
  /** Property or facet under conflict. */
  property: string;
  /** First evidence item in the conflict pair (lexicographically sorted). */
  leftEvidenceId: string;
  /** Second evidence item in the conflict pair. */
  rightEvidenceId: string;
  /** Severity classification from deterministic rules. */
  severity: ContradictionSeverity;
  /** Human-readable description of the objective conflict. */
  description: string;
  /** Rule identifier that produced this contradiction. */
  ruleId: string;
}

/**
 * Aggregated contradiction counts for governance and downstream caps.
 */
export interface ContradictionSummary {
  /** Total contradictions detected. */
  totalContradictions: number;
  /** Count of critical-severity contradictions. */
  critical: number;
  /** Count of major-severity contradictions. */
  major: number;
  /** Count of minor-severity contradictions. */
  minor: number;
  /** Whether any contradiction blocks automated reliance. */
  hasBlockingConflict: boolean;
}

/**
 * Metadata describing how contradiction detection was performed.
 */
export interface ContradictionDetectionMetadata {
  /** Stable detector identifier. */
  detectorId: string;
  /** Detector semantic version. */
  detectorVersion: string;
  /** ISO-8601 timestamp when detection completed. */
  detectedAt: string;
}

/**
 * Full output of the Contradiction Detection Layer (BUILD-037).
 */
export interface ContradictionDetectionResult {
  /** Detected contradictions ordered deterministically by id. */
  contradictions: EvidenceContradiction[];
  /** Aggregated summary counts. */
  summary: ContradictionSummary;
  /** Resolved contradiction state for downstream confidence and trust. */
  contradictionState: ContradictionState;
  /** Detection run metadata. */
  metadata: ContradictionDetectionMetadata;
}
