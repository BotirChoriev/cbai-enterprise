/**
 * EPIC-13.3 — Mental model: every space answers where, why, happening, unfinished, next, changed.
 */

import { deriveAdaptiveIntelligence } from "@/lib/intelligence-os/adaptive-intelligence";
import { deriveCurrentFlowStage, deriveIntelligenceFlow } from "@/lib/intelligence-os/intelligence-flow";
import { deriveWhatChanged, recordFlowSnapshot } from "@/lib/intelligence-os/living-memory";
import {
  intelligenceSpaceI18nKey,
  resolveIntelligenceSpace,
  type IntelligenceSpaceId,
} from "@/lib/intelligence-os/intelligence-spaces";
import { deriveEvidencePulse } from "@/lib/intelligence-os/evidence-pulse";
import type { Mission } from "@/lib/intelligence-os/mission.types";
import type { CapabilityPassport } from "@/lib/capability/capability-passport.types";
import type { WorkspaceRole } from "@/lib/assistant/assistant-profile";

export type MentalModelSnapshot = {
  readonly whereSpaceId: IntelligenceSpaceId;
  readonly whereLabelKey: ReturnType<typeof intelligenceSpaceI18nKey>;
  readonly why: string;
  readonly happening: string;
  readonly unfinished: string;
  readonly nextHref: string;
  readonly nextLabel: string;
  readonly changedKey: string | null;
};

export function deriveMentalModel(
  pathname: string,
  mission: Mission | null,
  passport: CapabilityPassport,
  rolePreference: WorkspaceRole | null,
): MentalModelSnapshot {
  const spaceId = resolveIntelligenceSpace(pathname);
  const flow = deriveIntelligenceFlow(mission);
  recordFlowSnapshot(mission?.id ?? null, flow);
  const changedKey = deriveWhatChanged(flow);
  const current = deriveCurrentFlowStage(mission);
  const pulse = deriveEvidencePulse(mission);
  const adaptive = deriveAdaptiveIntelligence(passport, rolePreference);

  const why = mission?.whyExists?.trim()
    ? mission.whyExists
    : mission?.problem?.trim()
      ? mission.problem
      : "begin-mission";

  const happening = pulse.label;

  const unfinished = current
    ? `${current.label}: ${current.detail}`
    : mission
      ? "flow-complete"
      : "no-mission";

  const nextHref = current?.href ?? adaptive.suggestedRoutes[0] ?? "/my-work";
  const nextLabel = current?.label ?? adaptive.explanation;

  return {
    whereSpaceId: spaceId,
    whereLabelKey: intelligenceSpaceI18nKey(spaceId),
    why,
    happening,
    unfinished,
    nextHref,
    nextLabel,
    changedKey,
  };
}
