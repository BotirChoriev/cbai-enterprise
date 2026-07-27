import assert from "node:assert/strict";
import test from "node:test";
import { buildStarterWorkCard } from "@/lib/activation/starter-work-card";
import {
  addProblemClaim,
  addProblemContradiction,
  addDecisionCriterion,
  addProblemMonitoringTrigger,
  addProblemScenario,
  addProblemUnknown,
  clearProblemsForTests,
  createProblemFromConfirmedStarterCard,
  decideProblemReadiness,
  evaluateProblemScenario,
  linkEvidencePassportToClaim,
  listProblems,
  observeProblemMetric,
  recordProblemDecision,
  reopenProblemDecision,
} from "@/lib/problems/problem-repository";

function starterCard() {
  return buildStarterWorkCard({
    text: "Reduce production downtime without lowering product quality.",
    locale: "en",
    source: "typed_command",
    route: "/",
    roleOverride: "manufacturer",
    outcome: "Reduce downtime by investigating verified causes.",
    problem: "Production downtime is increasing.",
    constraints: "Quality may not decline.",
    materials: [{ origin: "user_note", value: "Maintenance log is available." }],
  });
}

test("confirmed Starter Work Card becomes a human-owned canonical Problem", () => {
  clearProblemsForTests();
  const problem = createProblemFromConfirmedStarterCard(starterCard(), "op-1");

  assert.equal(problem.status, "open");
  assert.equal(problem.finalDecisionOwner, "human");
  assert.equal(problem.currentBriefVersion, 1);
  assert.equal(problem.briefs[0]?.confirmedBy, "human");
  assert.equal(problem.briefs[0]?.problemStatement, "Production downtime is increasing.");
  assert.deepEqual(problem.operationalObjectIds, ["op-1"]);
  assert.equal(listProblems().length, 1);
});

test("repeated confirmation is idempotent and never duplicates the Problem", () => {
  clearProblemsForTests();
  const first = createProblemFromConfirmedStarterCard(starterCard(), "op-1");
  const repeated = createProblemFromConfirmedStarterCard(starterCard(), "op-1");
  const linked = createProblemFromConfirmedStarterCard(starterCard(), "op-2");

  assert.equal(first.id, repeated.id);
  assert.equal(first.id, linked.id);
  assert.deepEqual(linked.operationalObjectIds, ["op-1", "op-2"]);
  assert.equal(listProblems().length, 1);
});

test("AI-inferred fields remain explicit assumptions and unknowns", () => {
  clearProblemsForTests();
  const card = buildStarterWorkCard({
    text: "Help me investigate a supply problem.",
    locale: "en",
    source: "typed_command",
    route: "/",
  });
  const problem = createProblemFromConfirmedStarterCard(card, "op-unknowns");
  const brief = problem.briefs[0]!;

  assert.ok(brief.assumptions.length > 0);
  assert.equal(problem.criticalUnknownCount, brief.unknowns.length);
  assert.ok(problem.activity.every((event) => event.actor === "human"));
});

test("evidence supports a claim only when the passport is human-confirmed", () => {
  clearProblemsForTests();
  const problem = createProblemFromConfirmedStarterCard(starterCard(), "op-evidence");
  const withClaim = addProblemClaim({
    problemId: problem.id,
    statement: "Preventive maintenance reduces downtime.",
    createdBy: "ai",
    confirmedByHuman: true,
  })!;
  const claim = withClaim.claims[0]!;

  const pending = linkEvidencePassportToClaim({
    problemId: problem.id,
    claimId: claim.id,
    passportId: "passport-pending",
    stance: "supports",
    humanVerificationStatus: "pending_review",
    confirmedByHuman: true,
  })!;
  assert.equal(pending.claims[0]?.status, "proposed");

  const confirmed = linkEvidencePassportToClaim({
    problemId: problem.id,
    claimId: claim.id,
    passportId: "passport-confirmed",
    stance: "supports",
    humanVerificationStatus: "human_confirmed",
    confirmedByHuman: true,
  })!;
  assert.equal(confirmed.claims[0]?.status, "supported");
});

test("readiness stays blocked until critical unknowns and contradictions are explicitly accepted", () => {
  clearProblemsForTests();
  const problem = createProblemFromConfirmedStarterCard(starterCard(), "op-readiness");
  const withClaim = addProblemClaim({
    problemId: problem.id,
    statement: "A proposed intervention will improve output.",
    createdBy: "human",
    confirmedByHuman: true,
  })!;
  const withUnknown = addProblemUnknown({
    problemId: problem.id,
    question: "What is the current baseline?",
    whyItMatters: "Scenarios cannot be compared without it.",
    severity: "critical",
    evidenceNeeded: "Verified baseline measurement",
    owner: "human_owner",
    confirmedByHuman: true,
  })!;
  const withContradiction = addProblemContradiction({
    problemId: problem.id,
    claimId: withClaim.claims[0]!.id,
    evidencePassportIds: [],
    reason: "measurement",
    severity: "high",
    explanation: "Two measurement methods produce different baselines.",
    confirmedByHuman: true,
  })!;

  const blocked = decideProblemReadiness({
    problemId: problem.id,
    decision: "ready_for_scenarios",
    confirmedByHuman: true,
  })!;
  assert.equal(blocked.readinessCheckpoint.status, "continue_investigation");

  const accepted = decideProblemReadiness({
    problemId: problem.id,
    decision: "ready_for_scenarios",
    acceptCriticalUnknownIds: withUnknown.unknownRegister
      .filter((item) => item.severity === "high" || item.severity === "critical")
      .map((item) => item.id),
    acknowledgeContradictionIds: withContradiction.contradictions.map((item) => item.id),
    note: "Proceed with explicit risk controls.",
    confirmedByHuman: true,
  })!;
  assert.equal(accepted.readinessCheckpoint.status, "ready_for_scenarios");
  assert.equal(accepted.status, "awaiting_human_decision");
});

test("AI may propose scenarios but cannot select the final decision", () => {
  clearProblemsForTests();
  const opened = createProblemFromConfirmedStarterCard(starterCard(), "op-scenarios");
  const ready = decideProblemReadiness({
    problemId: opened.id,
    decision: "ready_for_scenarios",
    acceptCriticalUnknownIds: opened.unknownRegister.map((item) => item.id),
    confirmedByHuman: true,
  })!;
  const withCriterion = addDecisionCriterion({
    problemId: ready.id,
    label: "Operational continuity",
    description: "Expected effect on downtime.",
    weight: 5,
    confirmedByHuman: true,
  })!;
  const first = addProblemScenario({
    problemId: ready.id,
    title: "Preventive maintenance",
    description: "Increase scheduled maintenance.",
    createdBy: "ai",
    confirmedByHuman: true,
  })!;
  const second = addProblemScenario({
    problemId: ready.id,
    title: "Supplier redundancy",
    description: "Qualify a second supplier.",
    createdBy: "human",
    confirmedByHuman: true,
  })!;
  const criterionId = withCriterion.decisionCriteria[0]!.id;
  const firstEvaluated = evaluateProblemScenario({
    problemId: ready.id,
    scenarioId: first.scenarios[0]!.id,
    criterionId,
    score: 4,
    rationale: "Human-reviewed estimate.",
    uncertainty: "medium",
    confirmedByHuman: true,
  })!;
  const secondScenario = second.scenarios.find((scenario) => scenario.title === "Supplier redundancy")!;
  const allEvaluated = evaluateProblemScenario({
    problemId: ready.id,
    scenarioId: secondScenario.id,
    criterionId,
    score: 3,
    rationale: "Human-reviewed estimate.",
    uncertainty: "high",
    confirmedByHuman: true,
  })!;
  assert.equal(firstEvaluated.decisions.length, 0);

  const decided = recordProblemDecision({
    problemId: ready.id,
    chosenScenarioId: allEvaluated.scenarios[0]!.id,
    rationale: "Chosen by the human after comparing both scenarios.",
    confirmedByHuman: true,
  })!;
  assert.equal(decided.status, "decided");
  assert.equal(decided.decisions[0]?.decidedBy, "human");
  assert.equal(decided.decisions[0]?.immutableForecastSnapshot, true);
});

test("monitoring can trigger review but only a human can reopen the decision", () => {
  const current = listProblems()[0]!;
  const monitored = addProblemMonitoringTrigger({
    problemId: current.id,
    label: "Downtime warning",
    metric: "downtime_hours",
    operator: "above",
    threshold: 10,
    owner: "operations lead",
    confirmedByHuman: true,
  })!;
  const trigger = monitored.monitoringTriggers[0]!;
  const observed = observeProblemMetric({
    problemId: monitored.id,
    triggerId: trigger.id,
    value: 12,
    sourceConfirmedByHuman: true,
  })!;
  assert.equal(observed.monitoringTriggers[0]?.status, "triggered");
  assert.equal(observed.status, "monitoring");

  const reopened = reopenProblemDecision({
    problemId: observed.id,
    reason: "Downtime exceeded the agreed threshold.",
    confirmedByHuman: true,
  })!;
  assert.equal(reopened.status, "reopened");
  assert.equal(reopened.activity.at(-1)?.actor, "human");
});
