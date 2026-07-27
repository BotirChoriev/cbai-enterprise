/**
 * Evidence & provenance contract for Domain / Country Intelligence.
 * Separates official source material, user content, CBAI synthesis, inference, and unknown.
 */

export const MATERIAL_CLASSES = [
  "official_source",
  "user_entered",
  "cbai_synthesis",
  "cbai_inference",
  "cbai_scenario",
  "unknown",
] as const;

export type MaterialClass = (typeof MATERIAL_CLASSES)[number];

export const FRESHNESS_STATES = [
  "fresh",
  "aging",
  "stale",
  "verification_required",
  "unavailable",
] as const;

export type FreshnessState = (typeof FRESHNESS_STATES)[number];

export const CONFIDENCE_STATES = [
  "verified",
  "reported",
  "estimated",
  "unknown",
  "unavailable",
] as const;

export type ConfidenceState = (typeof CONFIDENCE_STATES)[number];

/**
 * Why-change classification — never imply causation from correlation alone.
 */
export const CHANGE_FACTOR_CLASSES = [
  "documented_cause",
  "contributing_factor",
  "association_only",
  "expert_interpretation",
  "cbai_inference",
  "unknown",
] as const;

export type ChangeFactorClass = (typeof CHANGE_FACTOR_CLASSES)[number];

export type SourceLanguageMetadata = {
  readonly sourceLanguage?: string;
  /** Platform UI locale used when a summary was explicitly created — never silent translation. */
  readonly summaryLocale?: string;
  readonly summaryExplicitlyCreated?: boolean;
};

/**
 * Canonical claim / indicator observation with full provenance surface.
 * Values may be absent — absence is first-class, never fabricated.
 */
export type ProvenancedClaim = {
  readonly id: string;
  readonly displayLabel: string;
  readonly value?: string | number | null;
  readonly unit?: string | null;
  readonly observationPeriodStart?: string | null;
  readonly observationPeriodEnd?: string | null;
  readonly publicationDate?: string | null;
  readonly lastVerifiedDate?: string | null;
  readonly geographicCoverage?: string | null;
  readonly sourceOrganization?: string | null;
  readonly sourceUrl?: string | null;
  readonly sourceTitle?: string | null;
  readonly methodology?: string | null;
  readonly sampleScope?: string | null;
  readonly confidence: ConfidenceState;
  readonly freshness: FreshnessState;
  readonly limitations: readonly string[];
  readonly supportingEvidenceIds: readonly string[];
  readonly conflictingEvidenceIds: readonly string[];
  readonly officialSource: boolean;
  readonly materialClass: MaterialClass;
  readonly sourceLanguage: SourceLanguageMetadata;
  /** Localized platform summary only when explicitly created — never auto-filled from English. */
  readonly platformSummary?: string | null;
  readonly contentLocale?: string;
  readonly createdLocale?: string;
  readonly version: number;
  readonly unknownFields?: Readonly<Record<string, unknown>>;
};

export function classifyMaterialPresentation(materialClass: MaterialClass): {
  readonly mayPresentAsOfficialQuotation: boolean;
  readonly labelKey: string;
} {
  switch (materialClass) {
    case "official_source":
      return { mayPresentAsOfficialQuotation: true, labelKey: "domainIntelligence.materialOfficial" };
    case "user_entered":
      return { mayPresentAsOfficialQuotation: false, labelKey: "domainIntelligence.materialUser" };
    case "cbai_synthesis":
      return { mayPresentAsOfficialQuotation: false, labelKey: "domainIntelligence.materialSynthesis" };
    case "cbai_inference":
      return { mayPresentAsOfficialQuotation: false, labelKey: "domainIntelligence.materialInference" };
    case "cbai_scenario":
      return { mayPresentAsOfficialQuotation: false, labelKey: "domainIntelligence.materialScenario" };
    default:
      return { mayPresentAsOfficialQuotation: false, labelKey: "domainIntelligence.materialUnknown" };
  }
}

export function resolveFreshness(input: {
  readonly available: boolean;
  readonly verifiedAt: string | null | undefined;
  readonly now?: Date;
  readonly staleAfterDays?: number;
}): FreshnessState {
  if (!input.available) return "unavailable";
  if (!input.verifiedAt) return "verification_required";
  const verified = Date.parse(input.verifiedAt);
  if (Number.isNaN(verified)) return "verification_required";
  const now = input.now ?? new Date();
  const ageDays = (now.getTime() - verified) / (1000 * 60 * 60 * 24);
  const staleAfter = input.staleAfterDays ?? 365;
  if (ageDays > staleAfter) return "stale";
  if (ageDays > staleAfter / 2) return "aging";
  return "fresh";
}

/** Build an honest unavailable claim placeholder — never invents a value. */
export function unavailableClaim(input: {
  readonly id: string;
  readonly displayLabel: string;
  readonly geographicCoverage?: string;
  readonly limitations?: readonly string[];
}): ProvenancedClaim {
  return {
    id: input.id,
    displayLabel: input.displayLabel,
    value: null,
    unit: null,
    observationPeriodStart: null,
    observationPeriodEnd: null,
    publicationDate: null,
    lastVerifiedDate: null,
    geographicCoverage: input.geographicCoverage ?? null,
    sourceOrganization: null,
    sourceUrl: null,
    sourceTitle: null,
    methodology: null,
    sampleScope: null,
    confidence: "unavailable",
    freshness: "unavailable",
    limitations: input.limitations ?? ["No verified observation is connected for this claim."],
    supportingEvidenceIds: [],
    conflictingEvidenceIds: [],
    officialSource: false,
    materialClass: "unknown",
    sourceLanguage: {},
    platformSummary: null,
    version: 1,
  };
}
