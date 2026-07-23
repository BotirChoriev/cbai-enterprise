export type {
  ActiveEnterpriseContext,
  ApprovalStatus,
  CollaborationAssistantSnapshot,
  CollaborationTargetType,
  EnterpriseApproval,
  EnterpriseCapabilityStatus,
  EnterpriseComment,
  EnterpriseMention,
} from "@/lib/enterprise-collaboration/types";

export {
  loadActiveEnterpriseContext,
  saveActiveEnterpriseContext,
  setActiveOrganizationForUser,
  clearActiveEnterpriseContextForTests,
} from "@/lib/enterprise-collaboration/active-context";

export {
  assertUserBelongsToOrganization,
  filterByOrganizationMembership,
} from "@/lib/enterprise-collaboration/isolation";

export {
  createEnterpriseComment,
  loadEnterpriseCommentsForOrganization,
  loadEnterpriseCommentsForTarget,
  clearEnterpriseCommentsForTests,
} from "@/lib/enterprise-collaboration/comment-store";

export {
  extractMentionUserIds,
  createMentionsFromComment,
  loadMentionsForUser,
  countUnreadMentions,
  markMentionRead,
  clearEnterpriseMentionsForTests,
} from "@/lib/enterprise-collaboration/mention-store";

export {
  requestEnterpriseApproval,
  decideEnterpriseApproval,
  loadApprovalsForUser,
  countPendingApprovalsForUser,
  clearEnterpriseApprovalsForTests,
} from "@/lib/enterprise-collaboration/approval-store";

export {
  buildCollaborationAssistantSnapshot,
} from "@/lib/enterprise-collaboration/assistant-context";

export {
  getEnterpriseCapabilityMatrix,
  realtimeCollaborationStatus,
} from "@/lib/enterprise-collaboration/capability-status";

export {
  buildInvitationAcceptUrl,
  sendOrganizationInvitationEmail,
  isPreviewOrDevHost,
} from "@/lib/enterprise-collaboration/email-transport";

export { getRealtimeCapability, subscribeCollaborationRealtime } from "@/lib/enterprise-collaboration/realtime";
