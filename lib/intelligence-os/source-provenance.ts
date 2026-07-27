/**
 * Canonical source provenance and freshness contracts.
 *
 * Unknown dates stay null. Renderers must never substitute the current time for
 * missing publication, fetch, or verification timestamps.
 */

export const SOURCE_PROVENANCE_SCHEMA_VERSION = 1 as const;

export type FreshnessStatus =
  | "current"
  | "aging"
  | "stale"
  | "update_expected"
  | "unavailable"
  | "verification_required";

export type VerificationStatus =
  | "verified"
  | "partially_verified"
  | "human_review_required"
  | "unverified"
  | "unavailable";

export type CoverageState = "complete" | "partial" | "missing" | "not_applicable";

export type SourceMaterialKind =
  | "official_source"
  | "retrieved_evidence"
  | "user_provided"
  | "deterministic_label"
  | "ai_generated_summary"
  | "inference"
  | "unresolved_question";

export type CanonicalFreshness = {
  readonly publishedAt: string | null;
  readonly coverageStart: string | null;
  readonly coverageEnd: string | null;
  readonly fetchedAt: string | null;
  readonly verifiedAt: string | null;
  readonly nextExpectedUpdate: string | null;
  readonly freshnessStatus: FreshnessStatus;
  readonly sourceVersion: string | null;
  readonly verificationMethod: string | null;
};

export type SourceProvenance = {
  readonly schemaVersion: typeof SOURCE_PROVENANCE_SCHEMA_VERSION;
  readonly id: string;
  readonly sourceOrganization: string;
  readonly sourceTitle: string;
  readonly canonicalUrl: string | null;
  readonly sourceType: string;
  readonly originalLanguage: string | null;
  readonly jurisdiction: string | null;
  readonly licenseOrUsageNote: string | null;
  readonly verificationStatus: VerificationStatus;
  readonly coverageState: CoverageState;
  readonly confidenceNote: string | null;
  readonly knownLimitations: readonly string[];
  readonly materialKind: SourceMaterialKind;
  readonly freshness: CanonicalFreshness;
};

export function isIsoDate(value: string | null): boolean {
  return value !== null && !Number.isNaN(Date.parse(value));
}

export function resolveFreshnessStatus(input: {
  readonly available: boolean;
  readonly verifiedAt: string | null;
  readonly nextExpectedUpdate?: string | null;
  readonly agingAfterDays?: number;
  readonly staleAfterDays?: number;
  readonly now?: Date;
}): FreshnessStatus {
  if (!input.available) return "unavailable";
  if (!isIsoDate(input.verifiedAt)) return "verification_required";

  const now = input.now?.getTime() ?? Date.now();
  const nextExpected = input.nextExpectedUpdate ? Date.parse(input.nextExpectedUpdate) : Number.NaN;
  if (!Number.isNaN(nextExpected) && now > nextExpected) return "update_expected";

  const verifiedAt = Date.parse(input.verifiedAt as string);
  const ageDays = Math.max(0, (now - verifiedAt) / 86_400_000);
  const staleAfterDays = input.staleAfterDays ?? 365;
  const agingAfterDays = Math.min(input.agingAfterDays ?? 180, staleAfterDays);
  if (ageDays > staleAfterDays) return "stale";
  if (ageDays > agingAfterDays) return "aging";
  return "current";
}

export function createUnavailableProvenance(input: {
  readonly id: string;
  readonly sourceOrganization: string;
  readonly sourceTitle: string;
  readonly sourceType: string;
  readonly limitation: string;
}): SourceProvenance {
  return {
    schemaVersion: SOURCE_PROVENANCE_SCHEMA_VERSION,
    id: input.id,
    sourceOrganization: input.sourceOrganization,
    sourceTitle: input.sourceTitle,
    canonicalUrl: null,
    sourceType: input.sourceType,
    originalLanguage: null,
    jurisdiction: null,
    licenseOrUsageNote: null,
    verificationStatus: "unavailable",
    coverageState: "missing",
    confidenceNote: null,
    knownLimitations: [input.limitation],
    materialKind: "unresolved_question",
    freshness: {
      publishedAt: null,
      coverageStart: null,
      coverageEnd: null,
      fetchedAt: null,
      verifiedAt: null,
      nextExpectedUpdate: null,
      freshnessStatus: "unavailable",
      sourceVersion: null,
      verificationMethod: null,
    },
  };
}

export function assertSourceClaimable(source: SourceProvenance): boolean {
  return (
    source.materialKind !== "ai_generated_summary" &&
    source.materialKind !== "inference" &&
    source.verificationStatus !== "unavailable" &&
    Boolean(source.sourceOrganization.trim() && source.sourceTitle.trim())
  );
}
