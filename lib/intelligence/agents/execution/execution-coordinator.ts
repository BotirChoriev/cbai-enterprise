import type { AgentDefinition } from "@/lib/intelligence/agents/registry/types";
import type { AgentRuntimeContract } from "@/lib/intelligence/agents/runtime/agent-contract";
import {
  createAgentRequest,
  withAgentRequestLifecycle,
} from "@/lib/intelligence/agents/runtime/agent-request";
import {
  PROVIDER_KIND_LOCAL,
  type ProviderKind,
} from "@/lib/intelligence/agents/runtime/provider-kinds";
import { resolveAgentRuntimeContract } from "@/lib/intelligence/agents/runtime/agent-contract";
import {
  buildCompletedLocalExecutionResult,
  buildFailedLocalExecutionResult,
} from "@/lib/intelligence/agents/providers/local/local-runtime-state";
import { isLocalRuntimeExecutionEnabled } from "@/lib/intelligence/agents/providers/local/local-runtime-adapter";
import type { AgentTaskStore } from "@/lib/intelligence/agents/tasks/store/task-store";
import { defaultAgentTaskStore } from "@/lib/intelligence/agents/tasks/store/task-store";
import type { AgentTask } from "@/lib/intelligence/agents/tasks/task";
import {
  appendExecutionErrors,
  appendExecutionWarnings,
  copyAgentExecutionContext,
  createAgentExecutionContext,
  type AgentExecutionContext,
} from "@/lib/intelligence/agents/execution/execution-context";
import {
  createAgentExecutionResult,
  formatAgentExecutionSummary,
} from "@/lib/intelligence/agents/execution/execution-result";
import {
  resolveStateAfterHealth,
  resolveStateAfterPrepare,
  resolveStateAfterValidate,
  resolveExecutionReady,
} from "@/lib/intelligence/agents/execution/execution-state";
import type {
  AgentExecutionInput,
  AgentExecutionResult,
} from "@/lib/intelligence/agents/execution/types";

/** Stable identifier for the default agent execution coordinator. */
export const DEFAULT_AGENT_EXECUTION_COORDINATOR_ID = "default-agent-execution-coordinator";

/**
 * Contract resolver for agent runtime backends.
 */
export type AgentRuntimeContractResolver = (
  providerKind: ProviderKind,
) => AgentRuntimeContract;

/**
 * Contract for agent execution foundation coordination (BUILD-054+).
 *
 * Prepares dispatch-ready tasks through runtime contract operations.
 * Invokes execute() only for the local provider (BUILD-055).
 */
export interface AgentExecutionCoordinator {
  /** Initialize execution context and run contract prepare(). */
  prepareExecution(input: AgentExecutionInput): AgentExecutionContext;

  /** Run contract validate() against the prepared context. */
  validateExecution(context: AgentExecutionContext): AgentExecutionContext;

  /** Run contract describe() for audit metadata. */
  describeExecution(context: AgentExecutionContext): AgentExecutionContext;

  /** Run contract health() and resolve readiness state. */
  healthCheck(context: AgentExecutionContext): AgentExecutionContext;

  /** Invoke contract execute() when providerKind is local and foundation checks passed. */
  executeIfEligible(context: AgentExecutionContext): Promise<AgentExecutionContext>;

  /** Build the final execution foundation result summary. */
  createExecutionSummary(context: AgentExecutionContext): AgentExecutionResult;
}

/**
 * Returns true when a task is eligible for execution foundation preparation.
 */
export function isTaskExecutionEligible(task: AgentTask): boolean {
  if (task.dispatchMetadata?.dispatchReady) {
    return true;
  }

  return task.status === "queued" || task.status === "ready";
}

/**
 * Resolve provider kind for execution — defaults to local stub backend.
 */
export function resolveExecutionProviderKind(
  providerKind: ProviderKind | undefined,
): ProviderKind {
  return providerKind ?? PROVIDER_KIND_LOCAL;
}

/**
 * Build an agent request envelope from a dispatch-ready task.
 */
export function buildExecutionAgentRequest(input: {
  task: AgentTask;
  agentDefinition: AgentDefinition;
  providerKind: ProviderKind;
  evaluatedAt?: string;
}) {
  return createAgentRequest({
    agentId: input.task.agentId,
    providerKind: input.providerKind,
    requestId: input.task.requestId,
    question: input.task.title,
    runtimeSessionId: input.task.runtimeSessionId,
    tenantId: input.task.taskRequest.context.tenantId,
    tags: input.task.taskRequest.context.tags,
    agentDefinition: input.agentDefinition,
    timestamp: input.evaluatedAt,
  });
}

/**
 * Wrap a runtime contract with a deterministic unhealthy health check — test helper.
 */
export function wrapUnhealthyAgentRuntimeContract(
  contract: AgentRuntimeContract,
  reason: string = "Provider backend reported unhealthy for execution foundation test.",
): AgentRuntimeContract {
  return {
    get providerKind() {
      return contract.providerKind;
    },
    get contractId() {
      return contract.contractId;
    },
    get contractVersion() {
      return contract.contractVersion;
    },
    prepare: (request) => contract.prepare(request),
    validate: (request) => contract.validate(request),
    describe: (request) => contract.describe(request),
    supports: (request) => contract.supports(request),
    health: () => ({
      healthy: false,
      providerKind: contract.providerKind,
      status: "unsupported",
      reason,
      checkedAt: new Date().toISOString(),
    }),
    execute: (request) => contract.execute(request),
  };
}

/**
 * Wrap a runtime contract with a deterministic failing validate() — test helper.
 */
export function wrapFailingValidateAgentRuntimeContract(
  contract: AgentRuntimeContract,
  reason: string = "Provider backend validation failed for execution foundation test.",
): AgentRuntimeContract {
  return {
    get providerKind() {
      return contract.providerKind;
    },
    get contractId() {
      return contract.contractId;
    },
    get contractVersion() {
      return contract.contractVersion;
    },
    prepare: (request) => contract.prepare(request),
    validate: () => ({ accepted: false, reason }),
    describe: (request) => contract.describe(request),
    supports: (request) => contract.supports(request),
    health: () => contract.health(),
    execute: (request) => contract.execute(request),
  };
}

/**
 * Default agent execution coordinator (BUILD-054).
 */
export class DefaultAgentExecutionCoordinator implements AgentExecutionCoordinator {
  private readonly store: AgentTaskStore;
  private readonly resolveContract: AgentRuntimeContractResolver;

  constructor(
    store: AgentTaskStore = defaultAgentTaskStore,
    resolveContract: AgentRuntimeContractResolver = resolveAgentRuntimeContract,
  ) {
    this.store = store;
    this.resolveContract = resolveContract;
  }

  prepareExecution(input: AgentExecutionInput): AgentExecutionContext {
    const evaluatedAt = input.evaluatedAt ?? new Date().toISOString();
    const providerKind = resolveExecutionProviderKind(input.providerKind);
    const contract = this.resolveContract(providerKind);
    const errors: string[] = [];

    if (!isTaskExecutionEligible(input.task)) {
      errors.push("Execution reject: task is not dispatch-ready.");
    }

    if (input.agentDefinition.id !== input.task.agentId) {
      errors.push(
        `Execution reject: agent definition id "${input.agentDefinition.id}" does not match task agent id "${input.task.agentId}".`,
      );
    }

    const storedTask = this.store.get(input.task.id) ?? input.task;
    const request = buildExecutionAgentRequest({
      task: storedTask,
      agentDefinition: input.agentDefinition,
      providerKind,
      evaluatedAt,
    });

    let context = createAgentExecutionContext({
      task: storedTask,
      agentDefinition: input.agentDefinition,
      providerKind,
      contract,
      request,
      evaluatedAt,
      errors,
    });

    if (errors.length > 0) {
      return context;
    }

    const prepareResult = contract.prepare(request);
    context = {
      ...copyAgentExecutionContext(context),
      prepareResult,
      prepared: prepareResult.accepted,
      request: prepareResult.response
        ? withAgentRequestLifecycle(request, prepareResult.response.lifecycle)
        : request,
      state: resolveStateAfterPrepare(prepareResult.accepted, context.state),
    };

    if (!prepareResult.accepted) {
      context = appendExecutionErrors(
        context,
        [prepareResult.reason ?? "Execution reject: contract prepare() failed."],
      );
    }

    return context;
  }

  validateExecution(context: AgentExecutionContext): AgentExecutionContext {
    if (context.state === "blocked") {
      return context;
    }

    const validateResult = context.contract.validate(context.request);
    let updated: AgentExecutionContext = {
      ...copyAgentExecutionContext(context),
      validateResult,
      validated: validateResult.accepted,
      request: validateResult.response
        ? withAgentRequestLifecycle(context.request, validateResult.response.lifecycle)
        : context.request,
      state: resolveStateAfterValidate(validateResult.accepted, context.state),
    };

    if (!validateResult.accepted) {
      updated = appendExecutionErrors(
        updated,
        [validateResult.reason ?? "Execution reject: contract validate() failed."],
      );
    }

    return updated;
  }

  describeExecution(context: AgentExecutionContext): AgentExecutionContext {
    if (context.state === "blocked") {
      return context;
    }

    const describeResult = context.contract.describe(context.request);
    let updated: AgentExecutionContext = {
      ...copyAgentExecutionContext(context),
      describeResult,
      description: describeResult.accepted
        ? describeResult.response?.reason
        : context.description,
    };

    if (!describeResult.accepted) {
      updated = appendExecutionWarnings(updated, [
        describeResult.reason ?? "Execution warning: contract describe() failed.",
      ]);
    }

    return updated;
  }

  healthCheck(context: AgentExecutionContext): AgentExecutionContext {
    if (context.state === "blocked") {
      return context;
    }

    const healthResult = context.contract.health();
    const state = resolveStateAfterHealth(
      healthResult,
      context.state,
      context.prepared,
      context.validated,
    );

    let updated: AgentExecutionContext = {
      ...copyAgentExecutionContext(context),
      healthResult,
      healthy: healthResult.healthy,
      state,
    };

    if (!healthResult.healthy) {
      updated = appendExecutionErrors(updated, [
        healthResult.reason ?? "Execution reject: contract health() reported unhealthy.",
      ]);
    }

    return updated;
  }

  async executeIfEligible(context: AgentExecutionContext): Promise<AgentExecutionContext> {
    if (context.state === "blocked") {
      return context;
    }

    const foundationReady = resolveExecutionReady({
      prepared: context.prepared,
      validated: context.validated,
      healthy: context.healthy,
      state: context.state,
    });

    if (!foundationReady || !isLocalRuntimeExecutionEnabled(context.providerKind)) {
      return context;
    }

    const startedAtMs = Date.now();
    const response = await context.contract.execute(context.request);
    const executionDurationMs = Math.max(0, Date.now() - startedAtMs);

    const localExecution =
      response.lifecycle === "completed"
        ? buildCompletedLocalExecutionResult({
            executionDurationMs,
            executionSummary: response.reason,
          })
        : buildFailedLocalExecutionResult({
            reason: response.reason,
            executionDurationMs,
          });

    let updated: AgentExecutionContext = {
      ...copyAgentExecutionContext(context),
      executed: response.lifecycle === "completed",
      executeResponse: response,
      localExecution,
    };

    if (response.lifecycle === "failed" || response.blocking) {
      updated = appendExecutionErrors(updated, [response.reason]);
    }

    return updated;
  }

  createExecutionSummary(context: AgentExecutionContext): AgentExecutionResult {
    return createAgentExecutionResult(context);
  }
}

/** Shared default agent execution coordinator singleton. */
export const defaultAgentExecutionCoordinator = new DefaultAgentExecutionCoordinator();

/**
 * Run the full execution foundation pipeline for a dispatch-ready task.
 */
export function runAgentExecutionFoundation(input: {
  task: AgentTask;
  agentDefinition: AgentDefinition;
  providerKind?: ProviderKind;
  evaluatedAt?: string;
  coordinator?: AgentExecutionCoordinator;
}): AgentExecutionResult {
  const coordinator = input.coordinator ?? defaultAgentExecutionCoordinator;
  let context = coordinator.prepareExecution({
    task: input.task,
    agentDefinition: input.agentDefinition,
    providerKind: input.providerKind,
    evaluatedAt: input.evaluatedAt,
  });

  context = coordinator.validateExecution(context);
  context = coordinator.describeExecution(context);
  context = coordinator.healthCheck(context);

  return coordinator.createExecutionSummary(context);
}

/**
 * Run the full execution pipeline including local execute() when eligible (BUILD-055).
 */
export async function runAgentExecutionPipeline(input: {
  task: AgentTask;
  agentDefinition: AgentDefinition;
  providerKind?: ProviderKind;
  evaluatedAt?: string;
  coordinator?: AgentExecutionCoordinator;
}): Promise<AgentExecutionResult> {
  const coordinator = input.coordinator ?? defaultAgentExecutionCoordinator;
  let context = coordinator.prepareExecution({
    task: input.task,
    agentDefinition: input.agentDefinition,
    providerKind: input.providerKind,
    evaluatedAt: input.evaluatedAt,
  });

  context = coordinator.validateExecution(context);
  context = coordinator.describeExecution(context);
  context = coordinator.healthCheck(context);
  context = await coordinator.executeIfEligible(context);

  return coordinator.createExecutionSummary(context);
}

export { formatAgentExecutionSummary };
