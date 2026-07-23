/**
 * DRAFT-only assistant actions — confirmation required.
 * Never auto-approves, never writes completed approvals, never bypasses RLS/org gates.
 */

import { resolveActorId } from "@/lib/persistence/resolve-actor-id";
import { recordAssistantActionAudit } from "@/lib/digital-assistant-actions/audit";
import type {
  AssistantActionResult,
  DraftPayload,
} from "@/lib/digital-assistant-actions/types";

export type DraftActionDeps = {
  readonly actorId?: string | null;
};

function actor(deps?: DraftActionDeps): string | null {
  return deps?.actorId !== undefined ? deps.actorId : resolveActorId();
}

function draftResult(
  kind: AssistantActionResult["kind"],
  draft: DraftPayload,
  assistantText: string,
  href: string | undefined,
  deps?: DraftActionDeps,
): AssistantActionResult {
  const actorId = actor(deps);
  recordAssistantActionAudit({
    kind,
    mode: "draft",
    outcome: "draft_pending_confirmation",
    actorId,
    detail: `Draft ${draft.draftKind} pending confirmation`,
  });
  return {
    kind,
    mode: "draft",
    outcome: "draft_pending_confirmation",
    confirmationRequired: true,
    assistantText,
    href,
    draft,
  };
}

export function draftMissionAction(problem: string, deps?: DraftActionDeps): AssistantActionResult {
  const trimmed = problem.trim() || "Untitled mission problem";
  return draftResult(
    "draft_mission",
    { draftKind: "mission", problem: trimmed },
    `Draft mission ready (not created):\n"${trimmed.slice(0, 160)}"\nConfirm in the Missions UI to create. This is a draft only.`,
    "/?create=1",
    deps,
  );
}

export function draftTaskAction(
  input: { readonly missionId: string; readonly title: string },
  deps?: DraftActionDeps,
): AssistantActionResult {
  const title = input.title.trim() || "Untitled task";
  const missionId = input.missionId.trim() || "unspecified-mission";
  return draftResult(
    "draft_task",
    { draftKind: "task", missionId, title },
    `Draft task ready (not created) for mission ${missionId}:\n"${title}"\nConfirm in the mission workspace to add. Draft only — not completed.`,
    "/missions",
    deps,
  );
}

export function draftApprovalRequestAction(
  input: {
    readonly title: string;
    readonly organizationId?: string | null;
    readonly assignedTo?: string | null;
  },
  deps?: DraftActionDeps,
): AssistantActionResult {
  const title = input.title.trim() || "Approval request";
  return draftResult(
    "draft_approval_request",
    {
      draftKind: "approval_request",
      title,
      organizationId: input.organizationId ?? null,
      assignedTo: input.assignedTo ?? null,
    },
    [
      `Draft approval request ready (not submitted):`,
      `"${title}"`,
      "Confirmation required. The assistant never auto-approves and never bypasses org membership / RLS.",
      "Open Approvals to submit when ready.",
    ].join("\n"),
    "/approvals",
    deps,
  );
}

export function draftReportAction(
  input: { readonly reportType: string; readonly title?: string },
  deps?: DraftActionDeps,
): AssistantActionResult {
  const reportType = input.reportType.trim() || "executive";
  const title = input.title?.trim() || `Draft ${reportType} report`;
  return draftResult(
    "draft_report",
    { draftKind: "report", reportType, title },
    [
      `Draft report ready (not published):`,
      `Type: ${reportType}`,
      `Title: ${title}`,
      "Confirmation required. Open the Report builder to review sources and export.",
    ].join("\n"),
    "/reports/builder",
    deps,
  );
}

/**
 * Hard safety: assistant layer must never call approve APIs.
 * Exposed for tests and callers to assert the invariant.
 */
export function assistantMayAutoApprove(): false {
  return false;
}

export function assistantMayBypassRls(): false {
  return false;
}
