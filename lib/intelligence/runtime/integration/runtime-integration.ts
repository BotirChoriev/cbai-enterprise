import type { OrchestratorExecutionContext } from "@/lib/intelligence/orchestrator/execution-context";
import { appendContextWarnings } from "@/lib/intelligence/orchestrator/execution-context";
import type { ExecutionPlan } from "@/lib/intelligence/orchestrator/types";
import {
  defaultPolicyEngine,
  isPermissivePolicyDecision,
  isTerminalPolicyDecision,
} from "@/lib/intelligence/runtime/policy";
import type {
  PolicyDecision,
  RuntimePolicyEvaluationInput,
} from "@/lib/intelligence/runtime/policy/types";
import {
  defaultSessionRegistry,
  type SessionRegistry,
} from "@/lib/intelligence/runtime/registry";
import type { RuntimeSession } from "@/lib/intelligence/runtime/runtime-session";
import type { PolicyEngine } from "@/lib/intelligence/runtime/policy/policy-engine";

/** Outcome of enforcing a runtime policy decision (BUILD-051). */
export interface RuntimePolicyEnforcementOutcome {
  /** Whether orchestration may continue. */
  continueExecution: boolean;
  /** Applied policy decision. */
  decision: PolicyDecision;
  /** Non-blocking warnings to append to the runtime session. */
  warnings: string[];
}

/** Pause enforcement warning — pause is not supported in BUILD-051. */
export const RUNTIME_POLICY_PAUSE_UNSUPPORTED_WARNING =
  "Runtime policy pause is not supported yet — execution continues with warning.";

/**
 * Register a runtime session in the session registry.
 */
export function registerRuntimeSession(
  session: RuntimeSession,
  registry: SessionRegistry = defaultSessionRegistry,
  timestamp?: string,
): void {
  registry.register(session, timestamp);
}

/**
 * Update a runtime session entry in the session registry.
 */
export function updateRuntimeSessionRegistry(
  session: RuntimeSession,
  registry: SessionRegistry = defaultSessionRegistry,
  timestamp?: string,
): void {
  registry.update(session.snapshot().sessionId, session, timestamp);
}

/**
 * Build policy evaluation input from orchestrator state.
 */
export function buildRuntimePolicyEvaluationInput(input: {
  session: RuntimeSession;
  context: OrchestratorExecutionContext;
  plan: ExecutionPlan;
  evaluatedAt?: string;
}): RuntimePolicyEvaluationInput {
  return {
    session: input.session,
    context: input.context,
    plan: input.plan,
    diagnostics: input.context.diagnostics,
    trust: input.context.trust,
    contradictionSummary: input.context.evidence?.contradictionSummary,
    evaluatedAt: input.evaluatedAt,
  };
}

/**
 * Evaluate runtime policy for the current orchestration state.
 */
export function evaluateOrchestratorRuntimePolicy(
  input: RuntimePolicyEvaluationInput,
  policyEngine: PolicyEngine = defaultPolicyEngine,
): PolicyDecision {
  return policyEngine.evaluate(input);
}

/**
 * Apply an authoritative policy decision to a runtime session.
 */
export function enforceRuntimePolicyDecision(
  session: RuntimeSession,
  decision: PolicyDecision,
  timestamp: string = new Date().toISOString(),
): RuntimePolicyEnforcementOutcome {
  const warnings: string[] = [];

  if (decision.decision === "pause") {
    warnings.push(RUNTIME_POLICY_PAUSE_UNSUPPORTED_WARNING);
    session.appendWarning(RUNTIME_POLICY_PAUSE_UNSUPPORTED_WARNING);
    return { continueExecution: true, decision, warnings };
  }

  if (decision.decision === "allow" || decision.decision === "continue") {
    return { continueExecution: true, decision, warnings };
  }

  if (decision.decision === "cancel") {
    session.cancel(decision.reason, timestamp);
    return { continueExecution: false, decision, warnings };
  }

  if (decision.decision === "deny") {
    return { continueExecution: false, decision, warnings };
  }

  return { continueExecution: isPermissivePolicyDecision(decision), decision, warnings };
}

/**
 * Evaluate and enforce runtime policy; sync session registry afterward.
 */
export function evaluateAndEnforceRuntimePolicy(input: {
  session: RuntimeSession;
  context: OrchestratorExecutionContext;
  plan: ExecutionPlan;
  registry?: SessionRegistry;
  policyEngine?: PolicyEngine;
  evaluatedAt?: string;
}): RuntimePolicyEnforcementOutcome {
  const registry = input.registry ?? defaultSessionRegistry;
  const evaluatedAt = input.evaluatedAt ?? new Date().toISOString();
  const policyInput = buildRuntimePolicyEvaluationInput({
    session: input.session,
    context: input.context,
    plan: input.plan,
    evaluatedAt,
  });

  const decision = evaluateOrchestratorRuntimePolicy(
    policyInput,
    input.policyEngine ?? defaultPolicyEngine,
  );

  const outcome = enforceRuntimePolicyDecision(input.session, decision, evaluatedAt);

  for (const warning of outcome.warnings) {
    appendContextWarnings(input.context, [warning]);
  }

  input.context.lastPolicyDecision = decision;
  updateRuntimeSessionRegistry(input.session, registry, evaluatedAt);

  if (isTerminalPolicyDecision(decision) && decision.decision === "deny") {
    input.context.stoppedReason = `Stopped by runtime policy (${decision.policyName}): ${decision.reason}`;
  }

  if (decision.decision === "cancel") {
    input.context.stoppedReason = `Terminated by runtime policy (${decision.policyName}): ${decision.reason}`;
  }

  return outcome;
}
