/**
 * Measurement truth — no demo defaults, contextual workflow regression tests.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  emptyMeasurementWorkflowDraft,
  measurementDraftStore,
} from "@/lib/research-canvas/measurement-draft-store";
import {
  approveMeasurementPlanning,
  rejectExtractedItem,
  buildIdeaModel,
  confirmExtractedItem,
  createSmartIdea,
  loadSmartIdea,
  addManualInterpretationDraft,
} from "@/lib/research-canvas/smart-idea-store";
import {
  canCreateMeasurementPassport,
  canRunCalculation,
  DEMO_MEASUREMENT_VALUES,
  emptyMeasurementPlanDraft,
  evaluateMeasurementPlanReadiness,
  inferSuggestedMeasurementTypes,
  isBlankOrDemo,
  isDemoMeasurementValue,
} from "@/lib/research-canvas/measurement-truth";
import { buildIdeaModelSummary } from "@/lib/research-canvas/idea-model-summary";
import { parseMolecularFormula } from "@/lib/research-canvas/molecular-formula-analyzer";
import {
  createMeasurementPassport,
  createMeasurementPlan,
} from "@/lib/research-canvas/measurement-store";
import { RESEARCH_CANVAS_UZ } from "@/lib/i18n/platform-copy-research-canvas-uz";

const OPERATOR = "measurement-truth-test";
const VALID =
  "Bu batafsil qo'lda tavsif CBAI operatsion tizimi haqidagi g'oya uchun yetarli ma'lumot beradi.";

function readSource(path: string): string {
  return readFileSync(path, "utf8");
}

function ideaWithConfirmedModel(title = "CBAI OS idea") {
  const idea = createSmartIdea({
    title,
    originalDescription: "CBAI operating system workflow",
    problem: "CBAI operating system needs honest measurement workflow",
    purpose: "Improve research canvas truth",
    domain: "software",
    owner: OPERATOR,
  });
  addManualInterpretationDraft(idea.id, VALID, OPERATOR);
  const loaded = loadSmartIdea(idea.id)!;
  for (const item of loaded.extractedItems) {
    confirmExtractedItem(idea.id, item.id, { status: "Confirmed", actor: OPERATOR });
  }
  buildIdeaModel(idea.id, {});
  return loadSmartIdea(idea.id)!;
}

test("1. all measurement inputs start empty for a new Smart Idea", () => {
  const draft = emptyMeasurementWorkflowDraft();
  assert.equal(draft.convValue, "");
  assert.equal(draft.molecularFormula, "");
  assert.equal(draft.refPixels, "");
  assert.equal(draft.refReal, "");
  assert.equal(draft.pixelLength, "");
});

test("2. placeholder values are not real form values", () => {
  const client = readSource("components/research/canvas/ResearchCanvasClient.tsx");
  assert.doesNotMatch(client, /useState\("100"\)/);
  assert.doesNotMatch(client, /useState\("H2O"\)/);
  assert.doesNotMatch(client, /useState\("250"\)/);
});

test("3. no calculation runs on mount", () => {
  const panel = readSource("components/research/canvas/MeasurementWorkflowPanel.tsx");
  assert.match(panel, /const runMolecularCalc = \(\) => \{[\s\S]*parseMolecularFormula/);
  assert.doesNotMatch(panel, /useEffect\([\s\S]*parseMolecularFormula/);
  assert.doesNotMatch(panel, /useEffect\([\s\S]*runCalculation/);
  assert.doesNotMatch(panel, /useEffect\([\s\S]*convertUnits/);
});

test("4. H2O does not appear unless explicitly entered", () => {
  const panel = readSource("components/research/canvas/MeasurementWorkflowPanel.tsx");
  assert.doesNotMatch(panel, /"H2O"/);
  const empty = parseMolecularFormula("");
  assert.equal(empty.molecularMass, null);
});

test("5. no default data is saved", () => {
  const idea = ideaWithConfirmedModel();
  const plan = createMeasurementPlan({
    smartIdeaId: idea.id,
    measurand: "100",
    purpose: "test",
    domain: idea.domain,
    sampleOrObject: idea.title,
    methodId: "manual-entry",
    instrumentId: "manual-entry",
    unitId: "m",
    calibration: "",
    referenceStandard: "",
    conditions: "",
    rawDataReference: "",
    processingModel: "",
    uncertaintyNote: "",
    validationNote: "",
    humanReviewRequired: true,
  });
  assert.equal(plan, null);
});

test("6. no default data affects readiness", () => {
  const readiness = evaluateMeasurementPlanReadiness(emptyMeasurementPlanDraft());
  assert.equal(readiness.readiness, "needs_definition");
});

test("7. blank measurement cannot create a passport", () => {
  const idea = ideaWithConfirmedModel();
  const passport = createMeasurementPassport({
    smartIdeaId: idea.id,
    measurementPlanId: null,
    measuredObject: idea.title,
    measurand: "",
    result: "",
    unit: "",
    uncertainty: "",
    uncertaintyType: "manual",
    uncertaintyLimitation: "",
    methodId: "",
    instrumentId: "manual-entry",
    instrumentModel: "manual",
    calibrationStatus: "missing",
    referenceStandard: "",
    rawDataReference: "",
    processingSoftware: "cbai-research-canvas",
    algorithmVersion: "1.0",
    environmentalConditions: "",
    operator: OPERATOR,
    laboratory: "device-local",
    limitations: "",
    reproducibilityStatus: "not replicated",
    provenanceKind: "USER-PROVIDED",
  });
  assert.equal(passport, null);
});

test("8. example data cannot create a passport", () => {
  const idea = ideaWithConfirmedModel();
  for (const demo of DEMO_MEASUREMENT_VALUES) {
    const passport = createMeasurementPassport({
      smartIdeaId: idea.id,
      measurementPlanId: "mplan-demo",
      measuredObject: idea.title,
      measurand: "length",
      result: demo,
      unit: "m",
      uncertainty: "1",
      uncertaintyType: "manual",
      uncertaintyLimitation: "",
      methodId: "manual-entry",
      instrumentId: "manual-entry",
      instrumentModel: "manual",
      calibrationStatus: "missing",
      referenceStandard: "",
      rawDataReference: "user://observation/1",
      processingSoftware: "cbai-research-canvas",
      algorithmVersion: "1.0",
      environmentalConditions: "",
      operator: OPERATOR,
      laboratory: "device-local",
      limitations: "Test limitation documented.",
      reproducibilityStatus: "not replicated",
      provenanceKind: "USER-PROVIDED",
      reviewer: OPERATOR,
    });
    assert.equal(passport, null, `demo value ${demo} must not create passport`);
  }
});

test("9. calculated result is never labeled Measured", () => {
  const gate = canCreateMeasurementPassport({
    planId: "plan-1",
    result: "18.015",
    unit: "g/mol",
    methodId: "manual-entry",
    rawDataReference: "user://formula/H2O",
    provenanceKind: "CALCULATED",
    limitations: "Calculated from user formula.",
    reviewer: OPERATOR,
  });
  assert.equal(gate.ok, true);
  const passport = createMeasurementPassport({
    smartIdeaId: "sidea-test",
    measurementPlanId: "plan-1",
    measuredObject: "water",
    measurand: "molecular mass",
    result: "18.015",
    unit: "g/mol",
    uncertainty: "",
    uncertaintyType: "manual",
    uncertaintyLimitation: "Formula-based calculation.",
    methodId: "manual-entry",
    instrumentId: "manual-entry",
    instrumentModel: "manual",
    calibrationStatus: "missing",
    referenceStandard: "",
    rawDataReference: "user://formula/H2O",
    processingSoftware: "cbai-research-canvas",
    algorithmVersion: "1.0",
    environmentalConditions: "",
    operator: OPERATOR,
    laboratory: "device-local",
    limitations: "Calculated — not physically measured.",
    reproducibilityStatus: "not replicated",
    provenanceKind: "CALCULATED",
    reviewer: OPERATOR,
  });
  assert.ok(passport);
  assert.notEqual(passport!.validationStatus, "Measured");
});

test("10. molecular result requires explicit text input and submit", () => {
  const gate = canRunCalculation({ values: { formula: "" }, explicitAction: true });
  assert.equal(gate.ok, false);
  const parsed = parseMolecularFormula("H2O");
  assert.ok(parsed.molecularMass);
});

test("11. molecular result is labeled CALCULATED", () => {
  assert.match(RESEARCH_CANVAS_UZ.provenanceCalculated, /HISOB/i);
});

test("12. image real-world distance requires scale", () => {
  const gate = canRunCalculation({
    values: { pixelLength: "250", referenceReal: "", referencePixels: "" },
    explicitAction: true,
  });
  assert.equal(gate.ok, false);
});

test("13. operational metric requires definition, scope and period", () => {
  const readiness = evaluateMeasurementPlanReadiness({
    ...emptyMeasurementPlanDraft(),
    measurementType: "operational",
    measurand: "workflow_completion_rate",
    purpose: "Track workflow",
    operationalDefinition: "Completed workflows / started workflows",
    methodOrFormula: "count ratio",
    operationalEvent: "workflow complete",
    operationalNumerator: "completed",
    operationalDenominator: "started",
    scope: "",
    period: "",
  });
  assert.equal(readiness.readiness, "needs_definition");
});

test("14. Idea Model is shown for human review before MEASURE", () => {
  const idea = ideaWithConfirmedModel();
  assert.ok(idea.ideaModel);
  assert.equal(idea.measurementPlanningApproved, false);
  assert.equal(idea.stage, "INTERPRET");
  const client = readSource("components/research/canvas/ResearchCanvasClient.tsx");
  assert.match(client, /IdeaModelReviewPanel/);
});

test("15. rejected interpretation is excluded from Idea Model", () => {
  const idea = createSmartIdea({
    title: "Reject test",
    originalDescription: "",
    problem: "Reject path",
    purpose: "Test",
    owner: OPERATOR,
  });
  addManualInterpretationDraft(idea.id, VALID, OPERATOR);
  const loaded = loadSmartIdea(idea.id)!;
  const rejectTarget = loaded.extractedItems[0]!;
  for (const item of loaded.extractedItems.slice(1)) {
    confirmExtractedItem(idea.id, item.id, { status: "Confirmed", actor: OPERATOR });
  }
  rejectExtractedItem(idea.id, rejectTarget.id, { reason: "bad", actor: OPERATOR });
  buildIdeaModel(idea.id, {});
  const summary = buildIdeaModelSummary(loadSmartIdea(idea.id)!);
  assert.equal(summary.rejectedExcludedCount, 1);
  assert.ok(summary.confirmedSources.every((s) => s.field !== rejectTarget.field));
});

test("16. unknown Idea Model fields remain Unknown", () => {
  const idea = ideaWithConfirmedModel();
  const summary = buildIdeaModelSummary(idea);
  assert.ok(summary.assumptions.some((a) => /Unknown|Noma'lum|Needs user input/i.test(a)));
});

test("17. user explicitly advances to measurement planning", () => {
  const idea = ideaWithConfirmedModel();
  assert.equal(idea.measurementPlanningApproved, false);
  approveMeasurementPlanning(idea.id, OPERATOR);
  const advanced = loadSmartIdea(idea.id)!;
  assert.equal(advanced.measurementPlanningApproved, true);
  assert.equal(advanced.stage, "MEASURE");
});

test("18. active Smart Idea receives the correct plan", () => {
  const idea = ideaWithConfirmedModel("Operational metrics");
  const types = inferSuggestedMeasurementTypes(idea);
  assert.ok(types.includes("operational"));
  assert.equal(types.includes("chemical"), false);
});

test("19. switching ideas does not leak measurement drafts", () => {
  measurementDraftStore.write("idea-a", { ...emptyMeasurementWorkflowDraft(), measurand: "idea-a-only" });
  measurementDraftStore.write("idea-b", { ...emptyMeasurementWorkflowDraft(), measurand: "idea-b-only" });
  assert.equal(measurementDraftStore.read("idea-a").measurand, "idea-a-only");
  assert.equal(measurementDraftStore.read("idea-b").measurand, "idea-b-only");
});

test("20. Uzbek view has no listed hardcoded English strings in measurement workflow", () => {
  assert.equal(RESEARCH_CANVAS_UZ.measurementPassport, "O'lchov pasporti");
  assert.equal(RESEARCH_CANVAS_UZ.advanceToMeasurementPlanning, "O'lchash rejasiga o'tish");
  assert.notEqual(RESEARCH_CANVAS_UZ.measurementMethodNotDefined, "Measurement method has not been defined yet.");
});

test("21. raw JSON is hidden behind Technical details", () => {
  const panel = readSource("components/research/canvas/MeasurementWorkflowPanel.tsx");
  assert.match(panel, /showMolecularTechnical/);
  assert.match(panel, /technicalDetails/);
  assert.doesNotMatch(panel, /<pre[^>]*>\{JSON\.stringify\(parseMolecularFormula/);
});

test("22. Measurement Passport requires provenance and limitations", () => {
  const gate = canCreateMeasurementPassport({
    planId: "plan-1",
    result: "42",
    unit: "%",
    methodId: "manual-entry",
    rawDataReference: "user://observation/42",
    provenanceKind: "USER-PROVIDED",
    limitations: "",
    reviewer: OPERATOR,
  });
  assert.equal(gate.ok, false);
});

test("23. refresh preserves saved real records without creating defaults", () => {
  const idea = ideaWithConfirmedModel("Persist");
  approveMeasurementPlanning(idea.id, OPERATOR);
  const first = loadSmartIdea(idea.id);
  const second = loadSmartIdea(idea.id);
  assert.equal(first?.measurementPlanningApproved, second?.measurementPlanningApproved);
  assert.equal(emptyMeasurementWorkflowDraft().molecularFormula, "");
});

test("24. human decision/review boundary remains enforced", () => {
  const idea = ideaWithConfirmedModel();
  assert.equal(idea.measurementPlanningApproved, false);
  assert.ok(isBlankOrDemo("100"));
  assert.ok(isDemoMeasurementValue("H2O"));
});
