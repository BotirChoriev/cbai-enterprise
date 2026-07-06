import type { ContradictionSummary } from "@/lib/intelligence/contradictions/types";
import type { IntelligenceRunDiagnostics } from "@/lib/intelligence/diagnostics/types";
import type { OrchestratorExecutionContext } from "@/lib/intelligence/orchestrator/execution-context";
import type { ExecutionPlan } from "@/lib/intelligence/orchestrator/types";
import type { RuntimeSession } from "@/lib/intelligence/runtime/runtime-session";
import type { TrustAssessment } from "@/lib/intelligence/trust.types";

/** Runtime policy decision outcome (BUILD-044). */
export type PolicyDecisionType = "allow" | "deny" | "pause" | "cancel" | "continue";

/** Severity tier for a policy evaluation outcome. */
export type PolicySeverity = "info" | "warning" | "error" | "critical";

/**
 * Deterministic policy evaluation result (BUILD-044).
 *
 * The Policy Engine evaluates execution rules only — it does not execute intelligence.
 */
export interface PolicyDecision {
  /** Recommended runtime action. */
  decision: PolicyDecisionType;
  /** Human-readable deterministic reason. */
  reason: string;
  /** Rule identifier that produced this decision. */
  policyName: string;
  /** Severity classification for monitoring and audit. */
  severity: PolicySeverity;
  /** Whether this decision blocks further execution. */
  blocking: boolean;
  /** ISO-8601 timestamp when evaluation completed. */
  timestamp: string;
}

/**
 * Inputs for runtime policy evaluation (BUILD-044).
 */
export interface RuntimePolicyEvaluationInput {
  /** Active runtime session under evaluation. */
  session: RuntimeSession;
  /** Orchestrator execution context for the run. */
  context: OrchestratorExecutionContext;
  /** Active execution plan. */
  plan: ExecutionPlan;
  /** Optional run diagnostics output. */
  diagnostics?: IntelligenceRunDiagnostics;
  /** Optional trust assessment output. */
  trust?: TrustAssessment;
  /** Optional contradiction summary output. */
  contradictionSummary?: ContradictionSummary;
  /** Reference timestamp for deterministic evaluation (defaults to now). */
  evaluatedAt?: string;
}

/** Alias for orchestrator execution context in policy evaluation. */
export type PolicyExecutionContext = OrchestratorExecutionContext;

/** Semantic version of the runtime policy engine foundation. */
export const RUNTIME_POLICY_ENGINE_VERSION = "0.1.0-policy-engine";
