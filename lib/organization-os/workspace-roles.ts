/**
 * Workspace invite/display roles for Organization Workspace UI.
 * Storage roles map to organization_memberships.role (RLS-compatible text).
 * "admin" is the UI label for storage role "administrator".
 */

import type { OrganizationRole } from "@/lib/organization-os/organization-membership-store";

export type WorkspaceMemberRoleId = "owner" | "admin" | "reviewer" | "analyst" | "viewer";

export type WorkspaceMemberRoleOption = {
  readonly id: WorkspaceMemberRoleId;
  readonly label: string;
  readonly storageRole: OrganizationRole;
  readonly description: string;
  /** Roles that can be selected when inviting (owner is not inviteable). */
  readonly inviteable: boolean;
};

export const WORKSPACE_MEMBER_ROLES: readonly WorkspaceMemberRoleOption[] = [
  {
    id: "owner",
    label: "Owner",
    storageRole: "owner",
    description: "Full control of the organization.",
    inviteable: false,
  },
  {
    id: "admin",
    label: "Admin",
    storageRole: "administrator",
    description: "Manage members, missions, and approvals.",
    inviteable: true,
  },
  {
    id: "reviewer",
    label: "Reviewer",
    storageRole: "reviewer",
    description: "Review evidence and decide approvals.",
    inviteable: true,
  },
  {
    id: "analyst",
    label: "Analyst",
    storageRole: "analyst",
    description: "Work with evidence and reports.",
    inviteable: true,
  },
  {
    id: "viewer",
    label: "Viewer",
    storageRole: "viewer",
    description: "Read-only organization access.",
    inviteable: true,
  },
] as const;

export const INVITEABLE_WORKSPACE_ROLES = WORKSPACE_MEMBER_ROLES.filter((r) => r.inviteable);

export function storageRoleFromWorkspaceId(id: WorkspaceMemberRoleId): OrganizationRole {
  const found = WORKSPACE_MEMBER_ROLES.find((r) => r.id === id);
  return found?.storageRole ?? "viewer";
}

export function displayLabelForStorageRole(role: string): string {
  const found = WORKSPACE_MEMBER_ROLES.find((r) => r.storageRole === role);
  if (found) return found.label;
  if (role === "administrator") return "Admin";
  return role;
}
