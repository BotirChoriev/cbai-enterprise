import { taskResultStatusFromTaskStatus } from "@/lib/intelligence/agents/tasks/task-lifecycle";
import type { TaskStatus } from "@/lib/intelligence/agents/tasks/task-lifecycle";
import type {
  TaskDiagnosticsReference,
  TaskResultReference,
  TaskResultStatus,
} from "@/lib/intelligence/agents/tasks/types";

/**
 * Agent task result envelope (BUILD-048).
 *
 * Structural outcome metadata only — no business intelligence or fabricated output.
 */
export interface TaskResult {
  /** Result status classification. */
  status: TaskResultStatus;
  /** Non-blocking warnings collected for the task. */
  warnings: readonly string[];
  /** Blocking or terminal errors recorded for the task. */
  errors: readonly string[];
  /** Optional reference to diagnostics output. */
  diagnosticsReference?: TaskDiagnosticsReference;
  /** Optional reference to a result artifact. */
  resultReference?: TaskResultReference;
}

/**
 * Validate a task result envelope.
 */
export function validateTaskResult(
  result: TaskResult,
): { valid: true } | { valid: false; reason: string } {
  if (result.errors.length > 0 && result.status === "completed") {
    return {
      valid: false,
      reason: "Task result reject: completed status cannot include errors.",
    };
  }

  if (result.diagnosticsReference?.id !== undefined && !result.diagnosticsReference.id.trim()) {
    return {
      valid: false,
      reason: "Task result reject: diagnosticsReference id cannot be empty.",
    };
  }

  if (result.resultReference?.id !== undefined && !result.resultReference.id.trim()) {
    return {
      valid: false,
      reason: "Task result reject: resultReference id cannot be empty.",
    };
  }

  return { valid: true };
}

/**
 * Create an empty pending task result.
 */
export function createPendingTaskResult(): TaskResult {
  return {
    status: "pending",
    warnings: [],
    errors: [],
  };
}

/**
 * Create a task result from a terminal task status.
 */
export function createTaskResultFromStatus(input: {
  status: TaskStatus;
  warnings?: readonly string[];
  errors?: readonly string[];
  diagnosticsReference?: TaskDiagnosticsReference;
  resultReference?: TaskResultReference;
}): TaskResult {
  return {
    status: taskResultStatusFromTaskStatus(input.status),
    warnings: input.warnings ? [...input.warnings] : [],
    errors: input.errors ? [...input.errors] : [],
    diagnosticsReference: input.diagnosticsReference
      ? { ...input.diagnosticsReference }
      : undefined,
    resultReference: input.resultReference ? { ...input.resultReference } : undefined,
  };
}

/**
 * Create a failed task result with deterministic error message.
 */
export function createFailedTaskResult(reason: string): TaskResult {
  return {
    status: "failed",
    warnings: [],
    errors: [reason],
  };
}

/**
 * Produce a shallow copy of a task result envelope.
 */
export function copyTaskResult(result: TaskResult): TaskResult {
  return {
    status: result.status,
    warnings: [...result.warnings],
    errors: [...result.errors],
    diagnosticsReference: result.diagnosticsReference
      ? { ...result.diagnosticsReference }
      : undefined,
    resultReference: result.resultReference ? { ...result.resultReference } : undefined,
  };
}

/**
 * Returns true when the task result represents a terminal outcome.
 */
export function isTerminalTaskResult(result: TaskResult): boolean {
  return result.status !== "pending" && result.status !== "unsupported";
}
