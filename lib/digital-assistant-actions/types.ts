/**
 * Phase 6 — Digital Assistant action layer types.
 * READ actions query authorized device/org stores. DRAFT actions require confirmation
 * and never auto-approve or bypass RLS/org isolation.
 */

export const DIGITAL_ASSISTANT_ACTIONS_VERSION = "1.0.0-phase6" as const;

export type AssistantActionKind =
  | "list_missions"
  | "list_pending_approvals"
  | "list_mentions"
  | "org_activity_summary"
  | "missing_evidence"
  | "navigate"
  | "draft_mission"
  | "draft_task"
  | "draft_approval_request"
  | "draft_report";

export type AssistantActionMode = "read" | "draft" | "navigate";

export type AssistantActionOutcome =
  | "completed"
  | "draft_pending_confirmation"
  | "blocked"
  | "empty";

export type AssistantActionDefinition = {
  readonly kind: AssistantActionKind;
  readonly mode: AssistantActionMode;
  /** True when the action may mutate or create objects — confirmation required. */
  readonly confirmationRequired: boolean;
  readonly label: string;
  readonly description: string;
};

export type AssistantAuditEntry = {
  readonly id: string;
  readonly kind: AssistantActionKind;
  readonly mode: AssistantActionMode;
  readonly outcome: AssistantActionOutcome;
  readonly actorId: string | null;
  readonly detail: string;
  /** Never stores secrets — summary only. */
  readonly at: string;
};

export type MissionListItem = {
  readonly missionId: string;
  readonly stage: string;
  readonly taskCount: number;
  readonly updatedAt: string;
};

export type PendingApprovalItem = {
  readonly id: string;
  readonly title: string;
  readonly organizationId: string;
  readonly status: "pending";
  readonly assignedTo: string;
  readonly createdAt: string;
};

export type MentionListItem = {
  readonly id: string;
  readonly organizationId: string;
  readonly mentionedBy: string;
  readonly targetType: string;
  readonly targetId: string;
  readonly createdAt: string;
  readonly unread: boolean;
};

export type OrgActivitySummary = {
  readonly organizationId: string | null;
  readonly eventCount: number;
  readonly recentEvents: readonly {
    readonly event: string;
    readonly actorDisplayName: string;
    readonly timestamp: string;
  }[];
  readonly isolationNote: string;
};

export type MissingEvidenceItem = {
  readonly missionId: string;
  readonly requirementId: string;
  readonly description: string;
  readonly evidenceId: string | null;
};

export type NavigateTarget = {
  readonly href: string;
  readonly label: string;
};

export type DraftPayload =
  | { readonly draftKind: "mission"; readonly problem: string }
  | { readonly draftKind: "task"; readonly missionId: string; readonly title: string }
  | {
      readonly draftKind: "approval_request";
      readonly title: string;
      readonly organizationId: string | null;
      readonly assignedTo: string | null;
    }
  | { readonly draftKind: "report"; readonly reportType: string; readonly title: string };

export type AssistantActionResult = {
  readonly kind: AssistantActionKind;
  readonly mode: AssistantActionMode;
  readonly outcome: AssistantActionOutcome;
  readonly assistantText: string;
  readonly href?: string;
  readonly confirmationRequired: boolean;
  readonly draft?: DraftPayload;
  readonly data?: unknown;
};

export const ASSISTANT_ACTION_CATALOG: readonly AssistantActionDefinition[] = [
  {
    kind: "list_missions",
    mode: "read",
    confirmationRequired: false,
    label: "List missions",
    description: "Read mission engine runtimes on this device (authorized local store).",
  },
  {
    kind: "list_pending_approvals",
    mode: "read",
    confirmationRequired: false,
    label: "Pending approvals",
    description: "Read pending approvals assigned to the current actor (org-scoped).",
  },
  {
    kind: "list_mentions",
    mode: "read",
    confirmationRequired: false,
    label: "Mentions",
    description: "Read @mentions for the current actor (org membership gated).",
  },
  {
    kind: "org_activity_summary",
    mode: "read",
    confirmationRequired: false,
    label: "Org activity summary",
    description: "Summarize organization audit events visible to the current actor.",
  },
  {
    kind: "missing_evidence",
    mode: "read",
    confirmationRequired: false,
    label: "Missing evidence",
    description: "List unsatisfied required evidence on mission engine runtimes.",
  },
  {
    kind: "navigate",
    mode: "navigate",
    confirmationRequired: false,
    label: "Navigate",
    description: "Navigate to an allowed platform route.",
  },
  {
    kind: "draft_mission",
    mode: "draft",
    confirmationRequired: true,
    label: "Draft mission",
    description: "Draft a mission problem — confirmation required; not auto-created.",
  },
  {
    kind: "draft_task",
    mode: "draft",
    confirmationRequired: true,
    label: "Draft task",
    description: "Draft a mission task — confirmation required; not auto-created.",
  },
  {
    kind: "draft_approval_request",
    mode: "draft",
    confirmationRequired: true,
    label: "Draft approval request",
    description: "Draft an approval request — never auto-approves; confirmation required.",
  },
  {
    kind: "draft_report",
    mode: "draft",
    confirmationRequired: true,
    label: "Draft report",
    description: "Draft a report outline — confirmation required; not auto-published.",
  },
] as const;
