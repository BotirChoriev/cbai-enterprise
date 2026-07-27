/**
 * Starter Work Card (Adaptive Intelligence Workspace, Phase 5/6).
 *
 * The five-minute transparent value artifact. It exists ONLY in memory until
 * the user confirms it through the canonical Operational Object composer:
 * draft → user review → edit → explicit confirmation → created exactly once
 * → appears in My Work with provenance preserved.
 *
 * Honesty contract:
 * - user text is preserved verbatim (never translated or rewritten);
 * - everything CBAI derived is marked "inferred" and awaits confirmation;
 * - everything CBAI does not know is marked "unknown";
 * - no fabricated sources, numbers, or capabilities appear anywhere.
 */

import type {
  OperationalObjectDraft,
  OperationalObjectProvenance,
} from "@/lib/operational-objects/operational-object.types";
import {
  adaptiveClarifications,
  buildWorkspaceBlueprint,
  detectActivationRole,
  type ActivationRole,
  type ActivationValueState,
  type ClarificationId,
  type WorkspaceBlueprint,
} from "@/lib/activation/role-workspace-engine";
import { buildInitialMonitoring, type MonitoringIndicator } from "@/lib/activation/monitoring";
import { getActivationCopy } from "@/lib/i18n/platform-copy-activation";

export type ActivationMaterialOrigin = "user_note" | "user_link" | "user_file";

export type ActivationMaterial = {
  readonly origin: ActivationMaterialOrigin;
  /** Preserved verbatim — user content is never rewritten or translated. */
  readonly value: string;
};

export const STARTER_PATHWAY_IDS = [
  "evidence_first",
  "expert_collaboration",
  "pilot_execution",
] as const;

export type StarterPathwayId = (typeof STARTER_PATHWAY_IDS)[number];

export type StarterPathway = {
  readonly id: StarterPathwayId;
  /**
   * What the pathway's claims rest on. "evidence_required" means CBAI has no
   * evidence yet and says so — it never pretends a pathway is proven.
   */
  readonly evidenceBasis: "user_provided" | "public_knowledge" | "evidence_required";
};

export const PLAN_STEP_IDS = ["planStep1", "planStep2", "planStep3", "planStep4", "planStep5"] as const;
export type PlanStepId = (typeof PLAN_STEP_IDS)[number];

export type SevenDayPlanStep = {
  readonly stepId: PlanStepId;
  /** Inclusive day range within the first seven days. */
  readonly days: readonly [number, number];
};

export const HUMAN_DECISION_IDS = [
  "confirm_scope",
  "choose_pathway",
  "approve_plan",
] as const;
export type HumanDecisionId = (typeof HUMAN_DECISION_IDS)[number];

/** Progressive disclosure order for the full Work Card (Phase 6). */
export const WORK_CARD_SECTIONS = [
  "essentials",
  "evidence",
  "options",
  "plan",
  "monitoring",
  "review",
  "history",
] as const;
export type WorkCardSectionId = (typeof WORK_CARD_SECTIONS)[number];

export type StarterWorkCard = {
  readonly workingTitle: string;
  readonly titleState: ActivationValueState;
  readonly role: ActivationRole;
  readonly roleState: ActivationValueState;
  readonly blueprint: WorkspaceBlueprint;
  /** The user's own words — verbatim. */
  readonly originalText: string;
  readonly problemInterpretation: string;
  readonly problemState: ActivationValueState;
  readonly desiredOutcome: string | null;
  readonly outcomeState: ActivationValueState;
  readonly constraints: string | null;
  readonly constraintsState: ActivationValueState;
  readonly materials: readonly ActivationMaterial[];
  /** Clarifications still open — visible as "unknown", never hidden. */
  readonly unknowns: readonly ClarificationId[];
  /** Which aspects CBAI inferred and the user has not yet confirmed. */
  readonly assumptions: readonly string[];
  readonly pathways: readonly StarterPathway[];
  readonly sevenDayPlan: readonly SevenDayPlanStep[];
  readonly monitoring: readonly MonitoringIndicator[];
  readonly humanDecisions: readonly HumanDecisionId[];
  readonly contentLocale: string;
  readonly sourceRoute: string;
  readonly source: Extract<OperationalObjectProvenance["source"], "typed_command" | "voice_command" | "manual">;
  readonly createdVia: "activation";
};

export type BuildStarterWorkCardInput = {
  readonly text: string;
  readonly locale: string;
  readonly source: StarterWorkCard["source"];
  readonly route: string;
  /** Explicit user role choice overrides detection — role is never a silo. */
  readonly roleOverride?: ActivationRole;
  readonly outcome?: string | null;
  readonly problem?: string | null;
  readonly constraints?: string | null;
  readonly materials?: readonly ActivationMaterial[];
};

export function buildStarterWorkCard(input: BuildStarterWorkCardInput): StarterWorkCard {
  const text = input.text.trim();
  const detection = detectActivationRole(text);
  const role = input.roleOverride ?? detection.role;
  const roleState: ActivationValueState = input.roleOverride
    ? "known"
    : detection.confidence === "explicit"
      ? "inferred"
      : "unknown";
  const blueprint = buildWorkspaceBlueprint(role);

  const outcome = input.outcome?.trim() || null;
  const problem = input.problem?.trim() || null;
  const constraints = input.constraints?.trim() || null;
  const materials = input.materials ?? [];

  const unknowns = adaptiveClarifications({
    text,
    role,
    outcome,
    problem,
    materialsCount: materials.length,
    constraints,
  });

  const assumptions: string[] = [];
  if (!input.roleOverride && detection.confidence === "explicit") assumptions.push("role");
  if (text) assumptions.push("problemInterpretation", "workingTitle");
  assumptions.push("pathways", "sevenDayPlan", "monitoringPlan");

  const workingTitle = text ? text.slice(0, 90) : getActivationCopy(input.locale).untitledWork;

  return {
    workingTitle,
    titleState: text ? "inferred" : "unknown",
    role,
    roleState,
    blueprint,
    originalText: input.text,
    problemInterpretation: problem ?? text,
    problemState: problem ? "known" : text ? "inferred" : "unknown",
    desiredOutcome: outcome,
    outcomeState: outcome ? "known" : "unknown",
    constraints,
    constraintsState: constraints ? "known" : "unknown",
    materials,
    unknowns,
    assumptions,
    pathways: [
      { id: "evidence_first", evidenceBasis: "evidence_required" },
      { id: "expert_collaboration", evidenceBasis: "public_knowledge" },
      { id: "pilot_execution", evidenceBasis: materials.length > 0 ? "user_provided" : "evidence_required" },
    ],
    sevenDayPlan: [
      { stepId: "planStep1", days: [1, 2] },
      { stepId: "planStep2", days: [3, 3] },
      { stepId: "planStep3", days: [4, 5] },
      { stepId: "planStep4", days: [6, 6] },
      { stepId: "planStep5", days: [7, 7] },
    ],
    monitoring: buildInitialMonitoring(role),
    humanDecisions: [...HUMAN_DECISION_IDS],
    contentLocale: input.locale,
    sourceRoute: input.route,
    source: input.source,
    createdVia: "activation",
  };
}

/**
 * Deterministic draft id — the same command delivered twice (for example a
 * duplicated voice event) maps to the same Operational Object id, so the
 * store updates one record instead of creating a duplicate.
 */
export function starterCardDraftId(card: StarterWorkCard): string {
  const seed = `${card.originalText}|${card.role}|${card.contentLocale}`;
  let hash = 5381;
  for (let i = 0; i < seed.length; i += 1) {
    hash = ((hash << 5) + hash + seed.charCodeAt(i)) | 0;
  }
  return `act-${Math.abs(hash).toString(36)}`;
}

/**
 * Map the Starter Work Card onto the canonical Operational Object draft.
 * Persisting and exactly-once confirmation stay entirely in the existing
 * store — this function performs no mutation.
 */
export function starterCardToOperationalDraft(card: StarterWorkCard): OperationalObjectDraft {
  const copy = getActivationCopy(card.contentLocale);
  const inferredFields = card.assumptions;

  return {
    id: starterCardDraftId(card),
    type: card.blueprint.objectType,
    title: card.workingTitle,
    summary: card.problemInterpretation,
    objective: card.desiredOutcome ?? card.problemInterpretation,
    rationale: copy.starterRationale,
    expectedOutcome: card.desiredOutcome ?? copy.badgeUnknown,
    domain: card.blueprint.domain,
    status: "draft",
    priority: "normal",
    requiredInputs: card.unknowns.map((id) => copy.clarifications[id]),
    evidenceRequirements: [copy.pathways.evidence_first.title],
    nextAction: copy.planSteps.planStep1,
    humanDecision: copy.humanDecisionLine,
    knownInformation: [
      `role:${card.role}`,
      ...card.materials.map((m) => `${m.origin}:${m.value}`),
    ],
    missingInformation: card.unknowns.map((id) => copy.clarifications[id]),
    assumptions: card.assumptions,
    humanApprovalRequired: true,
    relatedObjectIds: [],
    sourceCommand: card.originalText,
    locale: card.contentLocale,
    provenance: {
      source: card.source,
      originalText: card.originalText,
      routePath: card.sourceRoute,
      locale: card.contentLocale,
      inferredFields,
    },
    activation: {
      schema: 1,
      card,
    },
  };
}
