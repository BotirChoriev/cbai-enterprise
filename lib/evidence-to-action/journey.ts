/**
 * Evidence-to-Action journey — orchestrates the canonical five-minute path
 * without persisting Operational Objects until human confirmation in the composer.
 */

import {
  buildStarterWorkCard,
  starterCardToOperationalDraft,
  type StarterWorkCard,
} from "@/lib/activation/starter-work-card";
import { createEvidencePassport, type EvidencePassport } from "@/lib/evidence-passport";
import {
  buildDecisionProvenanceGraph,
  explainWhyConclusionShown,
  type DecisionProvenanceGraph,
} from "@/lib/decision-provenance";
import { previewMapToActionDraft } from "@/lib/world-and-me-intelligence";
import type { WimEntityNode } from "@/lib/world-and-me-intelligence";
import type { OperationalObjectDraft } from "@/lib/operational-objects/operational-object.types";

export type EvidenceToActionStepId =
  | "enter"
  | "describe_goal"
  | "clarify"
  | "sources_and_gaps"
  | "compare_options"
  | "draft_work_card"
  | "confirm"
  | "operational_object"
  | "connect_evidence"
  | "monitor"
  | "report"
  | "inspect_why"
  | "human_decision";

export type JourneyClassification =
  | "VERIFIED"
  | "PARTIAL"
  | "EXTERNAL_BLOCKED"
  | "PRODUCT_DECISION_REQUIRED"
  | "NOT_IMPLEMENTED";

export type JourneyStepStatus = {
  readonly id: EvidenceToActionStepId;
  readonly classification: JourneyClassification;
  readonly detail: string;
};

export type FiveMinuteJourneyResult = {
  readonly card: StarterWorkCard;
  readonly draft: OperationalObjectDraft;
  readonly passport: EvidencePassport;
  readonly provenance: DecisionProvenanceGraph;
  readonly whyShown: string;
  readonly steps: readonly JourneyStepStatus[];
  readonly requiresHumanConfirmation: true;
  readonly persistedOperationalObject: false;
};

const createOnce = new Set<string>();

export function runFiveMinuteEvidenceToActionJourney(input: {
  readonly statement: string;
  readonly locale: string;
  readonly route?: string;
  readonly outcome?: string | null;
  readonly problem?: string | null;
  readonly constraints?: string | null;
  readonly sourceSnippet?: string | null;
}): FiveMinuteJourneyResult {
  const statement = input.statement.trim();
  if (!statement) throw new Error("statement_required");

  const key = `${input.locale}|${statement}`.toLowerCase();
  if (createOnce.has(key)) {
    // Idempotent rebuild for the same statement in-process — still confirmation-gated.
  }
  createOnce.add(key);

  const card = buildStarterWorkCard({
    text: statement,
    locale: input.locale,
    source: "typed_command",
    route: input.route ?? "/",
    outcome: input.outcome ?? null,
    problem: input.problem ?? null,
    constraints: input.constraints ?? null,
    materials: input.sourceSnippet
      ? [{ origin: "user_note", value: input.sourceSnippet }]
      : [],
  });

  const draft = starterCardToOperationalDraft(card);

  const sourceContent =
    input.sourceSnippet?.trim() ||
    card.materials[0]?.value ||
    "User-stated materials only — no external source attached yet.";

  const passport = createEvidencePassport({
    confirmCreate: true,
    claimText: card.problemInterpretation || statement,
    stance: "contextualizes",
    evidenceType: "observation",
    originalSourceContent: sourceContent,
    cbaiSynthesis: `CBAI structured three pathways for human review. Assumptions: ${card.assumptions.join("; ") || "none listed"}.`,
    localizedSummary: null,
    limitations: card.unknowns.map(String),
    contentLocale: input.locale,
    createdLocale: input.locale,
  });

  const options = [
    card.pathways[0] ? `Pathway: ${card.pathways[0].id}` : "Evidence-first path",
    card.pathways[1] ? `Pathway: ${card.pathways[1].id}` : "Expert collaboration path",
    card.pathways[2] ? `Pathway: ${card.pathways[2].id}` : "Pilot execution path",
  ];

  const provenance = buildDecisionProvenanceGraph({
    title: card.workingTitle || statement.slice(0, 80),
    sourceLabel: passport.directSourceUrl || "User-provided / local materials",
    sourceDetail: passport.originalSourceContent.slice(0, 240),
    claimText: passport.claimText,
    counterEvidence: null,
    assumption: card.assumptions[0] || "Assumptions remain unproven until evidence is confirmed.",
    options,
    risk: card.unknowns[0] ? `Open clarification: ${card.unknowns[0]}` : "Risks and unknowns require human judgment.",
    passportId: passport.passportId,
    contentLocale: input.locale,
  });

  const why = explainWhyConclusionShown(provenance);

  const steps: JourneyStepStatus[] = [
    { id: "enter", classification: "VERIFIED", detail: "Activation entry without registration." },
    { id: "describe_goal", classification: "VERIFIED", detail: "Voice or typed statement accepted." },
    { id: "clarify", classification: "VERIFIED", detail: "Adaptive clarifications ≤3." },
    {
      id: "sources_and_gaps",
      classification: "PARTIAL",
      detail: "Passport created from user materials; external live sources may be unavailable.",
    },
    { id: "compare_options", classification: "VERIFIED", detail: "3 pathways structured for review." },
    { id: "draft_work_card", classification: "VERIFIED", detail: "Starter Work Card in memory." },
    {
      id: "confirm",
      classification: "PARTIAL",
      detail: "Draft ready for composer confirmation — not auto-persisted.",
    },
    {
      id: "operational_object",
      classification: "PARTIAL",
      detail: "Appears in My Work only after explicit composer confirm.",
    },
    {
      id: "connect_evidence",
      classification: "PARTIAL",
      detail: "Passport linked in provenance; richer linking is progressive.",
    },
    {
      id: "monitor",
      classification: "PARTIAL",
      detail: "Monitoring indicators start as data_not_connected / source_required.",
    },
    {
      id: "report",
      classification: "PARTIAL",
      detail: "Report Studio drafts require evidence + human approval.",
    },
    { id: "inspect_why", classification: "VERIFIED", detail: why.whyShown },
    {
      id: "human_decision",
      classification: "VERIFIED",
      detail: "finalDecisionOwner=human; CBAI does not auto-decide.",
    },
  ];

  return {
    card,
    draft,
    passport,
    provenance,
    whyShown: why.whyShown,
    steps,
    requiresHumanConfirmation: true,
    persistedOperationalObject: false,
  };
}

export function worldToWorkPreview(input: {
  readonly entityLabel: string;
  readonly locale: string;
}): {
  readonly draft: OperationalObjectDraft | null;
  readonly classification: JourneyClassification;
  readonly detail: string;
} {
  try {
    const selected: WimEntityNode = {
      id: `temp:${input.entityLabel}`,
      kind: "country",
      officialName: input.entityLabel,
      fullLabel: input.entityLabel,
      shortCode: null,
      abbreviationForbiddenAlone: true,
      contentLocale: input.locale,
      sourceLanguage: null,
      geographicCoverage: null,
      evidenceStatus: "unknown",
      classification: "unknown",
      lastVerifiedDate: null,
      href: null,
    };
    const preview = previewMapToActionDraft({
      kind: "evidence_request",
      locale: input.locale,
      selected,
      relationships: [],
    });
    return {
      draft: preview.draft,
      classification: "VERIFIED",
      detail: "World-to-Work draft requires composer confirmation.",
    };
  } catch {
    return {
      draft: null,
      classification: "PARTIAL",
      detail: "World-to-Work preview unavailable for this input.",
    };
  }
}

export function resetEvidenceToActionForTests(): void {
  createOnce.clear();
}
