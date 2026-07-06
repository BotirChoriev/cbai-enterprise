/**
 * CBAI UN / Human Rights Connector Readiness — indicator and source family definitions.
 * Official taxonomy references only — no observation values or live connections.
 */

import type {
  UnHumanRightsIndicatorArea,
  UnHumanRightsIndicatorCodeRef,
  UnHumanRightsIndicatorFamily,
  UnHumanRightsSourceFamily,
  UnHumanRightsSourceFamilyId,
} from "@/lib/connectors/un-human-rights/un-human-rights.types";
import { getIndicatorBySlug } from "@/lib/indicator-framework";

function unCode(code: string): UnHumanRightsIndicatorCodeRef {
  return code as UnHumanRightsIndicatorCodeRef;
}

function resolveCbaiIndicator(slug: string): {
  id: string;
  slug: string;
} | null {
  const indicator = getIndicatorBySlug(slug);
  if (!indicator) return null;
  return { id: indicator.id, slug: indicator.slug };
}

/** Official UN agency source families — reference metadata only, not connected. */
export const UN_HUMAN_RIGHTS_SOURCE_FAMILIES: readonly UnHumanRightsSourceFamily[] = [
  {
    familyId: "united-nations-data",
    label: "United Nations Data",
    organization: "United Nations",
    officialWebsite: "https://data.un.org",
    description: "UN statistical databases and country profiles.",
  },
  {
    familyId: "ohchr",
    label: "OHCHR",
    organization: "Office of the United Nations High Commissioner for Human Rights",
    officialWebsite: "https://www.ohchr.org",
    description: "Human rights treaty body reports and universal periodic review records.",
  },
  {
    familyId: "undp",
    label: "UNDP",
    organization: "United Nations Development Programme",
    officialWebsite: "https://www.undp.org",
    description: "Governance and development programme statistical outputs.",
  },
  {
    familyId: "unicef",
    label: "UNICEF",
    organization: "United Nations Children's Fund",
    officialWebsite: "https://www.unicef.org",
    description: "Child protection and welfare statistical series.",
  },
  {
    familyId: "un-women",
    label: "UN Women",
    organization: "United Nations Entity for Gender Equality and the Empowerment of Women",
    officialWebsite: "https://www.unwomen.org",
    description: "Gender equality indicators and SDG 5 monitoring data.",
  },
  {
    familyId: "unhcr",
    label: "UNHCR",
    organization: "United Nations High Commissioner for Refugees",
    officialWebsite: "https://www.unhcr.org",
    description: "Refugee, asylum, and displacement statistical records.",
  },
  {
    familyId: "ilo",
    label: "ILO",
    organization: "International Labour Organization",
    officialWebsite: "https://www.ilo.org",
    description: "Labour standards and employment statistics.",
  },
  {
    familyId: "who",
    label: "WHO",
    organization: "World Health Organization",
    officialWebsite: "https://www.who.int",
    description: "Health system and coverage statistics.",
  },
  {
    familyId: "unesco",
    label: "UNESCO",
    organization: "United Nations Educational, Scientific and Cultural Organization",
    officialWebsite: "https://www.unesco.org",
    description: "Education and culture statistics.",
  },
  {
    familyId: "sdg-global-database",
    label: "SDG Global Database",
    organization: "United Nations Statistics Division",
    officialWebsite: "https://unstats.un.org/sdgs",
    description: "Sustainable Development Goals global indicator database.",
  },
] as const;

type FamilyInput = {
  familyId: string;
  area: UnHumanRightsIndicatorArea;
  title: string;
  description: string;
  sourceFamilies: readonly UnHumanRightsSourceFamilyId[];
  referenceIndicatorCodes: readonly string[];
  cbaiIndicatorSlug: string | null;
  mappingStatus: UnHumanRightsIndicatorFamily["mappingStatus"];
  mappingNotes: string;
};

function defineFamily(input: FamilyInput): UnHumanRightsIndicatorFamily {
  const cbai = input.cbaiIndicatorSlug
    ? resolveCbaiIndicator(input.cbaiIndicatorSlug)
    : null;

  const effectiveStatus =
    input.mappingStatus === "mapped" && !cbai ? "requires_review" : input.mappingStatus;

  return {
    familyId: input.familyId,
    area: input.area,
    title: input.title,
    description: input.description,
    sourceFamilies: input.sourceFamilies,
    referenceIndicatorCodes: input.referenceIndicatorCodes.map(unCode),
    cbaiIndicatorId: cbai?.id ?? null,
    cbaiIndicatorSlug: cbai?.slug ?? input.cbaiIndicatorSlug,
    mappingStatus: effectiveStatus,
    mappingNotes: input.mappingNotes,
  };
}

/** UN / human-rights indicator families by policy area. */
export const UN_HUMAN_RIGHTS_INDICATOR_FAMILIES: readonly UnHumanRightsIndicatorFamily[] = [
  defineFamily({
    familyId: "unhr-family-treaty-reporting",
    area: "human-rights",
    title: "Human Rights Treaty Reporting",
    description: "Treaty body reports and UPR documentation references.",
    sourceFamilies: ["ohchr", "united-nations-data"],
    referenceIndicatorCodes: ["HR-TREATY-REPORT", "UPR-CYCLE-REVIEW"],
    cbaiIndicatorSlug: "human-rights-treaty-reporting",
    mappingStatus: "mapped",
    mappingNotes: "Direct alignment with CBAI human rights treaty reporting indicator.",
  }),
  defineFamily({
    familyId: "unhr-family-institutional-framework",
    area: "governance",
    title: "Institutional Framework",
    description: "Official government structure and governance records from UN sources.",
    sourceFamilies: ["united-nations-data", "undp"],
    referenceIndicatorCodes: ["SDG-16-6-2", "SDG-16-7-1"],
    cbaiIndicatorSlug: "institutional-framework",
    mappingStatus: "mapped",
    mappingNotes: "SDG 16 governance indicators support institutional framework evidence slots.",
  }),
  defineFamily({
    familyId: "unhr-family-judicial-disclosure",
    area: "judicial-system",
    title: "Judicial Independence Disclosure",
    description: "Published judicial structure and legal framework records.",
    sourceFamilies: ["united-nations-data", "undp", "ohchr"],
    referenceIndicatorCodes: ["SDG-16-3-2", "HR-JUDICIAL-FRAMEWORK"],
    cbaiIndicatorSlug: "judicial-independence-disclosure",
    mappingStatus: "mapped",
    mappingNotes: "SDG 16.3.2 aligns with judicial disclosure requirements.",
  }),
  defineFamily({
    familyId: "unhr-family-public-services",
    area: "public-services",
    title: "Public Service Coverage",
    description: "Official public service availability and access records.",
    sourceFamilies: ["united-nations-data", "undp"],
    referenceIndicatorCodes: ["SDG-16-6-1", "SDG-1-4-1"],
    cbaiIndicatorSlug: "public-service-coverage",
    mappingStatus: "mapped",
    mappingNotes: "SDG public institution access series support coverage evidence.",
  }),
  defineFamily({
    familyId: "unhr-family-education",
    area: "education",
    title: "Education Enrollment",
    description: "Education statistics from UN and UNESCO sources.",
    sourceFamilies: ["united-nations-data", "unesco", "sdg-global-database"],
    referenceIndicatorCodes: ["SDG-4-1-1", "SDG-4-3-1"],
    cbaiIndicatorSlug: "education-enrollment-statistics",
    mappingStatus: "requires_review",
    mappingNotes: "UNESCO UIS is primary publisher — UN SDG series require agency disambiguation.",
  }),
  defineFamily({
    familyId: "unhr-family-health",
    area: "health",
    title: "Health System Coverage",
    description: "Health coverage and system statistics from UN and WHO sources.",
    sourceFamilies: ["united-nations-data", "who", "sdg-global-database"],
    referenceIndicatorCodes: ["SDG-3-8-1", "SDG-3-1-1"],
    cbaiIndicatorSlug: "health-system-coverage",
    mappingStatus: "requires_review",
    mappingNotes: "WHO is primary health publisher — UN SDG proxy series require review.",
  }),
  defineFamily({
    familyId: "unhr-family-employment",
    area: "employment",
    title: "Labour and Employment",
    description: "Employment and labour standards statistics from UN and ILO sources.",
    sourceFamilies: ["united-nations-data", "ilo", "sdg-global-database"],
    referenceIndicatorCodes: ["SDG-8-5-2", "SDG-8-6-1"],
    cbaiIndicatorSlug: "labour-market-statistics",
    mappingStatus: "requires_review",
    mappingNotes: "ILO is primary labour publisher — UN SDG employment series require review.",
  }),
  defineFamily({
    familyId: "unhr-family-gender-equality",
    area: "gender-equality",
    title: "Gender Equality",
    description: "SDG 5 gender equality monitoring indicators.",
    sourceFamilies: ["un-women", "sdg-global-database", "united-nations-data"],
    referenceIndicatorCodes: ["SDG-5-1-1", "SDG-5-5-1"],
    cbaiIndicatorSlug: null,
    mappingStatus: "planned",
    mappingNotes: "No dedicated CBAI gender equality indicator — framework extension required.",
  }),
  defineFamily({
    familyId: "unhr-family-child-protection",
    area: "child-protection",
    title: "Child Protection",
    description: "Child welfare and protection statistical series.",
    sourceFamilies: ["unicef", "sdg-global-database"],
    referenceIndicatorCodes: ["SDG-16-2-1", "SDG-16-2-3"],
    cbaiIndicatorSlug: null,
    mappingStatus: "planned",
    mappingNotes: "No dedicated CBAI child protection indicator — framework extension required.",
  }),
  defineFamily({
    familyId: "unhr-family-disability-inclusion",
    area: "disability-inclusion",
    title: "Disability Inclusion",
    description: "Disability inclusion and accessibility monitoring indicators.",
    sourceFamilies: ["united-nations-data", "sdg-global-database", "ohchr"],
    referenceIndicatorCodes: ["SDG-10-2-1", "CRPD-REPORTING"],
    cbaiIndicatorSlug: null,
    mappingStatus: "planned",
    mappingNotes: "No dedicated CBAI disability inclusion indicator — framework extension required.",
  }),
  defineFamily({
    familyId: "unhr-family-migration",
    area: "migration",
    title: "Migration and Displacement",
    description: "Refugee, asylum, and migration statistical records.",
    sourceFamilies: ["unhcr", "united-nations-data"],
    referenceIndicatorCodes: ["UNHCR-POP-STATS", "SDG-10-7-1"],
    cbaiIndicatorSlug: null,
    mappingStatus: "planned",
    mappingNotes: "No dedicated CBAI migration indicator — framework extension required.",
  }),
  defineFamily({
    familyId: "unhr-family-civil-registration",
    area: "civil-registration",
    title: "Civil Registration and Vital Statistics",
    description: "Birth, death, and civil registration completeness records.",
    sourceFamilies: ["united-nations-data", "unicef", "sdg-global-database"],
    referenceIndicatorCodes: ["SDG-16-9-1", "CRVS-COMPLETENESS"],
    cbaiIndicatorSlug: "institutional-framework",
    mappingStatus: "requires_review",
    mappingNotes: "CRVS completeness may align with institutional framework — governance review required.",
  }),
  defineFamily({
    familyId: "unhr-family-climate-commitments",
    area: "sustainable-development",
    title: "Climate Commitments",
    description: "NDC and climate submission records from UN climate frameworks.",
    sourceFamilies: ["united-nations-data", "sdg-global-database"],
    referenceIndicatorCodes: ["SDG-13-2-1", "NDC-SUBMISSION"],
    cbaiIndicatorSlug: "ndc-submission",
    mappingStatus: "mapped",
    mappingNotes: "NDC submission records align with CBAI climate commitment indicator.",
  }),
  defineFamily({
    familyId: "unhr-family-emissions",
    area: "sustainable-development",
    title: "Emissions Inventory",
    description: "Official emissions reporting under UN climate frameworks.",
    sourceFamilies: ["united-nations-data", "sdg-global-database"],
    referenceIndicatorCodes: ["SDG-13-2-2", "UNFCCC-INVENTORY"],
    cbaiIndicatorSlug: "emissions-inventory",
    mappingStatus: "mapped",
    mappingNotes: "UNFCCC inventory references support emissions inventory evidence.",
  }),
  defineFamily({
    familyId: "unhr-family-disaster-preparedness",
    area: "sustainable-development",
    title: "Disaster Preparedness",
    description: "Sendai Framework disaster risk reduction reporting.",
    sourceFamilies: ["united-nations-data", "sdg-global-database"],
    referenceIndicatorCodes: ["SDG-11-5-1", "SENDAI-FRAMEWORK-REPORT"],
    cbaiIndicatorSlug: "sendai-framework-reporting",
    mappingStatus: "mapped",
    mappingNotes: "Sendai reporting aligns with CBAI disaster preparedness indicator.",
  }),
] as const;

export function getUnHumanRightsSourceFamilyById(
  familyId: UnHumanRightsSourceFamilyId,
): UnHumanRightsSourceFamily | undefined {
  return UN_HUMAN_RIGHTS_SOURCE_FAMILIES.find((family) => family.familyId === familyId);
}

export function getUnHumanRightsIndicatorFamilyById(
  familyId: string,
): UnHumanRightsIndicatorFamily | undefined {
  return UN_HUMAN_RIGHTS_INDICATOR_FAMILIES.find((family) => family.familyId === familyId);
}

export function getUnHumanRightsFamiliesByArea(
  area: UnHumanRightsIndicatorArea,
): readonly UnHumanRightsIndicatorFamily[] {
  return UN_HUMAN_RIGHTS_INDICATOR_FAMILIES.filter((family) => family.area === area);
}
