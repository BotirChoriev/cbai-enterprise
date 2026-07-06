import type { EvidenceCollection } from "@/lib/intelligence/evidence.types";
import type { IntelligenceRequest } from "@/lib/intelligence/request.types";
import {
  buildContradictionSummary,
  runContradictionRules,
} from "@/lib/intelligence/contradictions/rules";
import type {
  ContradictionDetectionResult,
  ContradictionSummary,
} from "@/lib/intelligence/contradictions/types";

/** Semantic version of the default contradiction detector. */
export const CONTRADICTION_DETECTOR_VERSION = "0.1.0-contradiction-detection";

/** Stable identifier for audit metadata. */
export const DEFAULT_CONTRADICTION_DETECTOR_ID = "default-contradiction-detector";

/**
 * Contract for the CBAI Contradiction Detection Layer (BUILD-037).
 *
 * Analyzes collected evidence for objective conflicts only.
 * No AI models, semantic reasoning, or fabricated contradictions.
 */
export interface ContradictionDetector {
  /**
   * Detect contradictions in a collected evidence set.
   *
   * @param request - Intelligence request envelope (context only)
   * @param evidence - Evidence collection after quality assessment
   * @returns Detection result with summary and updated contradiction state
   */
  detect(
    request: IntelligenceRequest,
    evidence: EvidenceCollection,
  ): Promise<ContradictionDetectionResult>;
}

/**
 * Resolve contradiction state from detection summary.
 */
export function resolveContradictionState(
  summary: ContradictionSummary,
): EvidenceCollection["contradictionState"] {
  if (summary.totalContradictions === 0) {
    return "none";
  }

  return "detected";
}

/**
 * Merge contradiction detection output into an evidence collection.
 */
export function applyContradictionDetectionToEvidence(
  evidence: EvidenceCollection,
  result: ContradictionDetectionResult,
): EvidenceCollection {
  return {
    ...evidence,
    contradictionState: result.contradictionState,
    contradictions: result.contradictions,
    contradictionSummary: result.summary,
    contradictionDetection: result.metadata,
  };
}

/**
 * Default contradiction detector for the CBAI Intelligence Engine (BUILD-037).
 */
export class DefaultContradictionDetector implements ContradictionDetector {
  /**
   * Run deterministic rules over evidence items.
   *
   * Empty evidence yields zero contradictions and state `none`.
   */
  async detect(
    request: IntelligenceRequest,
    evidence: EvidenceCollection,
  ): Promise<ContradictionDetectionResult> {
    void request;

    const detectedAt = new Date().toISOString();
    const contradictions =
      evidence.items.length === 0
        ? []
        : runContradictionRules(evidence.items);
    const summary = buildContradictionSummary(contradictions);

    return {
      contradictions,
      summary,
      contradictionState: resolveContradictionState(summary),
      metadata: {
        detectorId: DEFAULT_CONTRADICTION_DETECTOR_ID,
        detectorVersion: CONTRADICTION_DETECTOR_VERSION,
        detectedAt,
      },
    };
  }
}

/** Shared default contradiction detector singleton. */
export const defaultContradictionDetector = new DefaultContradictionDetector();
