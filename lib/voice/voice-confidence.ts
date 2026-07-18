/** Speech recognition confidence — never fabricate scores the browser did not supply. */

export type ConfidencePresentation =
  | { readonly kind: "available"; readonly value: number }
  | { readonly kind: "unavailable" };

export function extractConfidenceFromResult(
  result: { confidence?: number } | undefined,
): ConfidencePresentation {
  if (result && typeof result.confidence === "number" && Number.isFinite(result.confidence)) {
    return { kind: "available", value: result.confidence };
  }
  return { kind: "unavailable" };
}

export function formatConfidenceLabel(presentation: ConfidencePresentation): string {
  if (presentation.kind === "available") {
    return `${Math.round(presentation.value * 100)}%`;
  }
  return "unavailable";
}

export function requiresHumanConfirmation(confidence: ConfidencePresentation, transcript: string): boolean {
  if (confidence.kind === "unavailable") return true;
  if (confidence.value < 0.65) return true;
  const trimmed = transcript.trim();
  if (trimmed.length < 3) return true;
  return false;
}
