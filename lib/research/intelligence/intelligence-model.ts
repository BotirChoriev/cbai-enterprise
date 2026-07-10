import type {
  TopicEvidenceCatalogItem,
  TopicReviewReadiness,
} from "@/lib/research/evidence/evidence-topic-builder";
import type { ResearchTopic } from "@/lib/research/research-topics";
import type {
  ResearchNextAction,
  ResearchReadinessState,
} from "@/lib/research/intelligence/intelligence-types";

export interface EvidenceGapIntelligence {
  topic: ResearchTopic;
  /** Evidence categories the catalog affirms are relevant to this topic. */
  connectedEvidence: readonly TopicEvidenceCatalogItem[];
  /** Evidence categories with no source connection — the honestly detectable gaps. */
  disconnectedEvidence: readonly TopicEvidenceCatalogItem[];
  /** Evidence categories gated behind human review; neither confirmed connected nor missing. */
  reviewGatedEvidence: readonly TopicEvidenceCatalogItem[];
  reviewStatus: TopicReviewReadiness;
  /** Labels of disconnected evidence categories — the same set as disconnectedEvidence. */
  missingEvidenceCategories: readonly string[];
  researchReadiness: ResearchReadinessState;
  nextAction: ResearchNextAction;
}
