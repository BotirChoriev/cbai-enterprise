/**
 * EPIC-13.4 — Floating Intelligence Presence: one primary intervention with full contract.
 */

import { deriveAmbientInsight } from "@/lib/intelligence-os/ambient-intelligence";
import { deriveEvidencePulse } from "@/lib/intelligence-os/evidence-pulse";
import type { Mission } from "@/lib/intelligence-os/mission.types";
import type { WorkspaceRole } from "@/lib/assistant/assistant-profile";
import type { UniversalObjectRef } from "@/lib/intelligence-os/universal-object";

export type FloatingIntelligenceIntervention = {
  readonly observationKey: string;
  readonly reasonKey: string;
  readonly evidenceBasis: string;
  readonly limitation: string;
  readonly suggestedActionHref: string | null;
  readonly requiresHumanJudgment: boolean;
  readonly attachedTo: UniversalObjectRef | "workspace";
};

export function deriveFloatingIntelligence(
  mission: Mission | null,
  operatorName: string,
  role: WorkspaceRole | null,
  focusedObject: UniversalObjectRef | null,
): FloatingIntelligenceIntervention | null {
  if (mission) {
    const insight = deriveAmbientInsight(mission, operatorName, role);
    const pulse = deriveEvidencePulse(mission);
    if (insight) {
      return {
        observationKey: insight.messageKey,
        reasonKey: insight.reasonKey,
        evidenceBasis: pulse.label,
        limitation: pulse.limitation,
        suggestedActionHref: insight.href ?? null,
        requiresHumanJudgment:
          insight.id === "conflicting-evidence" || insight.id === "impact-not-reviewed",
        attachedTo: focusedObject ?? { type: "mission", id: mission.id },
      };
    }
  }

  if (!mission) {
    const insight = deriveAmbientInsight(null, operatorName, role);
    if (!insight) return null;
    return {
      observationKey: insight.messageKey,
      reasonKey: insight.reasonKey,
      evidenceBasis: "No mission-linked evidence",
      limitation: "Begin a mission to attach evidence and trust signals.",
      suggestedActionHref: insight.href ?? "/",
      requiresHumanJudgment: true,
      attachedTo: "workspace",
    };
  }

  return null;
}
