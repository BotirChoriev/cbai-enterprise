import type { LocalExecutionStatus } from "@/lib/intelligence/agents/providers/local/types";
import {
  LOCAL_RUNTIME_EXECUTION_SUMMARY,
  type LocalRuntimeExecutionResult,
} from "@/lib/intelligence/agents/providers/local/types";

/** Local runtime coordination state (BUILD-055). */
export type LocalRuntimeState = "idle" | "executing" | "completed" | "failed";

/**
 * Returns true when local runtime state represents a terminal execution.
 */
export function isTerminalLocalRuntimeState(state: LocalRuntimeState): boolean {
  return state === "completed" || state === "failed";
}

/**
 * Resolve local runtime state from execution status.
 */
export function resolveLocalRuntimeState(status: LocalExecutionStatus): LocalRuntimeState {
  return status === "completed" ? "completed" : "failed";
}

/**
 * Build a deterministic completed local execution result.
 */
export function buildCompletedLocalExecutionResult(input?: {
  executionDurationMs?: number;
  executionSummary?: string;
}): LocalRuntimeExecutionResult {
  return {
    status: "completed",
    providerKind: "local",
    executionType: "deterministic",
    warnings: [],
    errors: [],
    executionSummary: input?.executionSummary ?? LOCAL_RUNTIME_EXECUTION_SUMMARY,
    executionDurationMs: input?.executionDurationMs ?? 0,
  };
}

/**
 * Build a failed local execution result.
 */
export function buildFailedLocalExecutionResult(input: {
  reason: string;
  executionDurationMs?: number;
}): LocalRuntimeExecutionResult {
  return {
    status: "failed",
    providerKind: "local",
    executionType: "deterministic",
    warnings: [],
    errors: [input.reason],
    executionSummary: input.reason,
    executionDurationMs: input?.executionDurationMs ?? 0,
  };
}
