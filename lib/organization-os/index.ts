/**
 * EPIC-05 — Organization Operating System public surface.
 */

export * from "@/lib/organization-os/organization.types";
export * from "@/lib/organization-os/organization-store";
export * from "@/lib/organization-os/organization-workspace";
export * from "@/lib/organization-os/team.types";
export * from "@/lib/organization-os/mission-room";
export * from "@/lib/organization-os/mission-discussion.types";
export * from "@/lib/organization-os/decision-ledger.types";
export * from "@/lib/organization-os/knowledge-contribution.types";
export * from "@/lib/organization-os/knowledge-dna";
export * from "@/lib/organization-os/mission-marketplace.types";
export * from "@/lib/organization-os/capability-matching";
export * from "@/lib/organization-os/permissions.types";
export * from "@/lib/organization-os/cloud-interfaces";
export * from "@/lib/organization-os/organization-inspector";

export const EPIC_05_MATURITY = {
  architecture: "foundation",
  multiUser: false,
  messaging: false,
  cloudSync: false,
  fakeCollaborators: false,
} as const;
