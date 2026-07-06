/**
 * CBAI Intelligence — Agent Task Store (BUILD-052).
 *
 * In-memory store for AgentTask records.
 * Not wired to Runtime or Dispatcher yet.
 *
 * @see docs/build-052-report.md
 */

export {
  DEFAULT_AGENT_TASK_STORE_ID,
  DefaultAgentTaskStore,
  defaultAgentTaskStore,
  type AgentTaskStore,
} from "@/lib/intelligence/agents/tasks/store/task-store";

export {
  ALL_TASK_PRIORITIES,
  ALL_TASK_STATUSES,
  buildAgentTaskStoreSnapshot,
  countActiveTasks,
  countTasksByAllStatuses,
  countTasksByPriority,
  countTasksByStatus,
  createEmptyPriorityCounts,
  createEmptyStatusCounts,
  filterTasksByPriority,
  filterTasksByStatus,
  findLatestTask,
  sortStoredTasks,
  copyStoredTask,
} from "@/lib/intelligence/agents/tasks/store/task-store-state";

export {
  queryActiveTasks,
  queryByAgentId,
  queryByPriority,
  queryByRequestId,
  queryByRuntimeSessionId,
  queryByStatus,
  queryByTaskId,
  queryTerminalTasks,
} from "@/lib/intelligence/agents/tasks/store/task-store-query";

export type {
  AgentTaskStoreSnapshot,
  TaskStoreAddResult,
  TaskStorePriorityCounts,
  TaskStoreStatusCounts,
  TaskStoreUpdateResult,
} from "@/lib/intelligence/agents/tasks/store/types";

export { AGENT_TASK_STORE_VERSION } from "@/lib/intelligence/agents/tasks/store/types";
