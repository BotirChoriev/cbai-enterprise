import type { University } from "@/lib/universities";
import type { UniversityLinkedEntities } from "@/lib/universities.adapter";
import { buildUniversityCoverageProfile } from "@/lib/universities.coverage";
import { defaultEntityResolver } from "@/lib/intelligence/evidence/adapters/entity/entity-resolver";

export type UniversityEvidenceStatus = "connected" | "insufficient" | "not_connected";

export type UniversityPersonaId =
  | "citizen"
  | "investor"
  | "government"
  | "student"
  | "researcher"
  | "academic";

export const INSUFFICIENT_EVIDENCE_LABEL = "Insufficient Evidence";

export const NOT_CONNECTED_SOURCE_LABEL = "Evidence source not connected";

export const INSTITUTIONAL_NEUTRALITY_NOTICE =
  "CBAI provides evidence-based, politically neutral university intelligence. It does not endorse, rank, or promote any institution.";

export type UniversityRegistryFacts = {
  name: string;
  icon: string;
  country: string;
  city: string;
  type: string;
  founded: number;
  website: string | null;
  websiteLabel: string;
  sourceLabel: string;
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

export type UniversityIntelligenceProfile = {
  universityId: string;
  referenceConnected: boolean;
  registryFacts: UniversityRegistryFacts;
  personas: UniversityPersonaSection[];
  linkedEntities: UniversityLinkedEntities;
  trustPillars: UniversityTrustPillar[];
  coverage: ReturnType<typeof buildUniversityCoverageProfile>;
  neutralityNotice: string;
};

const REGISTRY_SOURCE_LABEL = "Available — CBAI Local Registry";

function buildTrustPillars(): UniversityTrustPillar[] {
  return [
    {
      id: "evidence",
      title: "Evidence",
      description:
        "University profiles display registry facts and coverage status. Rankings, enrollment, and research scores are withheld until official sources connect.",
    },
    {
      id: "transparency",
      title: "Transparency",
      description:
        "Every indicator and source shows connection status. Required evidence sources are named — never hidden.",
    },
    {
      id: "methodology",
      title: "Methodology",
      description:
        "CBAI does not publish league tables or global ranks. Future evaluations require methodology and connected sources.",
    },
    {
      id: "political-neutrality",
      title: "Political Neutrality",
      description:
        "CBAI does not endorse institutions, publish rankings, or substitute marketing narratives for verified evidence.",
    },
    {
      id: "no-fake-data",
      title: "No Fake Data",
      description:
        "Unavailable sections state Not connected or Planned — never hidden behind synthetic student counts, faculty metrics, or AI summaries.",
    },
  ];
}

function buildPersonaSections(universityName: string): UniversityPersonaSection[] {
  return [
    {
      id: "citizen",
      title: "Citizen",
      currentValue: `Review ${universityName} registry facts and indicator coverage before relying on any institutional claim. No public rankings shown.`,
      futureCapability:
        "Public transparency and scholarship evidence when ministry and open data sources connect.",
    },
    {
      id: "investor",
      title: "Investor",
      currentValue:
        "Identify registry scope and linked companies in the same country from local catalogs — no innovation or investment scores today.",
      futureCapability:
        "Industry collaboration and innovation indicators when research databases and procurement sources connect.",
    },
    {
      id: "government",
      title: "Government",
      currentValue:
        "Use coverage maps to prioritize official education data publication. No institutional endorsements or league tables.",
      futureCapability:
        "Government recognition and accreditation indicators when ministry and accreditation agency sources connect.",
    },
    {
      id: "student",
      title: "Student",
      currentValue:
        "Institution name, location, type, founding year, and website (when recorded) from local registry only.",
      futureCapability:
        "Accreditation, program catalogs, and employment outcomes when UNESCO and ministry sources connect.",
    },
    {
      id: "researcher",
      title: "Researcher",
      currentValue:
        "Export indicator coverage, source status, and Knowledge Graph relationship counts for reproducible scoping.",
      futureCapability:
        "Research output and international cooperation data when bibliometric and UNESCO sources connect.",
    },
    {
      id: "academic",
      title: "Academic",
      currentValue:
        "CBAI separates reference catalog data from assessed intelligence. Cite source status and methodology in scholarly work.",
      futureCapability:
        "Field-normalized research metrics and cooperation datasets when verified academic sources publish.",
    },
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
    registryFacts: {
      name: university.name,
      icon: university.icon,
      country: university.country,
      city: university.city,
      type: university.type,
      founded: university.founded,
      website: university.website,
      websiteLabel: university.website ?? "Not recorded in local registry",
      sourceLabel: referenceConnected
        ? REGISTRY_SOURCE_LABEL
        : INSUFFICIENT_EVIDENCE_LABEL,
    },
    personas: buildPersonaSections(university.name),
    linkedEntities,
    trustPillars: buildTrustPillars(),
    coverage: buildUniversityCoverageProfile(university),
    neutralityNotice: INSTITUTIONAL_NEUTRALITY_NOTICE,
  };
}

export function resolveUniversityListEvidenceLabel(
  profile: UniversityIntelligenceProfile,
): string {
  const { evidenceCoverage } = profile.coverage;
  if (evidenceCoverage.total > 0) {
    const noun = evidenceCoverage.connected === 1 ? "indicator" : "indicators";
    return `${evidenceCoverage.connected} / ${evidenceCoverage.total} ${noun} connected`;
  }
  if (profile.referenceConnected) {
    return "Registry available";
  }
  return INSUFFICIENT_EVIDENCE_LABEL;
}

export { universityEvidenceStatusClass } from "@/lib/universities.coverage";

export const UNIVERSITY_METHODOLOGY_POINTS = [
  {
    id: "no-rankings-without-evidence",
    title: "No rankings without evidence",
    description:
      "CBAI does not display global ranks, league tables, or education scores until verified official sources and methodology connect.",
  },
  {
    id: "evidence-before-judgment",
    title: "Evidence before judgment",
    description:
      "Registry facts and connected evidence items are shown first. Evaluative conclusions require a documented evidence chain.",
  },
  {
    id: "indicators-require-sources",
    title: "Indicators require official sources",
    description:
      "Each indicator in the Global Indicator Framework declares required sources. Status reflects real connectivity — not UI decoration.",
  },
  {
    id: "rankings-require-methodology",
    title: "Rankings and scores require methodology",
    description:
      "When evaluation becomes available, every metric will cite indicator ID, methodology version, and source provenance before display.",
  },
  {
    id: "no-inferred-partnerships",
    title: "No inferred partnerships",
    description:
      "Research centers, scholarships, and industry partnerships are not invented. Knowledge Graph shows verified local catalog relationships only.",
  },
] as const;
