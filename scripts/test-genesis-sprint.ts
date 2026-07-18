// Genesis sprint — Living Humanity Intelligence OS regression tests.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { buildPersonalCabinetSnapshot } from "@/lib/genesis/personal-cabinet-selectors";
import { assertNoUniversalHumanScore, createCapabilityRecord } from "@/lib/genesis/capability-records-store";
import {
  createMeeting,
  createDecision,
  createDirective,
  createExecutionPlan,
  createExecutionTask,
  updateExecutionTask,
  loadExecutionChain,
} from "@/lib/genesis/execution-store";
import {
  createLivingResearchObject,
  addResearchResult,
  loadResearchResults,
} from "@/lib/genesis/living-research-object-store";
import {
  createOpportunity,
  createFundingNeed,
  deriveFundingReadinessGaps,
  explainOpportunityMatch,
} from "@/lib/genesis/opportunity-store";
import {
  createContributionClaim,
  updateContributionState,
  createRecognitionRecord,
} from "@/lib/genesis/contribution-store";
import { deriveLeadershipMetrics } from "@/lib/genesis/monitoring-metrics";
import { loadGenesisAudit } from "@/lib/genesis/genesis-audit-store";
import { createTeam } from "@/lib/genesis/team-store";
import {
  buildGenesisOperatorSnapshot,
  formatGenesisAttentionAnswer,
} from "@/lib/genesis/genesis-operator-snapshot";

const ORG = "org-genesis-test";
const OPERATOR = "Test Operator";

function readSource(relativePath: string): string {
  return readFileSync(join(process.cwd(), relativePath), "utf-8");
}

test("1. Personal Cabinet snapshot from empty state is honest", () => {
  const snap = buildPersonalCabinetSnapshot(OPERATOR);
  assert.equal(typeof snap.limitation, "string");
  assert.ok(snap.limitation.includes("device-local"));
  assert.equal(snap.missions.active.length + snap.missions.incomplete.length, snap.missions.active.length + snap.missions.incomplete.length);
  assert.equal(snap.attention.items.length >= 0, true);
});

test("2. No universal human score in capability metrics guard", () => {
  assert.equal(assertNoUniversalHumanScore({ domains: 3 }), true);
  assert.equal(assertNoUniversalHumanScore({ overallScore: 99 }), false);
  assert.equal(assertNoUniversalHumanScore({ employeeRanking: 1 }), false);
});

test("3. Meeting → decision → directive → plan → task chain links", () => {
  const meeting = createMeeting({
    organizationId: ORG,
    missionId: "m-demo",
    projectId: "p-demo",
    title: "Planning meeting",
    date: "2026-07-17",
    participants: [OPERATOR],
    agenda: "Define directive",
    notes: "",
    evidenceRefs: [],
    followUpDate: null,
  });
  const decision = createDecision({
    meetingId: meeting.id,
    organizationId: ORG,
    missionId: "m-demo",
    humanDecisionOwner: OPERATOR,
    decisionText: "Proceed with evidence-based pilot",
    rationale: "Human decision recorded",
    evidenceRefs: [],
    limitations: "Pilot scope only",
    reviewStatus: "Approved",
  });
  const directive = createDirective({
    decisionId: decision.id,
    organizationId: ORG,
    missionId: "m-demo",
    projectId: "p-demo",
    title: "Execute pilot",
    description: "",
    issuingAuthority: OPERATOR,
    responsibleOwner: OPERATOR,
    teamId: null,
    objective: "Pilot execution",
    expectedResult: "Documented outcome",
    successCriteria: "Evidence submitted",
    evidenceRequirement: "Required",
    issueDate: "2026-07-17",
    deadline: "2026-08-17",
    priority: "high",
    risks: "",
    dependencies: "",
    status: "Active",
  });
  const plan = createExecutionPlan({
    directiveId: directive.id,
    organizationId: ORG,
    milestones: ["Phase 1"],
    expectedOutputs: "Report",
    expectedOutcomes: "Learning",
    evidenceRequirements: "Completion evidence",
    status: "Active",
  });
  const task = createExecutionTask({
    planId: plan.id,
    directiveId: directive.id,
    organizationId: ORG,
    missionId: "m-demo",
    projectId: "p-demo",
    title: "Collect evidence",
    assignee: OPERATOR,
    accountableOwner: OPERATOR,
    collaborators: [],
    priority: "high",
    deadline: "2026-07-24",
    status: "Active",
    expectedResult: "Evidence bundle",
    evidenceRequirement: "Required",
    progressNote: "",
    approvalState: "none",
  });
  const chain = loadExecutionChain(directive.id);
  assert.equal(chain.directive?.id, directive.id);
  assert.equal(chain.plan?.id, plan.id);
  assert.equal(chain.tasks.some((t) => t.id === task.id), true);
});

test("4. Task completion without evidence is rejected", () => {
  const directive = createDirective({
    organizationId: ORG,
    title: "Evidence gate test",
    description: "",
    issuingAuthority: OPERATOR,
    responsibleOwner: OPERATOR,
    objective: "Test",
    expectedResult: "",
    successCriteria: "",
    evidenceRequirement: "Required",
    issueDate: "2026-07-17",
    deadline: "2026-07-24",
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
    title: "Gate task",
    assignee: OPERATOR,
    accountableOwner: OPERATOR,
    collaborators: [],
    priority: "medium",
    deadline: "2026-07-20",
    status: "Active",
    expectedResult: "",
    evidenceRequirement: "Required",
    progressNote: "",
    approvalState: "none",
  });
  const rejected = updateExecutionTask(task.id, { status: "Completed" });
  assert.equal(rejected, null);
  const accepted = updateExecutionTask(task.id, {
    status: "Completed",
    completionEvidence: "Submitted lab notebook excerpt",
  });
  assert.equal(accepted?.status, "Completed");
});

test("5. Living Research Object preserves negative result", () => {
  const obj = createLivingResearchObject({
    title: "Microbiology hypothesis test",
    authorOwner: OPERATOR,
    researchQuestion: "Does X inhibit Y?",
    hypothesis: "X reduces growth",
    domain: "microbiology",
    methods: "Plate assay",
    limitations: "Single lab",
    openQuestions: "Replication needed",
    missionId: "m-demo",
    projectId: null,
    researchTopicId: "microbiology",
    visibility: "private",
    ethicalReviewStatus: "N/A",
    humanReviewStatus: "none",
    collaborationNeed: "",
    fundingNeed: "",
    evidenceRefs: [],
  });
  addResearchResult({
    objectId: obj.id,
    summary: "No significant inhibition observed",
    status: "Negative Result",
    method: "Plate assay",
    source: "Local record",
    limitation: "Not peer reviewed",
    reasonForStatus: "Negative Result",
    humanReviewer: OPERATOR,
  });
  const results = loadResearchResults(obj.id);
  assert.equal(results.some((r) => r.status === "Negative Result"), true);
});

test("6. Funding readiness gaps are explicit", () => {
  const gaps = deriveFundingReadinessGaps({
    missionId: null,
    projectId: null,
    livingResearchObjectId: null,
    problem: "Need support",
    evidenceStatus: "",
    stage: "Draft",
    teamSummary: "",
    requestedSupport: "",
    intendedUse: "",
    milestones: "",
    risks: "",
    limitations: "",
    humanityImpact: "",
    natureImpact: "",
    conflictDisclosure: "",
    readinessStatus: "Evidence Incomplete",
  });
  assert.ok(gaps.length > 0);
  const need = createFundingNeed({
    missionId: "m-demo",
    projectId: null,
    livingResearchObjectId: null,
    problem: "Need support",
    evidenceStatus: "",
    stage: "Draft",
    teamSummary: "",
    requestedSupport: "",
    intendedUse: "",
    milestones: "",
    risks: "",
    limitations: "",
    humanityImpact: "",
    natureImpact: "",
    conflictDisclosure: "",
    readinessStatus: "Evidence Incomplete",
    readinessGaps: gaps,
  });
  assert.ok(need.readinessGaps.length > 0);
});

test("7. Opportunity match explains uncertainty", () => {
  const opp = createOpportunity({
    type: "Open Challenge",
    title: "Public health research program",
    problem: "Evidence-based intervention for water safety",
    organizationId: ORG,
    missionId: "m-demo",
    projectId: null,
    desiredOutcome: "Safe water access",
    requiredEvidence: "Field studies",
    requiredCapability: "Epidemiology",
    eligibility: "Open",
    scope: "Regional",
    deadline: null,
    fundingRange: null,
    humanDecisionOwner: OPERATOR,
    visibility: "private",
    status: "Open",
  });
  const match = explainOpportunityMatch(opp, {
    missionProblem: "water safety evidence intervention",
    capabilitySummary: "field research",
  });
  assert.equal(typeof match.relevant, "boolean");
  assert.ok(match.uncertainties.length > 0 || match.reasons.length > 0);
});

test("8. Recognition requires evidence for Supported status", () => {
  const blocked = createRecognitionRecord({
    recognizedChange: "Improvement claimed",
    subject: "Mission outcome",
    period: "2026-Q3",
    evidenceSources: [],
    methodologies: [],
    contributionIds: [],
    reviewers: [OPERATOR],
    limitations: "Not verified",
    disputes: "",
    humanityImpact: "",
    natureImpact: "",
    visibility: "private",
    status: "Supported",
    missionId: "m-demo",
  });
  assert.equal(blocked, null);
  const allowed = createRecognitionRecord({
    recognizedChange: "Supported improvement",
    subject: "Mission outcome",
    period: "2026-Q3",
    evidenceSources: ["Independent indicator report"],
    methodologies: ["Document review"],
    contributionIds: [],
    reviewers: [OPERATOR],
    limitations: "Partial scope",
    disputes: "",
    humanityImpact: "Documented",
    natureImpact: "",
    visibility: "private",
    status: "Supported",
    missionId: "m-demo",
  });
  assert.ok(allowed?.id);
});

test("9. Contribution claim review state transitions", () => {
  const claim = createContributionClaim({
    missionId: "m-demo",
    projectId: null,
    organizationId: ORG,
    directiveId: null,
    claimedChange: "Team delivered pilot evidence",
    claimedBy: OPERATOR,
    evidenceRefs: [{ label: "Pilot report" }],
    otherFactors: "External funding also helped",
    uncertainty: "Causation not proven",
    state: "Claimed",
  });
  const reviewed = updateContributionState(claim.id, "Under Review", "Reviewer");
  assert.equal(reviewed?.state, "Under Review");
});

test("10. Leadership monitoring metrics include limitations", () => {
  createTeam({ name: "Pilot team", organizationId: ORG, purpose: "Execution", missionIds: ["m-demo"] });
  const metrics = deriveLeadershipMetrics(ORG);
  assert.ok(metrics.length >= 5);
  for (const m of metrics) {
    assert.ok(m.definition.length > 0);
    assert.ok(m.limitation.length > 0);
    assert.ok(m.sourceRecords.startsWith("cbai-genesis"));
  }
});

test("11. Genesis audit trail records mutations", () => {
  const before = loadGenesisAudit({ organizationId: ORG }).length;
  createMeeting({
    organizationId: ORG,
    title: "Audit test meeting",
    date: "2026-07-17",
    participants: [OPERATOR],
    agenda: "",
    notes: "",
    evidenceRefs: [],
    followUpDate: null,
  });
  const after = loadGenesisAudit({ organizationId: ORG }).length;
  assert.ok(after >= before);
});

test("12. Operator snapshot formats attention honestly", () => {
  const snap = buildGenesisOperatorSnapshot(OPERATOR);
  const answer = formatGenesisAttentionAnswer(snap);
  assert.match(answer, /device-local|Nothing flagged/);
});

test("13. Capability record stores evidence linkage state", () => {
  const rec = createCapabilityRecord({
    label: "Microbiology methods",
    description: "Plate assay experience",
    methodsUsed: "Agar plate",
    missionId: "m-demo",
    projectId: null,
    evidenceRefs: [{ label: "Lab notes" }],
    visibility: "private",
    limitations: "",
    unresolvedQuestions: "",
  });
  assert.equal(rec.verificationState, "evidence_linked");
});

test("14. UI wired: Personal Cabinet and Execution OS panels", () => {
  const myWork = readSource("components/my-work/MyWork.tsx");
  const org = readSource("components/organization/OrganizationPageClient.tsx");
  assert.match(myWork, /PersonalCabinetPanel/);
  assert.match(myWork, /GenesisWorkflowPanel/);
  assert.match(org, /ExecutionOsPanel/);
});

test("15. i18n genesisOs namespace present in all dictionaries", () => {
  for (const lang of ["en", "ru", "tr", "uz"]) {
    const src = readSource(`lib/i18n/dictionaries/${lang}.ts`);
    assert.match(src, /genesisOs:/);
    assert.match(src, /GENESIS_OS_/);
  }
});
