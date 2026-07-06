/**
 * CBAI Intelligence — Agent Queue Integration (BUILD-056).
 *
 * Connects Agent Task Store with Runtime Queue.
 * Not wired to Scheduler or auto-dispatch yet.
 *
 * @see docs/build-056-report.md
 */

export {
  AGENT_QUEUE_INTEGRATION_VERSION,
  DEFAULT_AGENT_QUEUE_POLICY,
  type AgentQueueDiagnostics,
  type AgentQueueEnqueueResult,
  type AgentQueueDequeueResult,
  type AgentQueuePolicy,
} from "@/lib/intelligence/agents/queue/types";

export {
  buildAgentQueueDiagnostics,
  collectActiveQueuedTaskIds,
  copyAgentQueueDiagnostics,
  isTaskEligibleForQueue,
  mapTaskPriorityToQueuePriority,
  resolveQueuedTaskStatus,
  resolveReadyForDispatch,
  validateQueueTaskTransition,
} from "@/lib/intelligence/agents/queue/agent-queue-state";

export {
  validateAgentQueueDequeue,
  validateAgentQueueEnqueue,
} from "@/lib/intelligence/agents/queue/agent-queue-policy";

export {
  DEFAULT_AGENT_QUEUE_INTEGRATION_ID,
  DefaultAgentQueueIntegration,
  defaultAgentQueueIntegration,
  dequeueAgentTask,
  enqueueAgentTask,
  type AgentQueueIntegration,
} from "@/lib/intelligence/agents/queue/agent-queue-integration";
