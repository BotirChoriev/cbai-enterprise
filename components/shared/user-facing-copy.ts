/** Strip internal identifiers and developer phrasing from user-visible strings. */
export function sanitizeDisplayLine(text: string): string {
  return text
    .replace(/\s*\([a-z][a-z0-9-]*\)/gi, "")
    .replace(/\s*—\s*evidence anchor [a-z0-9-]+/gi, "")
    .replace(/evidence anchor [a-z0-9-]+/gi, "official source")
    .replace(/\bindicator\(s\)/gi, "item(s)")
    .replace(/\bindicators\b/gi, "items")
    .replace(/\bindicator\b/gi, "item")
    .replace(/\bentity reference\(s\)/gi, "profile reference(s)")
    .replace(/\bdeclared indicators\b/gi, "required items")
    .replace(/\bevidence anchors\b/gi, "official sources")
    .replace(/\bGlobal Registry\b/gi, "available profiles")
    .replace(/\bregistry\b/gi, "profile list")
    .replace(/\bconnector(s)?\b/gi, "source$1")
    .replace(/\bpipeline\b/gi, "review")
    .replace(/\bframework\b/gi, "standards")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function sanitizeUserMessage(text: string | null | undefined): string | null {
  if (!text) return null;
  return sanitizeDisplayLine(text);
}

export function userConnectionLabel(label: string): string {
  switch (label) {
    case "Connected":
      return "Available now";
    case "Planned":
    case "Evidence source planned":
      return "Not yet available";
    case "Not Connected":
    case "Not connected":
      return "No source connected";
    case "Verification pending":
      return "Review pending";
    case "Deprecated":
      return "Retired";
    default:
      return sanitizeDisplayLine(label);
  }
}

export function userComparisonReadinessLabel(status: string): string {
  switch (status) {
    case "comparable":
      return "Ready to compare";
    case "partial":
      return "Partial overlap";
    case "insufficient_evidence":
      return "Limited evidence";
    case "unsupported":
      return "Not available";
    default:
      return sanitizeDisplayLine(status);
  }
}
