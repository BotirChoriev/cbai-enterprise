/**
 * EPIC-13.3 — Ambient intelligence: one meaningful insight with explained reason.
 */

import { deriveAdaptiveIntelligence } from "@/lib/intelligence-os/adaptive-intelligence";
import { deriveEvidencePulse } from "@/lib/intelligence-os/evidence-pulse";
import { loadHumanImpactForMission } from "@/lib/intelligence-os/human-impact-store";
import type { Mission } from "@/lib/intelligence-os/mission.types";
import { buildCapabilityPassport } from "@/lib/capability/capability-passport-builder";
import type { WorkspaceRole } from "@/lib/assistant/assistant-profile";

export type AmbientInsightId =
  | "conflicting-evidence"
  | "outdated-evidence"
  | "impact-not-reviewed"
  | "missing-expertise"
  | "discipline-may-help"
  | "no-mission";

export type AmbientInsight = {
  readonly id: AmbientInsightId;
  readonly messageKey:
    | "ambientConflictingEvidence"
    | "ambientOutdatedEvidence"
    | "ambientImpactNotReviewed"
    | "ambientMissingExpertise"
    | "ambientDisciplineMayHelp"
    | "ambientNoMission";
  readonly reasonKey:
    | "ambientConflictingEvidenceReason"
    | "ambientOutdatedEvidenceReason"
    | "ambientImpactNotReviewedReason"
    | "ambientMissingExpertiseReason"
    | "ambientDisciplineMayHelpReason"
    | "ambientNoMissionReason";
  readonly href?: string;
};

export function deriveAmbientInsight(
  mission: Mission | null,
  operatorName: string,
  rolePreference: WorkspaceRole | null,
): AmbientInsight | null {
  if (!mission) {
    return {
      id: "no-mission",
      messageKey: "ambientNoMission",
      reasonKey: "ambientNoMissionReason",
      href: "/",
    };
  }

  const pulse = deriveEvidencePulse(mission);
  const impact = loadHumanImpactForMission(mission.id);
  const q = mission.projectId ? `?project=${mission.projectId}` : "";

  if (pulse.state === "conflicting") {
    return {
      id: "conflicting-evidence",
      messageKey: "ambientConflictingEvidence",
      reasonKey: "ambientConflictingEvidenceReason",
      href: mission.projectId ? `/my-work${q}#project-evidence` : "/knowledge",
    };
  }

  if (pulse.state === "outdated") {
    return {
      id: "outdated-evidence",
      messageKey: "ambientOutdatedEvidence",
      reasonKey: "ambientOutdatedEvidenceReason",
      href: "/knowledge",
    };
  }

  if (!impact?.isComplete) {
    return {
      id: "impact-not-reviewed",
      messageKey: "ambientImpactNotReviewed",
      reasonKey: "ambientImpactNotReviewedReason",
      href: mission.projectId ? `/my-work${q}#human-impact` : "/my-work",
    };
  }

  if (mission.capabilitiesNeeded.trim().length > 5 && mission.evidenceMissing.trim().length > 5) {
    return {
      id: "missing-expertise",
      messageKey: "ambientMissingExpertise",
      reasonKey: "ambientMissingExpertiseReason",
      href: "/trust",
    };
  }

  const passport = buildCapabilityPassport(operatorName);
  const adaptive = deriveAdaptiveIntelligence(passport, rolePreference);
  if (
    adaptive.mode === "capability" &&
    adaptive.primaryFocus &&
    mission.disciplines.length > 0 &&
    !mission.disciplines.includes(adaptive.primaryFocus)
  ) {
    return {
      id: "discipline-may-help",
      messageKey: "ambientDisciplineMayHelp",
      reasonKey: "ambientDisciplineMayHelpReason",
      href: adaptive.suggestedRoutes[0] ?? "/research",
    };
  }

  return null;
}
