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
  /** Catalog evidence categories documented for this topic — not live-connected. */
  catalogDocumentedEvidence: readonly TopicEvidenceCatalogItem[];
  /** Evidence linked to mission via lifecycle (linked+) or saved external source. */
  connectedEvidence: readonly TopicEvidenceCatalogItem[];
  /** Evidence categories with no source connection. */
  disconnectedEvidence: readonly TopicEvidenceCatalogItem[];
  /** Evidence categories gated behind human review. */
  reviewGatedEvidence: readonly TopicEvidenceCatalogItem[];
  reviewStatus: TopicReviewReadiness;
  /** Labels of items without live source connection. */
  missingEvidenceCategories: readonly string[];
  /** True when at least one item is live-connected (lifecycle linked+). */
  hasLiveConnectedEvidence: boolean;
  researchReadiness: ResearchReadinessState;
  nextAction: ResearchNextAction;
}
