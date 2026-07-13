import {
  getResearchTopicById,
  RESEARCH_TOPIC_STATUS_LABELS,
} from "@/lib/research/research-topics";
import type { ResearchTopic, ResearchTopicStatus } from "@/lib/research/research-topics";

export type TopicEvidenceCatalogStatus =
  | "catalog_available"
  | "source_not_connected"
  | "human_review_required";

export interface TopicEvidenceCatalogItem {
  evidenceItemId: string;
  /** Stable, topic-relative identifier suitable for a URL, e.g. "?evidence={slug}". */
  slug: string;
  topicId: string;
  label: string;
  status: TopicEvidenceCatalogStatus;
  note: string;
}

export interface TopicReviewReadiness {
  reviewOpened: boolean;
  humanReviewRequired: boolean;
  statusLabel: string;
  note: string;
}

export interface TopicEvidenceReview {
  topic: ResearchTopic;
  evidenceItems: readonly TopicEvidenceCatalogItem[];
  selectedEvidence: TopicEvidenceCatalogItem | undefined;
  reviewReadiness: TopicReviewReadiness;
  limitations: readonly string[];
  nextActions: readonly string[];
}

const EVIDENCE_STATUS_NOTES: Record<TopicEvidenceCatalogStatus, string> = {
  catalog_available:
    "This evidence category is documented in the catalog. No live source is connected yet.",
  source_not_connected: "This evidence category is not connected to any source yet.",
  human_review_required: "This evidence category requires human scientific review before use.",
};

function mapTopicStatusToEvidenceStatus(
  status: ResearchTopicStatus,
): TopicEvidenceCatalogStatus {
  switch (status) {
    case "catalog_available":
      return "catalog_available";
    case "evidence_not_connected":
      return "source_not_connected";
    case "workspace_not_available":
      return "human_review_required";
  }
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/** The deterministic evidence item id shape — exported so callers (bookmark parsing, tests) never
 * need to re-derive or guess it independently. */
export function buildEvidenceItemId(topicId: string, slug: string): string {
  return `topic-evidence:${topicId}:${slug}`;
}

function buildEvidenceItems(topic: ResearchTopic): readonly TopicEvidenceCatalogItem[] {
  const status = mapTopicStatusToEvidenceStatus(topic.status);

  return topic.relatedEvidenceTypes.map((evidenceType) => {
    const slug = slugify(evidenceType);
    return {
      evidenceItemId: buildEvidenceItemId(topic.topicId, slug),
      slug,
      topicId: topic.topicId,
      label: evidenceType,
      status,
      note: EVIDENCE_STATUS_NOTES[status],
    };
  });
}

/** Find a catalog evidence item by its stable, topic-relative slug. */
export function findTopicEvidenceItemBySlug(
  evidenceItems: readonly TopicEvidenceCatalogItem[],
  slug: string,
): TopicEvidenceCatalogItem | undefined {
  return evidenceItems.find((item) => item.slug === slug);
}

function buildReviewReadiness(topic: ResearchTopic): TopicReviewReadiness {
  return {
    reviewOpened: false,
    humanReviewRequired: true,
    statusLabel: "No review opened yet",
    note: `Catalog status: ${RESEARCH_TOPIC_STATUS_LABELS[topic.status]}. Human scientific review is required before any catalog evidence supports a research decision.`,
  };
}

const EVIDENCE_REVIEW_LIMITATIONS = [
  "Evidence categories are catalog labels only — no live sources are connected.",
  "No publications, researchers, experiments, or institutions are connected to this workflow.",
  "Nothing shown here has been scientifically verified.",
] as const;

function buildNextActions(topic: ResearchTopic): readonly string[] {
  return [
    "Connect an official source for one of the catalog evidence categories above.",
    "Open a research review for this topic once a source is connected.",
    topic.futureWorkspace,
  ];
}

/** Build a pure, catalog-only evidence and review summary for a research topic. */
export function buildTopicEvidenceReview(topicId: string): TopicEvidenceReview | undefined {
  const topic = getResearchTopicById(topicId);
  if (!topic) {
    return undefined;
  }

  const evidenceItems = buildEvidenceItems(topic);

  return {
    topic,
    evidenceItems,
    selectedEvidence: evidenceItems[0],
    reviewReadiness: buildReviewReadiness(topic),
    limitations: EVIDENCE_REVIEW_LIMITATIONS,
    nextActions: buildNextActions(topic),
  };
}
