/**
 * Phase 3 — Ten user modes (personal preference layer).
 *
 * These modes shape default dashboards and suggestion hints only.
 * They do NOT replace organization RBAC, membership roles, or auth permissions.
 */

export type UserModeId =
  | "general"
  | "senior_executive"
  | "journalist"
  | "investor"
  | "business_owner"
  | "academic"
  | "politician"
  | "legal"
  | "economist"
  | "student";

export type UserModeCatalogEntry = {
  readonly id: UserModeId;
  readonly label: string;
  readonly description: string;
  readonly defaultDashboardHref: string;
  readonly suggestedModules: readonly string[];
};

export type SelectedUserModeState = {
  readonly modeId: UserModeId;
  readonly updatedAt: string;
};
