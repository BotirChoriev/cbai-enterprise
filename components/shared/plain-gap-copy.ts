import type { EvidenceGapRecord } from "@/lib/evidence-gap";

export function plainMissingReason(
  reason: EvidenceGapRecord["missingReason"],
): string | null {
  if (!reason) return null;

  switch (reason) {
    case "Evidence source not connected":
      return "Integration status: Not connected. The official source is registered but not linked to this profile.";
    case "Connector planned":
      return "Integration status: Planned. Awaiting official source connector — no estimated availability date.";
    case "Indicator not mapped":
      return "Integration status: Missing. No official source mapping exists for this indicator yet.";
    case "Methodology pending":
      return "Integration status: Verification pending. Review methodology for this topic is not finalized.";
    case "Official source unavailable":
      return "Integration status: Blocked. The designated official source is no longer available.";
    case "Verification pending":
      return "Integration status: Verification pending. Human review is required before this source can be shown.";
    default:
      return "Integration status: Missing. Official information for this topic is not available yet.";
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
