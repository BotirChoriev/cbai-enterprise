import type { ResearchReadinessState } from "@/lib/research/intelligence/intelligence-types";

/**
 * Foundation for restoring a researcher's previous context in this topic's workspace.
 * No persistence mechanism (database, API, localStorage) exists anywhere in this platform
 * yet, so this is architecture only — getWorkspaceMemory() always returns undefined today.
 */
export interface WorkspaceMemory {
  topicId: string;
  lastVisitedAt: string;
  lastStage: ResearchReadinessState;
}

/**
 * A single deterministic workspace activity event. No event log exists anywhere in this
 * platform yet — architecture only, getWorkspaceTimeline() always returns an empty list today.
 */
export type WorkspaceTimelineEventType =
  | "evidence_added"
  | "review_started"
  | "finding_created"
  | "decision_updated";

export const WORKSPACE_TIMELINE_EVENT_LABELS: Record<WorkspaceTimelineEventType, string> = {
  evidence_added: "Evidence Added",
  review_started: "Review Started",
  finding_created: "Finding Created",
  decision_updated: "Decision Updated",
};

export interface WorkspaceTimelineEvent {
  eventId: string;
  topicId: string;
  eventType: WorkspaceTimelineEventType;
  description: string;
  occurredAt: string;
}

/**
 * Foundation for a future Focus Mode toggle. No UI wiring exists yet — this type exists so a
 * future build can add the toggle without redefining the underlying state shape.
 */
export type WorkspaceViewMode = "standard" | "focus";

/**
 * Foundation for a future Split View layout. No UI wiring exists yet — same reasoning as
 * WorkspaceViewMode above.
 */
export type WorkspaceLayoutMode = "single" | "split";
