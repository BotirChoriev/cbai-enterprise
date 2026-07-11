import type {
  WorkspaceMemory,
  WorkspaceTimelineEvent,
} from "@/lib/research/intelligence/workspace-shell-model";

/**
 * Look up any remembered previous session for this topic's workspace. No storage mechanism
 * (database, API, localStorage) exists anywhere in this platform yet, so this always returns
 * undefined today. The signature exists so a future build can implement real persistence
 * without changing any calling code.
 */
export function getWorkspaceMemory(topicId: string): WorkspaceMemory | undefined {
  void topicId;
  return undefined;
}

/**
 * List deterministic workspace activity for this topic. No event log exists anywhere in this
 * platform yet, so this always returns an empty list today. The signature exists so a future
 * build can implement real event tracking without changing any calling code.
 */
export function getWorkspaceTimeline(topicId: string): readonly WorkspaceTimelineEvent[] {
  void topicId;
  return [];
}
