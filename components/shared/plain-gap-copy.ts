import type { EvidenceGapRecord } from "@/lib/evidence-gap";

/** Dictionary key for a machine reason — used with useTranslation so every locale renders localized copy. */
export function missingReasonKey(reason: EvidenceGapRecord["missingReason"]): string | null {
  if (!reason) return null;
  switch (reason) {
    case "Evidence source not connected":
      return "entityIntelligence.gapReasonNotConnected";
    case "Connector planned":
      return "entityIntelligence.gapReasonConnectorPlanned";
    case "Indicator not mapped":
      return "entityIntelligence.gapReasonNotMapped";
    case "Methodology pending":
      return "entityIntelligence.gapReasonMethodologyPending";
    case "Official source unavailable":
      return "entityIntelligence.gapReasonSourceUnavailable";
    case "Verification pending":
      return "entityIntelligence.gapReasonVerificationPending";
    default:
      return "entityIntelligence.gapReasonDefault";
  }
}

/** Dictionary key + interpolation source for the next-step sentence. */
export function gapNextStepKey(
  gap: Pick<EvidenceGapRecord, "currentStatus" | "expectedSource">,
): { key: string; source: string | null } {
  switch (gap.currentStatus) {
    case "available":
      return { key: "entityIntelligence.gapNextAvailable", source: null };
    case "planned":
      return gap.expectedSource
        ? { key: "entityIntelligence.gapNextPlanned", source: gap.expectedSource }
        : { key: "entityIntelligence.gapNextPlannedNoSource", source: null };
    case "blocked":
      return { key: "entityIntelligence.gapNextBlocked", source: null };
    case "missing":
    default:
      return gap.expectedSource
        ? { key: "entityIntelligence.gapNextMissing", source: gap.expectedSource }
        : { key: "entityIntelligence.gapNextMissingNoSource", source: null };
  }
}

/** Dictionary key for the honest four-state evidence status badge. */
export function gapStatusKey(status: EvidenceGapRecord["currentStatus"]): string {
  switch (status) {
    case "available":
      return "entityIntelligence.gapStatusAvailable";
    case "planned":
      return "entityIntelligence.gapStatusPlanned";
    case "missing":
      return "entityIntelligence.gapStatusMissing";
    case "blocked":
      return "entityIntelligence.gapStatusBlocked";
  }
}

export function plainMissingReason(
  reason: EvidenceGapRecord["missingReason"],
): string | null {
  if (!reason) return null;

  switch (reason) {
    case "Evidence source not connected":
      return "The official source is not available on this profile yet.";
    case "Connector planned":
      return "The official source is planned but not available yet.";
    case "Indicator not mapped":
      return "No official source is linked to this topic yet.";
    case "Methodology pending":
      return "The review method for this topic is not finalized yet.";
    case "Official source unavailable":
      return "The official source is no longer available.";
    case "Verification pending":
      return "The official source is awaiting review before it can be shown.";
    default:
      return "Official information for this topic is not available yet.";
  }
}

export function plainGapNextStep(
  gap: Pick<EvidenceGapRecord, "currentStatus" | "expectedSource">,
): string {
  switch (gap.currentStatus) {
    case "available":
      return "Review this information before you use it in a decision.";
    case "planned":
      return gap.expectedSource
        ? `Check back when ${gap.expectedSource} is available on this profile.`
        : "Check back when the official source is available on this profile.";
    case "blocked":
      return "This topic cannot be filled from current official sources.";
    case "missing":
    default:
      return gap.expectedSource
        ? `Official information from ${gap.expectedSource} is not connected yet.`
        : "Official information for this topic is not connected yet.";
  }
}
