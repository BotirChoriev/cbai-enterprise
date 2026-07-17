/** BUILD-029 — Workspace organization vs external entity separation. */

import type { ProvenanceRecord } from "@/lib/knowledge-connectors/types";

export type OrganizationIdentityKind = "workspace_organization" | "external_organization_entity";

export type OrganizationEntityLinkState =
  | "suggested"
  | "requested"
  | "verified"
  | "rejected"
  | "revoked";

export type OrganizationEntityLink = {
  readonly id: string;
  readonly workspaceOrganizationId: string;
  readonly externalOrganizationEntityId: string;
  readonly state: OrganizationEntityLinkState;
  readonly provenance: readonly ProvenanceRecord[];
  readonly reviewedBy?: string | null;
  readonly reviewedAt?: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
};
