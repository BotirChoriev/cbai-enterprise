/**
 * BUILD-032 — Universal knowledge trust derivation.
 * Categorical states only — no numeric confidence scores.
 */

import type { CanonicalKnowledgeSource, KnowledgeTrustState } from "@/lib/knowledge-connectors/types";
import type { KnowledgeExplanation } from "@/lib/intelligence-os/knowledge-brain.types";

export type TrustReason = {
  readonly code: string;
  readonly message: string;
};

export type HumanReviewRequirement = "none" | "recommended" | "required";

export type TrustDerivation = {
  readonly state: KnowledgeTrustState;
  readonly reasons: readonly TrustReason[];
  readonly limitations: readonly string[];
  readonly requiredReview: HumanReviewRequirement;
  readonly nextActionLabel: string | null;
};

export function deriveKnowledgeTrustStateFromSource(
  source: CanonicalKnowledgeSource,
): TrustDerivation {
  const reasons: TrustReason[] = [
    { code: "retrieved", message: `Retrieved from ${source.provenance.originalSourceName}.` },
  ];
  const limitations = [...source.limitations, ...source.provenance.provenanceLimitations];
  let requiredReview: HumanReviewRequirement = "required";
  let state: KnowledgeTrustState = source.trustState;

  if (source.connectionState === "unavailable" || source.connectionState === "not_implemented") {
    state = "unavailable";
    reasons.push({ code: "connection", message: "Provider connection unavailable." });
  }

  if (!source.canonicalId) {
    state = "needs_review";
    reasons.push({ code: "identifier", message: "No strong canonical identifier." });
  }

  return {
    state,
    reasons,
    limitations,
    requiredReview,
    nextActionLabel: requiredReview === "required" ? "Review before linking to mission" : null,
  };
}

export function deriveKnowledgeTrustStateFromExplanation(
  explanation: KnowledgeExplanation,
): TrustDerivation {
  const reasons: TrustReason[] = [];
  let state: KnowledgeTrustState = "unknown";

  if (explanation.primary.conflict.length > 0) {
    state = "contradicted";
    reasons.push({ code: "conflict", message: "Conflicting evidence detected." });
  } else if (explanation.primary.known.length > 0) {
    state = "partially_supported";
    reasons.push({ code: "known", message: "Some linked references exist." });
  } else if (explanation.primary.unknown.length > 0) {
    state = "unknown";
    reasons.push({ code: "gaps", message: "Missing knowledge documented." });
  }

  if (explanation.humanReviewRequired) {
    state = state === "contradicted" ? "contradicted" : "needs_review";
  }

  const limitations = explanation.limitations ? [explanation.limitations] : [];

  return {
    state,
    reasons,
    limitations,
    requiredReview: explanation.humanReviewRequired ? "required" : "recommended",
    nextActionLabel: explanation.suggestedAction?.label ?? null,
  };
}
