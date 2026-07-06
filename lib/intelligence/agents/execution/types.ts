import type { AgentDefinition } from "@/lib/intelligence/agents/registry/types";
import type { AgentTask } from "@/lib/intelligence/agents/tasks/task";
import type { ProviderKind } from "@/lib/intelligence/agents/runtime/provider-kinds";
import type { LocalExecutionType } from "@/lib/intelligence/agents/providers/local/types";

/** Semantic version of the agent execution foundation. */
export const AGENT_EXECUTION_FOUNDATION_VERSION = "0.1.0-agent-execution-foundation";

/** Agent execution coordination lifecycle state (BUILD-054). */
export type ExecutionState = "created" | "prepared" | "validated" | "ready" | "blocked";

/**
 * Agent execution foundation result (BUILD-054).
 *
 * Contract preparation metadata only — no model inference or provider calls.
 */
export interface AgentExecutionResult {
  /** Source agent task id. */
  taskId: string;
  /** Assigned agent id. */
  agentId: string;
  /** Resolved provider kind for the runtime contract. */
  providerKind: ProviderKind;
  /** Whether contract prepare() succeeded. */
  prepared: boolean;
  /** Whether contract validate() succeeded. */
  validated: boolean;
  /** Whether contract health() reported healthy. */
  healthy: boolean;
  /** Non-blocking warnings collected during preparation. */
  warnings: readonly string[];
  /** Blocking errors collected during preparation. */
  errors: readonly string[];
  /** Runtime contract semantic version. */
  runtimeContractVersion: string;
  /** Whether execution foundation checks passed — execute() remains disabled. */
  executionReady: boolean;
  /** Current execution coordination state. */
  state: ExecutionState;
  /** Optional describe() reason when available. */
  description?: string;
  /** Whether contract execute() was invoked — local provider only (BUILD-055). */
  executed?: boolean;
  /** Execution classification when executed. */
  executionType?: LocalExecutionType;
  /** Wall-clock execution duration in milliseconds when executed. */
  executionDurationMs?: number;
  /** Factual execution summary when executed. */
  executionSummary?: string;
}

/**
 * Input for agent execution foundation operations.
 */
export interface AgentExecutionInput {
  /** Dispatch-ready agent task. */
  task: AgentTask;
  /** Linked agent registry definition. */
  agentDefinition: AgentDefinition;
  /** Provider kind for runtime contract resolution — defaults to local. */
  providerKind?: ProviderKind;
  /** Optional evaluation timestamp. */
  evaluatedAt?: string;
}
