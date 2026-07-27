/**
 * Academic Intelligence Workspace — discipline-oriented view for students/researchers.
 * Uses real university registry + research topic catalog only. Never invents
 * researchers, papers, experiments, or results.
 */

import { universities, type University } from "@/lib/universities";
import { countries } from "@/lib/countries";
import {
  RESEARCH_TOPICS,
  type ResearchTopic,
  type ResearchDomainId,
} from "@/lib/research/research-topics";
import { namesMatch } from "@/lib/name-match";
import { buildDomainRelationship, type DomainRelationshipRecord } from "@/lib/domain-intelligence/typed-relationship";

export type AcademicComparisonKind =
  | "university_vs_university"
  | "department_vs_department"
  | "method_vs_method"
  | "earlier_vs_current"
  | "supporting_vs_conflicting"
  | "local_vs_international";

export type AcademicComparisonView = {
  readonly kind: AcademicComparisonKind;
  readonly leftLabel: string;
  readonly rightLabel: string;
  readonly status: "available" | "unavailable";
  readonly notice: string;
};

export type AcademicIntelligenceWorkspace = {
  readonly schemaVersion: 1;
  readonly discipline: {
    readonly domainId: ResearchDomainId | null;
    readonly domainName: string | null;
    readonly topic: ResearchTopic | null;
    readonly relatedMethods: readonly string[];
    readonly relatedEvidenceTypes: readonly string[];
    readonly catalogStatus: string | null;
  };
  readonly geography: {
    readonly focusCountryId: string | null;
    readonly focusCountryName: string | null;
    readonly localUniversities: readonly University[];
    readonly internationalUniversities: readonly University[];
  };
  readonly hierarchy: {
    readonly faculties: readonly [];
    readonly departments: readonly [];
    readonly researchers: readonly [];
    readonly researchGroups: readonly [];
    readonly projects: readonly [];
    readonly publications: readonly [];
    readonly experiments: readonly [];
    readonly datasets: readonly [];
    readonly mathematicalModels: readonly [];
    readonly findings: readonly [];
    readonly limitations: readonly string[];
    readonly replications: readonly [];
    readonly conflictingResults: readonly [];
    readonly openQuestions: readonly string[];
  };
  readonly comparisons: readonly AcademicComparisonView[];
  readonly relationships: readonly DomainRelationshipRecord[];
  readonly timeline: {
    readonly events: readonly [];
    readonly notice: string;
  };
  readonly primaryNextAction: {
    readonly kind: "create_evidence_request" | "create_research_question" | "open_topic";
    readonly label: string;
  };
  readonly honestyNotice: string;
};

export type BuildAcademicWorkspaceInput = {
  readonly topicId?: string | null;
  readonly domainId?: ResearchDomainId | null;
  readonly countryId?: string | null;
  readonly universityIds?: readonly string[];
};

export function buildAcademicIntelligenceWorkspace(
  input: BuildAcademicWorkspaceInput = {},
): AcademicIntelligenceWorkspace {
  const topic =
    (input.topicId
      ? RESEARCH_TOPICS.find((t) => t.topicId === input.topicId) ?? null
      : null) ??
    (input.domainId
      ? RESEARCH_TOPICS.find((t) => t.domainId === input.domainId) ?? null
      : null);

  const domainId = topic?.domainId ?? input.domainId ?? null;
  const domainName = topic?.domain ?? null;

  const focusCountry =
    input.countryId
      ? countries.find(
          (c) =>
            c.id === input.countryId ||
            c.code.toLowerCase() === String(input.countryId).toLowerCase(),
        ) ?? null
      : null;

  const localUniversities = focusCountry
    ? universities.filter((u) => namesMatch(u.country, focusCountry.name))
    : [];
  const internationalUniversities = focusCountry
    ? universities.filter((u) => !namesMatch(u.country, focusCountry.name))
    : [...universities];

  const selectedUniversities =
    input.universityIds && input.universityIds.length > 0
      ? universities.filter((u) => input.universityIds!.includes(u.id))
      : localUniversities.length > 0
        ? localUniversities
        : universities.slice(0, 3);

  const relationships: DomainRelationshipRecord[] = [];
  for (const uni of selectedUniversities) {
    const country = countries.find((c) => namesMatch(c.name, uni.country));
    if (!country) continue;
    const rel = buildDomainRelationship({
      kind: "LOCATED_IN",
      fromKind: "university",
      fromId: uni.id,
      fromLabel: uni.name,
      toKind: "country",
      toId: country.id,
      toLabel: country.name,
      confidence: "registry_derived",
      provenance: {
        materialClass: "official_source",
        derivedFrom: "local-university-country-match",
        sourceLabel: "CBAI local university registry",
      },
    });
    if (rel) relationships.push(rel);
  }

  const openQuestions = [
    topic
      ? `Which universities have verified work on “${topic.topicName}”? (publication index not connected)`
      : "Which discipline or research topic should be the focus?",
    "Which departments and researchers performed related work? (academic registry not connected)",
    "Which methods, datasets, and instruments were used? (artifact registry not connected)",
    "Which findings agree or conflict? (evidence network not populated)",
  ];

  const comparisons: AcademicComparisonView[] = [
    {
      kind: "university_vs_university",
      leftLabel: selectedUniversities[0]?.name ?? "University A",
      rightLabel: selectedUniversities[1]?.name ?? "University B",
      status: selectedUniversities.length >= 2 ? "unavailable" : "unavailable",
      notice:
        "University comparison of research output requires connected publications and findings. Registry names alone are not research results.",
    },
    {
      kind: "local_vs_international",
      leftLabel: focusCountry ? `${focusCountry.name} universities` : "Local universities",
      rightLabel: "International universities",
      status: "unavailable",
      notice:
        localUniversities.length > 0
          ? `${localUniversities.length} local and ${internationalUniversities.length} international universities are in the registry. Research output comparison is not connected.`
          : "Select a country to separate local vs international registry universities. Research output comparison is not connected.",
    },
    {
      kind: "method_vs_method",
      leftLabel: topic?.relatedMethods[0] ?? "Method A",
      rightLabel: topic?.relatedMethods[1] ?? "Method B",
      status: "unavailable",
      notice:
        "Method labels come from the research topic catalog. Outcome rankings and empirical method comparisons are not connected.",
    },
    {
      kind: "supporting_vs_conflicting",
      leftLabel: "Supporting findings",
      rightLabel: "Conflicting findings",
      status: "unavailable",
      notice: "No finding records are connected — contradiction views stay empty rather than fabricated.",
    },
    {
      kind: "earlier_vs_current",
      leftLabel: "Earlier work",
      rightLabel: "Current work",
      status: "unavailable",
      notice: "Temporal research comparison requires dated publications and experiments — not connected.",
    },
    {
      kind: "department_vs_department",
      leftLabel: "Department A",
      rightLabel: "Department B",
      status: "unavailable",
      notice: "Faculty/department hierarchy is not in the local registry.",
    },
  ];

  return {
    schemaVersion: 1,
    discipline: {
      domainId,
      domainName,
      topic,
      relatedMethods: topic?.relatedMethods ?? [],
      relatedEvidenceTypes: topic?.relatedEvidenceTypes ?? [],
      catalogStatus: topic?.status ?? null,
    },
    geography: {
      focusCountryId: focusCountry?.id ?? null,
      focusCountryName: focusCountry?.name ?? null,
      localUniversities,
      internationalUniversities,
    },
    hierarchy: {
      faculties: [],
      departments: [],
      researchers: [],
      researchGroups: [],
      projects: [],
      publications: [],
      experiments: [],
      datasets: [],
      mathematicalModels: [],
      findings: [],
      limitations: [
        "Academic hierarchy below university (faculty, department, researcher) has no populated instance records.",
        "Publication, dataset, experiment, and finding registries are readiness shells only.",
      ],
      replications: [],
      conflictingResults: [],
      openQuestions,
    },
    comparisons,
    relationships,
    timeline: {
      events: [],
      notice: "No dated academic events are connected for this query.",
    },
    primaryNextAction: topic
      ? {
          kind: "create_evidence_request",
          label: `Create evidence request for “${topic.topicName}” sources`,
        }
      : {
          kind: "create_research_question",
          label: "Create a research question Draft Work Card",
        },
    honestyNotice:
      "This workspace shows real registry universities and catalog topic metadata only. Researchers, papers, experiments, datasets, results, and metrics are not invented.",
  };
}
