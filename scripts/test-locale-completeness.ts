/**
 * Locale completeness — Uzbek Research Canvas and navigation copy regression tests.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { RESEARCH_CANVAS_UZ } from "@/lib/i18n/platform-copy-research-canvas-uz";
import { RESEARCH_HOME_UZ } from "@/lib/i18n/platform-copy-build007-uz";
import { VOICE_CONTROL_UZ } from "@/lib/i18n/platform-copy-voice-control";
import { getResearchCanvasRuntimeCopy } from "@/lib/i18n/research-canvas-runtime-copy";
import { assertTerminologyConsistency, terminologyLabel } from "@/lib/i18n/terminology-registry";
import { getDictionary } from "@/lib/i18n/translate";
import { buildDecisionSupportPackage } from "@/lib/research-canvas/decision-support";
import { buildCurrentLandscape } from "@/lib/research-canvas/research-discovery";
import { createSmartIdea } from "@/lib/research-canvas/smart-idea-store";

const ENGLISH_UI_SENTENCES = [
  "Decision Support Package",
  "No measurement plan defined.",
  "No connected open-science records imported.",
  "Expert review may be required.",
  "CBAI presents facts, analysis, uncertainty, and options",
  "Private — device-local unless shared mode",
  "No connected records yet",
  "CBAI does not claim global completeness.",
  "Research Intelligence",
];

function readSource(path: string): string {
  return readFileSync(path, "utf8");
}

test("UZ Research Canvas DISCOVER runtime copy has no identified English UI sentences", () => {
  const bundle = Object.values(getResearchCanvasRuntimeCopy("uz")).join("\n");
  for (const sentence of ENGLISH_UI_SENTENCES) {
    assert.ok(!bundle.includes(sentence), `Found English sentence: ${sentence}`);
  }
});

test("UZ COMPARE gap statement is localized", () => {
  const copy = getResearchCanvasRuntimeCopy("uz");
  const landscape = buildCurrentLandscape("missing-idea-id", copy);
  const gap = landscape.find((item) => item.kind === "gap");
  assert.ok(gap);
  assert.equal(gap!.label, copy.gapNoConnectedRecords);
  assert.equal(gap!.limitation, copy.gapCompletenessLimitation);
});

test("UZ DECIDE decision support uses localized boundary text", () => {
  const copy = getResearchCanvasRuntimeCopy("uz");
  const idea = createSmartIdea({
    title: "Test",
    originalDescription: "desc",
    problem: "problem",
    purpose: "purpose",
    domain: "test",
    owner: "test",
  });
  const pkg = buildDecisionSupportPackage(idea, copy);
  assert.equal(pkg.humanDecisionBoundary, copy.humanDecisionBoundary);
  assert.ok(pkg.unknown.includes(copy.noMeasurementPlan));
});

test("UZ Research home primary UI is Uzbek", () => {
  assert.equal(RESEARCH_HOME_UZ.title, "Tadqiqot intellekti");
  assert.ok(!RESEARCH_HOME_UZ.subheadline.startsWith("Connect research"));
  assert.equal(RESEARCH_HOME_UZ.searchButton, "Tadqiqot qidirish");
});

test("UZ Research Canvas decisionSupport label localized", () => {
  assert.equal(RESEARCH_CANVAS_UZ.decisionSupport, "Qarorni qo'llab-quvvatlash paketi");
});

test("UZ voice control includes Uzbek recognition warning", () => {
  assert.ok(VOICE_CONTROL_UZ.uzbekRecognitionWarning.includes("O'zbekcha nutq"));
});

test("OperatingNavigator home branch uses translateNavLabel", () => {
  const source = readSource("components/operating/OperatingNavigator.tsx");
  assert.ok(source.includes("translateNavLabel(t, item.href, item.label)"));
});

test("EN/RU/TR dictionaries include voiceControl keys", () => {
  for (const lang of ["en", "ru", "tr", "uz"] as const) {
    const dict = getDictionary(lang);
    assert.ok(dict.voiceControl.confirmAction);
    assert.ok(dict.researchHome.title);
  }
});

test("scientific provider names remain in research canvas copy", () => {
  assert.ok(RESEARCH_CANVAS_UZ.searchCrossref.includes("Crossref"));
});

test("terminology registry has no conflicting primary labels", () => {
  assert.deepEqual(assertTerminologyConsistency(), []);
  assert.equal(terminologyLabel("myWork", "uz"), "Mening ishlarim");
});

test("no hardcoded English human-decision boundary in UZ runtime copy", () => {
  const copy = getResearchCanvasRuntimeCopy("uz");
  assert.ok(!copy.humanDecisionBoundary.includes("The human selects"));
});

test("ResearchHero uses dictionary researchHome strings", () => {
  const source = readSource("components/research/ResearchHero.tsx");
  assert.ok(source.includes("researchHome.title"));
  assert.ok(!source.includes("RESEARCH_HOME.title"));
});
