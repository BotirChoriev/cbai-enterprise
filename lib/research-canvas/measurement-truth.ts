/**
 * Measurement truth — no demo defaults, contextual categories, plan and passport gates.
 */

import type { MeasurementPassport, SmartIdea } from "@/lib/research-canvas/research-canvas-types";
import type { MeasurementProvenanceKind } from "@/lib/research-canvas/measurement-provenance";

export const MEASUREMENT_TYPES = [
  "physical",
  "chemical",
  "digital",
  "statistical",
  "operational",
  "qualitative",
] as const;

export type MeasurementType = (typeof MEASUREMENT_TYPES)[number];

export const MEASUREMENT_PLAN_READINESS = [
  "draft",
  "needs_definition",
  "needs_data",
  "instrument_required",
  "calibration_required",
  "ready_to_collect",
  "ready_to_calculate",
  "human_review_required",
  "supported",
  "inconclusive",
] as const;

export type MeasurementPlanReadiness = (typeof MEASUREMENT_PLAN_READINESS)[number];

export const DEMO_MEASUREMENT_VALUES = new Set(["100", "10", "250", "H2O", "h2o"]);

export type MeasurementPlanDraft = {
  readonly measurementType: MeasurementType | "";
  readonly measurand: string;
  readonly purpose: string;
  readonly operationalDefinition: string;
  readonly rawDataSource: string;
  readonly methodOrFormula: string;
  readonly unitId: string;
  readonly scope: string;
  readonly period: string;
  readonly instrument: string;
  readonly referenceCalibration: string;
  readonly uncertaintyLimitations: string;
  readonly acceptanceCriterion: string;
  readonly humanReviewer: string;
  readonly operationalNumerator: string;
  readonly operationalDenominator: string;
  readonly operationalEvent: string;
};

export function emptyMeasurementPlanDraft(): MeasurementPlanDraft {
  return {
    measurementType: "",
    measurand: "",
    purpose: "",
    operationalDefinition: "",
    rawDataSource: "",
    methodOrFormula: "",
    unitId: "",
    scope: "",
    period: "",
    instrument: "",
    referenceCalibration: "",
    uncertaintyLimitations: "",
    acceptanceCriterion: "",
    humanReviewer: "",
    operationalNumerator: "",
    operationalDenominator: "",
    operationalEvent: "",
  };
}

export function isDemoMeasurementValue(value: string): boolean {
  return DEMO_MEASUREMENT_VALUES.has(value.trim());
}

export function isBlankOrDemo(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.length === 0 || isDemoMeasurementValue(trimmed);
}

const CONCEPTUAL_HINTS =
  /software|operating system|organization|workflow|platform|cbai|digital|conceptual|process|mission|task|decision|interpretation/i;

export function isConceptualIdea(idea: SmartIdea): boolean {
  const text = [
    idea.title,
    idea.problem,
    idea.purpose,
    idea.domain,
    ...(idea.ideaModel?.researchQuestions ?? []),
    ...(idea.ideaModel?.components ?? []),
  ].join(" ");
  return CONCEPTUAL_HINTS.test(text) || idea.domain.toLowerCase().includes("software");
}

export function inferSuggestedMeasurementTypes(idea: SmartIdea): readonly MeasurementType[] {
  if (isConceptualIdea(idea)) {
    return ["operational", "qualitative", "statistical"];
  }
  const domain = idea.domain.toLowerCase();
  if (/chem|molecular|material|compound/.test(domain)) {
    return ["chemical", "physical", "statistical"];
  }
  if (/image|geometry|sketch|diagram/.test(domain)) {
    return ["digital", "physical"];
  }
  return ["physical", "digital", "statistical", "operational", "qualitative"];
}

export function operationalMetricOptions(): readonly string[] {
  return [
    "workflow_completion_rate",
    "problem_to_mission_time",
    "evidence_linked_decisions",
    "blocked_task_resolution_time",
    "claims_with_sources_ratio",
    "interpretation_accuracy",
    "human_decisions_preserved",
    "task_outcome_evidence",
  ];
}

export function evaluateMeasurementPlanReadiness(
  draft: MeasurementPlanDraft,
): { readiness: MeasurementPlanReadiness; gaps: readonly string[] } {
  const gaps: string[] = [];
  if (!draft.measurementType) {
    gaps.push("measurement_type");
  }
  if (!draft.measurand.trim()) {
    gaps.push("measurand");
  }
  if (!draft.purpose.trim()) {
    gaps.push("purpose");
  }
  if (!draft.operationalDefinition.trim()) {
    gaps.push("operational_definition");
  }
  if (!draft.methodOrFormula.trim()) {
    gaps.push("method");
  }

  if (draft.measurementType === "operational") {
    if (!draft.operationalEvent.trim()) gaps.push("operational_event");
    if (!draft.operationalNumerator.trim()) gaps.push("operational_numerator");
    if (!draft.operationalDenominator.trim()) gaps.push("operational_denominator");
    if (!draft.scope.trim()) gaps.push("scope");
    if (!draft.period.trim()) gaps.push("period");
  }

  if (draft.measurementType === "physical" || draft.measurementType === "digital") {
    if (!draft.unitId.trim() && draft.measurementType === "physical") gaps.push("unit");
    if (draft.measurementType === "digital" && !draft.referenceCalibration.trim()) {
      gaps.push("reference_scale");
    }
    if (draft.measurementType === "physical" && !draft.instrument.trim()) {
      gaps.push("instrument");
    }
  }

  if (draft.measurementType === "chemical") {
    if (!draft.methodOrFormula.trim()) gaps.push("formula");
  }

  if (draft.measurementType === "qualitative") {
    if (!draft.humanReviewer.trim()) gaps.push("reviewer");
    if (!draft.acceptanceCriterion.trim()) gaps.push("rubric");
  }

  if (gaps.length > 0) {
    const readiness: MeasurementPlanReadiness =
      gaps.includes("measurement_type") || gaps.includes("measurand") || gaps.includes("method")
        ? "needs_definition"
        : draft.measurementType === "operational" && (gaps.includes("scope") || gaps.includes("period"))
          ? "needs_definition"
          : gaps.includes("instrument")
            ? "instrument_required"
            : gaps.includes("reference_scale") || gaps.includes("reference_scale")
              ? "calibration_required"
              : "needs_data";
    return { readiness, gaps };
  }

  if (!draft.rawDataSource.trim()) {
    return { readiness: "needs_data", gaps: ["raw_data"] };
  }
  if (draft.humanReviewer.trim()) {
    return { readiness: "human_review_required", gaps: [] };
  }
  return { readiness: "ready_to_collect", gaps: [] };
}

export function canRunCalculation(input: {
  values: Readonly<Record<string, string>>;
  explicitAction: boolean;
}): { ok: boolean; reasonKey?: string } {
  if (!input.explicitAction) {
    return { ok: false, reasonKey: "calculationRequiresExplicitAction" };
  }
  for (const value of Object.values(input.values)) {
    if (isBlankOrDemo(value)) {
      return { ok: false, reasonKey: "calculationRequiresUserInput" };
    }
  }
  return { ok: true };
}

export function canCreateMeasurementPassport(input: {
  planId: string | null;
  result: string;
  unit: string;
  methodId: string;
  rawDataReference: string;
  provenanceKind: MeasurementProvenanceKind;
  limitations: string;
  reviewer?: string;
  planReadiness?: MeasurementPlanReadiness;
}): { ok: boolean; reasonKeys: readonly string[] } {
  const reasonKeys: string[] = [];
  if (!input.planId) reasonKeys.push("passportRequiresPlan");
  if (isBlankOrDemo(input.result)) reasonKeys.push("passportRequiresRealResult");
  if (!input.unit.trim()) reasonKeys.push("passportRequiresUnit");
  if (!input.methodId.trim()) reasonKeys.push("passportRequiresMethod");
  if (isBlankOrDemo(input.rawDataReference)) reasonKeys.push("passportRequiresRawData");
  if (!input.limitations.trim()) reasonKeys.push("passportRequiresLimitations");
  if (input.provenanceKind === "CALCULATED" && input.reviewer?.trim()) {
    // allowed
  } else if (input.provenanceKind === "MEASURED" && !input.reviewer?.trim()) {
    reasonKeys.push("passportRequiresReviewerForMeasured");
  }
  if (
    input.planReadiness &&
    ["draft", "needs_definition", "needs_data", "instrument_required", "calibration_required"].includes(
      input.planReadiness,
    )
  ) {
    reasonKeys.push("passportRequiresCompletePlan");
  }
  return { ok: reasonKeys.length === 0, reasonKeys };
}

export function passportValidationStatusForProvenance(
  provenanceKind: MeasurementProvenanceKind,
): MeasurementPassport["validationStatus"] {
  if (provenanceKind === "CALCULATED") return "Validation Required";
  if (provenanceKind === "USER-PROVIDED") return "Validation Required";
  if (provenanceKind === "MEASURED") return "Measured";
  return "Validation Required";
}

export function assertCalculatedNotLabeledMeasured(
  provenanceKind: MeasurementProvenanceKind,
  label: string,
): boolean {
  if (provenanceKind === "CALCULATED") {
    return !/\bmeasured\b/i.test(label);
  }
  return true;
}

export function imageScaleProvided(refPixels: string, refReal: string): boolean {
  return !isBlankOrDemo(refPixels) && !isBlankOrDemo(refReal) && Number(refReal) > 0 && Number(refPixels) > 0;
}
