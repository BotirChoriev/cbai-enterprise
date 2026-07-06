import type { AgentRequest } from "@/lib/intelligence/agents/runtime/agent-request";
import type { AgentRuntimeContract } from "@/lib/intelligence/agents/runtime/agent-contract";
import type {
  AgentHealthResult,
  AgentOperationResult,
} from "@/lib/intelligence/agents/runtime/types";
import type { ProviderKind } from "@/lib/intelligence/agents/runtime/provider-kinds";
import type { AgentDefinition } from "@/lib/intelligence/agents/registry/types";
import type { AgentTask } from "@/lib/intelligence/agents/tasks/task";
import type { ExecutionState } from "@/lib/intelligence/agents/execution/types";
import { AGENT_EXECUTION_FOUNDATION_VERSION } from "@/lib/intelligence/agents/execution/types";

/**
 * Agent execution coordination context (BUILD-054).
 *
 * Tracks contract operation outcomes without invoking execute().
 */
export interface AgentExecutionContext {
  /** Source agent task. */
  task: AgentTask;
  /** Linked agent registry definition. */
  agentDefinition: AgentDefinition;
  /** Resolved provider kind. */
  providerKind: ProviderKind;
  /** Resolved runtime contract instance. */
  contract: AgentRuntimeContract;
  /** Agent request envelope for contract operations. */
  request: AgentRequest;
  /** Current execution coordination state. */
  state: ExecutionState;
  /** Whether prepare() succeeded. */
  prepared: boolean;
  /** Whether validate() succeeded. */
  validated: boolean;
  /** Whether health() reported healthy. */
  healthy: boolean;
  /** Non-blocking warnings. */
  warnings: readonly string[];
  /** Blocking errors. */
  errors: readonly string[];
  /** Optional describe() reason. */
  description?: string;
  /** ISO-8601 evaluation timestamp. */
  evaluatedAt: string;
  /** Execution foundation semantic version. */
  foundationVersion: string;
  /** Cached prepare operation result. */
  prepareResult?: AgentOperationResult;
  /** Cached validate operation result. */
  validateResult?: AgentOperationResult;
  /** Cached describe operation result. */
  describeResult?: AgentOperationResult;
  /** Cached health check result. */
  healthResult?: AgentHealthResult;
}

/**
 * Produce a shallow copy of an execution context.
 */
export function copyAgentExecutionContext(
  context: AgentExecutionContext,
): AgentExecutionContext {
  return {
    ...context,
    warnings: [...context.warnings],
    errors: [...context.errors],
    task: { ...context.task },
    agentDefinition: {
      ...context.agentDefinition,
      capabilities: [...context.agentDefinition.capabilities],
      supportedEntityTypes: [...context.agentDefinition.supportedEntityTypes],
      supportedIntelligenceTypes: [...context.agentDefinition.supportedIntelligenceTypes],
    },
    request: {
      ...context.request,
      context: {
        ...context.request.context,
        tags: context.request.context.tags ? [...context.request.context.tags] : undefined,
      },
      agentDefinition: context.request.agentDefinition
        ? {
            ...context.request.agentDefinition,
            capabilities: [...context.request.agentDefinition.capabilities],
            supportedEntityTypes: [...context.request.agentDefinition.supportedEntityTypes],
            supportedIntelligenceTypes: [
              ...context.request.agentDefinition.supportedIntelligenceTypes,
            ],
          }
        : undefined,
    },
  };
}

/**
 * Create an initial execution context before contract operations.
 */
export function createAgentExecutionContext(input: {
  task: AgentTask;
  agentDefinition: AgentDefinition;
  providerKind: ProviderKind;
  contract: AgentRuntimeContract;
  request: AgentRequest;
  evaluatedAt?: string;
  warnings?: readonly string[];
  errors?: readonly string[];
}): AgentExecutionContext {
  return {
    task: input.task,
    agentDefinition: input.agentDefinition,
    providerKind: input.providerKind,
    contract: input.contract,
    request: input.request,
    state: input.errors && input.errors.length > 0 ? "blocked" : "created",
    prepared: false,
    validated: false,
    healthy: false,
    warnings: input.warnings ? [...input.warnings] : [],
    errors: input.errors ? [...input.errors] : [],
    evaluatedAt: input.evaluatedAt ?? new Date().toISOString(),
    foundationVersion: AGENT_EXECUTION_FOUNDATION_VERSION,
  };
}

/**
 * Append warnings to an execution context immutably.
 */
export function appendExecutionWarnings(
  context: AgentExecutionContext,
  warnings: readonly string[],
): AgentExecutionContext {
  if (warnings.length === 0) {
    return context;
  }

  return {
    ...context,
    warnings: [...context.warnings, ...warnings],
  };
}

/**
 * Append errors to an execution context immutably.
 */
export function appendExecutionErrors(
  context: AgentExecutionContext,
  errors: readonly string[],
): AgentExecutionContext {
  if (errors.length === 0) {
    return context;
  }

  return {
    ...context,
    errors: [...context.errors, ...errors],
    state: "blocked",
  };
}
