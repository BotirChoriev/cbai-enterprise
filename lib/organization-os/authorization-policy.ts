/**
 * BUILD-029 — Central organization authorization policy.
 * UI hiding is not protection — all mutations must call this layer.
 */

import type { OrganizationPermission } from "@/lib/organization-os/permissions-service";
import { evaluateOrganizationPermission } from "@/lib/organization-os/permissions-service";
import { loadOrganization } from "@/lib/organization-os/organization-store";

export type OrganizationAction =
  | "organization.view"
  | "organization.edit"
  | "organization.delete"
  | "organization.manage_settings"
  | "membership.view"
  | "membership.invite"
  | "membership.change_role"
  | "membership.remove"
  | "mission.create"
  | "mission.link"
  | "mission.view"
  | "mission.edit"
  | "project.create"
  | "project.view"
  | "project.edit"
  | "source.view"
  | "source.link"
  | "evidence.view"
  | "evidence.add"
  | "evidence.review"
  | "report.create"
  | "report.view"
  | "report.edit"
  | "collaboration.create"
  | "collaboration.manage"
  | "audit.view";

export type AuthorizationErrorCode =
  | "not_authenticated"
  | "not_authorized"
  | "not_found"
  | "validation_failed"
  | "shared_backend_not_configured";

export type AuthorizationResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly code: AuthorizationErrorCode; readonly message: string };

const ACTION_TO_PERMISSION: Partial<Record<OrganizationAction, OrganizationPermission>> = {
  "organization.view": "view_organization",
  "organization.edit": "edit_organization",
  "organization.manage_settings": "edit_organization",
  "membership.view": "view_organization",
  "membership.invite": "invite_members",
  "membership.change_role": "manage_members",
  "membership.remove": "remove_members",
  "mission.create": "create_mission",
  "mission.link": "link_mission",
  "mission.view": "view_private_mission",
  "mission.edit": "edit_mission",
  "project.view": "view_private_mission",
  "project.edit": "edit_mission",
  "project.create": "create_mission",
  "source.view": "view_private_mission",
  "source.link": "add_evidence",
  "evidence.view": "view_private_mission",
  "evidence.add": "add_evidence",
  "evidence.review": "review_evidence",
  "report.create": "create_report",
  "report.view": "view_private_mission",
  "report.edit": "create_report",
  "collaboration.create": "manage_collaboration",
  "collaboration.manage": "manage_collaboration",
  "audit.view": "view_audit_history",
};

export function authorizeOrganizationAction(input: {
  readonly actorId: string | null;
  readonly organizationId: string;
  readonly action: OrganizationAction;
  readonly resourceId?: string | null;
}): AuthorizationResult {
  if (!input.actorId) {
    return { ok: false, code: "not_authenticated", message: "Sign in to perform this action." };
  }
  const org = loadOrganization(input.organizationId);
  if (!org) {
    return { ok: false, code: "not_found", message: "Organization not found." };
  }
  const permission = ACTION_TO_PERMISSION[input.action];
  if (!permission) {
    return { ok: false, code: "not_authorized", message: "Action is not authorized." };
  }
  if (!evaluateOrganizationPermission(input.actorId, input.organizationId, permission)) {
    return { ok: false, code: "not_authorized", message: "You do not have permission for this action." };
  }
  return { ok: true };
}
