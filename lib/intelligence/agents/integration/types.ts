import type { DispatchResult } from "@/lib/intelligence/agents/dispatch/dispatch-result";
import type { DispatchDecision } from "@/lib/intelligence/agents/dispatch/types";
import type { AgentTask } from "@/lib/intelligence/agents/tasks/task";
import type { TaskStatus } from "@/lib/intelligence/agents/tasks/task-lifecycle";

/** Semantic version of the agent dispatch integration foundation. */
export const AGENT_DISPATCH_INTEGRATION_VERSION = "0.1.0-agent-dispatch-integration";

/**
 * Dispatch preparation diagnostics returned by integration (BUILD-053).
 */
export interface AgentDispatchDiagnostics {
  /** Selected agent id when dispatch succeeded. */
  selectedAgentId: string | null;
  /** Dispatch decision outcome. */
  decision: DispatchDecision;
  /** Deterministic dispatch reason. */
  reason: string;
  /** Non-blocking warnings collected during preparation. */
  warnings: readonly string[];
  /** Task lifecycle status after preparation. */
  taskStatus: TaskStatus;
  /** Whether the task is ready for future agent execution. */
  dispatchReady: boolean;
}

/**
 * Result of dispatch validation against a task record.
 */
export interface AgentDispatchValidationResult {
  /** Whether dispatch outcome is consistent with the task. */
  valid: boolean;
  /** Deterministic validation reason. */
  reason: string;
  /** Non-blocking validation warnings. */
  warnings: readonly string[];
}

/**
 * Result of agent dispatch preparation (BUILD-053).
 *
 * Selection and store metadata only — no agent execution.
 */
export interface AgentDispatchPreparationResult {
  /** Task record after store update. */
  task: AgentTask;
  /** Raw dispatch selection result. */
  dispatchResult: DispatchResult;
  /** Integration diagnostics envelope. */
  diagnostics: AgentDispatchDiagnostics;
  /** Whether the task was accepted into the store. */
  stored: boolean;
  /** Whether the store record was updated after dispatch. */
  storeUpdated: boolean;
}
