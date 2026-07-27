import type { WimRelationshipType } from "@/lib/world-and-me-intelligence/types";

/** Deterministic relationship labels — UI localizes via copy keys; these are EN fallbacks for tests. */
export const WIM_RELATIONSHIP_LABELS_EN: Record<WimRelationshipType, string> = {
  works_at: "Works at",
  member_of: "Member of",
  authored: "Authored",
  published_by: "Published by",
  researches: "Researches",
  uses_method: "Uses method",
  supports_claim: "Supports claim",
  challenges_claim: "Challenges claim",
  replicated: "Replicated",
  failed_to_replicate: "Failed to replicate",
  funds: "Funds",
  regulates: "Regulates",
  partners_with: "Partners with",
  seeks_collaboration: "Seeks collaboration",
  located_in: "Located in",
  relevant_to: "Relevant to",
  monitors: "Monitors",
  depends_on: "Depends on",
  linked_to_project: "Linked to project",
  linked_to_user: "Linked to user",
  watched_by: "Watched by",
  derived_from: "Derived from",
  supersedes: "Supersedes",
  contradicts: "Contradicts",
  requires_human_approval: "Requires human approval",
};

export function relationshipLabelEn(type: WimRelationshipType): string {
  return WIM_RELATIONSHIP_LABELS_EN[type] ?? type;
}

export function everyRelationshipHasType(rels: readonly { readonly type: string }[]): boolean {
  return rels.every((r) => typeof r.type === "string" && r.type.length > 0);
}
