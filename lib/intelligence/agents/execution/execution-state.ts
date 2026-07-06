import type { AgentHealthResult } from "@/lib/intelligence/agents/runtime/types";
import type { ExecutionState } from "@/lib/intelligence/agents/execution/types";

/**
 * Returns true when execution state represents a blocked coordination path.
 */
export function isBlockedExecutionState(state: ExecutionState): boolean {
  return state === "blocked";
}

/**
 * Returns true when execution state represents a ready coordination path.
 */
export function isReadyExecutionState(state: ExecutionState): boolean {
  return state === "ready";
}

/**
 * Resolve executionReady from foundation check outcomes.
 */
export function resolveExecutionReady(input: {
  prepared: boolean;
  validated: boolean;
  healthy: boolean;
  state: ExecutionState;
}): boolean {
  if (isBlockedExecutionState(input.state)) {
    return false;
  }

  return input.prepared && input.validated && input.healthy && input.state === "ready";
}

/**
 * Resolve execution state after prepare().
 */
export function resolveStateAfterPrepare(
  accepted: boolean,
  current: ExecutionState,
): ExecutionState {
  if (isBlockedExecutionState(current)) {
    return current;
  }

  return accepted ? "prepared" : "blocked";
}

/**
 * Resolve execution state after validate().
 */
export function resolveStateAfterValidate(
  accepted: boolean,
  current: ExecutionState,
): ExecutionState {
  if (isBlockedExecutionState(current)) {
    return current;
  }

  if (!accepted) {
    return "blocked";
  }

  return current === "prepared" ? "validated" : "blocked";
}

/**
 * Resolve execution state after health check.
 */
export function resolveStateAfterHealth(
  health: AgentHealthResult,
  current: ExecutionState,
  prepared: boolean,
  validated: boolean,
): ExecutionState {
  if (isBlockedExecutionState(current)) {
    return current;
  }

  if (!prepared || !validated) {
    return "blocked";
  }

  return health.healthy ? "ready" : "blocked";
}

/**
 * Copy execution state label for audit output.
 */
export function formatExecutionState(state: ExecutionState): string {
  switch (state) {
    case "created":
      return "created";
    case "prepared":
      return "prepared";
    case "validated":
      return "validated";
    case "ready":
      return "ready";
    case "blocked":
      return "blocked";
    default:
      return state;
  }
}
