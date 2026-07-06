import type {
  AgentDispatcher,
  AgentDispatchInput,
} from "@/lib/intelligence/agents/dispatch/dispatcher";
import { defaultAgentDispatcher } from "@/lib/intelligence/agents/dispatch/dispatcher";
import type { DispatchResult } from "@/lib/intelligence/agents/dispatch/dispatch-result";
import { isDispatchSelected } from "@/lib/intelligence/agents/dispatch/dispatch-result";
import type { DispatchPolicy } from "@/lib/intelligence/agents/dispatch/types";
import type { AgentDefinition } from "@/lib/intelligence/agents/registry/types";
import type { AgentTaskStore } from "@/lib/intelligence/agents/tasks/store/task-store";
import { defaultAgentTaskStore } from "@/lib/intelligence/agents/tasks/store/task-store";
import type { AgentTask } from "@/lib/intelligence/agents/tasks/task";
import {
  applyDispatchToTask,
} from "@/lib/intelligence/agents/integration/agent-dispatch-state";
import {
  buildAgentDispatchDiagnostics,
  copyAgentDispatchDiagnostics,
} from "@/lib/intelligence/agents/integration/agent-dispatch-diagnostics";
import type {
  AgentDispatchDiagnostics,
  AgentDispatchPreparationResult,
  AgentDispatchValidationResult,
} from "@/lib/intelligence/agents/integration/types";
import type { IntelligenceType } from "@/lib/intelligence/request.types";

/** Stable identifier for the default agent dispatch integration. */
export const DEFAULT_AGENT_DISPATCH_INTEGRATION_ID = "default-agent-dispatch-integration";

/**
 * Input for dispatch preparation.
 */
export interface AgentDispatchPreparationInput {
  /** Task requiring dispatch preparation. */
  task: AgentTask;
  /** Available agent definitions from the Agent Registry. */
  availableAgents: readonly AgentDefinition[];
  /** Optional dispatch policy override. */
  policy?: DispatchPolicy;
  /** Optional runtime session id reference. */
  runtimeSessionId?: string;
  /** Optional intelligence type for matching. */
  intelligenceType?: IntelligenceType;
  /** Optional evaluation timestamp. */
  evaluatedAt?: string;
}

/**
 * Contract for agent dispatch integration (BUILD-053).
 *
 * Connects Agent Task Store and Agent Dispatcher for deterministic preparation.
 * Does not execute agents or call provider stubs.
 */
export interface AgentDispatchIntegration {
  /** Prepare dispatch for a task — select agent, update store, return diagnostics. */
  prepareDispatch(input: AgentDispatchPreparationInput): AgentDispatchPreparationResult;

  /** Validate dispatch outcome against a task record. */
  validateDispatch(task: AgentTask, dispatchResult: DispatchResult): AgentDispatchValidationResult;

  /** Explain dispatch outcome for audit. */
  explainDispatch(task: AgentTask, dispatchResult: DispatchResult): string;
}

/**
 * Ensure a task exists in the store — add when missing.
 */
export function ensureTaskInStore(
  task: AgentTask,
  store: AgentTaskStore = defaultAgentTaskStore,
): { stored: boolean; task: AgentTask } {
  const existing = store.get(task.id);

  if (existing) {
    return { stored: false, task: existing };
  }

  const addResult = store.add(task);

  if (!addResult.accepted || !addResult.task) {
    throw new Error(addResult.reason ?? "Task store add rejected.");
  }

  return { stored: true, task: addResult.task };
}

/**
 * Default agent dispatch integration (BUILD-053).
 */
export class DefaultAgentDispatchIntegration implements AgentDispatchIntegration {
  private readonly store: AgentTaskStore;
  private readonly dispatcher: AgentDispatcher;

  constructor(
    store: AgentTaskStore = defaultAgentTaskStore,
    dispatcher: AgentDispatcher = defaultAgentDispatcher,
  ) {
    this.store = store;
    this.dispatcher = dispatcher;
  }

  prepareDispatch(input: AgentDispatchPreparationInput): AgentDispatchPreparationResult {
    const { stored, task: storedTask } = ensureTaskInStore(input.task, this.store);
    const dispatchInput: AgentDispatchInput = {
      task: storedTask,
      availableAgents: input.availableAgents,
      policy: input.policy,
      runtimeSessionId: input.runtimeSessionId,
      intelligenceType: input.intelligenceType,
      evaluatedAt: input.evaluatedAt,
    };

    const dispatchResult = this.dispatcher.dispatch(dispatchInput);
    const timestamp = dispatchResult.timestamp;
    const { task: preparedTask, diagnostics } = applyDispatchToTask(
      storedTask,
      dispatchResult,
      timestamp,
    );

    const updateResult = this.store.update(preparedTask.id, preparedTask, timestamp);

    if (!updateResult.updated || !updateResult.task) {
      throw new Error(updateResult.reason ?? "Task store update rejected after dispatch.");
    }

    return {
      task: updateResult.task,
      dispatchResult,
      diagnostics: copyAgentDispatchDiagnostics(diagnostics),
      stored,
      storeUpdated: true,
    };
  }

  validateDispatch(
    task: AgentTask,
    dispatchResult: DispatchResult,
  ): AgentDispatchValidationResult {
    const warnings: string[] = [];
    const diagnostics = buildAgentDispatchDiagnostics(task, dispatchResult);

    if (isDispatchSelected(dispatchResult)) {
      if (!dispatchResult.selectedAgentId) {
        return {
          valid: false,
          reason: "Dispatch validation reject: selected decision requires selectedAgentId.",
          warnings,
        };
      }

      if (task.agentId !== dispatchResult.selectedAgentId) {
        return {
          valid: false,
          reason: `Dispatch validation reject: task agentId "${task.agentId}" does not match selected "${dispatchResult.selectedAgentId}".`,
          warnings,
        };
      }

      if (task.dispatchMetadata && task.dispatchMetadata.selectedAgentId !== dispatchResult.selectedAgentId) {
        return {
          valid: false,
          reason: "Dispatch validation reject: task dispatchMetadata selectedAgentId mismatch.",
          warnings,
        };
      }

      if (!diagnostics.dispatchReady) {
        warnings.push("Dispatch selected but task is not dispatch-ready.");
      }

      return {
        valid: true,
        reason: "Dispatch validation passed: selected agent matches task assignment.",
        warnings,
      };
    }

    if (dispatchResult.decision === "rejected") {
      if (dispatchResult.selectedAgentId !== null) {
        return {
          valid: false,
          reason: "Dispatch validation reject: rejected decision must not include selectedAgentId.",
          warnings,
        };
      }

      return {
        valid: true,
        reason: "Dispatch validation passed: rejected dispatch with no selected agent.",
        warnings,
      };
    }

    return {
      valid: true,
      reason: `Dispatch validation passed: decision "${dispatchResult.decision}" recorded.`,
      warnings,
    };
  }

  explainDispatch(task: AgentTask, dispatchResult: DispatchResult): string {
    const diagnostics = buildAgentDispatchDiagnostics(task, dispatchResult);
    const validation = this.validateDispatch(task, dispatchResult);

    const lines = [
      `Task "${task.id}" dispatch preparation.`,
      `Decision: ${diagnostics.decision}.`,
      `Reason: ${diagnostics.reason}.`,
      `Selected agent: ${diagnostics.selectedAgentId ?? "none"}.`,
      `Task status: ${diagnostics.taskStatus}.`,
      `Dispatch ready: ${diagnostics.dispatchReady ? "yes" : "no"}.`,
      `Validation: ${validation.valid ? "valid" : "invalid"} — ${validation.reason}.`,
    ];

    if (diagnostics.warnings.length > 0) {
      lines.push(`Warnings: ${diagnostics.warnings.join("; ")}.`);
    }

    if (validation.warnings.length > 0) {
      lines.push(`Validation warnings: ${validation.warnings.join("; ")}.`);
    }

    return lines.join(" ");
  }
}

/** Shared default agent dispatch integration singleton. */
export const defaultAgentDispatchIntegration = new DefaultAgentDispatchIntegration();

/**
 * Convenience helper — prepare dispatch using the default integration singleton.
 */
export function prepareAgentDispatch(
  input: AgentDispatchPreparationInput,
  integration: AgentDispatchIntegration = defaultAgentDispatchIntegration,
): AgentDispatchPreparationResult {
  return integration.prepareDispatch(input);
}

export type { AgentDispatchDiagnostics, AgentDispatchPreparationResult };
