import type { TrustLevel } from "@/lib/intelligence/trust.types";

/** Minimum score for the `verified` trust level inclusive. */
export const TRUST_LEVEL_VERIFIED_MIN = 76;

/** Minimum score for the `high` trust level inclusive. */
export const TRUST_LEVEL_HIGH_MIN = 51;

/** Minimum score for the `moderate` trust level inclusive. */
export const TRUST_LEVEL_MODERATE_MIN = 26;

/** Minimum score for the `low` trust level inclusive. */
export const TRUST_LEVEL_LOW_MIN = 1;

/** Ordered trust levels from highest to lowest organizational reliance. */
export const TRUST_LEVELS_DESCENDING: readonly TrustLevel[] = [
  "verified",
  "high",
  "moderate",
  "low",
  "unverified",
] as const;

/**
 * Human-readable labels for trust levels in governance surfaces.
 */
export const TRUST_LEVEL_LABELS: Record<TrustLevel, string> = {
  unverified: "Unverified",
  low: "Low",
  moderate: "Moderate",
  high: "High",
  verified: "Verified",
};

/**
 * Organizational action permissions granted at each trust level.
 *
 * Conservative by default — automation requires `verified` trust.
 */
export const TRUST_LEVEL_PERMISSIONS: Record<
  TrustLevel,
  {
    allowAutomation: boolean;
    allowRecommendation: boolean;
    allowExecution: boolean;
  }
> = {
  unverified: {
    allowAutomation: false,
    allowRecommendation: false,
    allowExecution: false,
  },
  low: {
    allowAutomation: false,
    allowRecommendation: false,
    allowExecution: false,
  },
  moderate: {
    allowAutomation: false,
    allowRecommendation: true,
    allowExecution: false,
  },
  high: {
    allowAutomation: false,
    allowRecommendation: true,
    allowExecution: false,
  },
  verified: {
    allowAutomation: true,
    allowRecommendation: true,
    allowExecution: true,
  },
};

/**
 * Clamp a raw trust score to the 0–100 inclusive range.
 */
export function clampTrustScore(score: number): number {
  if (!Number.isFinite(score)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Resolve an evidence-grounded trust score to a {@link TrustLevel}.
 */
export function resolveTrustLevel(score: number): TrustLevel {
  const clamped = clampTrustScore(score);

  if (clamped >= TRUST_LEVEL_VERIFIED_MIN) {
    return "verified";
  }

  if (clamped >= TRUST_LEVEL_HIGH_MIN) {
    return "high";
  }

  if (clamped >= TRUST_LEVEL_MODERATE_MIN) {
    return "moderate";
  }

  if (clamped >= TRUST_LEVEL_LOW_MIN) {
    return "low";
  }

  return "unverified";
}

/**
 * Resolve action permissions for a trust level.
 */
export function resolveTrustPermissions(level: TrustLevel): {
  allowAutomation: boolean;
  allowRecommendation: boolean;
  allowExecution: boolean;
} {
  return TRUST_LEVEL_PERMISSIONS[level];
}

/**
 * Returns true when trust level does not permit any organizational action.
 */
export function isUnverifiedTrustLevel(level: TrustLevel): boolean {
  return level === "unverified" || level === "low";
}
