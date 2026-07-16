import type { GatewaySearchResponse } from "@/lib/search-gateway";

export type SearchActivationStageId =
  | "understanding"
  | "searchingEntities"
  | "checkingEvidence"
  | "findingKnowledge"
  | "comparing"
  | "preparing"
  | "completed"
  | "noMatches";

/** Real stages derived from what executeGatewaySearch actually touched — never decorative. */
export function deriveSearchActivationStages(
  query: string,
  response: GatewaySearchResponse,
): readonly SearchActivationStageId[] {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const stages: SearchActivationStageId[] = ["understanding", "searchingEntities"];

  const hasEvidence = response.groups.some((g) => g.id === "evidence" && g.topics.length > 0);
  const hasKnowledge = response.groups.some((g) => g.id === "knowledge" && g.topics.length > 0);
  const entityGroups = response.groups.filter((g) => g.entities.length > 0);

  if (hasEvidence) stages.push("checkingEvidence");
  if (hasKnowledge) stages.push("findingKnowledge");
  if (entityGroups.length > 1 || (hasEvidence && entityGroups.length > 0)) {
    stages.push("comparing");
  }

  if (!response.hasResults) {
    stages.push("noMatches");
    return stages;
  }

  stages.push("preparing", "completed");
  return stages;
}
