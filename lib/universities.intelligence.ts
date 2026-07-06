import type { University } from "@/lib/universities";
import { defaultEntityResolver } from "@/lib/intelligence/evidence/adapters/entity/entity-resolver";

export type UniversityEvidenceStatus = "connected" | "insufficient" | "not_connected";

export type UniversityPersonaId =
  | "citizen"
  | "student"
  | "researcher"
  | "academic"
  | "investor"
  | "government";

export const INSUFFICIENT_EVIDENCE_LABEL = "Insufficient Evidence";

export const NOT_CONNECTED_SOURCE_LABEL = "Evidence Source Not Connected";

export const RELATIONSHIP_NOT_CONNECTED_LABEL = "Relationship data not connected.";

export const INSTITUTIONAL_NEUTRALITY_NOTICE =
  "CBAI provides evidence-based, politically neutral university intelligence. It does not endorse, rank, or promote any institution.";

export type UniversityIntelligenceBlock = {
  id: string;
  title: string;
  meaning: string;
  evidenceStatus: UniversityEvidenceStatus;
  detail: string;
  sourceConnected: boolean;
  displayValue: string;
};

export type UniversityPersonaSection = {
  id: UniversityPersonaId;
  title: string;
  currentValue: string;
  futureCapability: string;
};

export type UniversityTrustPillar = {
  id: string;
  title: string;
  description: string;
};

export type UniversityLinkedEntities = {
  country: string | null;
  companies: string[];
  researchCenters: string[];
  government: string[];
};

export type UniversityIntelligenceProfile = {
  universityId: string;
  referenceConnected: boolean;
  registryFieldCount: number;
  blocks: UniversityIntelligenceBlock[];
  personas: UniversityPersonaSection[];
  linkedEntities: UniversityLinkedEntities;
  trustPillars: UniversityTrustPillar[];
  neutralityNotice: string;
};

const REGISTRY_FIELD_COUNT = 7;

function block(
  input: Omit<UniversityIntelligenceBlock, "displayValue"> & {
    displayValue?: string;
  },
): UniversityIntelligenceBlock {
  const displayValue =
    input.displayValue ??
    (input.sourceConnected
      ? input.detail
      : input.evidenceStatus === "insufficient"
        ? INSUFFICIENT_EVIDENCE_LABEL
        : NOT_CONNECTED_SOURCE_LABEL);

  return { ...input, displayValue };
}

function buildTrustPillars(): UniversityTrustPillar[] {
  return [
    {
      id: "evidence",
      title: "Evidence",
      description:
        "University profiles display registry facts and block-level evidence status. Extended intelligence is withheld until sources connect.",
    },
    {
      id: "methodology",
      title: "Methodology",
      description:
        "Relationships are derived from local country and company catalogs only. No inferred partnerships or rankings.",
    },
    {
      id: "neutrality",
      title: "Neutrality",
      description:
        "CBAI does not endorse institutions, publish league tables, or substitute marketing narratives for verified evidence.",
    },
    {
      id: "transparency",
      title: "Transparency",
      description:
        "Unavailable sections state Evidence Source Not Connected or Insufficient Evidence — never hidden behind synthetic data.",
    },
  ];
}

function buildPersonaSections(universityName: string): UniversityPersonaSection[] {
  return [
    {
      id: "citizen",
      title: "Citizen",
      currentValue: `Review ${universityName} registry facts and evidence status blocks before relying on any institutional claim.`,
      futureCapability:
        "Scholarship transparency, public procurement links, and civic accountability indicators when evidence sources connect.",
    },
    {
      id: "student",
      title: "Student",
      currentValue:
        "Institution name, location, type, founding year, and website (when recorded) from the local catalog.",
      futureCapability:
        "Accreditation verification, program catalogs, and enrollment statistics when education evidence sources connect.",
    },
    {
      id: "researcher",
      title: "Researcher",
      currentValue:
        "Export block-level evidence status and registry metadata for reproducible scoping.",
      futureCapability:
        "Research output, collaboration networks, and grant data when research evidence adapters connect.",
    },
    {
      id: "academic",
      title: "Academic",
      currentValue:
        "CBAI separates reference catalog data from assessed intelligence. Cite evidence status in downstream academic use.",
      futureCapability:
        "Peer-verified research metrics and international cooperation datasets when academic sources connect.",
    },
    {
      id: "investor",
      title: "Investor",
      currentValue:
        "Identify platform registry records and linked companies in the same country from local catalogs only.",
      futureCapability:
        "Innovation program outcomes, industry collaboration verification, and sector comparisons when investor evidence connects.",
    },
    {
      id: "government",
      title: "Government",
      currentValue:
        "Government form label from linked country registry when available. No political recommendations.",
      futureCapability:
        "Government recognition filings, public transparency metrics, and policy-linked education data when sources connect.",
    },
  ];
}

function buildIntelligenceBlocks(
  university: University,
  referenceConnected: boolean,
): UniversityIntelligenceBlock[] {
  const registrySummary = referenceConnected
    ? `${university.name} — ${university.type}, ${university.city}, ${university.country}, founded ${university.founded}.`
    : INSUFFICIENT_EVIDENCE_LABEL;

  return [
    block({
      id: "registry-profile",
      title: "Registry Profile",
      meaning:
        "Official identity from the local platform catalog — name, country, city, institution type, founding year, and website when recorded.",
      evidenceStatus: referenceConnected ? "connected" : "insufficient",
      detail: registrySummary,
      sourceConnected: referenceConnected,
      displayValue: referenceConnected
        ? "University reference profile available"
        : INSUFFICIENT_EVIDENCE_LABEL,
    }),
    block({
      id: "evidence-status",
      title: "Evidence Status",
      meaning:
        "Shows whether this university record is available and how much verified information is on file today.",
      evidenceStatus: referenceConnected ? "connected" : "insufficient",
      detail: referenceConnected
        ? `${REGISTRY_FIELD_COUNT} catalog fields available — assessed intelligence withheld until sources connect.`
        : INSUFFICIENT_EVIDENCE_LABEL,
      sourceConnected: referenceConnected,
      displayValue: referenceConnected
        ? "Reference data available — extended evidence not yet connected"
        : INSUFFICIENT_EVIDENCE_LABEL,
    }),
    block({
      id: "accreditation-status",
      title: "Accreditation Status",
      meaning:
        "Official accreditation records require connected education authority and quality assurance sources.",
      evidenceStatus: "not_connected",
      detail: NOT_CONNECTED_SOURCE_LABEL,
      sourceConnected: false,
    }),
    block({
      id: "research-capability",
      title: "Research Capability",
      meaning:
        "Research output, faculty metrics, and laboratory capacity require connected research evidence sources.",
      evidenceStatus: "not_connected",
      detail: NOT_CONNECTED_SOURCE_LABEL,
      sourceConnected: false,
    }),
    block({
      id: "international-cooperation",
      title: "International Cooperation",
      meaning:
        "Exchange programs, bilateral agreements, and international partnerships require connected cooperation datasets.",
      evidenceStatus: "not_connected",
      detail: NOT_CONNECTED_SOURCE_LABEL,
      sourceConnected: false,
    }),
    block({
      id: "scholarship-information",
      title: "Scholarship Information",
      meaning:
        "Scholarship programs, eligibility, and funding transparency require connected education finance sources.",
      evidenceStatus: "not_connected",
      detail: NOT_CONNECTED_SOURCE_LABEL,
      sourceConnected: false,
    }),
    block({
      id: "industry-collaboration",
      title: "Industry Collaboration",
      meaning:
        "Verified industry partnership records require connected collaboration and contract evidence sources.",
      evidenceStatus: "not_connected",
      detail: NOT_CONNECTED_SOURCE_LABEL,
      sourceConnected: false,
    }),
    block({
      id: "government-recognition",
      title: "Government Recognition",
      meaning:
        "Official recognition, charter status, and regulatory filings require connected government education registries.",
      evidenceStatus: "not_connected",
      detail: NOT_CONNECTED_SOURCE_LABEL,
      sourceConnected: false,
    }),
    block({
      id: "innovation-programs",
      title: "Innovation Programs",
      meaning:
        "Innovation incubators, technology transfer, and startup program data require connected innovation evidence sources.",
      evidenceStatus: "not_connected",
      detail: NOT_CONNECTED_SOURCE_LABEL,
      sourceConnected: false,
    }),
    block({
      id: "public-transparency",
      title: "Public Transparency",
      meaning:
        "Financial disclosures, governance reports, and public accountability metrics require connected transparency sources.",
      evidenceStatus: "not_connected",
      detail: NOT_CONNECTED_SOURCE_LABEL,
      sourceConnected: false,
    }),
  ];
}

export function buildUniversityIntelligenceProfile(
  university: University,
  linkedEntities: UniversityLinkedEntities,
): UniversityIntelligenceProfile {
  const resolution = defaultEntityResolver.resolveRef({
    type: "university",
    id: university.id,
    name: university.name,
  });
  const referenceConnected = resolution.entity !== undefined;

  return {
    universityId: university.id,
    referenceConnected,
    registryFieldCount: REGISTRY_FIELD_COUNT,
    blocks: buildIntelligenceBlocks(university, referenceConnected),
    personas: buildPersonaSections(university.name),
    linkedEntities,
    trustPillars: buildTrustPillars(),
    neutralityNotice: INSTITUTIONAL_NEUTRALITY_NOTICE,
  };
}

export function resolveUniversityListEvidenceLabel(
  profile: UniversityIntelligenceProfile,
): string {
  if (profile.referenceConnected) {
    return "Registry available";
  }

  return INSUFFICIENT_EVIDENCE_LABEL;
}

export function universityEvidenceStatusClass(
  status: UniversityEvidenceStatus,
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
