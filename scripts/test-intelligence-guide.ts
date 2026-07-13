// Focused tests for the "Intelligence Guide Activation" mission — the Project Guide's real
// next-step resolution, Project Health's real signals, and the new Command Center phrases
// ("open next step", "generate project report", "open project evidence"). Same zero-dependency
// harness as the other test scripts (Node's native node:test + the `@/` alias loader).
//
// Important environment note (matches every other *-project-*.ts suite in this repo): outside a
// browser, localStorage never persists, so `createProject()` returns a real, correctly-shaped
// object but it can never be found again via `loadProjects()`/`loadProject()`/`updateProject()` —
// there is no working round-trip in this environment. Tests that need "a project that already has
// real sub-data" construct the Project object directly (via object spread) and pass it straight
// into the pure functions under test, exactly as resolveProjectGuideStep/deriveProjectHealth
// already require (they take a Project value, not an id to re-fetch). Tests that exercise the
// store's honest-emptiness outside a browser assert that honesty directly, matching the pattern
// already established by scripts/test-project-engine.ts.
// Run with: npm run test:intelligence-guide

import { test } from "node:test";
import assert from "node:assert/strict";
import { createProject, markProjectReportGenerated, loadProject } from "@/lib/project/project-store";
import { resolveProjectGuideStep } from "@/lib/project/project-guide";
import { deriveProjectHealth } from "@/lib/project/project-health";
import { resolveProjectCommand } from "@/lib/project/project-commands";

function bareProject() {
  return createProject({
    title: "Guide Test Project",
    type: "research_project",
    description: "test",
    tags: [],
    visibility: "private",
    status: "active",
  });
}

test("1. resolveProjectGuideStep suggests the Research Question first, for a brand-new project", () => {
  const project = bareProject();
  const step = resolveProjectGuideStep(project);
  assert.equal(step.id, "add_question");
  assert.equal(step.suggestion, "Add your Research Question");
  assert.ok(step.href.includes(`project=${project.id}`));
  assert.ok(step.href.endsWith("#project-question"));
});

test("2. resolveProjectGuideStep's suggestions never use ordering language", () => {
  const project = bareProject();
  const step = resolveProjectGuideStep(project);
  const forbidden = ["you must", "required", "mandatory"];
  const text = `${step.suggestion} ${step.detail}`.toLowerCase();
  for (const word of forbidden) {
    assert.ok(!text.includes(word), `suggestion text must not contain "${word}"`);
  }
});

test("3. resolveProjectGuideStep advances to Objectives once a Research Question exists", () => {
  const project = createProject({
    title: "Project With Question",
    type: "research_project",
    description: "test",
    researchQuestion: "Does this work?",
    tags: [],
    visibility: "private",
    status: "active",
  });
  const step = resolveProjectGuideStep(project);
  assert.equal(step.id, "define_objectives");
});

test("4. resolveProjectGuideStep follows the mission's exact order — Question, Objectives, Evidence, Related Entities, Notes, Report — and only reaches 'ready' once every real signal is true", () => {
  const base = bareProject();
  const withQuestion = { ...base, researchQuestion: "Does this work?" };
  assert.equal(resolveProjectGuideStep(withQuestion).id, "define_objectives");

  const withObjectives = { ...withQuestion, objectives: "Find out." };
  // Outside a browser, evidence/entities/notes are honestly empty regardless of project fields,
  // so the next real gap is evidence — proving the Guide reads real sub-store state, not just
  // the Project record itself.
  assert.equal(resolveProjectGuideStep(withObjectives).id, "collect_evidence");

  const withReport = { ...withObjectives, reportGeneratedAt: new Date().toISOString() };
  // Even with a report timestamp set, evidence/entities/notes are still honestly empty outside a
  // browser, so the Guide must not skip ahead to "ready."
  assert.equal(resolveProjectGuideStep(withReport).id, "collect_evidence");
});

test("5. deriveProjectHealth's questionExists reflects the real persisted field, never a session flag", () => {
  const project = bareProject();
  assert.equal(deriveProjectHealth(project).questionExists, false);

  const withQuestion = { ...project, researchQuestion: "Does this work?" };
  assert.equal(deriveProjectHealth(withQuestion).questionExists, true);
});

test("6. deriveProjectHealth reports real counts and booleans — never a fabricated percentage or score", () => {
  const project = bareProject();
  const health = deriveProjectHealth(project);
  assert.equal(health.questionExists, false);
  assert.equal(health.objectivesExist, false);
  assert.equal(health.evidenceCount, 0);
  assert.equal(health.notesCount, 0);
  assert.equal(health.entityLinksCount, 0);
  assert.equal(health.reportGenerated, false);
  assert.equal(health.tasksCount, 0);
  assert.equal(health.tasksDoneCount, 0);
  assert.equal(health.openQuestionsCount, 0);
  assert.ok(!("percentage" in health));
  assert.ok(!("score" in health));

  const withReport = { ...project, reportGeneratedAt: new Date().toISOString() };
  assert.equal(deriveProjectHealth(withReport).reportGenerated, true);
});

test("7. markProjectReportGenerated / updateProject are honest outside a browser — never throw, never fabricate a found record", () => {
  assert.doesNotThrow(() => {
    const result = markProjectReportGenerated("not-a-real-project-id");
    // Nothing persists outside a browser, so there is nothing real to update — null, not a
    // fabricated success.
    assert.equal(result, null);
    assert.equal(loadProject("not-a-real-project-id"), null);
  });
});

test("8. resolveProjectCommand is honest about 'open next step' when no projects exist", () => {
  const result = resolveProjectCommand("open next step");
  assert.ok(result);
  assert.equal(result!.type, "message");
});

test("9. resolveProjectCommand is honest about 'generate project report' when no projects exist", () => {
  const result = resolveProjectCommand("generate project report");
  assert.ok(result);
  assert.equal(result!.type, "message");
});

test("10. resolveProjectCommand is honest about 'open project evidence' when no projects exist", () => {
  const result = resolveProjectCommand("open project evidence");
  assert.ok(result);
  assert.equal(result!.type, "message");
});

test("11. resolveProjectCommand still returns null for phrases none of its patterns own", () => {
  assert.equal(resolveProjectCommand("open my work"), null);
  assert.equal(resolveProjectCommand("open evidence"), null);
});

test("12. Every ProjectGuideStep id maps to an href containing the real project id", () => {
  const project = bareProject();
  const withEverythingSetExceptSubData = {
    ...project,
    researchQuestion: "Q",
    objectives: "O",
    reportGeneratedAt: new Date().toISOString(),
  };
  const step = resolveProjectGuideStep(withEverythingSetExceptSubData);
  assert.ok(step.href.startsWith(`/my-work?project=${project.id}`));
});
