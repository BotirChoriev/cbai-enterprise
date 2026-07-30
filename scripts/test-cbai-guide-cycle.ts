import assert from "node:assert/strict";
import test from "node:test";
import { deriveCbaiGuideCycle } from "@/lib/cbai-guide/cycle";
import type { MissionLifecycleStage } from "@/lib/intelligence-os/mission-lifecycle";

function stage(
  name: MissionLifecycleStage["stage"],
  status: MissionLifecycleStage["status"],
  missing: string | null = null,
): MissionLifecycleStage {
  return {
    stage: name,
    status,
    label: name,
    exists: status === "complete" ? name : null,
    missing,
    nextAction: "",
    href: "/",
  };
}

test("empty persisted mission state blocks Sense and never invents completion", () => {
  const cycle = deriveCbaiGuideCycle([
    stage("mission", "missing", "Define the problem."),
    stage("question", "missing", "Frame the question."),
    stage("evidence", "missing", "Add evidence."),
    stage("reasoning", "missing", "Compare scenarios."),
    stage("impact", "missing", "Human review required."),
    stage("report", "missing", "No action record."),
  ]);

  assert.equal(cycle.completedCount, 0);
  assert.equal(cycle.activeIndex, 0);
  assert.equal(cycle.stages[0].status, "blocked");
  assert.equal(cycle.nextBlocker, "Define the problem.");
  assert.equal(cycle.stages[1].status, "locked");
});

test("real evidence advances Structure but preserves the human decision gate", () => {
  const cycle = deriveCbaiGuideCycle([
    stage("mission", "complete"),
    stage("question", "partial"),
    stage("evidence", "complete"),
    stage("reasoning", "complete"),
    stage("impact", "missing", "Complete humanity impact review."),
    stage("report", "missing", "No action record."),
  ]);

  assert.equal(cycle.completedCount, 3);
  assert.equal(cycle.stages[3].id, "human_decide");
  assert.equal(cycle.stages[3].status, "blocked");
  assert.equal(cycle.stages[3].humanCheckpoint, true);
  assert.equal(cycle.stages[4].status, "locked");
});

test("impact and report never substitute for an explicit human decision", () => {
  const cycle = deriveCbaiGuideCycle([
    stage("mission", "complete"),
    stage("question", "complete"),
    stage("evidence", "complete"),
    stage("reasoning", "complete"),
    stage("impact", "complete"),
    stage("report", "complete"),
  ]);

  assert.equal(cycle.completedCount, 3);
  assert.equal(cycle.stages[3].id, "human_decide");
  assert.equal(cycle.stages[3].status, "blocked");
  assert.match(cycle.nextBlocker ?? "", /mission-linked human decision/i);
  assert.equal(cycle.stages[4].status, "locked");
  assert.equal(cycle.stages[5].status, "locked");
  assert.equal(cycle.stages[6].status, "locked");
});
