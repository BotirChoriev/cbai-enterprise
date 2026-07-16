/**
 * EPIC-05 — Organization Operating System types.
 * Architecture foundation — no fabricated organizations or members.
 */

export type OrganizationKind =
  | "company"
  | "university"
  | "research_center"
  | "government"
  | "hospital"
  | "ngo"
  | "startup"
  | "independent_laboratory"
  | "other";

export type OrganizationMaturity =
  | "architecture_only"
  | "device_local"
  | "cloud_ready"
  | "cloud_connected";

/** One organization — identity plus mission-aligned operating pillars. */
export type Organization = {
  readonly id: string;
  readonly name: string;
  readonly kind: OrganizationKind;
  readonly missionStatement: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly maturity: OrganizationMaturity;
};

/** Composed organization workspace — routes become views into shared org context. */
export type OrganizationWorkspace = {
  readonly organizationId: string | null;
  readonly organizationName: string | null;
  readonly kind: OrganizationKind | null;
  readonly activeMissionIds: readonly string[];
  readonly teamIds: readonly string[];
  readonly maturity: OrganizationMaturity;
  readonly cloudSyncConnected: false;
  readonly limitation: string;
};

/** Universal organization object contract — one grammar across org pillars. */
export type OrganizationObjectContract = {
  readonly identity: string | null;
  readonly mission: string | null;
  readonly knowledge: string | null;
  readonly evidence: string | null;
  readonly projects: string | null;
  readonly people: string | null;
  readonly capabilities: string | null;
  readonly trust: string | null;
  readonly reports: string | null;
  readonly impact: string | null;
  readonly legacy: string | null;
};

export const ORGANIZATION_KINDS: readonly OrganizationKind[] = [
  "company",
  "university",
  "research_center",
  "government",
  "hospital",
  "ngo",
  "startup",
  "independent_laboratory",
  "other",
];
