import type { EvidenceSourceType } from "@/lib/foundation/evidence-types";

export type EvidenceStatus =
  | "draft"
  | "verified"
  | "disputed"
  | "deprecated"
  | "archived";

export type EvidenceStrength = "weak" | "moderate" | "strong" | "conclusive";

/** Promoted to lib/foundation/evidence-types.ts — re-exported here so existing imports keep working. */
export type { EvidenceSourceType };
