import type { OperationalObjectDraft } from "@/lib/operational-objects/operational-object.types";
import type { WimEntityNode, WimRelationship } from "@/lib/world-and-me-intelligence/types";

export const WIM_DRAFT_KINDS = [
  "evidence_request",
  "comparative_study",
  "collaboration_request",
  "research_question",
  "monitoring_plan",
  "project_presentation",
  "meeting_plan",
  "replication_plan",
  "experiment_plan",
  "risk_review",
  "report_draft",
  "decision_brief",
] as const;
export type WimDraftKind = (typeof WIM_DRAFT_KINDS)[number];

export type WimDraftPreview = {
  readonly kind: WimDraftKind;
  readonly draft: OperationalObjectDraft;
  readonly inferredFields: readonly string[];
  readonly confirmationRequired: true;
  readonly idempotencyKey: string;
  readonly paths: readonly string[];
};

function mapType(kind: WimDraftKind): OperationalObjectDraft["type"] {
  switch (kind) {
    case "evidence_request":
      return "evidence_request";
    case "research_question":
      return "research_question";
    case "decision_brief":
      return "decision_brief";
    case "report_draft":
      return "report_draft";
    case "monitoring_plan":
      return "indicator_watch";
    case "meeting_plan":
      return "meeting";
    default:
      return "work_plan";
  }
}

export function previewMapToActionDraft(input: {
  readonly kind: WimDraftKind;
  readonly locale: string;
  readonly selected: WimEntityNode | null;
  readonly relationships: readonly WimRelationship[];
}): WimDraftPreview {
  const entity = input.selected;
  const idempotencyKey = `wim:${input.kind}:${entity?.id ?? "none"}`;
  const inferredFields = ["title", "summary", "objective", "domain", "rationale"] as const;
  const paths = [
    "Request additional source-backed evidence",
    "Compare with a second registry entity",
    "Open a monitoring plan for freshness",
    "Prepare a Decision Brief for human approval",
    "Link related Scientific Deliberation room",
  ].slice(0, 5);

  const draft: OperationalObjectDraft = {
    type: mapType(input.kind),
    title: `${input.kind.replace(/_/g, " ")} — ${entity?.officialName ?? "World and Me"}`.slice(0, 160),
    summary: "Draft from World and Me Intelligence Map. Nothing is saved until you confirm.",
    objective: entity
      ? `Act on ${entity.fullLabel} with evidence-backed options`
      : "Act on current map context with evidence-backed options",
    rationale: `Linked relationships: ${input.relationships.length}. Human confirmation required.`,
    expectedOutcome: "One confirmed Operational Object with preserved map context",
    domain: "knowledge",
    status: "draft",
    priority: "normal",
    requiredInputs: ["Confirm relevance", "Review unknowns"],
    evidenceRequirements: ["Retain provenance for every relationship step"],
    nextAction: "Review draft, then confirm once",
    humanDecision: "Human approval required before create",
    knownInformation: entity ? [entity.id, entity.kind] : [],
    missingInformation: ["Verified live source", "Full methodology coverage"],
    assumptions: ["Local registry relationships are partial until live connectors exist"],
    humanApprovalRequired: true,
    relatedObjectIds: [],
    locale: input.locale,
    provenance: {
      source: "manual",
      routePath: "/graph",
      locale: input.locale,
      relatedEntityKind: entity?.kind,
      relatedEntityId: entity?.id,
      relatedEntityName: entity?.officialName,
      inferredFields,
    },
  };

  return {
    kind: input.kind,
    draft,
    inferredFields,
    confirmationRequired: true,
    idempotencyKey,
    paths,
  };
}

const created = new Set<string>();

export function consumeWimDraftIdempotency(key: string, confirmed: boolean): boolean {
  if (!confirmed) return false;
  if (created.has(key)) return false;
  created.add(key);
  return true;
}

export function resetWimDraftIdempotencyForTests(): void {
  created.clear();
}
