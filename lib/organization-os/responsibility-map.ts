import type {
  OrganizationMembership,
  OrganizationRole,
} from "@/lib/organization-os/organization-membership-store";

export type ResponsibilityRole =
  | "problem_owner"
  | "evidence_contributor"
  | "evidence_reviewer"
  | "scenario_reviewer"
  | "decision_owner"
  | "action_owner"
  | "monitoring_owner"
  | "observer";

export type ResponsibilityAssignment = {
  readonly role: ResponsibilityRole;
  readonly memberId: string | null;
  readonly suggested: boolean;
};

export type ResponsibilityConflict =
  | "decision_owner_is_evidence_reviewer"
  | "decision_owner_is_only_scenario_reviewer"
  | "problem_has_no_independent_monitor";

export type ResponsibilityMapDraft = {
  readonly assignments: readonly ResponsibilityAssignment[];
  readonly gaps: readonly ResponsibilityRole[];
  readonly conflicts: readonly ResponsibilityConflict[];
  readonly readyForHumanReview: boolean;
  readonly persistence: "session_draft_only";
};

export const RESPONSIBILITY_ROLES: readonly ResponsibilityRole[] = [
  "problem_owner",
  "evidence_contributor",
  "evidence_reviewer",
  "scenario_reviewer",
  "decision_owner",
  "action_owner",
  "monitoring_owner",
  "observer",
];

const REQUIRED_ROLES: readonly ResponsibilityRole[] = [
  "problem_owner",
  "evidence_reviewer",
  "decision_owner",
  "monitoring_owner",
];

const ELIGIBLE_MEMBERSHIP_ROLES: Readonly<Record<ResponsibilityRole, readonly OrganizationRole[]>> = {
  problem_owner: ["owner", "administrator", "mission_lead"],
  evidence_contributor: ["researcher", "mission_lead", "administrator", "owner"],
  evidence_reviewer: ["reviewer", "mission_lead", "administrator", "owner"],
  scenario_reviewer: ["reviewer", "researcher", "mission_lead", "administrator", "owner"],
  decision_owner: ["owner", "administrator", "mission_lead"],
  action_owner: ["mission_lead", "administrator", "owner", "member"],
  monitoring_owner: ["reviewer", "mission_lead", "administrator", "owner"],
  observer: ["guest", "member", "reviewer", "researcher", "mission_lead", "administrator", "owner"],
};

function suggestedMemberId(
  members: readonly OrganizationMembership[],
  role: ResponsibilityRole,
): string | null {
  const eligible = ELIGIBLE_MEMBERSHIP_ROLES[role];
  return [...members]
    .sort((left, right) => eligible.indexOf(left.role) - eligible.indexOf(right.role))
    .find((member) => eligible.includes(member.role))?.id ?? null;
}

export function detectResponsibilityConflicts(
  assignments: readonly ResponsibilityAssignment[],
): ResponsibilityConflict[] {
  const byRole = new Map(assignments.map((assignment) => [assignment.role, assignment.memberId]));
  const conflicts: ResponsibilityConflict[] = [];
  const decisionOwner = byRole.get("decision_owner");
  const problemOwner = byRole.get("problem_owner");

  if (decisionOwner && decisionOwner === byRole.get("evidence_reviewer")) {
    conflicts.push("decision_owner_is_evidence_reviewer");
  }
  if (decisionOwner && decisionOwner === byRole.get("scenario_reviewer")) {
    conflicts.push("decision_owner_is_only_scenario_reviewer");
  }
  if (problemOwner && problemOwner === byRole.get("monitoring_owner")) {
    conflicts.push("problem_has_no_independent_monitor");
  }
  return conflicts;
}

export function deriveResponsibilityMapDraft(
  members: readonly OrganizationMembership[],
  overrides: Readonly<Partial<Record<ResponsibilityRole, string | null>>> = {},
): ResponsibilityMapDraft {
  const assignments = RESPONSIBILITY_ROLES.map((role) => {
    const hasOverride = Object.prototype.hasOwnProperty.call(overrides, role);
    return {
      role,
      memberId: hasOverride ? overrides[role] ?? null : suggestedMemberId(members, role),
      suggested: !hasOverride,
    };
  });
  const gaps = REQUIRED_ROLES.filter(
    (role) => assignments.find((assignment) => assignment.role === role)?.memberId == null,
  );
  const conflicts = detectResponsibilityConflicts(assignments);
  return {
    assignments,
    gaps,
    conflicts,
    readyForHumanReview: gaps.length === 0 && conflicts.length === 0,
    persistence: "session_draft_only",
  };
}

export function confirmResponsibilityMapDraft(
  draft: ResponsibilityMapDraft,
  humanConfirmed: boolean,
): ResponsibilityMapDraft | null {
  if (!humanConfirmed || !draft.readyForHumanReview) return null;
  return draft;
}
