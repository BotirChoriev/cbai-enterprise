/** Agent runtime lifecycle status (BUILD-047). */
export type AgentLifecycleStatus =
  | "created"
  | "prepared"
  | "validated"
  | "ready"
  | "executing"
  | "completed"
  | "failed"
  | "cancelled";

/** Terminal agent lifecycle states. */
const TERMINAL_AGENT_LIFECYCLE: ReadonlySet<AgentLifecycleStatus> = new Set([
  "completed",
  "failed",
  "cancelled",
]);

/**
 * Returns true when lifecycle represents a terminal agent runtime state.
 */
export function isTerminalAgentLifecycle(status: AgentLifecycleStatus): boolean {
  return TERMINAL_AGENT_LIFECYCLE.has(status);
}

/**
 * Returns true when lifecycle allows prepare transition.
 */
export function canPrepareAgentLifecycle(status: AgentLifecycleStatus): boolean {
  return status === "created";
}

/**
 * Returns true when lifecycle allows validate transition.
 */
export function canValidateAgentLifecycle(status: AgentLifecycleStatus): boolean {
  return status === "prepared" || status === "created";
}

/**
 * Returns true when lifecycle allows ready transition.
 */
export function canMarkAgentReady(status: AgentLifecycleStatus): boolean {
  return status === "validated";
}

/**
 * Returns true when lifecycle allows execute transition (reserved).
 */
export function canExecuteAgentLifecycle(status: AgentLifecycleStatus): boolean {
  return status === "ready";
}

/**
 * Advance lifecycle to prepared when allowed; otherwise return current status.
 */
export function advanceToPrepared(status: AgentLifecycleStatus): AgentLifecycleStatus {
  return canPrepareAgentLifecycle(status) ? "prepared" : status;
}

/**
 * Advance lifecycle to validated when allowed; otherwise return current status.
 */
export function advanceToValidated(status: AgentLifecycleStatus): AgentLifecycleStatus {
  return canValidateAgentLifecycle(status) ? "validated" : status;
}

/**
 * Advance lifecycle to ready when allowed; otherwise return current status.
 */
export function advanceToReady(status: AgentLifecycleStatus): AgentLifecycleStatus {
  return canMarkAgentReady(status) ? "ready" : status;
}
