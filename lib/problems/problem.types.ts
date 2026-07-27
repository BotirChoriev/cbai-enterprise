import type { ActivationMaterial, StarterWorkCard } from "@/lib/activation/starter-work-card";

export const PROBLEM_SCHEMA_VERSION = 1 as const;

export type ProblemStatus =
  | "draft"
  | "open"
  | "investigating"
  | "awaiting_human_decision"
  | "decided"
  | "monitoring"
  | "reopened"
  | "closed";

export type ProblemBrief = {
  readonly version: number;
  readonly title: string;
  readonly originalStatement: string;
  readonly problemStatement: string;
  readonly desiredOutcome: string | null;
  readonly constraints: string | null;
  readonly roleContext: string;
  readonly knownInformation: readonly string[];
  readonly assumptions: readonly string[];
  readonly unknowns: readonly string[];
  readonly materials: readonly ActivationMaterial[];
  readonly contentLocale: string;
  readonly createdAt: string;
  readonly confirmedAt: string;
  readonly confirmedBy: "human";
};

export type ProblemActivityEvent = {
  readonly id: string;
  readonly kind:
    | "problem_opened"
    | "brief_confirmed"
    | "claim_added"
    | "evidence_linked"
    | "unknown_added"
    | "unknown_resolved"
    | "contradiction_registered"
    | "readiness_decided"
    | "criterion_added"
    | "scenario_added"
    | "decision_recorded"
    | "monitoring_trigger_added"
    | "monitoring_triggered"
    | "decision_reopened"
    | "status_changed";
  readonly actor: "human" | "system";
  readonly summary: string;
  readonly at: string;
};

export type ProblemClaimStatus = "proposed" | "supported" | "disputed" | "unknown";

export type ProblemClaim = {
  readonly id: string;
  readonly statement: string;
  readonly status: ProblemClaimStatus;
  readonly createdBy: "human" | "ai";
  readonly evidencePassportIds: readonly string[];
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type ProblemUnknownSeverity = "low" | "medium" | "high" | "critical";

export type ProblemUnknown = {
  readonly id: string;
  readonly question: string;
  readonly whyItMatters: string;
  readonly severity: ProblemUnknownSeverity;
  readonly evidenceNeeded: string;
  readonly owner: string;
  readonly status: "open" | "accepted_as_risk" | "resolved";
  readonly resolutionEvidencePassportIds: readonly string[];
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type ProblemContradiction = {
  readonly id: string;
  readonly claimId: string;
  readonly evidencePassportIds: readonly string[];
  readonly reason:
    | "methodology"
    | "time_period"
    | "geography"
    | "sample"
    | "measurement"
    | "incomplete_data"
    | "other";
  readonly severity: "medium" | "high" | "critical";
  readonly explanation: string;
  readonly status: "unresolved" | "acknowledged" | "resolved";
  readonly reviewedByHuman: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type ProblemReadinessCheckpoint = {
  readonly status: "not_reviewed" | "ready_for_scenarios" | "continue_investigation";
  readonly decidedBy: "human" | null;
  readonly decidedAt: string | null;
  readonly acceptedCriticalUnknownIds: readonly string[];
  readonly acknowledgedContradictionIds: readonly string[];
  readonly note: string | null;
};

export type ProblemDecisionCriterion = {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly weight: 1 | 2 | 3 | 4 | 5;
  readonly definedBy: "human";
  readonly createdAt: string;
};

export type ProblemScenarioEvaluation = {
  readonly criterionId: string;
  readonly score: 1 | 2 | 3 | 4 | 5 | null;
  readonly rationale: string;
  readonly evidencePassportIds: readonly string[];
  readonly uncertainty: "low" | "medium" | "high" | "unknown";
};

export type ProblemScenario = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly createdBy: "human" | "ai";
  readonly benefits: readonly string[];
  readonly risks: readonly string[];
  readonly assumptions: readonly string[];
  readonly stakeholderImpacts: readonly string[];
  readonly reversibility: "easy" | "moderate" | "difficult" | "unknown";
  readonly evaluations: readonly ProblemScenarioEvaluation[];
  readonly status: "draft" | "ready_for_human_review" | "rejected";
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type ProblemDecisionRecord = {
  readonly id: string;
  readonly chosenScenarioId: string;
  readonly rationale: string;
  readonly conditions: readonly string[];
  readonly acceptedUnknownIds: readonly string[];
  readonly acknowledgedContradictionIds: readonly string[];
  readonly scenarioSnapshot: readonly ProblemScenario[];
  readonly criterionSnapshot: readonly ProblemDecisionCriterion[];
  readonly decidedBy: "human";
  readonly decidedAt: string;
  readonly immutableForecastSnapshot: true;
  readonly outcome: string | null;
  readonly outcomeObservedAt: string | null;
};

export type ProblemMonitoringTrigger = {
  readonly id: string;
  readonly label: string;
  readonly metric: string;
  readonly operator: "above" | "below" | "equals" | "changes";
  readonly threshold: number | string;
  readonly owner: string;
  readonly status: "active" | "triggered" | "disabled";
  readonly lastObservedValue: number | string | null;
  readonly lastObservedAt: string | null;
  readonly requiresHumanReview: true;
};

export type Problem = {
  readonly schemaVersion: typeof PROBLEM_SCHEMA_VERSION;
  readonly id: string;
  readonly status: ProblemStatus;
  readonly currentBriefVersion: number;
  readonly briefs: readonly ProblemBrief[];
  readonly claims: readonly ProblemClaim[];
  readonly unknownRegister: readonly ProblemUnknown[];
  readonly contradictions: readonly ProblemContradiction[];
  readonly readinessCheckpoint: ProblemReadinessCheckpoint;
  readonly decisionCriteria: readonly ProblemDecisionCriterion[];
  readonly scenarios: readonly ProblemScenario[];
  readonly decisions: readonly ProblemDecisionRecord[];
  readonly monitoringTriggers: readonly ProblemMonitoringTrigger[];
  readonly operationalObjectIds: readonly string[];
  readonly evidencePassportIds: readonly string[];
  readonly unresolvedContradictionCount: number;
  readonly criticalUnknownCount: number;
  readonly finalDecisionOwner: "human";
  readonly source: StarterWorkCard["source"];
  readonly sourceRoute: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly activity: readonly ProblemActivityEvent[];
};
