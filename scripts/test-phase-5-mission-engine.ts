// Phase 5 — Mission engine stage foundations.
// Run with: npm run test:phase-5-mission-engine

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  MISSION_ENGINE_STAGES,
  applyMissionStageTransition,
  canCompleteMissionEngine,
  canRecordFinalDecision,
  requiredEvidenceIncomplete,
  type MissionEngineRuntime,
} from "@/lib/mission-engine";

function readSource(relativePath: string): string {
  return readFileSync(join(process.cwd(), relativePath), "utf-8");
}

function baseRuntime(overrides: Partial<MissionEngineRuntime> = {}): MissionEngineRuntime {
  return {
    missionId: "mission-test-1",
    stage: "define",
    tasks: [
      {
        id: "task-1",
        title: "Draft problem statement",
        assigneeId: "local-user",
        status: "pending",
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    ],
    assignees: ["local-user"],
    evidenceRequirements: [],
    humanReviewCheckpoints: [],
    decision: null,
    stageAudit: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

test("1. Mission engine exposes eight stages", () => {
  assert.deepEqual([...MISSION_ENGINE_STAGES], [
    "define",
    "collect",
    "verify",
    "analyze",
    "compare",
    "scenario",
    "review",
    "complete",
  ]);
});

test("2. Stage transitions append who/when audit", () => {
  const result = applyMissionStageTransition(baseRuntime(), "collect", "alice", "Started collection");
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.runtime.stage, "collect");
    assert.equal(result.runtime.stageAudit.length, 1);
    assert.equal(result.runtime.stageAudit[0].changedBy, "alice");
    assert.equal(result.runtime.stageAudit[0].fromStage, "define");
    assert.ok(result.runtime.stageAudit[0].changedAt.length > 0);
  }
});

test("3. Completion blocked when required evidence incomplete", () => {
  const runtime = baseRuntime({
    stage: "review",
    evidenceRequirements: [
      {
        id: "req-1",
        description: "Primary source",
        evidenceId: null,
        required: true,
        satisfied: false,
      },
    ],
    decision: {
      summary: "Ready",
      approvedByHuman: true,
      approvedBy: "alice",
      approvedAt: "2026-01-02T00:00:00.000Z",
      notes: null,
    },
  });
  assert.equal(requiredEvidenceIncomplete(runtime), true);
  const gate = canCompleteMissionEngine(runtime);
  assert.equal(gate.ok, false);
  if (!gate.ok) {
    assert.match(gate.reason, /required evidence/i);
  }
  const blocked = applyMissionStageTransition(runtime, "complete", "alice");
  assert.equal(blocked.ok, false);
});

test("4. Final decision requires human approval flag", () => {
  const runtime = baseRuntime({
    evidenceRequirements: [
      {
        id: "req-1",
        description: "Primary source",
        evidenceId: "ev-1",
        required: true,
        satisfied: true,
      },
    ],
  });
  const denied = canRecordFinalDecision(runtime, false);
  assert.equal(denied.ok, false);
  const allowed = canRecordFinalDecision(runtime, true);
  assert.equal(allowed.ok, true);
});

test("5. Completion allowed only with evidence + human approval", () => {
  const runtime = baseRuntime({
    stage: "review",
    evidenceRequirements: [
      {
        id: "req-1",
        description: "Primary source",
        evidenceId: "ev-1",
        required: true,
        satisfied: true,
      },
    ],
    humanReviewCheckpoints: [
      {
        id: "cp-1",
        label: "Final human review",
        required: true,
        approvedBy: "alice",
        approvedAt: "2026-01-02T00:00:00.000Z",
        notes: null,
      },
    ],
    decision: {
      summary: "Approved decision",
      approvedByHuman: true,
      approvedBy: "alice",
      approvedAt: "2026-01-02T00:00:00.000Z",
      notes: null,
    },
  });
  assert.equal(canCompleteMissionEngine(runtime).ok, true);
  const done = applyMissionStageTransition(runtime, "complete", "alice");
  assert.equal(done.ok, true);
});

test("6. My Work panel and store wiring exist", () => {
  const panel = readSource("components/mission/MissionEngineStagePanel.tsx");
  assert.match(panel, /MissionEngineStagePanel/);
  assert.match(panel, /stageAudit/);
  assert.match(panel, /human approval/i);
  const myWork = readSource("components/my-work/MyWorkPageClient.tsx");
  assert.match(myWork, /MissionEngineStagePanel/);
  const store = readSource("lib/mission-engine/mission-engine-store.ts");
  assert.match(store, /cbai-mission-engine-runtimes/);
  const types = readSource("lib/intelligence-os/mission.types.ts");
  assert.match(types, /MissionEngineStage/);
});
