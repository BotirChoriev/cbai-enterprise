/**
 * Research Canvas stage navigation — focused regression tests.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  createSmartIdea,
  loadSmartIdea,
  addManualInterpretationDraft,
  confirmExtractedItem,
  buildIdeaModel,
  canBuildIdeaModel,
} from "@/lib/research-canvas/smart-idea-store";
import { deriveCanvasStageStatuses } from "@/lib/research-canvas/canvas-stage-status";
import { CANVAS_STAGES, stagePanelId, prerequisiteStageFor } from "@/lib/research-canvas/canvas-stage-navigation";
import { RESEARCH_CANVAS_UZ } from "@/lib/i18n/platform-copy-research-canvas-uz";
import { buildDecisionSupportPackage } from "@/lib/research-canvas/decision-support";

const OPERATOR = "stage-nav-test";

test("1. Every stage has an operational panel target id", () => {
  for (const stage of CANVAS_STAGES) {
    assert.match(stagePanelId(stage), /^research-canvas-stage-/);
  }
});

test("2. INTERPRET with missing evidence exposes blocked prerequisite key", () => {
  const idea = createSmartIdea({
    title: "Nav test",
    originalDescription: "",
    problem: "Test navigation blocked interpret",
    purpose: "Verify prerequisites",
    owner: OPERATOR,
  });
  const interpret = deriveCanvasStageStatuses(idea).find((s) => s.stage === "INTERPRET")!;
  assert.equal(interpret.status, "Evidence missing");
  assert.equal(interpret.blockedReasonKey, "interpretUploadOrManual");
  assert.equal(prerequisiteStageFor("INTERPRET", interpret), "IDEA");
});

test("3. Manual description unlocks draft interpretation path", () => {
  const idea = createSmartIdea({
    title: "Manual path",
    originalDescription: "Initial",
    problem: "Manual interpret test problem",
    purpose: "Purpose",
    owner: OPERATOR,
  });
  const draft = addManualInterpretationDraft(
    idea.id,
    "This is a detailed manual description of the scientific question and design intent for human review.",
    OPERATOR,
  );
  assert.ok(draft);
  const loaded = loadSmartIdea(idea.id)!;
  assert.ok(loaded.extractedItems.length > 0);
  assert.equal(loaded.stage, "INTERPRET");
});

test("4. Human confirmation required before Idea Model readiness", () => {
  const idea = createSmartIdea({
    title: "Confirm gate",
    originalDescription: "",
    problem: "Gate test",
    purpose: "Test",
    owner: OPERATOR,
  });
  addManualInterpretationDraft(
    idea.id,
    "Detailed enough manual description to create draft interpretation items for review.",
    OPERATOR,
  );
  const pending = loadSmartIdea(idea.id)!;
  assert.equal(canBuildIdeaModel(pending).ok, false);
  assert.equal(buildIdeaModel(idea.id, {}), null);
  for (const item of pending.extractedItems) {
    confirmExtractedItem(idea.id, item.id, { status: "Confirmed", actor: OPERATOR });
  }
  const ready = loadSmartIdea(idea.id)!;
  assert.equal(canBuildIdeaModel(ready).ok, true);
  assert.ok(buildIdeaModel(idea.id, { humanityBenefit: "Test benefit" }));
});

test("5. Blocked MEASURE stage references INTERPRET prerequisite", () => {
  const idea = createSmartIdea({
    title: "Measure block",
    originalDescription: "",
    problem: "Measure blocked",
    purpose: "Test",
    owner: OPERATOR,
  });
  const measure = deriveCanvasStageStatuses(idea).find((s) => s.stage === "MEASURE")!;
  assert.equal(measure.blockedReasonKey, "ideaModelRequired");
  assert.equal(prerequisiteStageFor("MEASURE", measure), "INTERPRET");
});

test("6. Stage panel ids are unique across all eight stages", () => {
  const ids = CANVAS_STAGES.map(stagePanelId);
  assert.equal(new Set(ids).size, CANVAS_STAGES.length);
});

test("7. Refresh reload preserves single Smart Idea record", () => {
  const idea = createSmartIdea({
    title: "Persist one",
    originalDescription: "",
    problem: "No duplicate on reload",
    purpose: "Test",
    owner: OPERATOR,
  });
  const first = loadSmartIdea(idea.id);
  const second = loadSmartIdea(idea.id);
  assert.equal(first?.id, second?.id);
});

test("8. Uzbek workflow strings are localized — not English stage names", () => {
  assert.equal(RESEARCH_CANVAS_UZ.stageInterpret, "TALQIN");
  assert.equal(RESEARCH_CANVAS_UZ.statusEvidenceMissing, "Dalil yetishmaydi");
  assert.equal(RESEARCH_CANVAS_UZ.workflowStatus, "Ish jarayoni holati");
  assert.notEqual(RESEARCH_CANVAS_UZ.stageInterpret, "INTERPRET");
});

test("9. Duplicate empty page header removed from client", () => {
  const src = readFileSync("components/research/canvas/ResearchCanvasClient.tsx", "utf8");
  assert.doesNotMatch(src, /<h1[^>]*>\{t\("researchCanvas\.pageTitle"\)\}/);
  assert.match(src, /role="tablist"/);
  assert.match(src, /stagePanelId/);
});

test("10. Mission banner uses linked mission or honest canvas message", () => {
  const src = readFileSync("components/research/canvas/ResearchCanvasClient.tsx", "utf8");
  assert.match(src, /missionBannerLabel/);
  assert.match(src, /noMissionBanner/);
  assert.match(src, /loadMission/);
});

test("11. Human decision boundary remains on decision package", () => {
  const idea = createSmartIdea({
    title: "Decision boundary",
    originalDescription: "",
    problem: "Boundary",
    purpose: "Test",
    owner: OPERATOR,
  });
  addManualInterpretationDraft(
    idea.id,
    "Detailed manual description long enough to pass the minimum length validation gate.",
    OPERATOR,
  );
  const loaded = loadSmartIdea(idea.id)!;
  for (const item of loaded.extractedItems) {
    confirmExtractedItem(idea.id, item.id, { status: "Confirmed", actor: OPERATOR });
  }
  buildIdeaModel(idea.id, {});
  const pkg = buildDecisionSupportPackage(loadSmartIdea(idea.id)!);
  assert.match(pkg.humanDecisionBoundary, /human/i);
});

test("12. No fake OCR capability introduced in interpret prerequisite copy", () => {
  const src = readFileSync("components/research/canvas/ResearchCanvasClient.tsx", "utf8");
  assert.match(src, /interpretRequiresEvidence/);
  assert.match(src, /ocrUnavailable/);
  assert.doesNotMatch(src, /OCR available/i);
});
