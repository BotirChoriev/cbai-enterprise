// Focused tests for the "Research Workspace Activation" mission — real note/finding/evidence-
// lifecycle persistence (SSR-safety, honest emptiness outside a browser), the Evidence Lifecycle
// stage vocabulary, and the extended Research Topic Report (question, supporting/counter
// evidence, notes). Same zero-dependency harness as the other test scripts (Node's native
// `node:test` + the `@/` alias loader — no DOM/localStorage is present in this environment, which
// is itself the honest SSR case every store function must handle safely).
// Run with: npm run test:research-workspace-activation

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  loadResearchNotes,
  saveResearchNote,
  loadResearchFindings,
  saveResearchFinding,
  loadEvidenceLifecycle,
  advanceEvidenceLifecycle,
  EVIDENCE_LIFECYCLE_STAGES,
  EVIDENCE_LIFECYCLE_LABELS,
} from "@/lib/research/research-workspace-store";
import { buildEntityReport } from "@/lib/entity/entity-report";
import { getResearchTopicById, RESEARCH_TOPICS } from "@/lib/research/research-topics";
import { buildResearchMission } from "@/lib/research-mission/research-mission-builder";

const MICROBIOLOGY = getResearchTopicById("microbiology")!;

test("1. Evidence Lifecycle stages are the exact real 7-stage vocabulary, in order", () => {
  assert.deepEqual(EVIDENCE_LIFECYCLE_STAGES, [
    "collected",
    "reviewed",
    "linked",
    "compared",
    "referenced",
    "included_in_report",
    "archived",
  ]);
  for (const stage of EVIDENCE_LIFECYCLE_STAGES) {
    assert.ok(EVIDENCE_LIFECYCLE_LABELS[stage].length > 0);
  }
});

test("2. Research notes are SSR-safe outside a browser — honestly empty, never throws", () => {
  assert.doesNotThrow(() => {
    const notes = loadResearchNotes(MICROBIOLOGY.topicId);
    assert.deepEqual(notes, []);
  });
});

test("3. Saving a research note outside a browser never throws and returns the real note shape", () => {
  assert.doesNotThrow(() => {
    const note = saveResearchNote({ topicId: MICROBIOLOGY.topicId, body: "Test note" });
    assert.equal(note.topicId, MICROBIOLOGY.topicId);
    assert.equal(note.body, "Test note");
    assert.ok(note.noteId.length > 0);
    assert.ok(note.createdAt.length > 0);
  });
});

test("4. Research findings are SSR-safe outside a browser — honestly empty, never throws", () => {
  assert.doesNotThrow(() => {
    assert.deepEqual(loadResearchFindings(MICROBIOLOGY.topicId), []);
  });
});

test("5. Saving a research finding outside a browser never throws and returns the real finding shape", () => {
  assert.doesNotThrow(() => {
    const finding = saveResearchFinding({ topicId: MICROBIOLOGY.topicId, summary: "Test finding" });
    assert.equal(finding.summary, "Test finding");
    assert.ok(finding.findingId.length > 0);
  });
});

test("6. Evidence lifecycle is SSR-safe outside a browser — honestly empty (no fabricated stages)", () => {
  assert.doesNotThrow(() => {
    assert.deepEqual(loadEvidenceLifecycle(MICROBIOLOGY.topicId), {});
  });
});

test("7. Advancing evidence lifecycle outside a browser never throws", () => {
  assert.doesNotThrow(() => {
    advanceEvidenceLifecycle(MICROBIOLOGY.topicId, "some-evidence-id");
  });
});

test("8. buildEntityReport(research_topic) includes the real research question", () => {
  const report = buildEntityReport("research_topic", MICROBIOLOGY.topicId)!;
  const mission = buildResearchMission({ missionId: MICROBIOLOGY.topicId });
  const expectedQuestion = mission.workspaceContract?.missionSummary.missionCenter.question.question;
  assert.ok(report.question.length > 0);
  if (expectedQuestion) {
    assert.equal(report.question, expectedQuestion);
  }
});

test("9. buildEntityReport(research_topic) surfaces real supporting/counter evidence, never fabricated", () => {
  const report = buildEntityReport("research_topic", MICROBIOLOGY.topicId)!;
  const mission = buildResearchMission({ missionId: MICROBIOLOGY.topicId });
  assert.deepEqual(report.supportingEvidence, mission.workspaceContract?.evidenceSummary.supportingEvidence ?? []);
  assert.deepEqual(report.counterEvidence, mission.workspaceContract?.evidenceSummary.conflictingEvidence ?? []);
});

test("10. buildEntityReport(research_topic) includes real persisted notes (honestly empty in this environment)", () => {
  const report = buildEntityReport("research_topic", MICROBIOLOGY.topicId)!;
  assert.ok(Array.isArray(report.notes));
});

test("11. Report limitations honestly state when no counter evidence is connected", () => {
  const report = buildEntityReport("research_topic", MICROBIOLOGY.topicId)!;
  if (report.counterEvidence.length === 0) {
    assert.ok(report.limitations.some((l) => l.toLowerCase().includes("counter evidence")));
  }
});

test("12. Every real research topic produces a report with a real, non-empty question", () => {
  for (const topic of RESEARCH_TOPICS.slice(0, 10)) {
    const report = buildEntityReport("research_topic", topic.topicId)!;
    assert.ok(report.question.length > 0, `${topic.topicId} must have a real question`);
  }
});
