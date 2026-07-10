import { deriveEvidenceGapIntelligence } from "@/lib/research/intelligence/intelligence-engine";
import type { EvidenceGapIntelligence } from "@/lib/research/intelligence/intelligence-model";
import type { ResearchDecision } from "@/lib/research/intelligence/decision-types";

// One decision per readiness state — never two candidates for the researcher to choose between.
// "continue_existing_review" and "no_action_required" are unreachable with today's data (no
// review is ever opened and no topic ever reaches full readiness), but are kept because the
// underlying signals (reviewOpened, "ready") are real fields this engine already reads honestly.
function decideFromIntelligence(intelligence: EvidenceGapIntelligence): ResearchDecision {
  switch (intelligence.researchReadiness) {
    case "needs_evidence":
      return "connect_missing_evidence_source";
    case "partially_ready":
      return intelligence.reviewStatus.reviewOpened
        ? "continue_existing_review"
        : "open_evidence_review";
    case "ready":
      return "no_action_required";
    case "review_required":
    case "unknown":
      // The topic itself (or its readiness) isn't knowable yet — recommending a specific
      // evidence/review action here would be guessing ahead of what the platform actually knows.
      return "unknown";
  }
}

/**
 * Derive the single next research decision for a topic from existing platform state only —
 * reuses the Evidence Gap Intelligence Engine rather than re-deriving readiness or evidence
 * status. Never returns more than one decision.
 */
export function deriveResearchDecision(topicId: string): ResearchDecision | undefined {
  const intelligence = deriveEvidenceGapIntelligence(topicId);
  if (!intelligence) {
    return undefined;
  }
  return decideFromIntelligence(intelligence);
}
