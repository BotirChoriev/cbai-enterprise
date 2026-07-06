import type { Country } from "@/lib/countries";
import { defaultEntityResolver } from "@/lib/intelligence/evidence/adapters/entity/entity-resolver";

/** Evidence connection classification for country intelligence blocks. */
export type CountryEvidenceStatus = "connected" | "insufficient" | "not_connected";

/** Persona identifiers for country intelligence views. */
export type CountryPersonaId =
  | "general"
  | "investor"
  | "public_institution"
  | "student"
  | "researcher"
  | "academic";

/** Standard unavailable messages (CBAI Golden Rule). */
export const INSUFFICIENT_EVIDENCE_LABEL = "Insufficient Evidence";

export const NOT_AVAILABLE_SOURCE_LABEL =
  "Not Available — evidence source not connected yet";

export const POLITICAL_NEUTRALITY_NOTICE =
  "CBAI provides evidence-based, politically neutral intelligence. It does not interfere in domestic politics or endorse political actors.";

/** Single constitution-compliant intelligence block. */
export type CountryIntelligenceBlock = {
  id: string;
  title: string;
  meaning: string;
  evidenceStatus: CountryEvidenceStatus;
  confidenceStatus: string;
  sourceConnected: boolean;
  displayValue: string;
};

/** Persona-specific guidance without fabricated claims. */
export type CountryPersonaSection = {
  id: CountryPersonaId;
  title: string;
  guidance: string;
  evidenceNote: string;
};

/** Linked entities derived from local company and university registries. */
export type CountryLinkedEntities = {
  relatedCompanies: string[];
  universities: string[];
};

/** Full country intelligence profile for UI rendering. */
export type CountryIntelligenceProfile = {
  countryId: string;
  entityProfileConnected: boolean;
  registryFieldCount: number;
  evidenceItemEstimate: number;
  blocks: CountryIntelligenceBlock[];
  personas: CountryPersonaSection[];
  linkedEntities: CountryLinkedEntities;
  neutralityNotice: string;
};

const REGISTRY_FIELD_COUNT = 6;

function block(
  input: Omit<CountryIntelligenceBlock, "displayValue"> & {
    displayValue?: string;
  },
): CountryIntelligenceBlock {
  const displayValue =
    input.displayValue ??
    (input.sourceConnected
      ? input.confidenceStatus
      : input.evidenceStatus === "insufficient"
        ? INSUFFICIENT_EVIDENCE_LABEL
        : NOT_AVAILABLE_SOURCE_LABEL);

  return {
    ...input,
    displayValue,
  };
}

function buildPersonaSections(countryName: string): CountryPersonaSection[] {
  return [
    {
      id: "general",
      title: "General User",
      guidance: `Review verified registry facts for ${countryName} and check each block's evidence status before drawing conclusions. CBAI withholds narrative scores until sources connect.`,
      evidenceNote: "Registry facts only — no automated political or economic recommendations.",
    },
    {
      id: "investor",
      title: "Investor",
      guidance:
        "Investment scores, procurement signals, and opportunity lists require connected financial, tender, and budget transparency sources. Use linked local entities to identify platform records only.",
      evidenceNote: NOT_AVAILABLE_SOURCE_LABEL,
    },
    {
      id: "public_institution",
      title: "Public Institution / State Leader",
      guidance:
        "Governance, procurement openness, and budget transparency blocks require dedicated public-sector evidence adapters. Registry facts help scope requests but do not substitute for official datasets.",
      evidenceNote: NOT_AVAILABLE_SOURCE_LABEL,
    },
    {
      id: "student",
      title: "Student",
      guidance: `Use ${countryName} registry facts and linked universities from the local platform catalog. Academic program or ranking analysis is not available without connected education evidence sources.`,
      evidenceNote: "University names listed only when present in the local registry.",
    },
    {
      id: "researcher",
      title: "Researcher",
      guidance:
        "Export block-level evidence status and registry metadata for reproducible scoping. Trend, scenario, and governance analyses require connected research-grade sources.",
      evidenceNote: NOT_AVAILABLE_SOURCE_LABEL,
    },
    {
      id: "academic",
      title: "Academic",
      guidance:
        "CBAI separates reference registry data from assessed intelligence. Cite evidence status and source connectivity in any downstream academic use.",
      evidenceNote: POLITICAL_NEUTRALITY_NOTICE,
    },
  ];
}

function buildConstitutionBlocks(
  country: Country,
  entityProfileConnected: boolean,
): CountryIntelligenceBlock[] {
  const registryConnected = entityProfileConnected;

  return [
    block({
      id: "evidence-status",
      title: "Evidence Status",
      meaning:
        "Shows whether the entity-profile adapter can resolve this country and how many registry fields are available as factual evidence.",
      evidenceStatus: registryConnected ? "connected" : "insufficient",
      confidenceStatus: registryConnected
        ? `Local registry connected — ${REGISTRY_FIELD_COUNT} factual fields`
        : INSUFFICIENT_EVIDENCE_LABEL,
      sourceConnected: registryConnected,
      displayValue: registryConnected
        ? `Entity profile connected — ${REGISTRY_FIELD_COUNT} registry fields available`
        : INSUFFICIENT_EVIDENCE_LABEL,
    }),
    block({
      id: "ai-score",
      title: "AI Score",
      meaning:
        "Would measure AI readiness and capability when a verified assessment source is connected.",
      evidenceStatus: "not_connected",
      confidenceStatus: INSUFFICIENT_EVIDENCE_LABEL,
      sourceConnected: false,
    }),
    block({
      id: "investment-score",
      title: "Investment Score",
      meaning:
        "Would measure investment attractiveness when financial and market evidence sources connect.",
      evidenceStatus: "not_connected",
      confidenceStatus: INSUFFICIENT_EVIDENCE_LABEL,
      sourceConnected: false,
    }),
    block({
      id: "risk-score",
      title: "Risk Score",
      meaning:
        "Would measure risk exposure when governance and market risk evidence sources connect.",
      evidenceStatus: "not_connected",
      confidenceStatus: INSUFFICIENT_EVIDENCE_LABEL,
      sourceConnected: false,
    }),
    block({
      id: "human-rights-governance",
      title: "Human Rights & Governance",
      meaning:
        "Governance and human-rights indicators require a dedicated evidence adapter.",
      evidenceStatus: "not_connected",
      confidenceStatus: INSUFFICIENT_EVIDENCE_LABEL,
      sourceConnected: false,
    }),
    block({
      id: "tender-transparency",
      title: "Tender Transparency",
      meaning:
        "Public tender transparency metrics require procurement evidence sources.",
      evidenceStatus: "not_connected",
      confidenceStatus: INSUFFICIENT_EVIDENCE_LABEL,
      sourceConnected: false,
    }),
    block({
      id: "procurement-openness",
      title: "Procurement Openness",
      meaning:
        "Procurement openness assessments require connected procurement datasets.",
      evidenceStatus: "not_connected",
      confidenceStatus: INSUFFICIENT_EVIDENCE_LABEL,
      sourceConnected: false,
    }),
    block({
      id: "budget-transparency",
      title: "Budget Transparency",
      meaning:
        "Budget transparency indicators require connected fiscal evidence sources.",
      evidenceStatus: "not_connected",
      confidenceStatus: INSUFFICIENT_EVIDENCE_LABEL,
      sourceConnected: false,
    }),
    block({
      id: "five-year-trend",
      title: "5-Year Trend",
      meaning:
        "Historical trend analysis requires time-series evidence sources.",
      evidenceStatus: "not_connected",
      confidenceStatus: INSUFFICIENT_EVIDENCE_LABEL,
      sourceConnected: false,
    }),
    block({
      id: "future-scenarios",
      title: "Future Scenarios",
      meaning:
        "Scenario modeling requires connected forecasting evidence — not generated without sources.",
      evidenceStatus: "not_connected",
      confidenceStatus: INSUFFICIENT_EVIDENCE_LABEL,
      sourceConnected: false,
    }),
    block({
      id: "persona-intelligence",
      title: "Persona Intelligence",
      meaning:
        "Persona views explain how to use available evidence responsibly for different audiences.",
      evidenceStatus: registryConnected ? "connected" : "insufficient",
      confidenceStatus: "Guidance available — assessed intelligence withheld",
      sourceConnected: true,
      displayValue: "Persona guidance available below",
    }),
  ];
}

/**
 * Build constitution-compliant country intelligence profile.
 */
export function buildCountryIntelligenceProfile(
  country: Country,
  linkedEntities: CountryLinkedEntities,
): CountryIntelligenceProfile {
  const resolution = defaultEntityResolver.resolveRef({
    type: "country",
    id: country.id,
    name: country.name,
  });
  const entityProfileConnected = resolution.entity !== undefined;

  return {
    countryId: country.id,
    entityProfileConnected,
    registryFieldCount: REGISTRY_FIELD_COUNT,
    evidenceItemEstimate: entityProfileConnected ? 2 : 0,
    blocks: buildConstitutionBlocks(country, entityProfileConnected),
    personas: buildPersonaSections(country.name),
    linkedEntities,
    neutralityNotice: POLITICAL_NEUTRALITY_NOTICE,
  };
}

/** Status badge label for list cards. */
export function resolveCountryListEvidenceLabel(
  profile: CountryIntelligenceProfile,
): string {
  if (profile.entityProfileConnected) {
    return "Registry connected";
  }

  return INSUFFICIENT_EVIDENCE_LABEL;
}

/** Status color class for evidence badges. */
export function countryEvidenceStatusClass(
  status: CountryEvidenceStatus,
): string {
  switch (status) {
    case "connected":
      return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    case "insufficient":
      return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    case "not_connected":
      return "text-zinc-400 bg-zinc-800/50 border-zinc-700/50";
  }
}
