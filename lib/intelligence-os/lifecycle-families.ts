/** BUILD-032 — Compatible lifecycle families (not one incorrect universal list). */

export type SourceLifecycleFamily =
  | "retrieved"
  | "inspected"
  | "saved"
  | "linked"
  | "awaiting_review"
  | "reviewed"
  | "rejected"
  | "superseded"
  | "archived";

export type EvidenceLifecycleFamily =
  | "candidate"
  | "awaiting_review"
  | "accepted"
  | "contextual"
  | "insufficient"
  | "contradicted"
  | "superseded"
  | "archived";

export type RelationshipLifecycleFamily =
  | "suggested"
  | "asserted"
  | "human_confirmed"
  | "contradicted"
  | "superseded"
  | "rejected"
  | "archived";

export type FreshnessCategory =
  | "current"
  | "recent"
  | "aging"
  | "outdated"
  | "unknown"
  | "not_applicable";

export type FreshnessAssessment = {
  readonly category: FreshnessCategory;
  readonly reason: string;
};

export function mapSourceIngestionToFamily(state: string): SourceLifecycleFamily {
  const map: Record<string, SourceLifecycleFamily> = {
    search_result: "retrieved",
    inspected: "inspected",
    saved_source: "saved",
    linked_to_mission: "linked",
    awaiting_review: "awaiting_review",
    reviewed_evidence: "reviewed",
    rejected: "rejected",
    superseded: "superseded",
    archived: "archived",
  };
  return map[state] ?? "retrieved";
}

export function deriveFreshnessFromDates(input: {
  readonly publicationDate?: string | null;
  readonly retrievedAt?: string | null;
  readonly reviewedAt?: string | null;
}): FreshnessAssessment {
  if (!input.publicationDate && !input.retrievedAt) {
    return { category: "unknown", reason: "No publication or retrieval date available." };
  }
  const retrieved = input.retrievedAt ? new Date(input.retrievedAt) : null;
  if (retrieved) {
    const days = (Date.now() - retrieved.getTime()) / (1000 * 60 * 60 * 24);
    if (days < 30) return { category: "recent", reason: "Retrieved within the last 30 days." };
    if (days < 365) return { category: "aging", reason: "Retrieved over 30 days ago." };
    return { category: "outdated", reason: "Retrieval is over one year old — verify relevance." };
  }
  return { category: "not_applicable", reason: "Freshness based on publication metadata only." };
}
