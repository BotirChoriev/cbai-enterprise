// Phase 6 — Digital Assistant action layer.
// Run with: npm run test:phase-6-assistant-actions

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  ASSISTANT_ACTION_CATALOG,
  DIGITAL_ASSISTANT_ACTIONS_VERSION,
  assistantMayAutoApprove,
  assistantMayBypassRls,
  clearAssistantActionAuditForTests,
  draftApprovalRequestAction,
  draftMissionAction,
  draftReportAction,
  draftTaskAction,
  listMentionsAction,
  listMissionsAction,
  listPendingApprovalsAction,
  loadAssistantActionAudit,
  missingEvidenceAction,
  navigateAction,
  orgActivitySummaryAction,
  resolveDigitalAssistantAction,
} from "@/lib/digital-assistant-actions";

function readSource(relativePath: string): string {
  return readFileSync(join(process.cwd(), relativePath), "utf-8");
}

test("1. Catalog covers read + draft + navigate kinds", () => {
  assert.equal(DIGITAL_ASSISTANT_ACTIONS_VERSION, "1.0.0-phase6");
  const kinds = ASSISTANT_ACTION_CATALOG.map((a) => a.kind);
  for (const kind of [
    "list_missions",
    "list_pending_approvals",
    "list_mentions",
    "org_activity_summary",
    "missing_evidence",
    "navigate",
    "draft_mission",
    "draft_task",
    "draft_approval_request",
    "draft_report",
  ]) {
    assert.ok(kinds.includes(kind as (typeof kinds)[number]), kind);
  }
  assert.ok(ASSISTANT_ACTION_CATALOG.every((a) => (a.mode === "draft") === a.confirmationRequired));
});

test("2. READ actions complete without confirmation and audit", () => {
  clearAssistantActionAuditForTests();
  const missions = listMissionsAction({
    actorId: "user-1",
    listMissions: () => [
      { missionId: "m1", stage: "define", taskCount: 1, updatedAt: "2026-01-01T00:00:00.000Z" },
    ],
  });
  assert.equal(missions.mode, "read");
  assert.equal(missions.confirmationRequired, false);
  assert.equal(missions.outcome, "completed");

  const approvals = listPendingApprovalsAction({
    actorId: "user-1",
    listPendingApprovals: () => [
      {
        id: "apr-1",
        title: "Review pack",
        organizationId: "org-1",
        status: "pending",
        assignedTo: "user-1",
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    ],
  });
  assert.equal(approvals.outcome, "completed");
  assert.match(approvals.assistantText, /Never auto-approved/);

  const mentions = listMentionsAction({
    actorId: "user-1",
    listMentions: () => [
      {
        id: "men-1",
        organizationId: "org-1",
        mentionedBy: "alice",
        targetType: "mission",
        targetId: "m1",
        createdAt: "2026-01-01T00:00:00.000Z",
        unread: true,
      },
    ],
  });
  assert.equal(mentions.outcome, "completed");

  const org = orgActivitySummaryAction({
    actorId: "user-1",
    orgActivity: () => ({
      organizationId: "org-1",
      eventCount: 1,
      recentEvents: [{ event: "approval_requested", actorDisplayName: "alice", timestamp: "2026-01-01T00:00:00.000Z" }],
      isolationNote: "Org activity summary never includes organizations you are not a member of.",
    }),
  });
  assert.equal(org.outcome, "completed");

  const missing = missingEvidenceAction({
    actorId: "user-1",
    missingEvidence: () => [
      { missionId: "m1", requirementId: "req-1", description: "Primary source", evidenceId: null },
    ],
  });
  assert.equal(missing.outcome, "completed");

  const audit = loadAssistantActionAudit();
  assert.ok(audit.length >= 5);
  assert.ok(audit.every((e) => e.mode === "read" || e.kind.length > 0));
});

test("3. DRAFT actions require confirmation and are not completed", () => {
  clearAssistantActionAuditForTests();
  const mission = draftMissionAction("Assess trade corridors", { actorId: "user-1" });
  assert.equal(mission.mode, "draft");
  assert.equal(mission.confirmationRequired, true);
  assert.equal(mission.outcome, "draft_pending_confirmation");
  assert.equal(mission.draft?.draftKind, "mission");

  const task = draftTaskAction({ missionId: "m1", title: "Collect sources" }, { actorId: "user-1" });
  assert.equal(task.outcome, "draft_pending_confirmation");

  const approval = draftApprovalRequestAction({ title: "Approve memo" }, { actorId: "user-1" });
  assert.equal(approval.outcome, "draft_pending_confirmation");
  assert.match(approval.assistantText, /never auto-approves/i);

  const report = draftReportAction({ reportType: "executive" }, { actorId: "user-1" });
  assert.equal(report.outcome, "draft_pending_confirmation");
  assert.equal(report.href, "/reports/builder");

  assert.equal(assistantMayAutoApprove(), false);
  assert.equal(assistantMayBypassRls(), false);
});

test("4. Navigate resolves allowed routes only", () => {
  clearAssistantActionAuditForTests();
  const nav = navigateAction("open approvals", { actorId: "user-1" });
  assert.ok(nav);
  assert.equal(nav.href, "/approvals");
  assert.equal(nav.outcome, "completed");
  assert.equal(navigateAction("open /admin/secrets"), null);
});

test("5. Intent resolver distinguishes draft vs completed", () => {
  clearAssistantActionAuditForTests();
  const draft = resolveDigitalAssistantAction("draft a mission about energy policy", {
    actorId: "user-1",
  });
  assert.ok(draft);
  assert.equal(draft.outcome, "draft_pending_confirmation");
  assert.notEqual(draft.outcome, "completed");

  const read = resolveDigitalAssistantAction("list missions", {
    actorId: "user-1",
    listMissions: () => [],
  });
  assert.ok(read);
  assert.equal(read.kind, "list_missions");
  assert.equal(read.outcome, "empty");
});

test("6. Digital Assistant wires Phase 6 resolver", () => {
  const source = readSource("lib/voice-operator/digital-assistant.ts");
  assert.match(source, /resolveDigitalAssistantAction/);
  assert.match(source, /digital-assistant-actions/);
  assert.match(source, /confirmationRequired/);
});
