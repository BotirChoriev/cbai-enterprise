export type EvidenceStatus =
  | "draft"
  | "verified"
  | "disputed"
  | "deprecated"
  | "archived";

export type EvidenceStrength = "weak" | "moderate" | "strong" | "conclusive";

export type EvidenceSourceType =
  | "publication"
  | "dataset"
  | "experiment"
  | "patent"
  | "laboratory"
  | "researcher"
  | "institution"
  | "company"
  | "government"
  | "other";
