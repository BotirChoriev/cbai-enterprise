/** Conservative blocklist — short unrelated transcripts must not map to navigation. */

const BLOCKED_PHRASES = ["salam step", "salam", "step take"] as const;

const BLOCKED_TOKENS = new Set(["take", "jaki", "baki", "step", "salam", "jaki"]);

export function isConservativelyBlockedInput(input: string): boolean {
  const normalized = input.trim().toLowerCase();
  if (!normalized) return true;

  if (BLOCKED_PHRASES.some((phrase) => normalized === phrase || normalized.includes(phrase))) {
    return true;
  }

  const tokens = normalized.split(/\s+/).filter(Boolean);
  if (tokens.length === 1 && BLOCKED_TOKENS.has(tokens[0]!)) return true;
  if (tokens.length <= 2 && tokens.every((token) => BLOCKED_TOKENS.has(token))) return true;

  return false;
}

export function looksLikeLowConfidenceTranscript(input: string, confidence: number | null): boolean {
  if (confidence !== null && confidence < 0.55) return true;
  const normalized = input.trim().toLowerCase();
  if (!normalized) return true;
  if (isConservativelyBlockedInput(normalized)) return true;
  const tokens = normalized.split(/\s+/).filter(Boolean);
  if (tokens.length === 1 && tokens[0]!.length <= 4) return true;
  return false;
}
