/**
 * Phase 6 — Digital Assistant action layer.
 * READ authorized device/org data; DRAFT only with confirmation; device-local audit.
 */

export { DIGITAL_ASSISTANT_ACTIONS_VERSION, ASSISTANT_ACTION_CATALOG } from "@/lib/digital-assistant-actions/types";
export type {
  AssistantActionKind,
  AssistantActionMode,
  AssistantActionOutcome,
  AssistantActionDefinition,
  AssistantAuditEntry,
  AssistantActionResult,
  DraftPayload,
  MissionListItem,
  PendingApprovalItem,
  MentionListItem,
  OrgActivitySummary,
  MissingEvidenceItem,
} from "@/lib/digital-assistant-actions/types";

export {
  recordAssistantActionAudit,
  loadAssistantActionAudit,
  clearAssistantActionAuditForTests,
  ASSISTANT_ACTION_AUDIT_KEY,
} from "@/lib/digital-assistant-actions/audit";

export {
  listMissionsAction,
  listPendingApprovalsAction,
  listMentionsAction,
  orgActivitySummaryAction,
  missingEvidenceAction,
  navigateAction,
  resolveNavigateHref,
  ASSISTANT_NAV_TARGETS,
} from "@/lib/digital-assistant-actions/read-actions";
export type { ReadActionDeps } from "@/lib/digital-assistant-actions/read-actions";

export {
  draftMissionAction,
  draftTaskAction,
  draftApprovalRequestAction,
  draftReportAction,
  assistantMayAutoApprove,
  assistantMayBypassRls,
} from "@/lib/digital-assistant-actions/draft-actions";
export type { DraftActionDeps } from "@/lib/digital-assistant-actions/draft-actions";

export { resolveDigitalAssistantAction } from "@/lib/digital-assistant-actions/resolve-action";
export type { ResolveAssistantActionDeps } from "@/lib/digital-assistant-actions/resolve-action";
