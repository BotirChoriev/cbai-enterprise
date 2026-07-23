/**
 * Collaboration-aware Digital Assistant snapshot — org-isolated.
 */

import { loadActiveEnterpriseContext } from "@/lib/enterprise-collaboration/active-context";
import { countUnreadMentions } from "@/lib/enterprise-collaboration/mention-store";
import { countPendingApprovalsForUser } from "@/lib/enterprise-collaboration/approval-store";
import type { CollaborationAssistantSnapshot } from "@/lib/enterprise-collaboration/types";
import { loadOrganization } from "@/lib/organization-os/organization-store";
import { loadMembershipForUser } from "@/lib/organization-os/organization-membership-store";
import { countUnreadNotifications } from "@/lib/notifications/user-notification-store";
import { loadCurrentMission } from "@/lib/intelligence-os/mission-store";
import {
  loadMissionCollaborations,
  loadCollaborationParticipants,
  loadCollaborationReviewAssignments,
} from "@/lib/collaboration/collaboration-store";

export function buildCollaborationAssistantSnapshot(userId: string | null): CollaborationAssistantSnapshot {
  const isolationNote =
    "Assistant collaboration context never includes organizations you are not a member of.";

  if (!userId) {
    return {
      organizationId: null,
      organizationName: null,
      workspaceId: null,
      missionId: null,
      missionProblem: null,
      assignees: [],
      pendingApprovals: 0,
      unreadNotifications: 0,
      assignedReviews: 0,
      unreadMentions: 0,
      isolationNote,
      summary: "Signed out — collaboration context unavailable.",
    };
  }

  const active = loadActiveEnterpriseContext();
  let organizationId = active.organizationId;
  if (organizationId && !loadMembershipForUser(userId, organizationId)) {
    organizationId = null;
  }

  const org = organizationId ? loadOrganization(organizationId) : null;
  const mission = loadCurrentMission();
  const missionId =
    active.missionId && mission?.id === active.missionId
      ? active.missionId
      : mission?.id ?? null;

  const collabs = loadMissionCollaborations(missionId ?? undefined).filter((c) => {
    if (!c.ownerOrganizationId) return c.createdBy === userId;
    return Boolean(loadMembershipForUser(userId, c.ownerOrganizationId));
  });

  const assignees = new Set<string>();
  let assignedReviews = 0;
  for (const collab of collabs) {
    for (const p of loadCollaborationParticipants(collab.id)) {
      if (p.status === "active" || p.status === "invited") assignees.add(p.participantId);
    }
    assignedReviews += loadCollaborationReviewAssignments(collab.id).filter(
      (r) => r.assignedTo === userId && (r.status === "assigned" || r.status === "in_review"),
    ).length;
  }

  const pendingApprovals = countPendingApprovalsForUser(userId, organizationId);
  const unreadNotifications = countUnreadNotifications(userId);
  const unreadMentions = countUnreadMentions(userId);

  const parts: string[] = [];
  if (org) parts.push(`Organization: ${org.name}`);
  if (active.workspaceId) parts.push(`Workspace lens: ${active.workspaceId}`);
  if (mission) parts.push(`Mission: ${mission.problem.slice(0, 72)}`);
  parts.push(`Pending approvals: ${pendingApprovals}`);
  parts.push(`Unread notifications: ${unreadNotifications}`);
  parts.push(`Assigned reviews: ${assignedReviews}`);
  parts.push(`Unread mentions: ${unreadMentions}`);

  return {
    organizationId: org?.id ?? null,
    organizationName: org?.name ?? null,
    workspaceId: active.workspaceId,
    missionId,
    missionProblem: mission?.problem ?? null,
    assignees: [...assignees],
    pendingApprovals,
    unreadNotifications,
    assignedReviews,
    unreadMentions,
    isolationNote,
    summary: parts.join(" · "),
  };
}
