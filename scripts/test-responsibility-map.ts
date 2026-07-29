import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  confirmResponsibilityMapDraft,
  deriveResponsibilityMapDraft,
} from "@/lib/organization-os/responsibility-map";
import type { OrganizationMembership } from "@/lib/organization-os/organization-membership-store";

function member(id: string, role: OrganizationMembership["role"]): OrganizationMembership {
  return {
    id,
    organizationId: "org-responsibility-test",
    userId: `user-${id}`,
    userDisplayName: id,
    role,
    version: 1,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
}

function source(path: string): string {
  return readFileSync(join(process.cwd(), path), "utf8");
}

test("empty organization exposes required responsibility gaps", () => {
  const draft = deriveResponsibilityMapDraft([]);
  assert.equal(draft.readyForHumanReview, false);
  assert.deepEqual(draft.gaps, ["problem_owner", "evidence_reviewer", "decision_owner", "monitoring_owner"]);
  assert.equal(draft.persistence, "session_draft_only");
});

test("single owner exposes concentration-of-authority conflicts", () => {
  const draft = deriveResponsibilityMapDraft([member("Owner", "owner")]);
  assert.ok(draft.conflicts.includes("decision_owner_is_evidence_reviewer"));
  assert.ok(draft.conflicts.includes("problem_has_no_independent_monitor"));
  assert.equal(draft.readyForHumanReview, false);
});

test("separated responsibilities can reach human review", () => {
  const members = [
    member("Owner", "owner"),
    member("Reviewer", "reviewer"),
    member("Lead", "mission_lead"),
  ];
  const draft = deriveResponsibilityMapDraft(members, {
    problem_owner: "Lead",
    evidence_reviewer: "Reviewer",
    scenario_reviewer: "Reviewer",
    decision_owner: "Owner",
    action_owner: "Lead",
    monitoring_owner: "Reviewer",
  });
  assert.equal(draft.gaps.length, 0);
  assert.equal(draft.conflicts.length, 0);
  assert.equal(draft.readyForHumanReview, true);
  assert.equal(confirmResponsibilityMapDraft(draft, false), null);
  assert.equal(confirmResponsibilityMapDraft(draft, true), draft);
});

test("responsibility UI is honest session state and performs no persistence mutation", () => {
  const ui = source("components/organization/ResponsibilityMapPanel.tsx");
  assert.match(ui, /session_draft_only|Session draft only/);
  assert.match(ui, /confirmResponsibilityMapDraft/);
  assert.match(ui, /voice\.setTextInput/);
  assert.match(ui, /conflictLabels\[conflict\]/);
  assert.doesNotMatch(ui, /supabase|repository|persist|updateOrganization|changeMemberRole/i);
});

test("organization page renders responsibility map only inside a real selected organization", () => {
  const page = source("components/organization/OrganizationPageClient.tsx");
  const selectedBlock = page.slice(page.indexOf("{selectedOrg ?"), page.indexOf("{feedback ?"));
  assert.match(selectedBlock, /ResponsibilityMapPanel/);
  assert.match(selectedBlock, /members=\{members\}/);
});
