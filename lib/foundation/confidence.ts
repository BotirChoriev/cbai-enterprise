// Shared confidence vocabulary — used by both Relationship and Evidence (and any future
// pillar that needs it). Categorical only, never numeric: confidence is always deterministically
// derivable from a real count (how many independent sources back a claim), never a fabricated
// percentage or score.
export type Confidence = "unverified" | "single_source" | "corroborated" | "disputed";

export const CONFIDENCE_LABELS: Record<Confidence, string> = {
  unverified: "Unverified",
  single_source: "Single source",
  corroborated: "Corroborated",
  disputed: "Disputed",
};

export function deriveConfidenceFromSourceCount(sourceCount: number): Confidence {
  if (sourceCount === 0) {
    return "unverified";
  }
  if (sourceCount === 1) {
    return "single_source";
  }
  return "corroborated";
}
