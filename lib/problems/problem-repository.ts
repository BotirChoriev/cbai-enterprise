import { resolveStorageKey } from "@/lib/storage/namespaced-key";
import type { StarterWorkCard } from "@/lib/activation/starter-work-card";
import { problemBriefFromConfirmedCard } from "@/lib/problems/problem-lifecycle";
import { getSyncedCloudUserId } from "@/lib/supabase/cloud-session-sync";
import { enqueueSync } from "@/lib/supabase/outbox";
import {
  PROBLEM_SCHEMA_VERSION,
  type Problem,
  type ProblemClaim,
  type ProblemContradiction,
  type ProblemUnknown,
  type ProblemUnknownSeverity,
  type ProblemDecisionCriterion,
  type ProblemDecisionRecord,
  type ProblemMonitoringTrigger,
  type ProblemScenario,
} from "@/lib/problems/problem.types";

const STORAGE_KEY = "cbai-problems";
const CHANGE_EVENT = "cbai-problems-changed";
const memory: Problem[] = [];

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function normalizeProblem(value: unknown): Problem | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const valid =
    record.schemaVersion === PROBLEM_SCHEMA_VERSION &&
    typeof record.id === "string" &&
    Array.isArray(record.briefs) &&
    Array.isArray(record.operationalObjectIds) &&
    record.finalDecisionOwner === "human";
  if (!valid) return null;
  const problem = record as unknown as Problem;
  return {
    ...problem,
    claims: Array.isArray(record.claims) ? (record.claims as ProblemClaim[]) : [],
    unknownRegister: Array.isArray(record.unknownRegister)
      ? (record.unknownRegister as ProblemUnknown[])
      : [],
    contradictions: Array.isArray(record.contradictions)
      ? (record.contradictions as ProblemContradiction[])
      : [],
    readinessCheckpoint:
      record.readinessCheckpoint && typeof record.readinessCheckpoint === "object"
        ? problem.readinessCheckpoint
        : {
            status: "not_reviewed",
            decidedBy: null,
            decidedAt: null,
            acceptedCriticalUnknownIds: [],
            acknowledgedContradictionIds: [],
            note: null,
          },
    decisionCriteria: Array.isArray(record.decisionCriteria)
      ? (record.decisionCriteria as ProblemDecisionCriterion[])
      : [],
    scenarios: Array.isArray(record.scenarios) ? (record.scenarios as ProblemScenario[]) : [],
    decisions: Array.isArray(record.decisions) ? (record.decisions as ProblemDecisionRecord[]) : [],
    monitoringTriggers: Array.isArray(record.monitoringTriggers)
      ? (record.monitoringTriggers as ProblemMonitoringTrigger[])
      : [],
  };
}

export function listProblems(): readonly Problem[] {
  if (!isBrowser()) return [...memory];
  try {
    const raw = window.localStorage.getItem(resolveStorageKey(STORAGE_KEY));
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed
          .map(normalizeProblem)
          .filter((problem): problem is Problem => problem !== null)
          .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      : [];
  } catch {
    return [];
  }
}

function updateProblem(problemId: string, transform: (problem: Problem, now: string) => Problem): Problem | null {
  const all = [...listProblems()];
  const index = all.findIndex((problem) => problem.id === problemId);
  if (index < 0) return null;
  const now = new Date().toISOString();
  const updated = transform(all[index]!, now);
  all[index] = updated;
  writeProblems(all);
  return updated;
}

function newRecordId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function addProblemClaim(input: {
  readonly problemId: string;
  readonly statement: string;
  readonly createdBy: "human" | "ai";
  readonly confirmedByHuman: true;
}): Problem | null {
  if (input.confirmedByHuman !== true || !input.statement.trim()) return null;
  return updateProblem(input.problemId, (problem, now) => {
    const claim: ProblemClaim = {
      id: newRecordId("claim"),
      statement: input.statement.trim(),
      status: "proposed",
      createdBy: input.createdBy,
      evidencePassportIds: [],
      createdAt: now,
      updatedAt: now,
    };
    return {
      ...problem,
      status: "investigating",
      claims: [...problem.claims, claim],
      updatedAt: now,
      activity: [
        ...problem.activity,
        {
          id: newRecordId("event"),
          kind: "claim_added",
          actor: "human",
          summary: `${input.createdBy} claim added after human confirmation.`,
          at: now,
        },
      ],
    };
  });
}

export function linkEvidencePassportToClaim(input: {
  readonly problemId: string;
  readonly claimId: string;
  readonly passportId: string;
  readonly stance: "supports" | "challenges" | "contextualizes";
  readonly humanVerificationStatus: "unverified" | "pending_review" | "human_confirmed" | "rejected";
  readonly confirmedByHuman: true;
}): Problem | null {
  if (input.confirmedByHuman !== true) return null;
  return updateProblem(input.problemId, (problem, now) => {
    const claims = problem.claims.map((claim) => {
      if (claim.id !== input.claimId) return claim;
      const evidencePassportIds = claim.evidencePassportIds.includes(input.passportId)
        ? claim.evidencePassportIds
        : [...claim.evidencePassportIds, input.passportId];
      const status =
        input.stance === "challenges"
          ? "disputed"
          : input.stance === "supports" && input.humanVerificationStatus === "human_confirmed"
            ? "supported"
            : claim.status;
      return { ...claim, evidencePassportIds, status, updatedAt: now };
    });
    const evidencePassportIds = problem.evidencePassportIds.includes(input.passportId)
      ? problem.evidencePassportIds
      : [...problem.evidencePassportIds, input.passportId];
    return {
      ...problem,
      claims,
      evidencePassportIds,
      updatedAt: now,
      activity: [
        ...problem.activity,
        {
          id: newRecordId("event"),
          kind: "evidence_linked",
          actor: "human",
          summary: `Evidence Passport linked with stance: ${input.stance}.`,
          at: now,
        },
      ],
    };
  });
}

export function addProblemUnknown(input: {
  readonly problemId: string;
  readonly question: string;
  readonly whyItMatters: string;
  readonly severity: ProblemUnknownSeverity;
  readonly evidenceNeeded: string;
  readonly owner: string;
  readonly confirmedByHuman: true;
}): Problem | null {
  if (input.confirmedByHuman !== true || !input.question.trim()) return null;
  return updateProblem(input.problemId, (problem, now) => {
    const unknown: ProblemUnknown = {
      id: newRecordId("unknown"),
      question: input.question.trim(),
      whyItMatters: input.whyItMatters.trim(),
      severity: input.severity,
      evidenceNeeded: input.evidenceNeeded.trim(),
      owner: input.owner.trim() || "human_owner",
      status: "open",
      resolutionEvidencePassportIds: [],
      createdAt: now,
      updatedAt: now,
    };
    const unknownRegister = [...problem.unknownRegister, unknown];
    return {
      ...problem,
      unknownRegister,
      criticalUnknownCount: unknownRegister.filter(
        (item) => item.status === "open" && (item.severity === "critical" || item.severity === "high"),
      ).length,
      updatedAt: now,
      activity: [
        ...problem.activity,
        { id: newRecordId("event"), kind: "unknown_added", actor: "human", summary: "Unknown registered.", at: now },
      ],
    };
  });
}

export function addProblemContradiction(input: {
  readonly problemId: string;
  readonly claimId: string;
  readonly evidencePassportIds: readonly string[];
  readonly reason: ProblemContradiction["reason"];
  readonly severity: ProblemContradiction["severity"];
  readonly explanation: string;
  readonly confirmedByHuman: true;
}): Problem | null {
  if (input.confirmedByHuman !== true || !input.explanation.trim()) return null;
  return updateProblem(input.problemId, (problem, now) => {
    const contradiction: ProblemContradiction = {
      id: newRecordId("contradiction"),
      claimId: input.claimId,
      evidencePassportIds: [...input.evidencePassportIds],
      reason: input.reason,
      severity: input.severity,
      explanation: input.explanation.trim(),
      status: "unresolved",
      reviewedByHuman: true,
      createdAt: now,
      updatedAt: now,
    };
    const contradictions = [...problem.contradictions, contradiction];
    return {
      ...problem,
      contradictions,
      unresolvedContradictionCount: contradictions.filter((item) => item.status === "unresolved").length,
      updatedAt: now,
      activity: [
        ...problem.activity,
        {
          id: newRecordId("event"),
          kind: "contradiction_registered",
          actor: "human",
          summary: "Contradiction registered for investigation.",
          at: now,
        },
      ],
    };
  });
}

export function decideProblemReadiness(input: {
  readonly problemId: string;
  readonly decision: "ready_for_scenarios" | "continue_investigation";
  readonly acceptCriticalUnknownIds?: readonly string[];
  readonly acknowledgeContradictionIds?: readonly string[];
  readonly note?: string;
  readonly confirmedByHuman: true;
}): Problem | null {
  if (input.confirmedByHuman !== true) return null;
  return updateProblem(input.problemId, (problem, now) => {
    const accepted = new Set(input.acceptCriticalUnknownIds ?? []);
    const acknowledged = new Set(input.acknowledgeContradictionIds ?? []);
    const blockingUnknowns = problem.unknownRegister.filter(
      (item) =>
        item.status === "open" &&
        (item.severity === "critical" || item.severity === "high") &&
        !accepted.has(item.id),
    );
    const blockingContradictions = problem.contradictions.filter(
      (item) =>
        item.status === "unresolved" &&
        (item.severity === "critical" || item.severity === "high") &&
        !acknowledged.has(item.id),
    );
    const canAdvance =
      input.decision === "ready_for_scenarios" &&
      blockingUnknowns.length === 0 &&
      blockingContradictions.length === 0;
    return {
      ...problem,
      status: canAdvance ? "awaiting_human_decision" : "investigating",
      readinessCheckpoint: {
        status: canAdvance ? "ready_for_scenarios" : "continue_investigation",
        decidedBy: "human",
        decidedAt: now,
        acceptedCriticalUnknownIds: [...accepted],
        acknowledgedContradictionIds: [...acknowledged],
        note: input.note?.trim() || null,
      },
      updatedAt: now,
      activity: [
        ...problem.activity,
        {
          id: newRecordId("event"),
          kind: "readiness_decided",
          actor: "human",
          summary: canAdvance
            ? "Human approved progression to scenario design."
            : "Human requested continued investigation.",
          at: now,
        },
      ],
    };
  });
}

export function addDecisionCriterion(input: {
  readonly problemId: string;
  readonly label: string;
  readonly description: string;
  readonly weight: 1 | 2 | 3 | 4 | 5;
  readonly confirmedByHuman: true;
}): Problem | null {
  if (input.confirmedByHuman !== true || !input.label.trim()) return null;
  return updateProblem(input.problemId, (problem, now) => ({
    ...problem,
    decisionCriteria: [
      ...problem.decisionCriteria,
      {
        id: newRecordId("criterion"),
        label: input.label.trim(),
        description: input.description.trim(),
        weight: input.weight,
        definedBy: "human",
        createdAt: now,
      },
    ],
    updatedAt: now,
    activity: [
      ...problem.activity,
      { id: newRecordId("event"), kind: "criterion_added", actor: "human", summary: "Decision criterion added.", at: now },
    ],
  }));
}

export function addProblemScenario(input: {
  readonly problemId: string;
  readonly title: string;
  readonly description: string;
  readonly createdBy: "human" | "ai";
  readonly benefits?: readonly string[];
  readonly risks?: readonly string[];
  readonly assumptions?: readonly string[];
  readonly stakeholderImpacts?: readonly string[];
  readonly reversibility?: ProblemScenario["reversibility"];
  readonly confirmedByHuman: true;
}): Problem | null {
  if (input.confirmedByHuman !== true || !input.title.trim()) return null;
  return updateProblem(input.problemId, (problem, now) => {
    if (problem.readinessCheckpoint.status !== "ready_for_scenarios") return problem;
    const scenario: ProblemScenario = {
      id: newRecordId("scenario"),
      title: input.title.trim(),
      description: input.description.trim(),
      createdBy: input.createdBy,
      benefits: [...(input.benefits ?? [])],
      risks: [...(input.risks ?? [])],
      assumptions: [...(input.assumptions ?? [])],
      stakeholderImpacts: [...(input.stakeholderImpacts ?? [])],
      reversibility: input.reversibility ?? "unknown",
      evaluations: problem.decisionCriteria.map((criterion) => ({
        criterionId: criterion.id,
        score: null,
        rationale: "",
        evidencePassportIds: [],
        uncertainty: "unknown",
      })),
      status: "draft",
      createdAt: now,
      updatedAt: now,
    };
    return {
      ...problem,
      scenarios: [...problem.scenarios, scenario],
      updatedAt: now,
      activity: [
        ...problem.activity,
        {
          id: newRecordId("event"),
          kind: "scenario_added",
          actor: "human",
          summary: `${input.createdBy} scenario added after human confirmation.`,
          at: now,
        },
      ],
    };
  });
}

export function evaluateProblemScenario(input: {
  readonly problemId: string;
  readonly scenarioId: string;
  readonly criterionId: string;
  readonly score: 1 | 2 | 3 | 4 | 5 | null;
  readonly rationale: string;
  readonly evidencePassportIds?: readonly string[];
  readonly uncertainty: "low" | "medium" | "high" | "unknown";
  readonly confirmedByHuman: true;
}): Problem | null {
  if (input.confirmedByHuman !== true) return null;
  return updateProblem(input.problemId, (problem, now) => ({
    ...problem,
    scenarios: problem.scenarios.map((scenario) =>
      scenario.id !== input.scenarioId
        ? scenario
        : {
            ...scenario,
            evaluations: scenario.evaluations.map((evaluation) =>
              evaluation.criterionId !== input.criterionId
                ? evaluation
                : {
                    ...evaluation,
                    score: input.score,
                    rationale: input.rationale.trim(),
                    evidencePassportIds: [...(input.evidencePassportIds ?? [])],
                    uncertainty: input.uncertainty,
                  },
            ),
            status: scenario.evaluations.every(
              (evaluation) =>
                evaluation.criterionId === input.criterionId
                  ? input.score !== null
                  : evaluation.score !== null,
            )
              ? "ready_for_human_review"
              : "draft",
            updatedAt: now,
          },
    ),
    updatedAt: now,
  }));
}

export function recordProblemDecision(input: {
  readonly problemId: string;
  readonly chosenScenarioId: string;
  readonly rationale: string;
  readonly conditions?: readonly string[];
  readonly confirmedByHuman: true;
}): Problem | null {
  if (input.confirmedByHuman !== true || !input.rationale.trim()) return null;
  return updateProblem(input.problemId, (problem, now) => {
    const chosen = problem.scenarios.find((scenario) => scenario.id === input.chosenScenarioId);
    if (!chosen || problem.scenarios.length < 2 || chosen.status !== "ready_for_human_review") return problem;
    const decision: ProblemDecisionRecord = {
      id: newRecordId("decision"),
      chosenScenarioId: chosen.id,
      rationale: input.rationale.trim(),
      conditions: [...(input.conditions ?? [])],
      acceptedUnknownIds: [...problem.readinessCheckpoint.acceptedCriticalUnknownIds],
      acknowledgedContradictionIds: [...problem.readinessCheckpoint.acknowledgedContradictionIds],
      scenarioSnapshot: structuredClone(problem.scenarios),
      criterionSnapshot: structuredClone(problem.decisionCriteria),
      decidedBy: "human",
      decidedAt: now,
      immutableForecastSnapshot: true,
      outcome: null,
      outcomeObservedAt: null,
    };
    return {
      ...problem,
      status: "decided",
      decisions: [...problem.decisions, decision],
      updatedAt: now,
      activity: [
        ...problem.activity,
        { id: newRecordId("event"), kind: "decision_recorded", actor: "human", summary: "Human decision recorded.", at: now },
      ],
    };
  });
}

export function addProblemMonitoringTrigger(input: {
  readonly problemId: string;
  readonly label: string;
  readonly metric: string;
  readonly operator: ProblemMonitoringTrigger["operator"];
  readonly threshold: number | string;
  readonly owner: string;
  readonly confirmedByHuman: true;
}): Problem | null {
  if (input.confirmedByHuman !== true || !input.label.trim() || !input.metric.trim()) return null;
  return updateProblem(input.problemId, (problem, now) => {
    if (problem.status !== "decided" && problem.status !== "monitoring") return problem;
    const trigger: ProblemMonitoringTrigger = {
      id: newRecordId("trigger"),
      label: input.label.trim(),
      metric: input.metric.trim(),
      operator: input.operator,
      threshold: input.threshold,
      owner: input.owner.trim() || "human_owner",
      status: "active",
      lastObservedValue: null,
      lastObservedAt: null,
      requiresHumanReview: true,
    };
    return {
      ...problem,
      status: "monitoring",
      monitoringTriggers: [...problem.monitoringTriggers, trigger],
      updatedAt: now,
      activity: [
        ...problem.activity,
        { id: newRecordId("event"), kind: "monitoring_trigger_added", actor: "human", summary: "Monitoring trigger added.", at: now },
      ],
    };
  });
}

function triggerMatches(trigger: ProblemMonitoringTrigger, value: number | string): boolean {
  if (trigger.operator === "changes") return trigger.lastObservedValue !== null && trigger.lastObservedValue !== value;
  if (trigger.operator === "equals") return String(value) === String(trigger.threshold);
  const observed = Number(value);
  const threshold = Number(trigger.threshold);
  if (!Number.isFinite(observed) || !Number.isFinite(threshold)) return false;
  return trigger.operator === "above" ? observed > threshold : observed < threshold;
}

export function observeProblemMetric(input: {
  readonly problemId: string;
  readonly triggerId: string;
  readonly value: number | string;
  readonly sourceConfirmedByHuman: true;
}): Problem | null {
  if (input.sourceConfirmedByHuman !== true) return null;
  return updateProblem(input.problemId, (problem, now) => {
    let triggered = false;
    const monitoringTriggers = problem.monitoringTriggers.map((trigger) => {
      if (trigger.id !== input.triggerId) return trigger;
      triggered = triggerMatches(trigger, input.value);
      return {
        ...trigger,
        status: triggered ? "triggered" as const : trigger.status,
        lastObservedValue: input.value,
        lastObservedAt: now,
      };
    });
    return {
      ...problem,
      monitoringTriggers,
      status: triggered ? "monitoring" : problem.status,
      updatedAt: now,
      activity: triggered
        ? [
            ...problem.activity,
            {
              id: newRecordId("event"),
              kind: "monitoring_triggered",
              actor: "system",
              summary: "Verified observation triggered human review; no decision changed automatically.",
              at: now,
            },
          ]
        : problem.activity,
    };
  });
}

export function reopenProblemDecision(input: {
  readonly problemId: string;
  readonly reason: string;
  readonly confirmedByHuman: true;
}): Problem | null {
  if (input.confirmedByHuman !== true || !input.reason.trim()) return null;
  return updateProblem(input.problemId, (problem, now) => {
    if (!problem.monitoringTriggers.some((trigger) => trigger.status === "triggered")) return problem;
    return {
      ...problem,
      status: "reopened",
      updatedAt: now,
      activity: [
        ...problem.activity,
        {
          id: newRecordId("event"),
          kind: "decision_reopened",
          actor: "human",
          summary: `Human reopened decision: ${input.reason.trim()}`,
          at: now,
        },
      ],
    };
  });
}

function writeProblems(problems: readonly Problem[]): void {
  if (!isBrowser()) {
    memory.length = 0;
    memory.push(...problems);
    return;
  }
  window.localStorage.setItem(resolveStorageKey(STORAGE_KEY), JSON.stringify(problems));
  window.dispatchEvent(new Event(CHANGE_EVENT));
  const ownerId = getSyncedCloudUserId();
  if (ownerId) {
    for (const problem of problems) {
      enqueueSync(ownerId, "problem_snapshots", "upsert", problem.id, {
        owner_id: ownerId,
        local_id: problem.id,
        schema_version: problem.schemaVersion,
        status: problem.status,
        payload: problem as unknown as Record<string, unknown>,
      });
    }
  }
}

export function getProblem(problemId: string): Problem | null {
  return listProblems().find((problem) => problem.id === problemId) ?? null;
}

export function createProblemFromConfirmedStarterCard(
  card: StarterWorkCard,
  operationalObjectId: string,
): Problem {
  const candidate = problemBriefFromConfirmedCard(card, operationalObjectId);
  const all = [...listProblems()];
  const existingIndex = all.findIndex((problem) => problem.id === candidate.id);
  if (existingIndex >= 0) {
    const existing = all[existingIndex]!;
    if (existing.operationalObjectIds.includes(operationalObjectId)) return existing;
    const updated: Problem = {
      ...existing,
      operationalObjectIds: [...existing.operationalObjectIds, operationalObjectId],
      updatedAt: new Date().toISOString(),
    };
    all[existingIndex] = updated;
    writeProblems(all);
    return updated;
  }
  writeProblems([candidate, ...all]);
  return candidate;
}

export function subscribeProblems(onChange: () => void): () => void {
  if (!isBrowser()) return () => undefined;
  const storageListener = (event: StorageEvent) => {
    if (event.key && event.key !== resolveStorageKey(STORAGE_KEY)) return;
    onChange();
  };
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", storageListener);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", storageListener);
  };
}

export function clearProblemsForTests(): void {
  memory.length = 0;
  if (isBrowser()) window.localStorage.removeItem(resolveStorageKey(STORAGE_KEY));
}
