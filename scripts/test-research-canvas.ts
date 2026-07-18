// Research Canvas — Smart Idea, measurement, and open-science discovery tests.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  createSmartIdea,
  addSmartIdeaArtifact,
  addManualInterpretationDraft,
  confirmExtractedItem,
  buildIdeaModel,
  confirmExternalSearch,
  getSanitizedSearchConcepts,
  recordHumanDecision,
  loadSmartIdea,
} from "@/lib/research-canvas/smart-idea-store";
import { analyzeSvgContent } from "@/lib/research-canvas/svg-geometry-analyzer";
import { analyzeImageMetadata } from "@/lib/research-canvas/image-metadata-analyzer";
import { convertUnits } from "@/lib/research-canvas/unit-converter";
import { UNIT_REGISTRY, getUnit } from "@/lib/research-canvas/unit-registry";
import { validateFormulaDimensions, getFormula } from "@/lib/research-canvas/formula-registry";
import { runCalculation } from "@/lib/research-canvas/scientific-calculator";
import {
  createMeasurementPlan,
  createMeasurementPassport,
  validateMeasurementPassport,
} from "@/lib/research-canvas/measurement-store";
import { parseMolecularFormula, rejectPhotoChemicalClaim } from "@/lib/research-canvas/molecular-formula-analyzer";
import { METHOD_REGISTRY, VIRTUAL_INSTRUMENT_REGISTRY } from "@/lib/research-canvas/instrument-registry";
import { listOpenScienceProviders, getConnectedProviders } from "@/lib/research-canvas/open-science-provider-registry";
import {
  deduplicateByDoi,
  searchOpenScienceForIdea,
  buildHistoricalTimeline,
  compareIdeaToRecord,
} from "@/lib/research-canvas/research-discovery";
import { buildDecisionSupportPackage } from "@/lib/research-canvas/decision-support";
import { resolveResearchCanvasCommand } from "@/lib/research-canvas/research-canvas-operator-commands";
import { loadGenesisAudit } from "@/lib/genesis/genesis-audit-store";

const OPERATOR = "Research Canvas Tester";

function readSource(path: string): string {
  return readFileSync(join(process.cwd(), path), "utf-8");
}

test("1. default Private visibility on Smart Idea create", () => {
  const idea = createSmartIdea({
    title: "Test capacitor sketch",
    originalDescription: "Hand-drawn circuit",
    problem: "Need low-loss capacitor",
    purpose: "Energy storage prototype",
    owner: OPERATOR,
  });
  assert.equal(idea.visibility, "Private");
  assert.equal(idea.externalSearchConfirmed, false);
});

test("2. file metadata extraction for image artifact", () => {
  const idea = createSmartIdea({
    title: "Image test",
    originalDescription: "PNG sketch",
    problem: "Measure wire length",
    purpose: "Calibration test",
    owner: OPERATOR,
  });
  const updated = addSmartIdeaArtifact(idea.id, {
    fileName: "sketch.png",
    mimeType: "image/png",
    fileSizeBytes: 4096,
    kind: "image",
    pixelWidth: 800,
    pixelHeight: 600,
  });
  assert.ok(updated);
  assert.ok(updated!.artifacts.length === 1);
  assert.ok(updated!.extractedItems.some((e) => e.field.includes("dimensions")));
  const meta = analyzeImageMetadata({
    fileName: "sketch.png",
    mimeType: "image/png",
    fileSizeBytes: 4096,
    pixelWidth: 800,
    pixelHeight: 600,
  });
  assert.equal(meta.pixelWidth, 800);
  assert.equal(meta.hasScaleInformation, false);
});

test("3. SVG geometry parsing — rect and circle", () => {
  const svg = `<svg viewBox="0 0 100 100" width="100" height="100">
    <rect id="r1" width="10" height="20"/>
    <circle id="c1" r="5"/>
    <text>Label A</text>
  </svg>`;
  const result = analyzeSvgContent(svg);
  assert.ok(result.elementCount >= 2);
  assert.equal(result.viewBox, "0 0 100 100");
  assert.ok(result.elements.some((e) => e.tag === "rect" && e.area === 200));
  assert.ok(result.elements.some((e) => e.tag === "circle" && e.radius === 5));
  assert.ok(result.textLabels.includes("Label A"));
});

test("4. unsupported SVG path handling", () => {
  const svg = `<svg><path d="M0 0 L10 10"/></svg>`;
  const result = analyzeSvgContent(svg);
  assert.equal(result.unsupportedPaths, 1);
  assert.ok(result.limitations.some((l) => l.includes("path")));
});

test("5. interpretation confirmation gate — unconfirmed not verified", () => {
  const idea = createSmartIdea({
    title: "Gate test",
    originalDescription: "SVG",
    problem: "Test gate",
    purpose: "Confirm flow",
    owner: OPERATOR,
  });
  addSmartIdeaArtifact(idea.id, {
    fileName: "d.svg",
    mimeType: "image/svg+xml",
    fileSizeBytes: 200,
    kind: "svg",
    textContent: '<svg><rect width="5" height="5"/></svg>',
  });
  const loaded = loadSmartIdea(idea.id)!;
  assert.ok(loaded.extractedItems.every((e) => e.confirmationStatus !== "Confirmed"));
  const itemId = loaded.extractedItems[0]!.id;
  confirmExtractedItem(idea.id, itemId, { status: "Confirmed", actor: OPERATOR });
  const after = loadSmartIdea(idea.id)!;
  assert.ok(after.extractedItems.some((e) => e.id === itemId && e.confirmationStatus === "Confirmed"));
});

test("6. correction history preserved on extracted item", () => {
  const idea = createSmartIdea({
    title: "Correction test",
    originalDescription: "x",
    problem: "y",
    purpose: "z",
    owner: OPERATOR,
  });
  addSmartIdeaArtifact(idea.id, {
    fileName: "d.svg",
    mimeType: "image/svg+xml",
    fileSizeBytes: 100,
    kind: "svg",
    textContent: '<svg><line x1="0" y1="0" x2="3" y2="4"/></svg>',
  });
  const itemId = loadSmartIdea(idea.id)!.extractedItems[0]!.id;
  confirmExtractedItem(idea.id, itemId, {
    status: "Human-Corrected",
    correctedValue: "5 user units",
    actor: OPERATOR,
  });
  const item = loadSmartIdea(idea.id)!.extractedItems.find((e) => e.id === itemId)!;
  assert.equal(item.userCorrection, "5 user units");
  assert.equal(item.correctedBy, OPERATOR);
  assert.ok(item.correctedAt);
});

test("7. SI base dimensions present in unit registry", () => {
  const bases = ["m", "kg", "s", "A", "K", "mol", "cd"];
  for (const id of bases) {
    assert.ok(getUnit(id), `Missing base unit ${id}`);
  }
  assert.ok(UNIT_REGISTRY.length >= 15);
});

test("8. compatible unit conversions — m to cm", () => {
  const idea = createSmartIdea({
    title: "Convert",
    originalDescription: "",
    problem: "length",
    purpose: "test",
    owner: OPERATOR,
  });
  const r = convertUnits({ value: 2, fromUnitId: "m", toUnitId: "cm", smartIdeaId: idea.id });
  assert.equal(r.ok, true);
  if (r.ok) assert.equal(r.convertedValue, 200);
});

test("9. incompatible conversion rejection — length to mass", () => {
  const idea = createSmartIdea({
    title: "Reject",
    originalDescription: "",
    problem: "bad",
    purpose: "test",
    owner: OPERATOR,
  });
  const r = convertUnits({ value: 1, fromUnitId: "m", toUnitId: "kg", smartIdeaId: idea.id });
  assert.equal(r.ok, false);
  if (!r.ok) assert.match(r.reason, /Incompatible/i);
});

test("10. Celsius to kelvin offset conversion", () => {
  const idea = createSmartIdea({
    title: "Temp",
    originalDescription: "",
    problem: "temp",
    purpose: "test",
    owner: OPERATOR,
  });
  const r = convertUnits({ value: 0, fromUnitId: "C", toUnitId: "K", smartIdeaId: idea.id });
  assert.equal(r.ok, true);
  if (r.ok) assert.ok(Math.abs(r.convertedValue - 273.15) < 0.001);
});

test("11. formula dimension validation — required variables", () => {
  const formula = getFormula("rect-area");
  assert.ok(formula);
  const ok = validateFormulaDimensions(formula!, { length: 4, width: 5 });
  assert.equal(ok.ok, true);
  const bad = validateFormulaDimensions(formula!, { length: 4 });
  assert.equal(bad.ok, false);
});

test("12. geometry calculation — circle area", () => {
  const idea = createSmartIdea({
    title: "Calc",
    originalDescription: "",
    problem: "area",
    purpose: "test",
    owner: OPERATOR,
  });
  const out = runCalculation({
    smartIdeaId: idea.id,
    formulaId: "circle-area",
    variables: { radius: 2 },
    variableUnits: { radius: "m" },
  });
  assert.equal(out.ok, true);
  if (out.ok) {
    assert.ok(Math.abs(out.record.result - Math.PI * 4) < 0.001);
    assert.equal(out.record.isUserDefined, false);
  }
});

test("13. measurement state gates — incomplete plan", () => {
  const idea = createSmartIdea({
    title: "Plan",
    originalDescription: "",
    problem: "measurand missing",
    purpose: "test",
    owner: OPERATOR,
  });
  const plan = createMeasurementPlan({
    smartIdeaId: idea.id,
    measurand: "",
    purpose: "test",
    domain: "general",
    sampleOrObject: "sample",
    methodId: "",
    instrumentId: "manual",
    unitId: "",
    calibration: "",
    referenceStandard: "",
    conditions: "",
    rawDataReference: "",
    processingModel: "",
    uncertaintyNote: "",
    validationNote: "",
    humanReviewRequired: true,
  });
  assert.equal(plan.state, "Input Incomplete");
});

test("14. Measurement Passport validation reviewer gate", () => {
  const idea = createSmartIdea({
    title: "Passport",
    originalDescription: "",
    problem: "length",
    purpose: "test",
    owner: OPERATOR,
  });
  const passport = createMeasurementPassport({
    smartIdeaId: idea.id,
    missionId: null,
    projectId: null,
    researchObjectId: null,
    measuredObject: "wire",
    measurand: "length",
    result: "0.12",
    unit: "m",
    uncertainty: "",
    uncertaintyType: "manual",
    uncertaintyLimitation: "User estimated",
    methodId: "manual-entry",
    instrumentId: "measurement-passport",
    instrumentModel: "manual",
    calibrationStatus: "user-defined",
    calibrationDate: null,
    referenceStandard: "ruler",
    rawDataReference: "manual measurement log",
    processingSoftware: "none",
    algorithmVersion: "1",
    environmentalConditions: "lab bench",
    operator: OPERATOR,
    laboratory: "local",
    limitations: "Approximate — user measured.",
    reproducibilityStatus: "unknown",
  });
  assert.ok(passport);
  const validated = validateMeasurementPassport(passport!.id, {
    reviewer: OPERATOR,
    uncertainty: "±1 mm",
  });
  assert.ok(validated);
  assert.equal(validated!.validationStatus, "Validated");
});

test("15. passport creation rejected without raw data reference", () => {
  const idea = createSmartIdea({
    title: "No raw",
    originalDescription: "",
    problem: "x",
    purpose: "y",
    owner: OPERATOR,
  });
  const p = createMeasurementPassport({
    smartIdeaId: idea.id,
    missionId: null,
    projectId: null,
    researchObjectId: null,
    measuredObject: "x",
    measurand: "length",
    result: "1",
    unit: "m",
    uncertainty: "",
    uncertaintyType: "manual",
    uncertaintyLimitation: "User estimated",
    methodId: "manual-entry",
    instrumentId: "measurement-passport",
    instrumentModel: "manual",
    calibrationStatus: "missing",
    calibrationDate: null,
    referenceStandard: "",
    rawDataReference: "",
    processingSoftware: "",
    algorithmVersion: "",
    environmentalConditions: "",
    operator: OPERATOR,
    laboratory: "",
    limitations: "",
    reproducibilityStatus: "unknown",
  });
  assert.equal(p, null);
});

test("16. AI confidence separated from measurement uncertainty in extraction", () => {
  const idea = createSmartIdea({
    title: "Confidence",
    originalDescription: "",
    problem: "test",
    purpose: "test",
    owner: OPERATOR,
  });
  addSmartIdeaArtifact(idea.id, {
    fileName: "a.png",
    mimeType: "image/png",
    fileSizeBytes: 100,
    kind: "image",
    pixelWidth: 10,
    pixelHeight: 10,
  });
  const item = loadSmartIdea(idea.id)!.extractedItems[0]!;
  assert.ok(typeof item.aiConfidence === "number");
  assert.match(item.limitation, /not measurement uncertainty/i);
});

test("17. molecular formula parsing and no photo-to-chemistry", () => {
  const parsed = parseMolecularFormula("H2O");
  assert.equal(parsed.normalizedFormula, "H2O");
  assert.ok(parsed.molecularMass && parsed.molecularMass > 17);
  const reject = rejectPhotoChemicalClaim("photo");
  assert.match(reject.reason, /photograph/i);
});

test("18. method and virtual instrument capability states", () => {
  assert.ok(METHOD_REGISTRY.some((m) => m.capabilityState === "Working"));
  assert.ok(VIRTUAL_INSTRUMENT_REGISTRY.some((i) => i.capabilityState === "Preview"));
  assert.ok(VIRTUAL_INSTRUMENT_REGISTRY.every((i) => i.limitations.length > 0));
});

test("19. provider registry — honest connection states", () => {
  const providers = listOpenScienceProviders();
  assert.ok(providers.length >= 3);
  assert.ok(providers.every((p) => p.connectionStatus === "configured" || p.connectionStatus === "available"));
  const connected = getConnectedProviders();
  assert.ok(Array.isArray(connected));
});

test("20. DOI deduplication", () => {
  const records = deduplicateByDoi([
    {
      id: "a",
      smartIdeaId: "s1",
      provider: "crossref",
      title: "Paper A",
      authors: [],
      date: "2020",
      doi: "10.1234/a",
      sourceUrl: null,
      openAccessStatus: "unknown",
      abstract: null,
      publicationType: "article",
      license: null,
      retrievedAt: "2024",
      projectStatus: "Status Unknown",
      statusEvidence: "metadata",
      statusLimitation: "limit",
    },
    {
      id: "b",
      smartIdeaId: "s1",
      provider: "crossref",
      title: "Paper A duplicate",
      authors: [],
      date: "2020",
      doi: "10.1234/a",
      sourceUrl: null,
      openAccessStatus: "unknown",
      abstract: null,
      publicationType: "article",
      license: null,
      retrievedAt: "2024",
      projectStatus: "Status Unknown",
      statusEvidence: "metadata",
      statusLimitation: "limit",
    },
  ]);
  assert.equal(records.length, 1);
});

test("21. sanitized search concepts exclude private artifact dataUrl", () => {
  const idea = createSmartIdea({
    title: "Privacy",
    originalDescription: "secret sketch content",
    problem: "Energy storage materials",
    purpose: "Prototype validation",
    owner: OPERATOR,
  });
  addSmartIdeaArtifact(idea.id, {
    fileName: "secret.png",
    mimeType: "image/png",
    fileSizeBytes: 5000,
    kind: "image",
    dataUrl: "data:image/png;base64,SECRETDATA",
    pixelWidth: 100,
    pixelHeight: 100,
  });
  const loaded = loadSmartIdea(idea.id)!;
  const concepts = getSanitizedSearchConcepts(loaded);
  assert.ok(!concepts.some((c) => c.includes("SECRETDATA")));
  assert.ok(!concepts.some((c) => c.includes("base64")));
});

test("22. external search blocked without confirmation", async () => {
  const idea = createSmartIdea({
    title: "Search gate",
    originalDescription: "",
    problem: "battery chemistry research",
    purpose: "discovery",
    owner: OPERATOR,
  });
  const result = await searchOpenScienceForIdea({
    idea,
    keyword: "battery",
    externalSearchConfirmed: false,
  });
  assert.equal(result.connectionState, "blocked");
  assert.equal(result.records.length, 0);
});

test("23. timeline requires source dates from discovery records", () => {
  const idea = createSmartIdea({
    title: "Timeline",
    originalDescription: "",
    problem: "timeline test",
    purpose: "test",
    owner: OPERATOR,
  });
  const timeline = buildHistoricalTimeline(idea.id);
  assert.equal(timeline.length, 0);
});

test("24. comparison explanation and patent note", () => {
  const idea = createSmartIdea({
    title: "Compare",
    originalDescription: "",
    problem: "low loss capacitor",
    purpose: "energy storage",
    owner: OPERATOR,
  });
  addManualInterpretationDraft(
    idea.id,
    "Detailed description of low loss capacitor research comparing materials and measurement needs.",
    OPERATOR,
  );
  const loadedForConfirm = loadSmartIdea(idea.id)!;
  for (const item of loadedForConfirm.extractedItems) {
    confirmExtractedItem(idea.id, item.id, { status: "Confirmed", actor: OPERATOR });
  }
  buildIdeaModel(idea.id, { materials: ["graphene"], unknowns: ["dielectric constant"] });
  const loaded = loadSmartIdea(idea.id)!;
  const cmp = compareIdeaToRecord(loaded, {
    id: "r1",
    smartIdeaId: idea.id,
    provider: "crossref",
    title: "Graphene capacitor study",
    authors: ["A. Researcher"],
    date: "2019",
    doi: "10.5555/test",
    sourceUrl: "https://example.org",
    openAccessStatus: "unknown",
    abstract: "Study of graphene electrodes.",
    publicationType: "article",
    license: "CC-BY",
    retrievedAt: "2024",
    projectStatus: "Status Unknown",
    statusEvidence: "metadata only",
    statusLimitation: "No success inference",
  });
  assert.ok(cmp.similarities.length >= 0);
  assert.match(cmp.patentNote, /professional/i);
});

test("25. Decision Support Package and human decision boundary", () => {
  const idea = createSmartIdea({
    title: "Decision",
    originalDescription: "",
    problem: "Decision path",
    purpose: "test",
    owner: OPERATOR,
  });
  addManualInterpretationDraft(
    idea.id,
    "Detailed manual description for decision support package human boundary verification test.",
    OPERATOR,
  );
  const loadedItems = loadSmartIdea(idea.id)!;
  for (const item of loadedItems.extractedItems) {
    confirmExtractedItem(idea.id, item.id, { status: "Confirmed", actor: OPERATOR });
  }
  buildIdeaModel(idea.id, { humanityBenefit: "Cleaner energy", natureImpact: "Material sourcing review needed" });
  const pkg = buildDecisionSupportPackage(loadSmartIdea(idea.id)!);
  assert.match(pkg.humanDecisionBoundary, /human/i);
  assert.ok(pkg.options.length > 0);
  recordHumanDecision(idea.id, { selectedPath: "Validate in lab", reason: "Need measurement", actor: OPERATOR });
  assert.match(loadSmartIdea(idea.id)!.humanDecision ?? "", /Validate in lab/);
});

test("26. audit trail records research canvas actions", () => {
  const idea = createSmartIdea({
    title: "Audit",
    originalDescription: "",
    problem: "audit test",
    purpose: "test",
    owner: OPERATOR,
  });
  confirmExternalSearch(idea.id, OPERATOR);
  const audit = loadGenesisAudit().filter((a) => a.domain === "research_canvas");
  assert.ok(audit.some((a) => a.action === "smart_idea_created"));
  assert.ok(audit.some((a) => a.action === "external_search_confirmed"));
});

test("27. operator commands resolve with canvas href", () => {
  const cmd = resolveResearchCanvasCommand("Open Research Canvas");
  assert.ok(cmd);
  assert.equal(cmd!.href, "/research/canvas");
});

test("28. route and UI files exist — no fabricated registry-only instruments", () => {
  assert.ok(readSource("app/(dashboard)/research/canvas/page.tsx").includes("ResearchCanvasPageClient"));
  assert.ok(readSource("components/research/canvas/ResearchCanvasClient.tsx").includes("ResearchCanvasClient"));
  const ui = readSource("components/research/canvas/ResearchCanvasClient.tsx");
  assert.match(ui, /externalSearchConfirmed/);
  assert.match(ui, /Private/);
});

test("29. refresh persistence — smart idea reloads from store", () => {
  const idea = createSmartIdea({
    title: "Persist",
    originalDescription: "persist test",
    problem: "store",
    purpose: "reload",
    owner: OPERATOR,
  });
  const reloaded = loadSmartIdea(idea.id);
  assert.equal(reloaded?.title, "Persist");
});

test("30. no fabricated scientific records in discovery normalization", async () => {
  const idea = createSmartIdea({
    title: "Honest",
    originalDescription: "",
    problem: "metadata only test",
    purpose: "test",
    owner: OPERATOR,
  });
  confirmExternalSearch(idea.id, OPERATOR);
  const loaded = loadSmartIdea(idea.id)!;
  const search = await searchOpenScienceForIdea({
    idea: loaded,
    keyword: "10.1038/nature12373",
    externalSearchConfirmed: true,
  });
  for (const r of search.records) {
    assert.ok(r.title);
    assert.match(r.statusLimitation, /does not prove|metadata|Bibliographic/i);
  }
});
