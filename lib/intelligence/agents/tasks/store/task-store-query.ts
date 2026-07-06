import type { AgentTask } from "@/lib/intelligence/agents/tasks/task";
import {
  isActiveTaskStatus,
  isTerminalTaskStatus,
  type TaskStatus,
} from "@/lib/intelligence/agents/tasks/task-lifecycle";
import type { TaskPriority } from "@/lib/intelligence/agents/tasks/task-priority";
import {
  copyStoredTask,
  filterTasksByPriority,
  filterTasksByStatus,
  sortStoredTasks,
} from "@/lib/intelligence/agents/tasks/store/task-store-state";
import type { AgentTaskStore } from "@/lib/intelligence/agents/tasks/store/task-store";

/**
 * Query a task by id.
 */
export function queryByTaskId(store: AgentTaskStore, taskId: string): AgentTask | null {
  return store.get(taskId);
}

/**
 * Query all tasks assigned to an agent id.
 */
export function queryByAgentId(store: AgentTaskStore, agentId: string): AgentTask[] {
  const normalized = agentId.trim();

  return sortStoredTasks(
    store.list().filter((task) => task.agentId === normalized),
  ).map(copyStoredTask);
}

/**
 * Query all tasks linked to a runtime session id.
 */
export function queryByRuntimeSessionId(
  store: AgentTaskStore,
  runtimeSessionId: string,
): AgentTask[] {
  const normalized = runtimeSessionId.trim();

  return sortStoredTasks(
    store.list().filter((task) => task.runtimeSessionId === normalized),
  ).map(copyStoredTask);
}

/**
 * Query all tasks for a source intelligence request id.
 */
export function queryByRequestId(store: AgentTaskStore, requestId: string): AgentTask[] {
  const normalized = requestId.trim();

  return sortStoredTasks(
    store.list().filter((task) => task.requestId === normalized),
  ).map(copyStoredTask);
}

/**
 * Query tasks by lifecycle status.
 */
export function queryByStatus(store: AgentTaskStore, status: TaskStatus): AgentTask[] {
  return filterTasksByStatus(store.list(), status).map(copyStoredTask);
}

/**
 * Query active non-terminal tasks.
 */
export function queryActiveTasks(store: AgentTaskStore): AgentTask[] {
  return sortStoredTasks(
    store.list().filter((task) => isActiveTaskStatus(task.status)),
  ).map(copyStoredTask);
}

/**
 * Query terminal tasks (completed, failed, cancelled, timeout).
 */
export function queryTerminalTasks(store: AgentTaskStore): AgentTask[] {
  return sortStoredTasks(
    store.list().filter((task) => isTerminalTaskStatus(task.status)),
  ).map(copyStoredTask);
}

/**
 * Query tasks by priority tier.
 */
export function queryByPriority(store: AgentTaskStore, priority: TaskPriority): AgentTask[] {
  return filterTasksByPriority(store.list(), priority).map(copyStoredTask);
}
