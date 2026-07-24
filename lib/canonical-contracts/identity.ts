/**
 * Identity contracts (Stage 1) — type-level only; no store migration.
 */

/** Stable product person identity (device-local or cloud). */
export type CanonicalPersonId = string;

/** Account binding when signed in (device-local user id or cloud user id). */
export type CanonicalAccountRef = {
  readonly kind: "guest" | "device_local" | "cloud";
  readonly personId: CanonicalPersonId | null;
  readonly displayLabel?: string;
};

/**
 * Non-rewrite rule: existing identity records keep IDs, timestamps, and unknown fields.
 * Stage 1 does not transform auth stores.
 */
export const IDENTITY_PRESERVATION_RULES = {
  preserveIds: true,
  preserveTimestamps: true,
  preserveUnknownFields: true,
  noSilentAccountMerge: true,
  deviceLocalIsNotTeamAuth: true,
} as const;
