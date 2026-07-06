import type { AgentTask } from "@/lib/intelligence/agents/tasks/task";
import { copyAgentTask, validateAgentTask } from "@/lib/intelligence/agents/tasks/task";
import { validateTaskLifecycleTransition } from "@/lib/intelligence/agents/tasks/task-lifecycle";
import {
  buildAgentTaskStoreSnapshot,
  copyStoredTask,
  sortStoredTasks,
} from "@/lib/intelligence/agents/tasks/store/task-store-state";
import type {
  AgentTaskStoreSnapshot,
  TaskStoreAddResult,
  TaskStoreUpdateResult,
} from "@/lib/intelligence/agents/tasks/store/types";

/** Stable identifier for the default agent task store. */
export const DEFAULT_AGENT_TASK_STORE_ID = "default-agent-task-store";

/**
 * Contract for the CBAI Intelligence Agent Task Store (BUILD-052).
 *
 * In-memory tracking of AgentTask records.
 * No persistence, timers, workers, or browser APIs.
 */
export interface AgentTaskStore {
  /** Add a new agent task. */
  add(task: AgentTask): TaskStoreAddResult;

  /** Retrieve a task by id. */
  get(taskId: string): AgentTask | null;

  /** List all tasks in deterministic order. */
  list(): readonly AgentTask[];

  /** Update an existing task record. */
  update(taskId: string, task: AgentTask, updatedAt?: string): TaskStoreUpdateResult;

  /** Remove a task by id. */
  remove(taskId: string): AgentTask | null;

  /** Remove all tasks from the store. */
  clear(): void;

  /** Immutable store state snapshot. */
  snapshot(): AgentTaskStoreSnapshot;
}

/**
 * Default in-memory intelligence agent task store (BUILD-052).
 */
export class DefaultAgentTaskStore implements AgentTaskStore {
  private entries = new Map<string, AgentTask>();

  add(task: AgentTask): TaskStoreAddResult {
    const validation = validateAgentTask(task);

    if (!validation.valid) {
      return { accepted: false, reason: validation.reason };
    }

    if (!task.id.trim()) {
      return { accepted: false, reason: "Add reject: task id is required." };
    }

    if (this.entries.has(task.id)) {
      return {
        accepted: false,
        reason: `Add reject: task id "${task.id}" is already registered.`,
      };
    }

    const stored = copyAgentTask(task);
    this.entries.set(stored.id, stored);

    return { accepted: true, task: copyStoredTask(stored) };
  }

  get(taskId: string): AgentTask | null {
    const task = this.entries.get(taskId);

    if (!task) {
      return null;
    }

    return copyStoredTask(task);
  }

  list(): readonly AgentTask[] {
    return sortStoredTasks([...this.entries.values()]).map(copyStoredTask);
  }

  update(
    taskId: string,
    task: AgentTask,
    updatedAt: string = new Date().toISOString(),
  ): TaskStoreUpdateResult {
    const existing = this.entries.get(taskId);

    if (!existing) {
      return {
        updated: false,
        reason: `Update reject: task id "${taskId}" is not registered.`,
      };
    }

    if (task.id !== taskId) {
      return {
        updated: false,
        reason: `Update reject: task id mismatch — expected "${taskId}", got "${task.id}".`,
      };
    }

    if (existing.status !== task.status) {
      const transition = validateTaskLifecycleTransition(existing.status, task.status);

      if (!transition.valid) {
        return { updated: false, reason: transition.reason };
      }
    }

    const candidate: AgentTask = {
      ...copyAgentTask(task),
      updatedAt,
    };

    const validation = validateAgentTask(candidate);

    if (!validation.valid) {
      return { updated: false, reason: validation.reason };
    }

    this.entries.set(taskId, candidate);

    return { updated: true, task: copyStoredTask(candidate) };
  }

  remove(taskId: string): AgentTask | null {
    const task = this.entries.get(taskId);

    if (!task) {
      return null;
    }

    this.entries.delete(taskId);
    return copyStoredTask(task);
  }

  clear(): void {
    this.entries.clear();
  }

  snapshot(): AgentTaskStoreSnapshot {
    return buildAgentTaskStoreSnapshot(this.list());
  }
}

/** Shared default agent task store singleton. */
export const defaultAgentTaskStore = new DefaultAgentTaskStore();
