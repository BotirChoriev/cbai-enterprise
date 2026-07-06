import type { PolicyDecision } from "@/lib/intelligence/runtime/policy/types";
import type { SessionRegistry } from "@/lib/intelligence/runtime/registry/session-registry";
import { defaultSessionRegistry } from "@/lib/intelligence/runtime/registry/session-registry";
import type { RuntimeQueue } from "@/lib/intelligence/runtime/queue/queue";
import { defaultRuntimeQueue } from "@/lib/intelligence/runtime/queue/queue";
import type { RuntimeScheduler } from "@/lib/intelligence/runtime/scheduler/scheduler";
import { defaultRuntimeScheduler } from "@/lib/intelligence/runtime/scheduler/scheduler";
import type {
  ObservabilityCollectInput,
  PolicyDecisionSummary,
  RuntimeComponentHealth,
  RuntimeMetrics,
} from "@/lib/intelligence/observability/types";

/**
 * Build policy decision summary from a policy decision when available.
 */
export function buildPolicyDecisionSummary(
  decision: PolicyDecision | undefined,
): PolicyDecisionSummary | undefined {
  if (!decision) {
    return undefined;
  }

  return {
    decision: decision.decision,
    policyName: decision.policyName,
    reason: decision.reason,
    blocking: decision.blocking,
  };
}

/**
 * Derive runtime component health from runtime metrics inputs.
 */
export function deriveRuntimeComponentHealth(input: {
  sessionRegistry: ReturnType<SessionRegistry["snapshot"]>;
  queue: ReturnType<RuntimeQueue["snapshot"]>;
  scheduler: ReturnType<RuntimeScheduler["snapshot"]>;
  policyDecision?: PolicyDecisionSummary;
}): RuntimeComponentHealth {
  if (input.policyDecision?.blocking && input.policyDecision.decision === "deny") {
    return "blocked";
  }

  if (input.sessionRegistry.failed > 0 && input.sessionRegistry.active === 0) {
    return "degraded";
  }

  if (
    input.queue.failed > 0 ||
    input.queue.running > 0 ||
    input.scheduler.expired > 0
  ) {
    return "degraded";
  }

  if (
    input.queue.pending > 0 ||
    input.scheduler.scheduled > 0 ||
    input.sessionRegistry.active > 0
  ) {
    return "degraded";
  }

  return "healthy";
}

/**
 * Collect runtime layer metrics snapshot.
 */
export function collectRuntimeMetrics(input: {
  sessionRegistry?: SessionRegistry;
  queue?: RuntimeQueue;
  scheduler?: RuntimeScheduler;
  collectInput?: ObservabilityCollectInput;
}): RuntimeMetrics {
  const evaluatedAt = input.collectInput?.evaluatedAt ?? new Date().toISOString();
  const sessionRegistry = (input.sessionRegistry ?? defaultSessionRegistry).snapshot();
  const queue = (input.queue ?? defaultRuntimeQueue).snapshot();
  const scheduler = (input.scheduler ?? defaultRuntimeScheduler).snapshot(evaluatedAt);
  const policyDecision = buildPolicyDecisionSummary(input.collectInput?.lastPolicyDecision);
  const runtimeHealth = deriveRuntimeComponentHealth({
    sessionRegistry,
    queue,
    scheduler,
    policyDecision,
  });

  return {
    sessionRegistry,
    queue,
    scheduler,
    policyDecision,
    runtimeHealth,
  };
}
