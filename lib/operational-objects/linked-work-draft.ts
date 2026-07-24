/**
 * Prefilled Draft Work Card payloads from Country and Knowledge Graph context.
 * Factual only — never creates records until user confirms in the composer.
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
  | "report_draft";

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

function entityRef(kind: string, id: string): string {
  return `entity:${kind}:${id}`;
}

function graphRef(nodeId: string): string {
  return `graph-node:${nodeId}`;
}

function presetToType(preset: LinkedWorkPreset): OperationalObjectType {
  if (preset === "report_draft") return "work_plan";
  return preset;
}

function presetToDomain(preset: LinkedWorkPreset, surface: "country" | "graph"): OperationalObjectDomain {
  if (preset === "report_draft") return "reports";
  if (preset === "evidence_request") return "evidence";
  if (surface === "graph") return "knowledge";
  return "countries";
}

function presetTypeLabel(
  preset: LinkedWorkPreset,
  locale: string,
): string {
  const copy = getDictionary(locale).operationalObject;
  if (preset === "research_question") return copy.typeResearchQuestion;
  if (preset === "evidence_request") return copy.typeEvidenceRequest;
  if (preset === "report_draft") return copy.typeReportDraft;
  return copy.typeWorkPlan;
}

function titleForEntity(entityName: string, preset: LinkedWorkPreset, locale: string): string {
  return `${entityName} — ${presetTypeLabel(preset, locale)}`;
}

export function buildCountryLinkedWorkDraft(
  context: CountryLinkedWorkContext,
  preset: LinkedWorkPreset,
  locale: string,
): { draft: OperationalObjectDraft; inferredFields: readonly string[] } {
  const copy = getDictionary(locale).operationalObject;
  const inferred = [
    "type",
    "domain",
    "title",
    "objective",
    "relatedObjectIds",
    "requiredInputs",
    "nextAction",
  ] as string[];

  const title = titleForEntity(context.countryName, preset, locale);
  const draft: OperationalObjectDraft = {
    type: presetToType(preset),
    title,
    summary: title,
    objective: title,
    rationale: "",
    expectedOutcome: "",
    domain: presetToDomain(preset, "country"),
    status: "draft",
    priority: "normal",
    requiredInputs: [context.countryName],
    evidenceRequirements:
      preset === "evidence_request" ? [copy.linkedEvidenceOfficialSources] : [],
    nextAction: copy.linkedWorkDefaultNextAction,
    humanDecision: "",
    relatedObjectIds: [entityRef("country", context.countryId)],
    locale,
    provenance: {
      source: "existing_object",
      routePath: context.routePath,
      locale,
      inferredFields: inferred,
      relatedEntityKind: "country",
      relatedEntityId: context.countryId,
      relatedEntityName: context.countryName,
    },
  };

  return { draft, inferredFields: inferred };
}

export function buildGraphLinkedWorkDraft(
  context: GraphLinkedWorkContext,
  preset: LinkedWorkPreset,
  locale: string,
): { draft: OperationalObjectDraft; inferredFields: readonly string[] } {
  const copy = getDictionary(locale).operationalObject;
  const inferred = [
    "type",
    "domain",
    "title",
    "objective",
    "relatedObjectIds",
    "requiredInputs",
    "nextAction",
  ] as string[];

  const title = titleForEntity(context.entityName, preset, locale);
  const draft: OperationalObjectDraft = {
    type: presetToType(preset),
    title,
    summary: title,
    objective: title,
    rationale: "",
    expectedOutcome: "",
    domain: presetToDomain(preset, "graph"),
    status: "draft",
    priority: "normal",
    requiredInputs: [context.entityName],
    evidenceRequirements:
      preset === "evidence_request" ? [copy.linkedEvidenceGraphSources] : [],
    nextAction: copy.linkedWorkDefaultNextAction,
    humanDecision: "",
    relatedObjectIds: [graphRef(context.nodeId), entityRef(context.entityType, context.entityId)],
    locale,
    provenance: {
      source: "existing_object",
      routePath: context.routePath,
      locale,
      inferredFields: inferred,
      relatedEntityKind: context.entityType,
      relatedEntityId: context.entityId,
      relatedEntityName: context.entityName,
      graphNodeId: context.nodeId,
    },
  };

  return { draft, inferredFields: inferred };
}

export const COUNTRY_LINKED_PRESETS: readonly LinkedWorkPreset[] = [
  "research_question",
  "evidence_request",
  "work_plan",
  "report_draft",
];

export const GRAPH_LINKED_PRESETS: readonly LinkedWorkPreset[] = [
  "research_question",
  "evidence_request",
  "work_plan",
];
