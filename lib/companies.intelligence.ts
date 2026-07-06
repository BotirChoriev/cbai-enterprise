import type { Company } from "@/lib/companies";
import { defaultEntityResolver } from "@/lib/intelligence/evidence/adapters/entity/entity-resolver";

export type CompanyEvidenceStatus = "connected" | "insufficient" | "not_connected";

export type CompanyPersonaId =
  | "general"
  | "citizen"
  | "investor"
  | "public_institution"
  | "researcher"
  | "academic";

export const INSUFFICIENT_EVIDENCE_LABEL = "Insufficient Evidence";

export const NOT_CONNECTED_SOURCE_LABEL = "Evidence Source Not Connected";

export const COMMERCIAL_NEUTRALITY_NOTICE =
  "CBAI provides evidence-based, neutral company intelligence. It does not endorse, attack, or commercially promote any company.";

export type CompanyIntelligenceBlock = {
  id: string;
  title: string;
  meaning: string;
  evidenceStatus: CompanyEvidenceStatus;
  detail: string;
  sourceConnected: boolean;
  displayValue: string;
};

export type CompanyPersonaSection = {
  id: CompanyPersonaId;
  title: string;
  guidance: string;
  evidenceNote: string;
};

export type CompanyLinkedEntities = {
  relatedCountry: string | null;
  universities: string[];
};

export type CompanyIntelligenceProfile = {
  companyId: string;
  referenceConnected: boolean;
  blocks: CompanyIntelligenceBlock[];
  personas: CompanyPersonaSection[];
  linkedEntities: CompanyLinkedEntities;
  neutralityNotice: string;
};

const REFERENCE_FIELD_COUNT = 5;

function block(
  input: Omit<CompanyIntelligenceBlock, "displayValue"> & {
    displayValue?: string;
  },
): CompanyIntelligenceBlock {
  const displayValue =
    input.displayValue ??
    (input.sourceConnected
      ? input.detail
      : input.evidenceStatus === "insufficient"
        ? INSUFFICIENT_EVIDENCE_LABEL
        : NOT_CONNECTED_SOURCE_LABEL);

  return { ...input, displayValue };
}

function buildPersonaSections(companyName: string): CompanyPersonaSection[] {
  return [
    {
      id: "general",
      title: "General Citizen",
      guidance: `Review factual catalog information for ${companyName} and check each section's evidence status before drawing conclusions. CBAI does not present opinion polls or popularity scores as official ratings.`,
      evidenceNote: "Reference catalog only — no automated commercial or political recommendations.",
    },
    {
      id: "investor",
      title: "Investor View",
      guidance:
        "Investment analysis, sector comparisons, and tender participation require connected financial, market, and procurement evidence sources. Catalog entries help identify platform records only.",
      evidenceNote: NOT_CONNECTED_SOURCE_LABEL,
    },
    {
      id: "citizen",
      title: "Citizen View",
      guidance:
        "Public procurement participation, local economic presence, and corporate responsibility indicators require connected civic transparency sources.",
      evidenceNote: NOT_CONNECTED_SOURCE_LABEL,
    },
    {
      id: "public_institution",
      title: "Government / Public Institution View",
      guidance:
        "Governance, procurement openness, and regulatory compliance views require dedicated public-sector evidence sources. Catalog facts help scope requests but do not replace official filings.",
      evidenceNote: NOT_CONNECTED_SOURCE_LABEL,
    },
    {
      id: "researcher",
      title: "Researcher View",
      guidance:
        "Export section-level evidence status and catalog metadata for reproducible scoping. Trend, correlation, and market analyses require connected research-grade sources.",
      evidenceNote: NOT_CONNECTED_SOURCE_LABEL,
    },
    {
      id: "academic",
      title: "Academic View",
      guidance:
        "CBAI separates reference catalog data from assessed intelligence. Cite evidence status and source connectivity in any downstream academic use.",
      evidenceNote: COMMERCIAL_NEUTRALITY_NOTICE,
    },
  ];
}

function buildIntelligenceBlocks(
  company: Company,
  referenceConnected: boolean,
): CompanyIntelligenceBlock[] {
  return [
    block({
      id: "company-registry-profile",
      title: "Company Registry Profile",
      meaning:
        "Basic company identity from the local platform catalog — name, symbol, country, industry, and founding year.",
      evidenceStatus: referenceConnected ? "connected" : "insufficient",
      detail: referenceConnected
        ? `${company.name} (${company.icon}) — ${company.industry}, ${company.country}, founded ${company.founded}.`
        : INSUFFICIENT_EVIDENCE_LABEL,
      sourceConnected: referenceConnected,
      displayValue: referenceConnected
        ? "Company reference profile available"
        : INSUFFICIENT_EVIDENCE_LABEL,
    }),
    block({
      id: "evidence-status",
      title: "Evidence Status",
      meaning:
        "Shows whether this company record is available and how much verified information is on file today.",
      evidenceStatus: referenceConnected ? "connected" : "insufficient",
      detail: referenceConnected
        ? `${REFERENCE_FIELD_COUNT} catalog fields available — assessed intelligence withheld until sources connect.`
        : INSUFFICIENT_EVIDENCE_LABEL,
      sourceConnected: referenceConnected,
      displayValue: referenceConnected
        ? "Reference data available — extended evidence not yet connected"
        : INSUFFICIENT_EVIDENCE_LABEL,
    }),
    block({
      id: "ownership-governance",
      title: "Ownership & Governance Status",
      meaning:
        "Ownership structure, board composition, and governance filings require connected corporate registry sources.",
      evidenceStatus: "not_connected",
      detail: NOT_CONNECTED_SOURCE_LABEL,
      sourceConnected: false,
    }),
    block({
      id: "financial-transparency",
      title: "Financial Transparency Status",
      meaning:
        "Revenue, filings, and market metrics require connected financial disclosure sources.",
      evidenceStatus: "not_connected",
      detail: NOT_CONNECTED_SOURCE_LABEL,
      sourceConnected: false,
    }),
    block({
      id: "tender-procurement",
      title: "Tender / Procurement Participation Status",
      meaning:
        "Public tender and procurement participation requires connected procurement transparency sources.",
      evidenceStatus: "not_connected",
      detail: NOT_CONNECTED_SOURCE_LABEL,
      sourceConnected: false,
    }),
    block({
      id: "esg-responsibility",
      title: "ESG / Responsibility Status",
      meaning:
        "Environmental, social, and governance indicators require connected ESG evidence sources.",
      evidenceStatus: "not_connected",
      detail: NOT_CONNECTED_SOURCE_LABEL,
      sourceConnected: false,
    }),
  ];
}

export function buildCompanyIntelligenceProfile(
  company: Company,
  linkedEntities: CompanyLinkedEntities,
): CompanyIntelligenceProfile {
  const resolution = defaultEntityResolver.resolveRef({
    type: "company",
    id: company.id,
    name: company.name,
  });
  const referenceConnected = resolution.entity !== undefined;

  return {
    companyId: company.id,
    referenceConnected,
    blocks: buildIntelligenceBlocks(company, referenceConnected),
    personas: buildPersonaSections(company.name),
    linkedEntities,
    neutralityNotice: COMMERCIAL_NEUTRALITY_NOTICE,
  };
}

export function resolveCompanyListEvidenceLabel(
  profile: CompanyIntelligenceProfile,
): string {
  if (profile.referenceConnected) {
    return "Reference available";
  }

  return INSUFFICIENT_EVIDENCE_LABEL;
}

export function companyEvidenceStatusClass(
  status: CompanyEvidenceStatus,
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
