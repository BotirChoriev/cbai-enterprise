/**
 * Capability Passport and Discovery safety rules — architecture constraints, not UI.
 * Every future EPIC-03/EPIC-04 expansion must comply.
 */

export const CAPABILITY_SAFETY_RULES = [
  "never-infer-human-worth",
  "never-infer-protected-traits",
  "no-universal-intelligence-score",
  "no-global-human-ranking",
  "no-silent-capability-lockout",
  "no-prestige-proxy",
  "explainable-signals-only",
  "provenance-required",
  "uncertainty-visible",
  "user-controls-visibility",
  "user-can-challenge-signals",
  "regulated-credential-boundaries",
  "opportunity-matching-requires-consent",
  "no-private-data-exposure-in-discovery",
] as const;

export type CapabilitySafetyRule = (typeof CAPABILITY_SAFETY_RULES)[number];

export const DISCOVERY_FAIRNESS_RULES = [
  "no-status-based-ranking",
  "no-country-prestige-proxy",
  "no-university-prestige-proxy",
  "recommendation-explanations-required",
  "privacy-and-consent-before-matching",
  "bias-audit-before-expansion",
  "no-fabricated-collaborators",
  "no-fabricated-opportunities",
] as const;

export type DiscoveryFairnessRule = (typeof DISCOVERY_FAIRNESS_RULES)[number];

/** Forbidden patterns in capability/discovery code — governance test guard */
export const FORBIDDEN_CAPABILITY_PATTERNS = [
  /\biq\b/i,
  /\bintelligence\s*score\b/i,
  /\bglobal\s*rank/i,
  /\bhuman\s*worth\b/i,
  /\bprestige\s*score\b/i,
] as const;
