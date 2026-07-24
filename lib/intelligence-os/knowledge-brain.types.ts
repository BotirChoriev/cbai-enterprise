/** Knowledge Brain — universal explainability contract for resolvable platform objects. */

import type { UniversalObjectRef } from "@/lib/intelligence-os/universal-object";

export type KnowledgePrimaryBucket = "known" | "unknown" | "conflict" | "needs_review";

export type KnowledgeSourceConnectionStatus =
  | "catalog_only"
  | "device_local"
  | "connected"
  | "restricted"
  | "unavailable"
  | "not_yet_connected";

/** Internal source record — describes present and future integrations without simulating them. */
export type KnowledgeSourceRecord = {
  readonly sourceId: string;
  readonly title: string;
  readonly sourceType: string;
  readonly organizationOrAuthor: string | null;
  readonly publicationOrCreatedDate: string | null;
  readonly originalLanguage: string | null;
  readonly sourceLocation: string | null;
  readonly provenance: string | null;
  readonly authorityBasis: string | null;
  readonly verificationStatus: string | null;
  readonly freshness: string | null;
  readonly connectionAvailability: KnowledgeSourceConnectionStatus;
  readonly retrievalStatus: string | null;
  readonly limitations: readonly string[];
};

export type KnowledgeSuggestedAction = {
  readonly label: string;
  readonly href: string;
  readonly labelKey?: "research.openTopic" | "navigation.evidence" | "navigation.reports" | "navigation.graph";
};

/** Progressive explanation model — primary buckets plus secondary disclosure fields. */
export type KnowledgeExplanation = {
  readonly ref: UniversalObjectRef | null;
  readonly whatIsThis: string | null;
  readonly whyItMatters: string | null;
  readonly missionRelevance: string | null;
  readonly primary: Readonly<Record<KnowledgePrimaryBucket, readonly string[]>>;
  readonly howWeKnow: string | null;
  readonly provenance: string | null;
  readonly freshness: string | null;
  readonly supportingEvidence: readonly string[];
  readonly contradictingEvidence: readonly string[];
  readonly missingEvidence: readonly string[];
  readonly relatedQuestions: readonly string[];
  readonly limitations: string | null;
  readonly humanReviewRequired: boolean;
  readonly suggestedAction: KnowledgeSuggestedAction | null;
  readonly sources: readonly KnowledgeSourceRecord[];
};
