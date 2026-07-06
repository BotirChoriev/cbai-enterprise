import { normalizeAgentCapabilities } from "@/lib/intelligence/agents/registry/agent-capabilities";
import type { AgentCapability } from "@/lib/intelligence/agents/registry/types";
import type {
  TaskConstraints,
  TaskRequestContext,
} from "@/lib/intelligence/agents/tasks/types";
import type { EntityRef, QueryIntent } from "@/lib/intelligence/request.types";

/**
 * Agent task request envelope (BUILD-048).
 *
 * Describes work intent and scope — no execution or model payloads.
 */
export interface TaskRequest {
  /** Query intent driving task prioritization. */
  intent: QueryIntent;
  /** Capability tags requested for this task. */
  requestedCapabilities: readonly AgentCapability[];
  /** Optional entity scope for the task. */
  subjectEntities: readonly EntityRef[];
  /** Lightweight task context metadata. */
  context: TaskRequestContext;
  /** Optional factual constraints. */
  constraints?: TaskConstraints;
}

/**
 * Validate a task request envelope.
 */
export function validateTaskRequest(
  request: TaskRequest,
): { valid: true } | { valid: false; reason: string } {
  if (!request.intent) {
    return { valid: false, reason: "Task request reject: intent is required." };
  }

  for (const entity of request.subjectEntities) {
    if (!entity.id.trim()) {
      return {
        valid: false,
        reason: "Task request reject: subject entity id is required.",
      };
    }

    if (!entity.type.trim()) {
      return {
        valid: false,
        reason: "Task request reject: subject entity type is required.",
      };
    }
  }

  if (request.constraints?.maxDurationMs !== undefined) {
    if (!Number.isFinite(request.constraints.maxDurationMs) || request.constraints.maxDurationMs <= 0) {
      return {
        valid: false,
        reason: "Task request reject: maxDurationMs must be a positive number.",
      };
    }
  }

  if (request.constraints?.deadlineAt) {
    const deadlineMs = Date.parse(request.constraints.deadlineAt);

    if (!Number.isFinite(deadlineMs)) {
      return {
        valid: false,
        reason: "Task request reject: deadlineAt must be a valid ISO-8601 timestamp.",
      };
    }
  }

  return { valid: true };
}

/**
 * Create a task request envelope.
 */
export function createTaskRequest(input: {
  intent: QueryIntent;
  requestedCapabilities?: readonly AgentCapability[];
  subjectEntities?: readonly EntityRef[];
  context?: TaskRequestContext;
  constraints?: TaskConstraints;
}): TaskRequest {
  return {
    intent: input.intent,
    requestedCapabilities: normalizeAgentCapabilities(input.requestedCapabilities),
    subjectEntities: input.subjectEntities ? [...input.subjectEntities] : [],
    context: {
      tenantId: input.context?.tenantId,
      conversationId: input.context?.conversationId,
      runtimeSessionId: input.context?.runtimeSessionId,
      tags: input.context?.tags ? [...input.context.tags] : undefined,
    },
    constraints: input.constraints
      ? {
          maxDurationMs: input.constraints.maxDurationMs,
          deadlineAt: input.constraints.deadlineAt,
          requiredCapabilities: input.constraints.requiredCapabilities
            ? [...input.constraints.requiredCapabilities]
            : undefined,
          notes: input.constraints.notes ? [...input.constraints.notes] : undefined,
        }
      : undefined,
  };
}

/**
 * Produce a shallow copy of a task request envelope.
 */
export function copyTaskRequest(request: TaskRequest): TaskRequest {
  return {
    intent: request.intent,
    requestedCapabilities: [...request.requestedCapabilities],
    subjectEntities: request.subjectEntities.map((entity) => ({ ...entity })),
    context: {
      ...request.context,
      tags: request.context.tags ? [...request.context.tags] : undefined,
    },
    constraints: request.constraints
      ? {
          maxDurationMs: request.constraints.maxDurationMs,
          deadlineAt: request.constraints.deadlineAt,
          requiredCapabilities: request.constraints.requiredCapabilities
            ? [...request.constraints.requiredCapabilities]
            : undefined,
          notes: request.constraints.notes ? [...request.constraints.notes] : undefined,
        }
      : undefined,
  };
}

/**
 * Returns true when requested capabilities include the required capability.
 */
export function taskRequestIncludesCapability(
  request: TaskRequest,
  capability: AgentCapability,
): boolean {
  return request.requestedCapabilities.includes(capability);
}
