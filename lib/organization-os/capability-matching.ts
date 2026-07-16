/**
 * EPIC-05 — Collaborator matching: required capability only, never people.
 */

import type { Mission } from "@/lib/intelligence-os/mission.types";

export type CapabilityRequirement = {
  readonly capabilityLabel: string;
  readonly whyRequired: string;
  readonly evidenceGap: string | null;
  readonly roleInMission: string;
  readonly unknown: string;
};

export type CapabilityMatchingResult = {
  readonly requirements: readonly CapabilityRequirement[];
  readonly recommendsPeople: false;
  readonly externalMatchingConnected: false;
  readonly explanation: string;
};

export function deriveCapabilityRequirements(mission: Mission | null): CapabilityMatchingResult {
  if (!mission) {
    return {
      requirements: [],
      recommendsPeople: false,
      externalMatchingConnected: false,
      explanation: "No active mission — capability requirements cannot be derived.",
    };
  }

  const requirements: CapabilityRequirement[] = [];
  const gap = mission.evidenceMissing.trim();
  const capability = mission.capabilitiesNeeded.trim();

  if (capability) {
    requirements.push({
      capabilityLabel: capability,
      whyRequired: "Documented on the mission as required capability.",
      evidenceGap: gap || null,
      roleInMission: "Validate methods, source quality, or domain-specific claims.",
      unknown: "Availability is not assessed — requirement only.",
    });
  }

  if (gap && !capability) {
    requirements.push({
      capabilityLabel: "Complementary evidence expertise",
      whyRequired: "Mission documents evidence gaps that current references may not cover.",
      evidenceGap: gap,
      roleInMission: "Locate independent sources or validate gap closure.",
      unknown: "No person or institution is recommended.",
    });
  }

  if (gap && capability) {
    requirements.push({
      capabilityLabel: "Independent evidence review",
      whyRequired: `Two evidence gaps remain documented: ${gap}`,
      evidenceGap: gap,
      roleInMission: "Cross-check conclusions before impact or publication stages.",
      unknown: "Explainable requirement — not a collaborator recommendation.",
    });
  }

  const explanation =
    requirements.length === 0
      ? "Mission has no documented capability gaps."
      : requirements.length === 1
        ? `This mission currently lacks ${requirements[0].capabilityLabel} because ${requirements[0].evidenceGap ?? "documented mission gaps remain"}.`
        : "This mission documents multiple capability and evidence gaps — see requirements list.";

  return {
    requirements,
    recommendsPeople: false,
    externalMatchingConnected: false,
    explanation,
  };
}
