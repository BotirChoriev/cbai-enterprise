/**
 * Voice action outcome helpers — honest announce after execution success only.
 */

import type { CapabilityId, VoiceActionOutcome, VoiceActionOutcomeKind } from "@/lib/platform-capabilities/capability-registry";

export function buildVoiceActionOutcome(input: {
  readonly kind: VoiceActionOutcomeKind;
  readonly capabilityId: CapabilityId | null;
  readonly understood: string;
  readonly action: string;
  readonly currentLocation: string;
  readonly navigatedHref?: string | null;
}): VoiceActionOutcome {
  const resultKey = `voiceActionOutcome.${input.kind}`;
  const nextStepKey =
    input.kind === "understood_and_executed"
      ? "voiceActionOutcome.nextContinue"
      : input.kind === "understood_confirmation_required"
        ? "voiceActionOutcome.nextConfirm"
        : input.kind === "understood_missing_information"
          ? "voiceActionOutcome.nextAnswer"
          : input.kind === "understood_capability_degraded" || input.kind === "understood_capability_unavailable"
            ? "voiceActionOutcome.nextAlternative"
            : input.kind === "navigation_failed"
              ? "voiceActionOutcome.nextStay"
              : "voiceActionOutcome.nextClarify";

  return {
    kind: input.kind,
    capabilityId: input.capabilityId,
    understood: input.understood,
    action: input.action,
    resultKey,
    currentLocation: input.currentLocation,
    nextStepKey,
    navigatedHref: input.navigatedHref ?? null,
  };
}

export function outcomeKindForUploadReadiness(readiness: "available" | "degraded" | "planned" | "unavailable"): VoiceActionOutcomeKind {
  if (readiness === "available") return "understood_confirmation_required";
  if (readiness === "degraded") return "understood_capability_degraded";
  return "understood_capability_unavailable";
}
