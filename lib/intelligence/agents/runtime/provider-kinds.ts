/** Provider kind identifiers for future agent backends (BUILD-047). */
export type ProviderKind = "openai" | "anthropic" | "gemini" | "local";

/** Provider kind: OpenAI. */
export const PROVIDER_KIND_OPENAI = "openai" as const;

/** Provider kind: Anthropic. */
export const PROVIDER_KIND_ANTHROPIC = "anthropic" as const;

/** Provider kind: Gemini. */
export const PROVIDER_KIND_GEMINI = "gemini" as const;

/** Provider kind: Local. */
export const PROVIDER_KIND_LOCAL = "local" as const;

/** All supported provider kinds in deterministic order. */
export const ALL_PROVIDER_KINDS: readonly ProviderKind[] = [
  PROVIDER_KIND_OPENAI,
  PROVIDER_KIND_ANTHROPIC,
  PROVIDER_KIND_GEMINI,
  PROVIDER_KIND_LOCAL,
];

const PROVIDER_KIND_SET = new Set<string>(ALL_PROVIDER_KINDS);

/**
 * Returns true when the value is a known provider kind.
 */
export function isProviderKind(value: string): value is ProviderKind {
  return PROVIDER_KIND_SET.has(value);
}

/**
 * Human-readable labels for provider kinds — metadata only.
 */
export const PROVIDER_KIND_LABELS: Record<ProviderKind, string> = {
  openai: "OpenAI",
  anthropic: "Anthropic",
  gemini: "Gemini",
  local: "Local",
};

/**
 * Factual stub descriptions for provider backends — no execution claims.
 */
export const PROVIDER_KIND_DESCRIPTIONS: Record<ProviderKind, string> = {
  openai: "Reserved OpenAI agent backend contract — not connected in BUILD-047.",
  anthropic: "Reserved Anthropic agent backend contract — not connected in BUILD-047.",
  gemini: "Reserved Gemini agent backend contract — not connected in BUILD-047.",
  local: "Reserved local agent backend contract — not connected in BUILD-047.",
};
