/**
 * Enterprise collaboration contracts — device-local runtime with org isolation.
 * Cloud sync / realtime remain planned unless a shared backend session is active.
 */

export type EnterpriseCapabilityStatus =
  | "implemented"
  | "partially_implemented"
  | "planned"
  | "missing";

export type CollaborationTargetType =
  | "mission"
  | "evidence"
  | "report"
  | "collaboration"
  | "organization"
  | "review"
  | "approval";

export type EnterpriseComment = {
  readonly id: string;
  readonly organizationId: string;
  readonly targetType: CollaborationTargetType;
  readonly targetId: string;
  readonly authorId: string;
  readonly body: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type EnterpriseMention = {
  readonly id: string;
  readonly organizationId: string;
  readonly commentId: string;
  readonly mentionedUserId: string;
  readonly mentionedBy: string;
  readonly targetType: CollaborationTargetType;
  readonly targetId: string;
  readonly createdAt: string;
  readonly readAt: string | null;
};

export type ApprovalStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled"
  | "changes_requested";

export type EnterpriseApproval = {
  readonly id: string;
  readonly organizationId: string;
  readonly targetType: CollaborationTargetType;
  readonly targetId: string;
  readonly title: string;
  readonly requestedBy: string;
  readonly assignedTo: string;
  readonly status: ApprovalStatus;
  readonly decisionNote: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type ActiveEnterpriseContext = {
  readonly organizationId: string | null;
  readonly workspaceId: "government" | "investor" | "citizen" | null;
  readonly missionId: string | null;
  readonly updatedAt: string;
};

export type CollaborationAssistantSnapshot = {
  readonly organizationId: string | null;
  readonly organizationName: string | null;
  readonly workspaceId: ActiveEnterpriseContext["workspaceId"];
  readonly missionId: string | null;
  readonly missionProblem: string | null;
  readonly assignees: readonly string[];
  readonly pendingApprovals: number;
  readonly unreadNotifications: number;
  readonly assignedReviews: number;
  readonly unreadMentions: number;
  readonly isolationNote: string;
  readonly summary: string;
};
