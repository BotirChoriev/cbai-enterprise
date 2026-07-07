import type { EvidenceGapRecord } from "@/lib/evidence-gap";

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
