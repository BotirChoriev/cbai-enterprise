/**
 * Session context memory for the Digital Assistant OS layer.
 * Syncs platform selection into existing voice session memory — no parallel store.
 */

import { getCurrentMission } from "@/lib/intelligence-os/mission-engine";
import { getPrimaryEntity, type PlatformContextSnapshot } from "@/lib/context";
import { patchVoiceSessionMemory, readVoiceSessionMemory } from "@/lib/voice-operator/session-memory";
import { buildCollaborationAssistantSnapshot } from "@/lib/enterprise-collaboration/assistant-context";
import { resolveActorId } from "@/lib/persistence/resolve-actor-id";

export type AssistantOsContext = {
  readonly countryName: string | null;
  readonly companyName: string | null;
  readonly universityName: string | null;
  readonly missionProblem: string | null;
  readonly researchTopicId: string | null;
  readonly pathname: string;
  readonly summary: string;
  readonly organizationName: string | null;
  readonly workspaceId: string | null;
  readonly pendingApprovals: number;
  readonly unreadNotifications: number;
  readonly assignedReviews: number;
  readonly unreadMentions: number;
};

export function buildAssistantOsContext(
  platform: PlatformContextSnapshot | null,
  pathname: string,
): AssistantOsContext {
  const mission = getCurrentMission();
  const primary = platform ? getPrimaryEntity(platform) : null;
  const topicMatch = /^\/research\/([^/]+)/.exec(pathname);
  const researchTopicId = topicMatch?.[1] ?? null;
  const collab = buildCollaborationAssistantSnapshot(resolveActorId());

  const countryName =
    platform?.country?.name ?? (primary?.kind === "country" ? primary.name : null);
  const companyName =
    platform?.company?.name ?? (primary?.kind === "company" ? primary.name : null);
  const universityName =
    platform?.university?.name ?? (primary?.kind === "university" ? primary.name : null);

  const parts: string[] = [];
  if (collab.organizationName) parts.push(`Organization: ${collab.organizationName}`);
  if (collab.workspaceId) parts.push(`Workspace: ${collab.workspaceId}`);
  if (countryName) parts.push(`Country: ${countryName}`);
  if (companyName) parts.push(`Company: ${companyName}`);
  if (universityName) parts.push(`University: ${universityName}`);
  if (mission) parts.push(`Mission: ${mission.problem.slice(0, 80)}`);
  if (researchTopicId) parts.push(`Research topic: ${researchTopicId}`);
  if (pathname.startsWith("/reports")) parts.push("Module: Reports");
  if (pathname.startsWith("/knowledge") || pathname.startsWith("/evidence")) {
    parts.push("Module: Evidence");
  }
  if (pathname.startsWith("/trust")) parts.push("Module: Trust");
  if (pathname.startsWith("/enterprise") || pathname.startsWith("/notifications")) {
    parts.push("Module: Enterprise collaboration");
  }
  if (collab.pendingApprovals > 0) parts.push(`Pending approvals: ${collab.pendingApprovals}`);
  if (collab.unreadNotifications > 0) parts.push(`Unread notifications: ${collab.unreadNotifications}`);

  return {
    countryName,
    companyName,
    universityName,
    missionProblem: mission?.problem ?? null,
    researchTopicId,
    pathname,
    summary: parts.length > 0 ? parts.join(" · ") : "No entity selected yet",
    organizationName: collab.organizationName,
    workspaceId: collab.workspaceId,
    pendingApprovals: collab.pendingApprovals,
    unreadNotifications: collab.unreadNotifications,
    assignedReviews: collab.assignedReviews,
    unreadMentions: collab.unreadMentions,
  };
}

/** Persist OS context into the existing Voice Operator session memory. */
export function syncAssistantOsContext(
  platform: PlatformContextSnapshot | null,
  pathname: string,
): AssistantOsContext {
  const os = buildAssistantOsContext(platform, pathname);
  if (readVoiceSessionMemory()) {
    patchVoiceSessionMemory({ activeContextSummary: os.summary });
  }
  return os;
}
