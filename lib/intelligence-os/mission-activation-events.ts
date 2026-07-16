/** Broadcast when mission-relevant local data changes — mission context re-reads without reload. */

export const MISSION_DATA_CHANGED = "cbai:mission-data-changed";

export type MissionDataChangeReason =
  | "project"
  | "evidence"
  | "note"
  | "question"
  | "task"
  | "report"
  | "impact"
  | "reasoning"
  | "research"
  | "bookmark";

export function notifyMissionDataChanged(reason: MissionDataChangeReason): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(MISSION_DATA_CHANGED, { detail: { reason } }));
}
