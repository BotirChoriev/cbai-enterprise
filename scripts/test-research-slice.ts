// Functional test harness for the first live Research Intelligence vertical slice. Uses only
// Node's own built-in test runner (`node:test`) and assertion module (`node:assert/strict`) —
// zero new dependencies, no test framework installed solely for this mission. Run with:
//
//   npm run test:research-slice
//
// which is `node --import ./scripts/register-alias-loader.mjs --test scripts/test-research-slice.ts`
// — the loader only resolves this repo's "@/..." path alias; Node's native TypeScript execution
// (stable since Node 23+) does the rest.

import { test } from "node:test";
import assert from "node:assert/strict";
import { buildResearchWorkspaceContract } from "@/lib/research-workspace/research-workspace-builder";
import { runResearchIntelligencePipeline } from "@/lib/foundation/adapters/research-foundation-adapter";
import { WORKFLOW_STATES } from "@/lib/foundation/workflow-types";
import { buildResearchMission } from "@/lib/research-mission/research-mission-builder";
import { MISSION_LIFECYCLE_STATES } from "@/lib/research-mission/research-mission-engine";

// The richest real topic in the catalog: 3 real relatedMethods, 3 real relatedEvidenceTypes,
// "catalog_available" status, and the only topic cross-referenced by two entities-registry
// records (a laboratory and a dataset) — see docs/current-progress.md for the full trace.
const TEST_TOPIC_ID = "microbiology";
const UNKNOWN_TOPIC_ID = "not-a-real-topic-xyz";

test("1. valid topic ID produces a workspace contract", () => {
  const contract = buildResearchWorkspaceContract({ subjectId: TEST_TOPIC_ID });
  assert.ok(contract, "expected a real contract for a real topic");
  assert.equal(contract?.subjectId, TEST_TOPIC_ID);
});

test("2. unknown topic ID fails safely", () => {
  assert.doesNotThrow(() => {
    const contract = buildResearchWorkspaceContract({ subjectId: UNKNOWN_TOPIC_ID });
    assert.equal(contract, undefined, "expected undefined, not a fabricated contract");
  });
});

test("3. no fabricated fields appear", () => {
  const contract = buildResearchWorkspaceContract({ subjectId: TEST_TOPIC_ID });
  assert.ok(contract);

  // Nothing in this catalog has ever been independently verified — asserting "verified" would
  // be fabricated certainty.
  for (const item of contract!.evidenceSummary.evidence) {
    assert.notEqual(item.verificationStatus, "verified");
  }

  // Researchers and Hypotheses have zero real backing data anywhere in this repository — they
  // must stay empty, never populated with an invented person or claim.
  assert.deepEqual(contract!.researchTeam.team.filter((e) => e.entityKind === "researcher"), []);
  assert.deepEqual(contract!.openHypotheses.hypotheses, []);
});

test("4. empty data remains empty", () => {
  const contract = buildResearchWorkspaceContract({ subjectId: TEST_TOPIC_ID });
  assert.ok(contract);

  // Findings and the research timeline have no persistence layer anywhere in this platform yet.
  assert.deepEqual(contract!.researchFindings.findings, []);
  assert.deepEqual(contract!.researchTimeline.events, []);
});

test("5. pipeline evidence is traceable to source data", () => {
  const contract = buildResearchWorkspaceContract({ subjectId: TEST_TOPIC_ID });
  assert.ok(contract);
  assert.ok(contract!.evidenceSummary.evidence.length > 0, "microbiology should have real catalog evidence");

  for (const item of contract!.evidenceSummary.evidence) {
    assert.ok(item.evidenceId.length > 0);
    assert.ok(
      item.relatedSubjectIds?.includes(TEST_TOPIC_ID),
      `evidence "${item.evidenceId}" should trace back to ${TEST_TOPIC_ID}`,
    );
  }
});

test("6. relationship output is traceable", () => {
  const contract = buildResearchWorkspaceContract({ subjectId: TEST_TOPIC_ID });
  assert.ok(contract);
  const relationships = contract!.knowledgeNetwork.relationships;
  assert.ok(relationships.length > 0, "microbiology should have real catalog relationships");

  for (const relationship of relationships) {
    assert.equal(relationship.sourceId, TEST_TOPIC_ID);
    assert.ok(relationship.explanation.length > 0, "every relationship must carry a real explanation");
  }
});

test("7. reasoning cannot assert a final decision", () => {
  const result = runResearchIntelligencePipeline(TEST_TOPIC_ID);
  assert.ok(result?.reasoning);
  assert.equal(result!.reasoning!.humanDecisionRequired, true);
  assert.ok(result!.reasoning!.humanDecisionReason.length > 0);
});

test("8. workflow state is valid", () => {
  const result = runResearchIntelligencePipeline(TEST_TOPIC_ID);
  assert.ok(result?.workflow);
  assert.ok(
    (WORKFLOW_STATES as readonly string[]).includes(result!.workflow!.currentState),
    `"${result!.workflow!.currentState}" must be one of the declared WORKFLOW_STATES`,
  );
});

test("9. workspace output reuses pipeline and network results (never re-derives)", () => {
  const result = runResearchIntelligencePipeline(TEST_TOPIC_ID);
  const contract = buildResearchWorkspaceContract({ subjectId: TEST_TOPIC_ID });
  assert.ok(result && contract);

  const pipelineEvidenceIds = result!.evidence.map((item) => item.evidenceId).sort();
  const contractEvidenceIds = contract!.evidenceSummary.evidence.map((item) => item.evidenceId).sort();
  assert.deepEqual(contractEvidenceIds, pipelineEvidenceIds, "contract evidence must be the same records the pipeline produced");

  const pipelineRelationshipIds = result!.relationships.map((r) => r.relationshipId).sort();
  const contractRelationshipIds = contract!.knowledgeNetwork.relationships.map((r) => r.relationshipId).sort();
  assert.deepEqual(
    contractRelationshipIds,
    pipelineRelationshipIds,
    "contract relationships must be the same records the pipeline produced",
  );
});

test("10. the selected topic's data layer does not throw (real JSX render verified by `npm run build`'s static generation of /research/microbiology)", () => {
  assert.doesNotThrow(() => {
    const mission = buildResearchMission({ missionId: TEST_TOPIC_ID });
    const contract = mission.workspaceContract;
    assert.ok(contract);
    // Exercise the exact same field accesses ResearchIntelligenceOverview.tsx reads.
    void mission.currentState;
    void contract!.missionSummary.missionCenter.question.question;
    void contract!.missionProgress.monitoring.currentState;
    void contract!.missionProgress.recommendedNextStep;
    void contract!.evidenceSummary.evidence;
    void contract!.researchQuestions.questions;
    void contract!.relatedOrganizations.organizations;
    void contract!.relatedDatasets.datasets;
    void contract!.researchTimeline.events;
    void contract!.activityTimeline.pipelineTrace;
  });
});

test("11. the full chain wires Research Domain through Research Mission to the same Workspace Contract (one Workspace object, never re-derived)", () => {
  const mission = buildResearchMission({ missionId: TEST_TOPIC_ID });
  const contract = buildResearchWorkspaceContract({ subjectId: TEST_TOPIC_ID });
  assert.ok(mission.workspaceContract);
  assert.ok(contract);

  // Real, non-fabricated goal/scope, sourced from the Research Domain (Phase 1/2), not invented.
  assert.ok(mission.goal.length > 0, "goal should default to the real ResearchMissionEntity statement");
  assert.ok(mission.scope.length > 0, "scope should default to the real ResearchTopicEntity description");

  assert.ok(
    (MISSION_LIFECYCLE_STATES as readonly string[]).includes(mission.currentState),
    `"${mission.currentState}" must be one of the declared MISSION_LIFECYCLE_STATES`,
  );

  const missionEvidenceIds = mission.evidence.map((item) => item.evidenceId).sort();
  const contractEvidenceIds = contract!.evidenceSummary.evidence.map((item) => item.evidenceId).sort();
  assert.deepEqual(
    missionEvidenceIds,
    contractEvidenceIds,
    "mission.evidence must be the same records the Workspace Contract carries — never re-derived",
  );
});
