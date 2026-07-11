// Milestones chosen to map 1:1 onto real, already-existing deterministic signals
// (Gap Engine, Decision Engine, Review Workspace Engine). No "validation" milestone is
// included — this platform has no distinct real signal for it beyond review/findings, and
// inventing one would violate "do not invent any new data."
export type MilestoneId =
  | "question_defined"
  | "evidence_catalogued"
  | "evidence_connected"
  | "review_opened"
  | "findings_recorded"
  | "decision_reached";

export const MILESTONE_LABELS: Record<MilestoneId, string> = {
  question_defined: "Research question defined",
  evidence_catalogued: "Evidence categories catalogued",
  evidence_connected: "Evidence connected",
  review_opened: "Review opened",
  findings_recorded: "Findings recorded",
  decision_reached: "Decision reached",
};
