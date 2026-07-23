/**
 * UI integration tests for enterprise collaboration surfaces (device-local path).
 * Live Preview proof remains npm run verify:live-enterprise-collaboration.
 */

import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { test } from "node:test";
import {
  INVITEABLE_WORKSPACE_ROLES,
  WORKSPACE_MEMBER_ROLES,
  displayLabelForStorageRole,
  storageRoleFromWorkspaceId,
} from "@/lib/organization-os/workspace-roles";
import { permissionsForRole } from "@/lib/organization-os/permissions-service";
import {
  clearEnterpriseApprovalsForTests,
  clearEnterpriseCommentsForTests,
  clearEnterpriseMentionsForTests,
  clearActiveEnterpriseContextForTests,
  createEnterpriseComment,
  extractMentionUserIds,
  requestEnterpriseApproval,
  decideEnterpriseApproval,
} from "@/lib/enterprise-collaboration";
import {
  clearOrganizationMembershipForTests,
  createOrganizationWithOwner,
  inviteOrganizationMember,
  acceptOrganizationInvitationByToken,
} from "@/lib/organization-os/organization-membership-store";
import { clearOrganizationsForTests } from "@/lib/organization-os/organization-store";
import { clearOrganizationAuditForTests } from "@/lib/organization-os/organization-audit-store";
import { clearNotificationsForTests, loadUserNotifications } from "@/lib/notifications/user-notification-store";

function reset() {
  clearOrganizationsForTests();
  clearOrganizationMembershipForTests();
  clearOrganizationAuditForTests();
  clearNotificationsForTests();
  clearEnterpriseCommentsForTests();
  clearEnterpriseMentionsForTests();
  clearEnterpriseApprovalsForTests();
  clearActiveEnterpriseContextForTests();
}

function assertSourceContains(relPath: string, needles: readonly string[]) {
  const abs = resolve(process.cwd(), relPath);
  assert.ok(existsSync(abs), `missing ${relPath}`);
  const src = readFileSync(abs, "utf8");
  for (const n of needles) {
    assert.ok(src.includes(n), `${relPath} should include ${JSON.stringify(n)}`);
  }
}

test("workspace roles expose owner/admin/reviewer/analyst/viewer", () => {
  assert.deepEqual(
    WORKSPACE_MEMBER_ROLES.map((r) => r.id),
    ["owner", "admin", "reviewer", "analyst", "viewer"],
  );
  assert.equal(storageRoleFromWorkspaceId("admin"), "administrator");
  assert.equal(displayLabelForStorageRole("administrator"), "Admin");
  assert.ok(INVITEABLE_WORKSPACE_ROLES.every((r) => r.id !== "owner"));
  assert.ok(permissionsForRole("analyst").includes("add_evidence"));
  assert.ok(permissionsForRole("viewer").includes("view_organization"));
  assert.ok(permissionsForRole("administrator").includes("approve_internal_review"));
});

test("organization workspace route and cloud-wired centers exist", () => {
  assertSourceContains("app/(dashboard)/organization/workspace/page.tsx", [
    "OrganizationWorkspace",
  ]);
  assertSourceContains("components/enterprise-collaboration/OrganizationWorkspace.tsx", [
    "persistEnterpriseComment",
    "persistApprovalRequest",
    "fetchOrganizationActivityEvents",
    "INVITEABLE_WORKSPACE_ROLES",
    "CollaborationStatePanel",
    "changeOrganizationMemberRoleCloud",
    "parentId",
    "Reply",
  ]);
  assertSourceContains("components/enterprise-collaboration/ApprovalCenter.tsx", [
    "persistApprovalRequest",
    "persistApprovalDecision",
    "fetchApprovalsForUser",
  ]);
  assertSourceContains("components/enterprise-collaboration/NotificationCenter.tsx", [
    "fetchInboxNotifications",
    "fetchMentionsForUser",
  ]);
  assertSourceContains("components/enterprise-collaboration/ActivityCenter.tsx", [
    "fetchOrganizationActivityEvents",
  ]);
  assertSourceContains("components/enterprise-collaboration/MissionDashboard.tsx", [
    "persistEnterpriseComment",
  ]);
  assertSourceContains("lib/enterprise-collaboration/cloud-persistence.ts", [
    "getSupabaseBrowserClient",
    "append_organization_activity",
    "from(\"enterprise_comments\")",
    "from(\"enterprise_approvals\")",
    "from(\"user_notifications\")",
  ]);
  const cloud = readFileSync(
    resolve(process.cwd(), "lib/enterprise-collaboration/cloud-persistence.ts"),
    "utf8",
  );
  assert.doesNotMatch(cloud, /SERVICE_ROLE|service_role|serviceRole/);
});

test("UI integration: comments mentions approvals notifications (device-local mirror of workspace flows)", () => {
  reset();
  const { organization } = createOrganizationWithOwner({
    name: "UI Org",
    kind: "research_center",
    ownerUserId: "owner-ui",
    ownerDisplayName: "Owner UI",
  });
  const invite = inviteOrganizationMember({
    organizationId: organization.id,
    inviterId: "owner-ui",
    inviterDisplayName: "Owner UI",
    inviteeEmail: "reviewer@example.com",
    role: "reviewer",
  });
  assert.ok(!("error" in invite));
  const accepted = acceptOrganizationInvitationByToken(
    invite.rawToken,
    "reviewer-ui",
    "Reviewer UI",
    "reviewer@example.com",
  );
  assert.ok(!("error" in accepted));

  const comment = createEnterpriseComment({
    organizationId: organization.id,
    authorId: "owner-ui",
    targetType: "mission",
    targetId: "organization-workspace",
    body: "Please review @reviewer-ui",
  });
  assert.ok(!("error" in comment));
  assert.deepEqual(extractMentionUserIds(comment.body), ["reviewer-ui"]);

  const approval = requestEnterpriseApproval({
    organizationId: organization.id,
    requestedBy: "owner-ui",
    assignedTo: "reviewer-ui",
    targetType: "mission",
    targetId: "organization-workspace",
    title: "Workspace publish",
  });
  assert.ok(!("error" in approval));
  const decided = decideEnterpriseApproval({
    approvalId: approval.id,
    actorId: "reviewer-ui",
    decision: "approved",
  });
  assert.ok(!("error" in decided));
  assert.equal(decided.status, "approved");

  const notes = loadUserNotifications("reviewer-ui");
  assert.ok(notes.length >= 1);
});
