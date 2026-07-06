/**
 * CBAI Intelligence — Agent Task Model (BUILD-048).
 *
 * Task contracts and lifecycle metadata only.
 * No execution, AI providers, or runtime wiring.
 *
 * @see docs/build-048-report.md
 */

export {
  createAgentTask,
  createAgentTaskId,
  copyAgentTask,
  resetAgentTaskSequence,
  sortAgentTasks,
  validateAgentTask,
  withAgentTaskStatus,
  type AgentTask,
} from "@/lib/intelligence/agents/tasks/task";

export {
  createTaskRequest,
  copyTaskRequest,
  taskRequestIncludesCapability,
  validateTaskRequest,
  type TaskRequest,
} from "@/lib/intelligence/agents/tasks/task-request";

export {
  copyTaskResult,
  createFailedTaskResult,
  createPendingTaskResult,
  createTaskResultFromStatus,
  isTerminalTaskResult,
  validateTaskResult,
  type TaskResult,
} from "@/lib/intelligence/agents/tasks/task-result";

export {
  canCompleteTask,
  canFailOrCancelTask,
  canMarkTaskReady,
  canQueueTask,
  canStartTask,
  isActiveTaskStatus,
  isTerminalTaskStatus,
  taskResultStatusFromTaskStatus,
  validateTaskLifecycleTransition,
  type TaskStatus,
} from "@/lib/intelligence/agents/tasks/task-lifecycle";

export {
  ALL_TASK_PRIORITIES,
  TASK_PRIORITY_BACKGROUND,
  TASK_PRIORITY_CRITICAL,
  TASK_PRIORITY_HIGH,
  TASK_PRIORITY_LABELS,
  TASK_PRIORITY_LOW,
  TASK_PRIORITY_NORMAL,
  TASK_PRIORITY_RANK,
  compareTaskPriority,
  isTaskPriority,
  resolveTaskPriority,
  type TaskPriority,
} from "@/lib/intelligence/agents/tasks/task-priority";

export type {
  TaskConstraints,
  TaskDiagnosticsReference,
  TaskRequestContext,
  TaskResultReference,
  TaskResultStatus,
} from "@/lib/intelligence/agents/tasks/types";

export { AGENT_TASK_MODEL_VERSION } from "@/lib/intelligence/agents/tasks/types";

export {
  AGENT_TASK_STORE_VERSION,
  DEFAULT_AGENT_TASK_STORE_ID,
  DefaultAgentTaskStore,
  defaultAgentTaskStore,
  buildAgentTaskStoreSnapshot,
  queryActiveTasks,
  queryByAgentId,
  queryByPriority,
  queryByRequestId,
  queryByRuntimeSessionId,
  queryByStatus,
  queryByTaskId,
  queryTerminalTasks,
  type AgentTaskStore,
  type AgentTaskStoreSnapshot,
  type TaskStoreAddResult,
  type TaskStoreUpdateResult,
} from "@/lib/intelligence/agents/tasks/store";
