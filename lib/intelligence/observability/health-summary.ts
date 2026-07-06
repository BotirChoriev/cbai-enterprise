import type {
  AgentMetrics,
  HealthSummary,
  ObservabilityHealthStatus,
  RuntimeMetrics,
} from "@/lib/intelligence/observability/types";

/**
 * Derive overall observability health status from runtime and agent metrics.
 */
export function deriveObservabilityHealthStatus(input: {
  runtime: RuntimeMetrics;
  agent: AgentMetrics;
}): ObservabilityHealthStatus {
  if (input.runtime.runtimeHealth === "blocked") {
    return "blocked";
  }

  if (input.runtime.policyDecision?.blocking && input.runtime.policyDecision.decision === "cancel") {
    return "blocked";
  }

  if (input.runtime.runtimeHealth === "degraded") {
    return "degraded";
  }

  if (
    input.runtime.queue.pending > 0 ||
    input.runtime.scheduler.scheduled > 0 ||
    input.agent.taskStore.active > 0 ||
    input.agent.dispatchReadiness.pendingDispatchCount > 0
  ) {
    return "degraded";
  }

  return "healthy";
}

/**
 * Build non-blocking warnings from observability metrics.
 */
export function buildObservabilityWarnings(input: {
  runtime: RuntimeMetrics;
  agent: AgentMetrics;
}): string[] {
  const warnings: string[] = [];

  if (input.runtime.queue.pending > 0) {
    warnings.push(`${input.runtime.queue.pending} queue item(s) pending dispatch preparation.`);
  }

  if (input.runtime.scheduler.scheduled > 0) {
    warnings.push(`${input.runtime.scheduler.scheduled} scheduled item(s) awaiting evaluation.`);
  }

  if (input.runtime.scheduler.readyCount > 0) {
    warnings.push(`${input.runtime.scheduler.readyCount} scheduled item(s) ready for queue promotion.`);
  }

  if (input.agent.dispatchReadiness.pendingDispatchCount > 0) {
    warnings.push(
      `${input.agent.dispatchReadiness.pendingDispatchCount} active task(s) pending dispatch readiness.`,
    );
  }

  if (!input.agent.localAdapterAvailable) {
    warnings.push("Local runtime adapter is not available.");
  }

  if (input.runtime.sessionRegistry.failed > 0) {
    warnings.push(`${input.runtime.sessionRegistry.failed} failed runtime session(s) recorded.`);
  }

  return warnings;
}

/**
 * Build blocking issues from observability metrics.
 */
export function buildObservabilityBlockingIssues(input: {
  runtime: RuntimeMetrics;
}): string[] {
  const issues: string[] = [];

  if (input.runtime.policyDecision?.blocking) {
    issues.push(
      `Policy ${input.runtime.policyDecision.policyName} blocked execution: ${input.runtime.policyDecision.reason}`,
    );
  }

  if (input.runtime.queue.failed > 0) {
    issues.push(`${input.runtime.queue.failed} queue item(s) failed.`);
  }

  return issues;
}

/**
 * Resolve deterministic recommended next action from observability state.
 */
export function resolveRecommendedNextAction(input: {
  status: ObservabilityHealthStatus;
  runtime: RuntimeMetrics;
  agent: AgentMetrics;
  blockingIssues: readonly string[];
}): string {
  if (input.status === "blocked") {
    return "Resolve blocking policy or queue failures before continuing runtime operations.";
  }

  if (input.runtime.scheduler.readyCount > 0) {
    return "Call evaluateReadyTasks(evaluatedAt) to promote due scheduled tasks to the queue.";
  }

  if (input.runtime.scheduler.scheduled > 0) {
    return "Monitor scheduled tasks and call evaluateReadyTasks(evaluatedAt) when due.";
  }

  if (input.runtime.queue.pending > 0) {
    return "Dequeue pending tasks for dispatch and execution preparation.";
  }

  if (input.agent.dispatchReadiness.pendingDispatchCount > 0) {
    return "Run dispatch integration to prepare active tasks for agent assignment.";
  }

  if (input.agent.executionReadiness.executionCandidateCount > 0) {
    return "Run execution foundation for dispatch-ready queued tasks.";
  }

  if (
    input.runtime.sessionRegistry.total === 0 &&
    input.agent.taskStore.total === 0 &&
    input.runtime.queue.total === 0 &&
    input.runtime.scheduler.total === 0
  ) {
    return "No runtime activity — schedule or enqueue agent tasks when ready.";
  }

  return "Continue monitoring runtime and agent metrics — no immediate action required.";
}

/**
 * Build unified health summary from runtime and agent metrics.
 */
export function collectHealthSummary(input: {
  runtime: RuntimeMetrics;
  agent: AgentMetrics;
}): HealthSummary {
  const status = deriveObservabilityHealthStatus(input);
  const warnings = buildObservabilityWarnings(input);
  const blockingIssues = buildObservabilityBlockingIssues(input);
  const recommendedNextAction = resolveRecommendedNextAction({
    status,
    runtime: input.runtime,
    agent: input.agent,
    blockingIssues,
  });

  return {
    status,
    warnings,
    blockingIssues,
    recommendedNextAction,
  };
}
