import type { NegativeResultReadiness } from "@/lib/research/negative-results/negative-result-types";

/** Readiness entries — no actual failed experiments or outcomes. */
export const NEGATIVE_RESULT_REGISTRY: readonly NegativeResultReadiness[] = [
  {
    negativeResultId: "nr-readiness-global",
    relatedTopicIds: [],
    futureExperimentTypes: [
      "Laboratory experiment",
      "Replication study",
      "Clinical experiment",
      "Field experiment",
    ],
    futureEvidenceSources: ["Experiment records", "Replication studies", "Peer-reviewed studies"],
    humanReviewRequired: true,
    status: "not_connected_yet",
  },
  {
    negativeResultId: "nr-readiness-antibiotic-resistance",
    relatedTopicIds: ["antibiotic-resistance"],
    futureExperimentTypes: ["Clinical experiment", "Replication study", "Surveillance study"],
    futureEvidenceSources: [
      "Clinical studies",
      "Genomic datasets",
      "Public health reports",
    ],
    humanReviewRequired: true,
    status: "future_workspace",
  },
  {
    negativeResultId: "nr-readiness-microbiology",
    relatedTopicIds: ["microbiology"],
    futureExperimentTypes: ["Laboratory experiment", "Replication study"],
    futureEvidenceSources: ["Laboratory records", "Datasets", "Peer-reviewed studies"],
    humanReviewRequired: true,
    status: "not_connected_yet",
  },
  {
    negativeResultId: "nr-readiness-crispr",
    relatedTopicIds: ["crispr"],
    futureExperimentTypes: ["Laboratory experiment", "Protocol comparison"],
    futureEvidenceSources: ["Methods papers", "Ethics records", "Policy guidance"],
    humanReviewRequired: true,
    status: "future_workspace",
  },
] as const;
