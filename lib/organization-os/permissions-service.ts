/**
 * BUILD-029 — Central permission evaluation for organization roles.
 */

import type { OrganizationRole } from "@/lib/organization-os/organization-membership-store";
import { loadMembershipForUser } from "@/lib/organization-os/organization-membership-store";

export type OrganizationPermission =
  | "view_organization"
  | "edit_organization"
  | "manage_members"
  | "invite_members"
  | "remove_members"
  | "create_mission"
  | "link_mission"
  | "view_private_mission"
  | "edit_mission"
  | "add_evidence"
  | "review_evidence"
  | "create_report"
  | "approve_internal_review"
  | "manage_collaboration"
  | "view_audit_history";

const ROLE_PERMISSIONS: Record<OrganizationRole, readonly OrganizationPermission[]> = {
  owner: [
    "view_organization",
    "edit_organization",
    "manage_members",
    "invite_members",
    "remove_members",
    "create_mission",
    "link_mission",
    "view_private_mission",
    "edit_mission",
    "add_evidence",
    "review_evidence",
    "create_report",
    "approve_internal_review",
    "manage_collaboration",
    "view_audit_history",
  ],
  administrator: [
    "view_organization",
    "edit_organization",
    "manage_members",
    "invite_members",
    "create_mission",
    "link_mission",
    "view_private_mission",
    "edit_mission",
    "add_evidence",
    "review_evidence",
    "create_report",
    "approve_internal_review",
    "manage_collaboration",
    "view_audit_history",
  ],
  mission_lead: [
    "view_organization",
    "create_mission",
    "link_mission",
    "view_private_mission",
    "edit_mission",
    "add_evidence",
    "review_evidence",
    "create_report",
    "manage_collaboration",
  ],
  researcher: ["view_organization", "view_private_mission", "add_evidence", "create_report"],
  analyst: ["view_organization", "view_private_mission", "add_evidence", "create_report", "review_evidence"],
  reviewer: ["view_organization", "view_private_mission", "review_evidence", "approve_internal_review"],
  member: ["view_organization", "view_private_mission"],
  viewer: ["view_organization"],
  guest: ["view_organization"],
};

export function evaluateOrganizationPermission(
  userId: string | null,
  organizationId: string,
  permission: OrganizationPermission,
): boolean {
  if (!userId) return false;
  const membership = loadMembershipForUser(userId, organizationId);
  if (!membership) return false;
  return ROLE_PERMISSIONS[membership.role].includes(permission);
}

export function permissionsForRole(role: OrganizationRole): readonly OrganizationPermission[] {
  return ROLE_PERMISSIONS[role];
}
