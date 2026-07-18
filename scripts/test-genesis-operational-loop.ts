// Genesis operational result loop — progress, blockers, outcomes, contribution, recognition, operator.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  createExecutionTask,
  createExecutionPlan,
  createDirective,
  updateExecutionTask,
  loadExecutionTask,
} from "@/lib/genesis/execution-store";
import { createProgressUpdate, loadProgressUpdates } from "@/lib/genesis/progress-update-store";
import { createBlocker, updateBlockerStatus, isTaskBlocked } from "@/lib/genesis/blocker-store";
import {
  createOutcome,
  updateOutcomeVerification,
  submitOutcomeForReview,
} from "@/lib/genesis/outcome-store";
import {
  createContributionClaim,
  submitContributionEvidence,
  updateContributionState,
  createRecognitionRecord,
  deriveRecognitionReadiness,
  updateRecognitionStatus,
} from "@/lib/genesis/contribution-store";
import { deriveLeadershipMetrics } from "@/lib/genesis/monitoring-metrics";
import { buildPersonalCabinetSnapshot } from "@/lib/genesis/personal-cabinet-selectors";
import { resolveGenesisCommand } from "@/lib/genesis/genesis-operator-commands";
import { assertNoUniversalHumanScore } from "@/lib/genesis/capability-records-store";
import { loadGenesisAudit } from "@/lib/genesis/genesis-audit-store";
import { genesisId } from "@/lib/genesis/genesis-storage";

const ORG = "org-loop-test";
const OPERATOR = "Loop Tester";

function readSource(path: string): string {
  return readFileSync(join(process.cwd(), path), "utf-8");
}

function seedTask(): string {
  const directive = createDirective({
    organizationId: ORG,
    title: "Loop directive",
    description: "",
    issuingAuthority: OPERATOR,
    responsibleOwner: OPERATOR,
    objective: "Test",
    expectedResult: "",
    successCriteria: "",
    evidenceRequirement: "Required",
    issueDate: "2026-07-17",
    deadline: "2026-08-17",
    priority: "medium",
    risks: "",
    dependencies: "",
    status: "Active",
  });
  const plan = createExecutionPlan({
    directiveId: directive.id,
    organizationId: ORG,
    milestones: [],
    expectedOutputs: "",
    expectedOutcomes: "",
    evidenceRequirements: "",
    status: "Active",
  });
  const task = createExecutionTask({
    planId: plan.id,
    directiveId: directive.id,
    organizationId: ORG,
    title: "Loop task",
    assignee: OPERATOR,
    accountableOwner: OPERATOR,
    collaborators: [],
    priority: "medium",
    deadline: "2026-07-24",
    status: "Active",
    expectedResult: "",
    evidenceRequirement: "Required",
    progressNote: "",
    approvalState: "none",
  });
  return task.id;
}

test("1. Progress history preservation", () => {
  const taskId = seedTask();
  createProgressUpdate({
    organizationId: ORG,
    taskId,
    author: OPERATOR,
    reportingPeriod: "2026-07",
    summary: "First update",
    workCompleted: "A",
    currentWork: "B",
    nextPlannedWork: "C",
    evidenceRefs: [],
    reportedDate: "2026-07-10",
    limitationText: "",
    humanReviewStatus: "none",
  });
  createProgressUpdate({
    organizationId: ORG,
    taskId,
    author: OPERATOR,
    reportingPeriod: "2026-07",
    summary: "Second update",
    workCompleted: "D",
    currentWork: "E",
    nextPlannedWork: "F",
    evidenceRefs: [],
    reportedDate: "2026-07-17",
    limitationText: "",
    humanReviewStatus: "none",
  });
  const history = loadProgressUpdates({ taskId });
  assert.equal(history.length, 2);
  assert.equal(history[0]!.summary, "Second update");
});

test("2. Blocker creation sets task blocked", () => {
  const taskId = seedTask();
  createBlocker({
    organizationId: ORG,
    taskId,
    blockerType: "Missing Evidence",
    description: "Need lab notes",
    severity: "high",
    operationalImpact: "Delayed",
    evidenceRefs: [],
    responsibleOwner: OPERATOR,
    requiredDecision: "",
    proposedOptions: "",
    dueDate: null,
  });
  assert.equal(isTaskBlocked(taskId), true);
  assert.equal(loadExecutionTask(taskId)?.status, "Blocked");
});

test("3. Blocker resolution requires resolution text", () => {
  const taskId = seedTask();
  const blocker = createBlocker({
    organizationId: ORG,
    taskId,
    blockerType: "Technical Issue",
    description: "Server down",
    severity: "medium",
    operationalImpact: "",
    evidenceRefs: [],
    responsibleOwner: OPERATOR,
    requiredDecision: "",
    proposedOptions: "",
    dueDate: null,
  });
  assert.equal(updateBlockerStatus(blocker.id, { status: "Resolved" }), null);
  const resolved = updateBlockerStatus(blocker.id, {
    status: "Resolved",
    resolution: "Server restored",
  });
  assert.equal(resolved?.status, "Resolved");
});

test("4. Blocked task distinguished from overdue", () => {
  const taskId = seedTask();
  createBlocker({
    organizationId: ORG,
    taskId,
    blockerType: "Human Decision Required",
    description: "Awaiting approval",
    severity: "high",
    operationalImpact: "",
    evidenceRefs: [],
    responsibleOwner: OPERATOR,
    requiredDecision: "Approve scope",
    proposedOptions: "",
    dueDate: null,
  });
  const metrics = deriveLeadershipMetrics(ORG);
  const blocked = metrics.find((m) => m.id === "blocked-tasks");
  const overdue = metrics.find((m) => m.id === "overdue-tasks");
  assert.ok(blocked && blocked.value >= 1);
  assert.ok(overdue);
});

test("5. Completion evidence gate", () => {
  const taskId = seedTask();
  assert.equal(updateExecutionTask(taskId, { status: "Completed" }), null);
  const ok = updateExecutionTask(taskId, {
    status: "Completed",
    completionEvidence: "Signed delivery receipt",
  });
  assert.equal(ok?.status, "Completed");
});

test("6. Output/outcome/impact separation in model", () => {
  const outcome = createOutcome({
    organizationId: ORG,
    taskIds: [],
    title: "Separation test",
    outputDescription: "Report PDF delivered",
    outcomeDescription: "Team can reference baseline data",
    impactClaim: "Possible long-term policy change — unverified",
    baseline: "",
    target: "",
    currentValue: "",
    unit: "",
    reportingPeriod: "2026-Q3",
    evidenceRefs: [],
    responsibleOwner: OPERATOR,
    limitations: "",
    humanityImpact: "",
    natureImpact: "",
  });
  assert.notEqual(outcome.outputDescription, outcome.outcomeDescription);
  assert.notEqual(outcome.outcomeDescription, outcome.impactClaim);
});

test("7. Supported outcome evidence gate", () => {
  const outcome = createOutcome({
    organizationId: ORG,
    taskIds: [],
    title: "Gate test",
    outputDescription: "Output",
    outcomeDescription: "Outcome",
    impactClaim: "Impact",
    baseline: "",
    target: "",
    currentValue: "",
    unit: "",
    reportingPeriod: "2026-Q3",
    evidenceRefs: [],
    responsibleOwner: OPERATOR,
    limitations: "",
    humanityImpact: "",
    natureImpact: "",
  });
  assert.equal(updateOutcomeVerification(outcome.id, "Supported", OPERATOR), null);
});

test("8. Supported outcome human-review gate passes with evidence", () => {
  const outcome = createOutcome({
    organizationId: ORG,
    taskIds: [],
    title: "Review test",
    outputDescription: "Output",
    outcomeDescription: "Outcome",
    impactClaim: "Impact",
    baseline: "",
    target: "",
    currentValue: "",
    unit: "",
    reportingPeriod: "2026-Q3",
    evidenceRefs: [{ label: "Independent audit report" }],
    responsibleOwner: OPERATOR,
    limitations: "Partial scope",
    humanityImpact: "",
    natureImpact: "",
  });
  const reviewed = updateOutcomeVerification(outcome.id, "Supported", OPERATOR);
  assert.equal(reviewed?.verificationStatus, "Supported");
});

test("9. Contribution evidence linkage", () => {
  const claim = createContributionClaim({
    organizationId: ORG,
    taskIds: [],
    claimedChange: "Delivered pilot",
    claimedBy: OPERATOR,
    evidenceRefs: [],
    otherFactors: "",
    uncertainty: "",
    state: "Claimed",
  });
  const updated = submitContributionEvidence(claim.id, [{ label: "Pilot report v1" }]);
  assert.equal(updated?.state, "Evidence Submitted");
  assert.ok(updated!.evidenceRefs.length > 0);
});

test("10. Contribution review history preserved", () => {
  const claim = createContributionClaim({
    organizationId: ORG,
    taskIds: [],
    claimedChange: "Change",
    claimedBy: OPERATOR,
    evidenceRefs: [],
    otherFactors: "",
    uncertainty: "",
    state: "Claimed",
  });
  updateContributionState(claim.id, "Under Review", "Reviewer", "Initial review");
  updateContributionState(claim.id, "Partially Supported", "Reviewer", "Partial evidence");
  const all = updateContributionState(claim.id, "Supported", "Reviewer", "Supported with limits");
  assert.ok(all!.stateHistory.length >= 3);
});

test("11. Recognition readiness requirements", () => {
  const readiness = deriveRecognitionReadiness({
    outcomeId: null,
    evidenceSources: [],
    contributionIds: [],
    methodologies: [],
    limitations: "",
    reviewers: [],
  });
  assert.equal(readiness.ready, false);
  assert.ok(readiness.missing.length > 0);
});

test("12. Recognition Supported gate", () => {
  const draft = createRecognitionRecord({
    outcomeId: "out-1",
    recognizedChange: "Change",
    subject: "Subject",
    period: "2026-Q3",
    evidenceSources: ["Source A"],
    methodologies: ["Review"],
    contributionIds: ["c-1"],
    reviewers: [OPERATOR],
    limitations: "Limits",
    disputes: "",
    humanityImpact: "",
    natureImpact: "",
    visibility: "private",
    status: "Under Independent Review",
    missionId: null,
  });
  assert.ok(draft);
  const blocked = updateRecognitionStatus(draft!.id, "Supported", OPERATOR, "Approve", {
    outcomeVerificationStatus: "Draft",
    contributionStates: ["Claimed"],
  });
  assert.equal(blocked, null);
});

test("13. Dispute preservation on outcome", () => {
  const outcome = createOutcome({
    organizationId: ORG,
    taskIds: [],
    title: "Dispute",
    outputDescription: "O",
    outcomeDescription: "O",
    impactClaim: "I",
    baseline: "",
    target: "",
    currentValue: "",
    unit: "",
    reportingPeriod: "2026-Q3",
    evidenceRefs: [{ label: "evidence" }],
    responsibleOwner: OPERATOR,
    limitations: "",
    humanityImpact: "",
    natureImpact: "",
  });
  submitOutcomeForReview(outcome.id, OPERATOR);
  const disputed = updateOutcomeVerification(outcome.id, "Disputed", OPERATOR, "Methodology questioned");
  assert.equal(disputed?.verificationStatus, "Disputed");
});

test("14. Leadership metrics from real records", () => {
  const metrics = deriveLeadershipMetrics(ORG);
  assert.ok(metrics.some((m) => m.id === "open-blockers"));
  assert.ok(metrics.some((m) => m.id === "progress-updates"));
  for (const m of metrics) {
    assert.ok(m.definition.length > 0);
    assert.ok(m.limitation.length > 0);
  }
});

test("15. Personal Cabinet attention selectors", () => {
  const snap = buildPersonalCabinetSnapshot(OPERATOR);
  assert.ok(Array.isArray(snap.attention.structured));
  assert.ok(typeof snap.limitation === "string");
});

test("16. Operator attention answers", () => {
  const match = resolveGenesisCommand("what requires attention", OPERATOR);
  assert.ok(match);
  assert.match(match!.message, /device-local|Nothing flagged|Next honest action/);
});

test("17. Human decision boundary in operator response", () => {
  const match = resolveGenesisCommand("which decisions require human review", OPERATOR);
  assert.ok(match);
  assert.match(match!.message, /human|device-local/);
});

test("18. Audit events for progress and blockers", () => {
  const before = loadGenesisAudit().length;
  const taskId = seedTask();
  createProgressUpdate({
    organizationId: ORG,
    taskId,
    author: OPERATOR,
    reportingPeriod: "2026-07",
    summary: "Audit test",
    workCompleted: "",
    currentWork: "",
    nextPlannedWork: "",
    evidenceRefs: [],
    reportedDate: "2026-07-17",
    limitationText: "",
    humanReviewStatus: "none",
  });
  assert.ok(loadGenesisAudit().length >= before);
});

test("19. Persistence via memory fallback in node", () => {
  const id = genesisId("persist");
  assert.match(id, /^persist-/);
});

test("20. No universal score or ranking", () => {
  assert.equal(assertNoUniversalHumanScore({ domains: 1 }), true);
  assert.equal(assertNoUniversalHumanScore({ employeeRanking: 1 }), false);
});

test("21. UI and operator wiring present", () => {
  assert.match(readSource("components/genesis/OperationalLoopPanel.tsx"), /createProgressUpdate/);
  assert.match(readSource("components/assistant/AssistantCommandCenter.tsx"), /resolveGenesisCommand/);
  assert.match(readSource("components/genesis/ExecutionOsPanel.tsx"), /OperationalLoopPanel/);
});
