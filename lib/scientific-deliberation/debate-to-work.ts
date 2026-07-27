import type { DeliberationBundle } from "@/lib/scientific-deliberation/types";
import type { OperationalObjectDraft } from "@/lib/operational-objects/operational-object.types";

export const DEBATE_TO_WORK_KINDS = [
  "evidence_request",
  "research_question",
  "comparative_study",
  "replication_plan",
  "experiment_plan",
  "literature_review",
  "joint_research_project",
  "decision_brief",
  "monitoring_plan",
  "consensus_disagreement_report",
] as const;
export type DebateToWorkKind = (typeof DEBATE_TO_WORK_KINDS)[number];

export type DebateToWorkPreview = {
  readonly kind: DebateToWorkKind;
  readonly draft: OperationalObjectDraft;
  readonly inferredFields: readonly string[];
  readonly confirmationRequired: true;
  readonly idempotencyKey: string;
  readonly relations: {
    readonly roomId: string;
    readonly claimIds: readonly string[];
    readonly evidenceIds: readonly string[];
    readonly participants: readonly string[];
    readonly unresolvedQuestions: readonly string[];
  };
};

function mapType(kind: DebateToWorkKind): OperationalObjectDraft["type"] {
  switch (kind) {
    case "evidence_request":
      return "evidence_request";
    case "research_question":
      return "research_question";
    case "decision_brief":
      return "decision_brief";
    case "consensus_disagreement_report":
      return "report_draft";
    case "joint_research_project":
      return "project";
    case "monitoring_plan":
      return "indicator_watch";
    default:
      return "work_plan";
  }
}

/**
 * Preview Debate-to-Work Operational Object. Creation requires explicit confirm elsewhere.
 * Idempotency key is stable for room+kind+claim set.
 */
export function previewDebateToWork(
  bundle: DeliberationBundle,
  kind: DebateToWorkKind,
  locale: string,
): DebateToWorkPreview {
  const claimIds = bundle.claims.map((c) => c.id);
  const evidenceIds = bundle.evidence.map((e) => e.id);
  const idempotencyKey = `sdn:${bundle.room.id}:${kind}:${claimIds.join(",") || "none"}`;
  const unresolved = [
    ...bundle.claims.filter((c) => c.status === "unknown" || c.status === "proposed").map((c) => c.statement),
    ...(bundle.synthesis?.unknown ?? []),
  ];
  const inferredFields = ["title", "summary", "objective", "domain", "rationale"] as const;
  const draft: OperationalObjectDraft = {
    type: mapType(kind),
    title: `${kind.replace(/_/g, " ")} — ${bundle.room.title}`.slice(0, 160),
    summary: `From deliberation room ${bundle.room.id}. Human approval required.`,
    objective: bundle.room.scientificQuestion,
    rationale: `Linked claims: ${claimIds.join(", ") || "none"}. Policy evidence rooms never automate political decisions.`,
    expectedOutcome: "Human-reviewed next scientific or operational step",
    domain: "evidence",
    status: "draft",
    priority: "normal",
    requiredInputs: unresolved.slice(0, 5),
    evidenceRequirements: evidenceIds.length
      ? evidenceIds.map((id) => `Retain evidence ${id}`)
      : ["Add source-backed evidence before execution"],
    nextAction: "Confirm human review of linked claims and evidence",
    humanDecision: "Final scientific approval remains with the named human approver",
    owner: bundle.room.finalHumanApprover,
    knownInformation: bundle.evidence.map((e) => e.id).slice(0, 8),
    missingInformation: unresolved.slice(0, 8),
    assumptions: bundle.claims.flatMap((c) => c.assumptions).slice(0, 8),
    humanApprovalRequired: true,
    relatedObjectIds: [],
    locale,
    dueAt: bundle.room.endsAt ?? undefined,
    provenance: {
      source: "manual",
      routePath: `/evidence?room=${encodeURIComponent(bundle.room.id)}`,
      locale,
      relatedEntityKind: "deliberation_room",
      relatedEntityId: bundle.room.id,
      relatedEntityName: bundle.room.title,
      inferredFields,
    },
  };

  return {
    kind,
    draft,
    inferredFields,
    confirmationRequired: true,
    idempotencyKey,
    relations: {
      roomId: bundle.room.id,
      claimIds,
      evidenceIds,
      participants: bundle.participants.map((p) => p.displayLabel),
      unresolvedQuestions: unresolved,
    },
  };
}

const createdKeys = new Set<string>();

/** Exactly-once creation gate for a process lifetime / test harness. */
export function consumeDebateToWorkIdempotency(key: string, confirmed: boolean): boolean {
  if (!confirmed) return false;
  if (createdKeys.has(key)) return false;
  createdKeys.add(key);
  return true;
}

export function resetDebateToWorkIdempotencyForTests(): void {
  createdKeys.clear();
}
