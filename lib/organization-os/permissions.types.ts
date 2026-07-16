/**
 * EPIC-05 — Permission-ready architecture (no auth implementation).
 */

export type PermissionScope =
  | "organization"
  | "workspace"
  | "mission"
  | "object"
  | "evidence"
  | "decision"
  | "report"
  | "comment";

export type PermissionAction = "read" | "write" | "review" | "approve" | "admin";

export type PermissionGrant = {
  readonly scope: PermissionScope;
  readonly action: PermissionAction;
  readonly resourceId: string;
  readonly subjectRef: string;
};

export type PermissionMatrix = {
  readonly grants: readonly PermissionGrant[];
  readonly authConnected: false;
  readonly limitation: string;
};

export function emptyPermissionMatrix(): PermissionMatrix {
  return {
    grants: [],
    authConnected: false,
    limitation:
      "Permission matrix is architecture-only. Organization RBAC and team policies require EPIC-15 auth integration.",
  };
}

export const PERMISSION_SCOPES: readonly PermissionScope[] = [
  "organization",
  "workspace",
  "mission",
  "object",
  "evidence",
  "decision",
  "report",
  "comment",
];
