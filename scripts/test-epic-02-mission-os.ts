// EPIC-02 — Mission Operating System lifecycle verification.
// Run with: npm run test:epic-02-mission-os

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  deriveMissionLifecycle,
  getMissionNextAction,
} from "@/lib/intelligence-os/mission-lifecycle";
import { deriveLegacyTrail } from "@/lib/intelligence-os/legacy-trail";
import { deriveReportReadiness } from "@/lib/intelligence-os/report-readiness";
import { isMissionCreationComplete } from "@/lib/intelligence-os/mission-engine";
import type { Mission } from "@/lib/intelligence-os/mission.types";

function readSource(relativePath: string): string {
  return readFileSync(join(process.cwd(), relativePath), "utf-8");
}

const sampleMission: Mission = {
  id: "mission-test-1",
  problem: "Understand antibiotic resistance patterns in Central Asia hospitals",
  whyExists: "Reduce preventable treatment failures",
  whoBenefits: "Patients and clinicians",
  whoCouldBeHarmed: "Patients if conclusions are premature",
  evidenceHave: "Two peer-reviewed studies",
  evidenceMissing: "Local hospital surveillance data",
  disciplines: ["microbiology"],
  capabilitiesNeeded: "Epidemiologist with hospital access",
  environmentalImpact: "Minimal direct environmental effect",
  successCriteria: "Documented evidence chain with impact review",
  projectId: "project-test-1",
  status: "active",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

test("1. Mission lifecycle returns exists, missing, and nextAction for every stage", () => {
  const lifecycle = deriveMissionLifecycle(sampleMission);
  assert.equal(lifecycle.length, 7);
  for (const stage of lifecycle) {
    assert.ok(stage.nextAction.length > 0);
    assert.ok(stage.href.length > 0);
    assert.ok(["complete", "partial", "missing", "blocked"].includes(stage.status));
  }
});

test("2. Empty mission lifecycle prompts creation — no fabricated progress", () => {
  const lifecycle = deriveMissionLifecycle(null);
  assert.equal(lifecycle.length, 7);
  assert.ok(lifecycle.every((s) => s.status === "missing"));
  const next = getMissionNextAction(null);
  assert.ok(next?.nextAction.includes("Create"));
});

test("3. Mission creation completeness requires real fields", () => {
  assert.ok(isMissionCreationComplete(sampleMission));
  assert.ok(!isMissionCreationComplete({ ...sampleMission, problem: "short" }));
});

test("4. Legacy trail empty without mission — no fabricated artifacts", () => {
  const trail = deriveLegacyTrail(null);
  assert.equal(trail.isEmpty, true);
  assert.equal(trail.artifacts.length, 0);
});

test("5. Legacy trail includes mission problem from stored mission object", () => {
  const trail = deriveLegacyTrail(sampleMission);
  assert.ok(trail.artifacts.some((a) => a.kind === "mission" && a.detail.includes("antibiotic")));
});

test("6. Report readiness states are qualitative — impact required before claim", () => {
  const readiness = deriveReportReadiness("nonexistent-project");
  assert.ok(["draft", "incomplete", "impact_required", "reviewed", "decision_required"].includes(readiness.state));
  assert.equal(readiness.canClaimReadiness, false);
});

test("7. Mission context provider wired in dashboard layout", () => {
  const layout = readSource("app/(dashboard)/layout.tsx");
  assert.match(layout, /MissionContextProvider/);
});

test("8. Mission thread timeline uses lifecycle hrefs and next actions", () => {
  const timeline = readSource("components/canvas/CanvasMissionTimeline.tsx");
  assert.match(timeline, /deriveMissionLifecycle/);
  assert.match(timeline, /nextAction/);
});

test("9. Mission persists via mission-store localStorage keys", () => {
  const store = readSource("lib/intelligence-os/mission-store.ts");
  assert.match(store, /cbai-missions/);
  assert.match(store, /cbai-current-mission-id/);
});

test("10. Human Impact panel editable and linked to mission", () => {
  const panel = readSource("components/mission/HumanImpactPanel.tsx");
  assert.match(panel, /saveHumanImpact/);
  const canvas = readSource("components/canvas/IntelligenceCanvas.tsx");
  assert.match(canvas, /HumanImpactPanel/);
});
