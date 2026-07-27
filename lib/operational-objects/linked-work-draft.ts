/**
 * Shared entity / topic / graph linked-work draft factory.
 * Factual prefills only — never creates records until composer confirm.
 */

import { getDictionary } from "@/lib/i18n/translate";
import type {
  OperationalObjectDomain,
  OperationalObjectDraft,
  OperationalObjectType,
} from "@/lib/operational-objects/operational-object.types";

export type LinkedWorkPreset =
  | "research_question"
  | "evidence_request"
  | "work_plan"
  | "report_draft"
  | "literature_review"
  | "experiment_plan"
  | "relationship_review"
  | "source_verification"
  /** Country Intelligence — maps to existing OO types; Draft Work Card only. */
  | "comparative_study"
  | "monitoring_plan"
  | "risk_review"
  | "decision_brief"
  | "policy_review";

export type LinkedWorkSurface =
  | "country"
  | "company"
  | "university"
  | "research"
  | "graph"
  | "evidence";

export type LinkedWorkEntityContext = {
  readonly relatedEntityKind: LinkedWorkSurface;
  readonly relatedEntityId: string;
  readonly relatedEntityName: string;
  readonly routePath: string;
  readonly parentId?: string;
  readonly relatedObjectIds?: readonly string[];
  readonly graphNodeId?: string;
  readonly domainHint?: OperationalObjectDomain;
};

export type CountryLinkedWorkContext = {
  readonly countryId: string;
  readonly countryName: string;
  readonly routePath: string;
};

export type GraphLinkedWorkContext = {
  readonly nodeId: string;
  readonly entityType: string;
  readonly entityId: string;
  readonly entityName: string;
  readonly routePath: string;
};

export type CompanyLinkedWorkContext = {
  readonly companyId: string;
  readonly companyName: string;
  readonly routePath: string;
};

export type UniversityLinkedWorkContext = {
  readonly universityId: string;
  readonly universityName: string;
  readonly routePath: string;
};

export type ResearchLinkedWorkContext = {
  readonly topicId: string;
  readonly topicName: string;
  readonly routePath: string;
};

function entityRef(kind: string, id: string): string {
  return `entity:${kind}:${id}`;
}

function graphRef(nodeId: string): string {
  return `graph-node:${nodeId}`;
}

function presetToType(preset: LinkedWorkPreset): OperationalObjectType {
  if (preset === "report_draft" || preset === "literature_review" || preset === "experiment_plan") {
    return "work_plan";
  }
  if (
    preset === "relationship_review" ||
    preset === "source_verification" ||
    preset === "risk_review" ||
    preset === "policy_review"
  ) {
    return "review";
  }
  if (preset === "comparative_study") return "research_question";
  if (preset === "monitoring_plan") return "country_watch";
  if (preset === "decision_brief") return "decision_brief";
  return preset;
}

function presetToDomain(preset: LinkedWorkPreset, surface: LinkedWorkSurface): OperationalObjectDomain {
  if (preset === "report_draft") return "reports";
  if (preset === "evidence_request" || preset === "source_verification") return "evidence";
  if (preset === "literature_review" || preset === "experiment_plan") return "research";
  if (preset === "research_question") {
    if (surface === "country") return "countries";
    if (surface === "company") return "companies";
    if (surface === "university") return "universities";
    return "research";
  }
  if (surface === "graph") return "knowledge";
  if (surface === "company") return "companies";
  if (surface === "university") return "universities";
  if (surface === "research") return "research";
  if (surface === "evidence") return "evidence";
  return "countries";
}

function presetTypeLabel(preset: LinkedWorkPreset, locale: string): string {
  const copy = getDictionary(locale).operationalObject;
  if (preset === "research_question" || preset === "comparative_study") return copy.typeResearchQuestion;
  if (preset === "evidence_request") return copy.typeEvidenceRequest;
  if (preset === "report_draft") return copy.typeReportDraft;
  if (preset === "literature_review") return copy.templateLiterature;
  if (preset === "experiment_plan") return copy.templateExperiment;
  if (
    preset === "relationship_review" ||
    preset === "risk_review" ||
    preset === "policy_review"
  ) {
    return copy.typeReview;
  }
  if (preset === "source_verification") return copy.typeSourceReview;
  if (preset === "decision_brief") return copy.typeDecisionBrief;
  if (preset === "monitoring_plan") return copy.typeCountryWatch;
  return copy.typeWorkPlan;
}

function titleForEntity(entityName: string, preset: LinkedWorkPreset, locale: string): string {
  return `${entityName} — ${presetTypeLabel(preset, locale)}`;
}

const INFERRED = [
  "type",
  "domain",
  "title",
  "objective",
  "relatedObjectIds",
  "requiredInputs",
  "nextAction",
] as const;

export function buildEntityLinkedWorkDraft(
  context: LinkedWorkEntityContext,
  preset: LinkedWorkPreset,
  locale: string,
): { draft: OperationalObjectDraft; inferredFields: readonly string[] } {
  const copy = getDictionary(locale).operationalObject;
  const inferred = [...INFERRED];
  const title = titleForEntity(context.relatedEntityName, preset, locale);
  const relatedIds = [
    ...(context.relatedObjectIds ?? []),
    ...(context.graphNodeId ? [graphRef(context.graphNodeId)] : []),
    entityRef(context.relatedEntityKind, context.relatedEntityId),
  ];

  const evidenceNeeds =
    preset === "evidence_request" || preset === "source_verification"
      ? [
          context.relatedEntityKind === "graph"
            ? copy.linkedEvidenceGraphSources
            : copy.linkedEvidenceOfficialSources,
        ]
      : [];

  const draft: OperationalObjectDraft = {
    type: presetToType(preset),
    title,
    summary: title,
    objective: title,
    rationale: "",
    expectedOutcome: "",
    domain: context.domainHint ?? presetToDomain(preset, context.relatedEntityKind),
    status: "draft",
    priority: "normal",
    requiredInputs: [context.relatedEntityName],
    evidenceRequirements: evidenceNeeds,
    nextAction: copy.linkedWorkDefaultNextAction,
    humanDecision: "",
    parentId: context.parentId,
    relatedObjectIds: relatedIds,
    locale,
    knownInformation: [],
    missingInformation: [copy.linkedWorkMissingScope],
    assumptions: [copy.linkedWorkAssumptionEditable],
    provenance: {
      source: "existing_object",
      routePath: context.routePath,
      locale,
      inferredFields: inferred,
      relatedEntityKind: context.relatedEntityKind,
      relatedEntityId: context.relatedEntityId,
      relatedEntityName: context.relatedEntityName,
      graphNodeId: context.graphNodeId,
    },
  };

  return { draft, inferredFields: inferred };
}

export function buildCountryLinkedWorkDraft(
  context: CountryLinkedWorkContext,
  preset: LinkedWorkPreset,
  locale: string,
): { draft: OperationalObjectDraft; inferredFields: readonly string[] } {
  return buildEntityLinkedWorkDraft(
    {
      relatedEntityKind: "country",
      relatedEntityId: context.countryId,
      relatedEntityName: context.countryName,
      routePath: context.routePath,
    },
    preset,
    locale,
  );
}

export function buildGraphLinkedWorkDraft(
  context: GraphLinkedWorkContext,
  preset: LinkedWorkPreset,
  locale: string,
): { draft: OperationalObjectDraft; inferredFields: readonly string[] } {
  return buildEntityLinkedWorkDraft(
    {
      relatedEntityKind: "graph",
      relatedEntityId: context.entityId,
      relatedEntityName: context.entityName,
      routePath: context.routePath,
      graphNodeId: context.nodeId,
      domainHint: "knowledge",
    },
    preset,
    locale,
  );
}

export function buildCompanyLinkedWorkDraft(
  context: CompanyLinkedWorkContext,
  preset: LinkedWorkPreset,
  locale: string,
): { draft: OperationalObjectDraft; inferredFields: readonly string[] } {
  return buildEntityLinkedWorkDraft(
    {
      relatedEntityKind: "company",
      relatedEntityId: context.companyId,
      relatedEntityName: context.companyName,
      routePath: context.routePath,
    },
    preset,
    locale,
  );
}

export function buildUniversityLinkedWorkDraft(
  context: UniversityLinkedWorkContext,
  preset: LinkedWorkPreset,
  locale: string,
): { draft: OperationalObjectDraft; inferredFields: readonly string[] } {
  return buildEntityLinkedWorkDraft(
    {
      relatedEntityKind: "university",
      relatedEntityId: context.universityId,
      relatedEntityName: context.universityName,
      routePath: context.routePath,
    },
    preset,
    locale,
  );
}

export function buildResearchLinkedWorkDraft(
  context: ResearchLinkedWorkContext,
  preset: LinkedWorkPreset,
  locale: string,
): { draft: OperationalObjectDraft; inferredFields: readonly string[] } {
  return buildEntityLinkedWorkDraft(
    {
      relatedEntityKind: "research",
      relatedEntityId: context.topicId,
      relatedEntityName: context.topicName,
      routePath: context.routePath,
      domainHint: "research",
    },
    preset,
    locale,
  );
}

/** Honest evidence-request when a live connector is not available. */
export function buildEvidenceConnectFallbackDraft(input: {
  readonly category: string;
  readonly relatedEntityName?: string;
  readonly relatedEntityKind?: string;
  readonly relatedEntityId?: string;
  readonly routePath: string;
  readonly locale: string;
  readonly reason: string;
}): { draft: OperationalObjectDraft; inferredFields: readonly string[] } {
  const copy = getDictionary(input.locale).operationalObject;
  const title = input.relatedEntityName
    ? `${input.relatedEntityName} — ${copy.typeEvidenceRequest}`
    : `${input.category} — ${copy.typeEvidenceRequest}`;
  const inferred = ["type", "domain", "title", "objective", "nextAction", "evidenceRequirements"] as const;
  const draft: OperationalObjectDraft = {
    type: "evidence_request",
    title,
    summary: title,
    objective: title,
    rationale: input.reason,
    expectedOutcome: "",
    domain: "evidence",
    status: "draft",
    priority: "normal",
    requiredInputs: [input.category, ...(input.relatedEntityName ? [input.relatedEntityName] : [])],
    evidenceRequirements: [input.category],
    nextAction: copy.evidenceConnectNextAction,
    humanDecision: "",
    relatedObjectIds:
      input.relatedEntityKind && input.relatedEntityId
        ? [entityRef(input.relatedEntityKind, input.relatedEntityId)]
        : [],
    locale: input.locale,
    knownInformation: [],
    missingInformation: [copy.evidenceConnectMissingSource],
    assumptions: [copy.evidenceConnectAssumption],
    provenance: {
      source: "manual",
      routePath: input.routePath,
      locale: input.locale,
      inferredFields: [...inferred],
      relatedEntityKind: input.relatedEntityKind,
      relatedEntityId: input.relatedEntityId,
      relatedEntityName: input.relatedEntityName,
    },
  };
  return { draft, inferredFields: [...inferred] };
}

export const COUNTRY_LINKED_PRESETS: readonly LinkedWorkPreset[] = [
  "research_question",
  "evidence_request",
  "comparative_study",
  "monitoring_plan",
  "risk_review",
  "report_draft",
  "decision_brief",
  "policy_review",
];

export const COMPANY_LINKED_PRESETS: readonly LinkedWorkPreset[] = [
  "research_question",
  "source_verification",
  "evidence_request",
  "report_draft",
];

export const UNIVERSITY_LINKED_PRESETS: readonly LinkedWorkPreset[] = [
  "research_question",
  "evidence_request",
  "literature_review",
  "report_draft",
  "comparative_study",
  "monitoring_plan",
  "decision_brief",
  "policy_review",
];

export const RESEARCH_LINKED_PRESETS: readonly LinkedWorkPreset[] = [
  "research_question",
  "literature_review",
  "experiment_plan",
  "evidence_request",
];

export const GRAPH_LINKED_PRESETS: readonly LinkedWorkPreset[] = [
  "relationship_review",
  "evidence_request",
  "work_plan",
  "report_draft",
];
