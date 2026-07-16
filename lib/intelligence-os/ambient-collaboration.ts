/**
 * EPIC-13.4 — Ambient collaboration guidance without fake people or institutions.
 */

import type { Mission } from "@/lib/intelligence-os/mission.types";

export type CollaborationGuidance = {
  readonly expertiseNeeded: string | null;
  readonly whyRelevant: string;
  readonly evidenceGap: string | null;
  readonly roleDescription: string;
  readonly unknown: string;
  readonly externalMatchingConnected: false;
  readonly href: string;
};

export function deriveCollaborationGuidance(mission: Mission | null): CollaborationGuidance | null {
  if (!mission) return null;

  const needsExpertise = mission.capabilitiesNeeded.trim();
  const gap = mission.evidenceMissing.trim();

  if (!needsExpertise && !gap) return null;

  return {
    expertiseNeeded: needsExpertise || null,
    whyRelevant: needsExpertise
      ? "Mission documents required capabilities that current evidence may not cover."
      : "Evidence gaps suggest complementary expertise may strengthen conclusions.",
    evidenceGap: gap || null,
    roleDescription: needsExpertise
      ? "Contributor could validate methods, source quality, or domain-specific claims."
      : "Contributor could help locate independent sources for documented gaps.",
    unknown: "No external collaborator network is connected — requirements only, not availability.",
    externalMatchingConnected: false,
    href: "/trust",
  };
}
