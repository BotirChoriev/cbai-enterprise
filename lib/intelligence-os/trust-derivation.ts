/**
 * BUILD-032 — Universal knowledge trust derivation.
 * Categorical states only — no numeric confidence scores.
 */

import type { CanonicalKnowledgeSource, KnowledgeTrustState } from "@/lib/knowledge-connectors/types";
import type { KnowledgeExplanation } from "@/lib/intelligence-os/knowledge-brain.types";
import type { SavedKnowledgeSource } from "@/lib/knowledge-ingestion/source-ingestion.types";

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
  const requiredReview: HumanReviewRequirement = "required";
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

export function deriveKnowledgeTrustStateFromSavedSource(
  source: SavedKnowledgeSource,
): TrustDerivation {
  const reasons: TrustReason[] = [
    {
      code: "provider",
      message: `Saved from ${source.provenance.originalSourceName}.`,
    },
    { code: "saved", message: `Saved ${source.savedAt.slice(0, 10)}.` },
  ];
  const limitations = source.limitations.map((l) => l.message);

  let state: KnowledgeTrustState = source.trustState;
  let requiredReview: HumanReviewRequirement = "required";
  let nextActionLabel: string | null = "Send for human review";

  switch (source.lifecycleState) {
    case "search_result":
    case "inspected":
      state = "retrieved";
      nextActionLabel = "Save source";
      break;
    case "saved_source":
      state = "source_available";
      nextActionLabel = "Link to mission";
      break;
    case "linked_to_mission":
      state = "needs_review";
      nextActionLabel = "Send for review";
      break;
    case "awaiting_review":
      state = "needs_review";
      nextActionLabel = "Begin review";
      break;
    case "reviewed_evidence":
      state = source.trustState;
      requiredReview = "none";
      nextActionLabel = "Open evidence context";
      break;
    case "rejected":
      state = "rejected";
      requiredReview = "none";
      nextActionLabel = null;
      break;
    case "superseded":
      state = "superseded";
      requiredReview = "none";
      nextActionLabel = null;
      break;
    case "archived":
      state = "archived";
      requiredReview = "none";
      nextActionLabel = null;
      break;
  }

  if (source.humanReviewState === "accepted" && source.lifecycleState === "linked_to_mission") {
    requiredReview = "none";
    nextActionLabel = null;
  }

  return { state, reasons, limitations, requiredReview, nextActionLabel };
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

export type UnifiedTrustInput =
  | { readonly kind: "canonical_source"; readonly source: CanonicalKnowledgeSource }
  | { readonly kind: "saved_source"; readonly source: SavedKnowledgeSource }
  | { readonly kind: "explanation"; readonly explanation: KnowledgeExplanation }
  | { readonly kind: "living_object"; readonly lifecycleState: string; readonly trustState: KnowledgeTrustState; readonly limitations?: readonly string[] };

/** BUILD-032 — Single entry point delegating to existing derivations. */
export function deriveKnowledgeTrustState(input: UnifiedTrustInput): TrustDerivation {
  switch (input.kind) {
    case "canonical_source":
      return deriveKnowledgeTrustStateFromSource(input.source);
    case "saved_source":
      return deriveKnowledgeTrustStateFromSavedSource(input.source);
    case "explanation":
      return deriveKnowledgeTrustStateFromExplanation(input.explanation);
    case "living_object":
      return {
        state: input.trustState,
        reasons: [{ code: "lifecycle", message: `Lifecycle: ${input.lifecycleState}.` }],
        limitations: input.limitations ?? [],
        requiredReview: input.trustState === "needs_review" ? "required" : "none",
        nextActionLabel: null,
      };
  }
}
