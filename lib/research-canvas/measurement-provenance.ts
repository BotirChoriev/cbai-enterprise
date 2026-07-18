/**
 * Universal Measurement & Verification — provenance kinds and transition gates.
 */

export const MEASUREMENT_PROVENANCE_KINDS = [
  "USER-PROVIDED",
  "EXTRACTED",
  "CALCULATED",
  "MEASURED",
  "ESTIMATED",
  "SIMULATED",
  "VALIDATED",
  "HUMAN-CONFIRMED",
  "UNKNOWN",
] as const;

export type MeasurementProvenanceKind = (typeof MEASUREMENT_PROVENANCE_KINDS)[number];

export function provenanceDisplayLabel(kind: MeasurementProvenanceKind): string {
  switch (kind) {
    case "CALCULATED":
      return "Calculated — not a physical measurement";
    case "EXTRACTED":
      return "Machine-extracted — requires human confirmation";
    case "MEASURED":
      return "Measured — method and instrument documented";
    case "VALIDATED":
      return "Validated — reviewer and uncertainty documented";
    case "SIMULATED":
      return "Simulated — not an experimental result";
    default:
      return kind.replace(/-/g, " ");
  }
}

export function canTransitionToValidated(input: {
  result: string;
  unit: string;
  methodId: string;
  rawDataReference: string;
  reviewer: string;
  uncertainty: string;
  uncertaintyLimitation: string;
}): { ok: boolean; gaps: string[] } {
  const gaps: string[] = [];
  if (!input.result.trim()) gaps.push("Result value required.");
  if (!input.unit.trim()) gaps.push("Unit required.");
  if (!input.methodId.trim()) gaps.push("Method required.");
  if (!input.rawDataReference.trim()) gaps.push("Raw data reference required.");
  if (!input.reviewer.trim()) gaps.push("Human reviewer required.");
  if (!input.uncertainty.trim() && !input.uncertaintyLimitation.trim()) {
    gaps.push("Uncertainty or explicit limitation required.");
  }
  return { ok: gaps.length === 0, gaps };
}

export function assertPhotoNotChemicalClaim(sourceKind: string): { allowed: false; reason: string } | { allowed: true } {
  if (sourceKind === "image" || sourceKind === "photo") {
    return {
      allowed: false,
      reason: "Chemical identity cannot be inferred from an ordinary photograph.",
    };
  }
  return { allowed: true };
}

export function assertScaleRequiredForRealWorldLength(hasReferenceScale: boolean): { ok: boolean; reason?: string } {
  if (!hasReferenceScale) {
    return {
      ok: false,
      reason: "Real-world dimensions require user-defined reference scale — pixel counts alone are not measurements.",
    };
  }
  return { ok: true };
}
