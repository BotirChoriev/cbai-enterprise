import { ISSUE_BLOCKING_EXECUTION_DENIED } from "@/lib/intelligence/diagnostics/issues";
import {
  DefaultAgentDispatchIntegration,
} from "@/lib/intelligence/agents/integration/agent-dispatch-integration";
import {
  DefaultAgentExecutionCoordinator,
  runAgentExecutionFoundation,
  runAgentExecutionPipeline,
  wrapFailingValidateAgentRuntimeContract,
  wrapUnhealthyAgentRuntimeContract,
} from "@/lib/intelligence/agents/execution/execution-coordinator";
import { resolveAgentRuntimeContract } from "@/lib/intelligence/agents/runtime/agent-contract";
import { PROVIDER_KIND_LOCAL } from "@/lib/intelligence/agents/runtime/provider-kinds";
import { resetAgentRequestSequence } from "@/lib/intelligence/agents/runtime/agent-request";
import {
  LOCAL_RUNTIME_EXECUTION_SUMMARY,
  localRuntimeAdapter,
  buildLocalRuntimeExecutionDiagnostics,
} from "@/lib/intelligence/agents/providers/local";
import {
  AGENT_CAPABILITY_RESEARCH,
  AGENT_CAPABILITY_SEARCH,
} from "@/lib/intelligence/agents/registry/agent-capabilities";
import { createAgentDefinition } from "@/lib/intelligence/agents/registry/agent-definition";
import {
  DefaultAgentQueueIntegration,
} from "@/lib/intelligence/agents/queue/agent-queue-integration";
import {
  DefaultAgentSchedulerBridge,
} from "@/lib/intelligence/agents/scheduler/agent-scheduler-bridge";
import { DefaultRuntimeScheduler } from "@/lib/intelligence/runtime/scheduler/scheduler";
import { resetScheduleItemSequence } from "@/lib/intelligence/runtime/scheduler/schedule-item";
import {
  createAgentTask,
  resetAgentTaskSequence,
  withAgentTaskStatus,
} from "@/lib/intelligence/agents/tasks/task";
import { createTaskRequest } from "@/lib/intelligence/agents/tasks/task-request";
import {
  DefaultAgentTaskStore,
} from "@/lib/intelligence/agents/tasks/store/task-store";
import { DefaultRuntimeQueue } from "@/lib/intelligence/runtime/queue/queue";
import { resetQueueItemSequence } from "@/lib/intelligence/runtime/queue/queue-item";
import { DefaultSessionRegistry } from "@/lib/intelligence/runtime/registry/session-registry";
import { DefaultObservabilityService } from "@/lib/intelligence/observability/observability-service";
import { DefaultRuntimeWorker } from "@/lib/intelligence/runtime/worker/worker";
import { TEST_RUNTIME_CANCEL_REQUEST_PREFIX } from "@/lib/intelligence/runtime/integration/runtime-policy-diagnostics";
import {
  queryByRequestId,
  defaultSessionRegistry,
} from "@/lib/intelligence/runtime/registry";
import type { IntelligenceRequest } from "@/lib/intelligence/request.types";
import type {
  IntelligenceTestScenario,
  IntelligenceTestValidationContext,
  IntelligenceTestValidationResult,
} from "@/lib/intelligence/testing/types";

/** Semantic version of the built-in scenario catalog. */
export const INTELLIGENCE_TEST_SCENARIOS_VERSION = "0.1.0-scenarios";

/** Known local country entity id from domain data. */
export const TEST_COUNTRY_ENTITY_ID = "usa";

/** Known local company entity id from domain data. */
export const TEST_COMPANY_ENTITY_ID = "apple";

/** Known local university entity id from domain data. */
export const TEST_UNIVERSITY_ENTITY_ID = "stanford";

/** Sentinel id guaranteed not to exist in local entity stores. */
export const TEST_MISSING_ENTITY_ID = "cbai-test-missing-entity-id";

let scenarioSequence = 0;

/**
 * Create a base intelligence request with deterministic defaults.
 */
export function createTestRequest(
  overrides: Partial<IntelligenceRequest> & Pick<IntelligenceRequest, "question">,
): IntelligenceRequest {
  scenarioSequence += 1;

  return {
    id: overrides.id ?? `test-request-${scenarioSequence}`,
    question: overrides.question,
    requestedAt: overrides.requestedAt ?? "2026-07-05T00:00:00.000Z",
    type: overrides.type,
    intent: overrides.intent,
    subjectEntities: overrides.subjectEntities,
    tenantId: overrides.tenantId,
    conversationId: overrides.conversationId,
    includeGraph: overrides.includeGraph,
    includeMemory: overrides.includeMemory,
  };
}

function pass(): IntelligenceTestValidationResult {
  return { pass: true, failures: [] };
}

function fail(...messages: string[]): IntelligenceTestValidationResult {
  return { pass: false, failures: messages };
}

function validatePolicyStoppedRun(
  context: IntelligenceTestValidationContext,
): IntelligenceTestValidationResult | null {
  if (!context.error?.includes("runtime policy")) {
    return null;
  }

  const entries = queryByRequestId(defaultSessionRegistry, context.request.id);

  if (entries.length === 0) {
    return fail("Expected session registry entry after runtime policy stop.");
  }

  if (entries[0].lifecycle !== "failed") {
    return fail(
      `Expected registry lifecycle failed after policy deny, received ${entries[0].lifecycle}.`,
    );
  }

  return pass();
}

function requireResult(
  context: IntelligenceTestValidationContext,
): IntelligenceTestValidationResult | null {
  if (context.error) {
    return fail(`Pipeline threw unexpectedly: ${context.error}`);
  }

  if (!context.result) {
    return fail("Pipeline returned no result.");
  }

  return null;
}

function prepareDispatchReadyHarnessTask(context: {
  request: IntelligenceRequest;
  agentId?: string;
}) {
  resetAgentTaskSequence();
  resetAgentRequestSequence();
  const store = new DefaultAgentTaskStore();
  const integration = new DefaultAgentDispatchIntegration(store);
  const agent = createAgentDefinition({
    id: context.agentId ?? "harness-research-agent",
    name: "Harness Research Agent",
    version: "1.0.0",
    description: "Research capability test agent.",
    category: "test",
    status: "enabled",
    capabilities: [AGENT_CAPABILITY_RESEARCH],
  });
  const task = createAgentTask({
    agentId: "unassigned",
    requestId: context.request.id,
    title: "Execution foundation harness task",
    taskRequest: createTaskRequest({
      intent: "general",
      requestedCapabilities: [AGENT_CAPABILITY_RESEARCH],
    }),
  });
  const preparation = integration.prepareDispatch({ task, availableAgents: [agent] });

  return { store, agent, preparation };
}

/**
 * Built-in deterministic intelligence engine test scenarios (BUILD-039).
 */
export const INTELLIGENCE_TEST_SCENARIOS: IntelligenceTestScenario[] = [
  {
    id: "empty-request",
    name: "Empty request",
    description:
      "Request with no subjectEntities — validates conservative empty-scope pipeline behavior.",
    buildRequest: () =>
      createTestRequest({
        question: "What intelligence is available without entity scope?",
      }),
    validate: (context) => {
      const guard = requireResult(context);
      if (guard) return guard;

      const result = context.result!;
      const failures: string[] = [];

      if (context.request.subjectEntities && context.request.subjectEntities.length > 0) {
        failures.push("Expected no subjectEntities for empty request scenario.");
      }

      if (result.trust.allowAutomation) {
        failures.push("Expected allowAutomation false for empty-scope request.");
      }

      if (result.trust.allowExecution) {
        failures.push("Expected allowExecution false for empty-scope request.");
      }

      if (!["unverified", "low", "moderate"].includes(result.trust.trustLevel)) {
        failures.push(
          `Expected conservative trust level for empty-scope request, received ${result.trust.trustLevel}.`,
        );
      }

      return failures.length > 0 ? fail(...failures) : pass();
    },
  },
  {
    id: "country-entity-request",
    name: "Country entity request",
    description: "Request scoped to a known local country entity (usa).",
    buildRequest: () =>
      createTestRequest({
        question: "Summarize intelligence for the United States.",
        subjectEntities: [{ type: "country", id: TEST_COUNTRY_ENTITY_ID, name: "United States" }],
      }),
    validate: (context) => {
      const policyStop = validatePolicyStoppedRun(context);
      if (policyStop) return policyStop;

      const guard = requireResult(context);
      if (guard) return guard;

      const result = context.result!;
      const failures: string[] = [];

      if (result.evidence.items.length === 0) {
        failures.push("Expected evidence items from country entity-profile adapter.");
      }

      const hasCountryEvidence = result.evidence.items.some(
        (item) => item.entityId === TEST_COUNTRY_ENTITY_ID && item.entityType === "country",
      );

      if (!hasCountryEvidence) {
        failures.push("Expected at least one evidence item bound to country:usa.");
      }

      return failures.length > 0 ? fail(...failures) : pass();
    },
  },
  {
    id: "company-entity-request",
    name: "Company entity request",
    description: "Request scoped to a known local company entity (apple).",
    buildRequest: () =>
      createTestRequest({
        question: "Summarize intelligence for Apple.",
        subjectEntities: [{ type: "company", id: TEST_COMPANY_ENTITY_ID, name: "Apple" }],
      }),
    validate: (context) => {
      const policyStop = validatePolicyStoppedRun(context);
      if (policyStop) return policyStop;

      const guard = requireResult(context);
      if (guard) return guard;

      const result = context.result!;
      const failures: string[] = [];

      if (result.evidence.items.length === 0) {
        failures.push("Expected evidence items from company entity-profile adapter.");
      }

      const hasCompanyEvidence = result.evidence.items.some(
        (item) => item.entityId === TEST_COMPANY_ENTITY_ID && item.entityType === "company",
      );

      if (!hasCompanyEvidence) {
        failures.push("Expected at least one evidence item bound to company:apple.");
      }

      return failures.length > 0 ? fail(...failures) : pass();
    },
  },
  {
    id: "university-entity-request",
    name: "University entity request",
    description: "Request scoped to a known local university entity (stanford).",
    buildRequest: () =>
      createTestRequest({
        question: "Summarize intelligence for Stanford University.",
        subjectEntities: [
          { type: "university", id: TEST_UNIVERSITY_ENTITY_ID, name: "Stanford University" },
        ],
      }),
    validate: (context) => {
      const policyStop = validatePolicyStoppedRun(context);
      if (policyStop) return policyStop;

      const guard = requireResult(context);
      if (guard) return guard;

      const result = context.result!;
      const failures: string[] = [];

      if (result.evidence.items.length === 0) {
        failures.push("Expected evidence items from university entity-profile adapter.");
      }

      const hasUniversityEvidence = result.evidence.items.some(
        (item) =>
          item.entityId === TEST_UNIVERSITY_ENTITY_ID && item.entityType === "university",
      );

      if (!hasUniversityEvidence) {
        failures.push("Expected at least one evidence item bound to university:stanford.");
      }

      return failures.length > 0 ? fail(...failures) : pass();
    },
  },
  {
    id: "unsupported-entity-type",
    name: "Unsupported entity type",
    description:
      "Request with government entity type — not connected in BUILD-030 entity adapter.",
    buildRequest: () =>
      createTestRequest({
        question: "Summarize intelligence for a government entity.",
        subjectEntities: [{ type: "government", id: "us-federal", name: "US Federal Government" }],
      }),
    validate: (context) => {
      const guard = requireResult(context);
      if (guard) return guard;

      const warnings = [
        ...(context.result!.evidence.metadata?.warnings ?? []),
        ...context.result!.warnings,
      ];

      const hasUnsupportedWarning = warnings.some((warning) =>
        warning.includes("entity-type-not-connected:government"),
      );

      if (!hasUnsupportedWarning) {
        return fail("Expected entity-type-not-connected warning for government entity type.");
      }

      return pass();
    },
  },
  {
    id: "missing-entity-id",
    name: "Missing entity id",
    description: "Request referencing a country id that does not exist in local stores.",
    buildRequest: () =>
      createTestRequest({
        question: "Summarize intelligence for a missing country.",
        subjectEntities: [{ type: "country", id: TEST_MISSING_ENTITY_ID }],
      }),
    validate: (context) => {
      const guard = requireResult(context);
      if (guard) return guard;

      const warnings = [
        ...(context.result!.evidence.metadata?.warnings ?? []),
        ...context.result!.warnings,
      ];

      const hasMissingWarning = warnings.some((warning) =>
        warning.includes(`entity-not-found:country:${TEST_MISSING_ENTITY_ID}`),
      );

      if (!hasMissingWarning) {
        return fail("Expected entity-not-found warning for missing country id.");
      }

      const hasMissingEntityEvidence = context.result!.evidence.items.some(
        (item) => item.entityId === TEST_MISSING_ENTITY_ID,
      );

      if (hasMissingEntityEvidence) {
        return fail("Did not expect evidence items for a missing entity id.");
      }

      return pass();
    },
  },
  {
    id: "graph-enabled",
    name: "Graph enabled",
    description:
      "Request with includeGraph true — expects graph context requested but not connected.",
    buildRequest: () =>
      createTestRequest({
        question: "Analyze graph connectivity for the United States.",
        includeGraph: true,
        subjectEntities: [{ type: "country", id: TEST_COUNTRY_ENTITY_ID }],
      }),
    validate: (context) => {
      const policyStop = validatePolicyStoppedRun(context);
      if (policyStop) return policyStop;

      const guard = requireResult(context);
      if (guard) return guard;

      const result = context.result!;
      const failures: string[] = [];

      if (result.graphContext?.enabled !== true) {
        failures.push("Expected graphContext.enabled true when includeGraph is true.");
      }

      if (result.graphContext?.metadata?.status !== "graph-context-not-connected") {
        failures.push(
          `Expected graph status graph-context-not-connected, received ${result.graphContext?.metadata?.status ?? "unknown"}.`,
        );
      }

      const hasGraphDegradedIssue = result.diagnostics?.issues.some(
        (issue) => issue.code === "degraded-graph-not-connected",
      );

      if (!hasGraphDegradedIssue) {
        failures.push("Expected degraded-graph-not-connected diagnostic issue.");
      }

      return failures.length > 0 ? fail(...failures) : pass();
    },
  },
  {
    id: "memory-enabled",
    name: "Memory enabled",
    description:
      "Request with includeMemory true — expects memory context requested but not connected.",
    buildRequest: () =>
      createTestRequest({
        question: "Analyze organizational memory for Apple.",
        includeMemory: true,
        subjectEntities: [{ type: "company", id: TEST_COMPANY_ENTITY_ID }],
      }),
    validate: (context) => {
      const policyStop = validatePolicyStoppedRun(context);
      if (policyStop) return policyStop;

      const guard = requireResult(context);
      if (guard) return guard;

      const result = context.result!;
      const failures: string[] = [];

      if (result.memoryContext?.enabled !== true) {
        failures.push("Expected memoryContext.enabled true when includeMemory is true.");
      }

      if (result.memoryContext?.metadata?.status !== "memory-not-connected") {
        failures.push(
          `Expected memory status memory-not-connected, received ${result.memoryContext?.metadata?.status ?? "unknown"}.`,
        );
      }

      const hasMemoryDegradedIssue = result.diagnostics?.issues.some(
        (issue) => issue.code === "degraded-memory-not-connected",
      );

      if (!hasMemoryDegradedIssue) {
        failures.push("Expected degraded-memory-not-connected diagnostic issue.");
      }

      return failures.length > 0 ? fail(...failures) : pass();
    },
  },
  {
    id: "operational-request-blocked-by-trust",
    name: "Operational request blocked by trust",
    description:
      "Operational request type with local entity scope — trust must deny execution and diagnostics must block.",
    buildRequest: () =>
      createTestRequest({
        question: "Execute operational workflow for Apple.",
        type: "operational",
        subjectEntities: [{ type: "company", id: TEST_COMPANY_ENTITY_ID }],
      }),
    validate: (context) => {
      const policyStop = validatePolicyStoppedRun(context);
      if (policyStop) return policyStop;

      const guard = requireResult(context);
      if (guard) return guard;

      const result = context.result!;
      const failures: string[] = [];

      if (result.trust.allowExecution) {
        failures.push("Expected allowExecution false for operational request under current trust.");
      }

      if (result.diagnostics?.runHealth !== "blocked") {
        failures.push(
          `Expected diagnostics runHealth blocked, received ${result.diagnostics?.runHealth ?? "unknown"}.`,
        );
      }

      const hasExecutionBlock = result.diagnostics?.issues.some(
        (issue) => issue.code === ISSUE_BLOCKING_EXECUTION_DENIED,
      );

      if (!hasExecutionBlock) {
        failures.push("Expected blocking-execution-denied diagnostic issue.");
      }

      if ((result.diagnostics?.blockingIssueCount ?? 0) === 0) {
        failures.push("Expected at least one blocking diagnostic issue.");
      }

      return failures.length > 0 ? fail(...failures) : pass();
    },
  },
  {
    id: "policy-deny",
    name: "Policy deny on blocking contradiction",
    description:
      "Country entity run with blocking contradictions — runtime policy must deny before downstream stages.",
    buildRequest: () =>
      createTestRequest({
        question: "Policy deny check for United States intelligence.",
        subjectEntities: [{ type: "country", id: TEST_COUNTRY_ENTITY_ID, name: "United States" }],
      }),
    validate: (context) => {
      const entries = queryByRequestId(defaultSessionRegistry, context.request.id);

      if (entries.length === 0) {
        return fail("Expected session registry entry for policy-deny request.");
      }

      const entry = entries[0];

      if (entry.lifecycle !== "failed") {
        return fail(
          `Expected registry lifecycle failed after policy deny, received ${entry.lifecycle}.`,
        );
      }

      if (context.error) {
        return pass();
      }

      if (context.result?.orchestration?.policyDecision === "deny") {
        return pass();
      }

      if (context.result?.diagnostics?.policyDecision === "deny") {
        return pass();
      }

      return fail("Expected policy deny via orchestration error or policyDecision deny.");
    },
  },
  {
    id: "policy-cancel",
    name: "Policy cancel on harness trigger",
    description:
      "Deterministic cancel request id — runtime policy must terminate the session as cancelled.",
    buildRequest: () =>
      createTestRequest({
        id: `${TEST_RUNTIME_CANCEL_REQUEST_PREFIX}harness`,
        question: "Policy cancel harness trigger.",
      }),
    validate: (context) => {
      const entries = queryByRequestId(defaultSessionRegistry, context.request.id);

      if (entries.length === 0) {
        return fail("Expected session registry entry for policy-cancel request.");
      }

      const entry = entries[0];

      if (entry.lifecycle !== "cancelled") {
        return fail(
          `Expected registry lifecycle cancelled after policy cancel, received ${entry.lifecycle}.`,
        );
      }

      if (!context.error && context.result?.orchestration?.policyDecision !== "cancel") {
        return fail("Expected pipeline error or orchestration policyDecision cancel.");
      }

      return pass();
    },
  },
  {
    id: "session-registry-updates",
    name: "Session registry updates",
    description:
      "Validates orchestrator registers and updates the session registry during a successful run.",
    buildRequest: () =>
      createTestRequest({
        question: "Session registry lifecycle check.",
      }),
    validate: (context) => {
      const guard = requireResult(context);
      if (guard) return guard;

      const entries = queryByRequestId(defaultSessionRegistry, context.request.id);

      if (entries.length !== 1) {
        return fail(
          `Expected exactly one registry entry for request, received ${entries.length}.`,
        );
      }

      const entry = entries[0];
      const failures: string[] = [];

      if (entry.requestId !== context.request.id) {
        failures.push("Registry entry requestId does not match pipeline request id.");
      }

      if (entry.lifecycle !== "completed") {
        failures.push(
          `Expected registry lifecycle completed for successful run, received ${entry.lifecycle}.`,
        );
      }

      if (entry.updatedAt.localeCompare(entry.registeredAt) < 0) {
        failures.push("Registry updatedAt must be greater than or equal to registeredAt.");
      }

      return failures.length > 0 ? fail(...failures) : pass();
    },
  },
  {
    id: "agent-dispatch-no-agents",
    name: "Agent dispatch with no agents",
    description:
      "Dispatch integration rejects when no agent definitions are available.",
    buildRequest: () =>
      createTestRequest({
        question: "Agent dispatch no agents check.",
      }),
    validate: (context) => {
      resetAgentTaskSequence();
      const store = new DefaultAgentTaskStore();
      const integration = new DefaultAgentDispatchIntegration(store);
      const task = createAgentTask({
        agentId: "unassigned",
        requestId: context.request.id,
        title: "No agents dispatch test",
        taskRequest: createTaskRequest({
          intent: "general",
          requestedCapabilities: [AGENT_CAPABILITY_RESEARCH],
        }),
      });

      const preparation = integration.prepareDispatch({ task, availableAgents: [] });

      if (preparation.diagnostics.decision !== "rejected") {
        return fail(
          `Expected rejected dispatch decision, received ${preparation.diagnostics.decision}.`,
        );
      }

      if (preparation.diagnostics.dispatchReady) {
        return fail("Expected dispatchReady false when no agents are available.");
      }

      if (preparation.task.status !== "created") {
        return fail(
          `Expected task status created after rejected dispatch, received ${preparation.task.status}.`,
        );
      }

      if (!store.get(task.id)) {
        return fail("Expected task to remain in store after rejected dispatch.");
      }

      return pass();
    },
  },
  {
    id: "agent-dispatch-capability-match",
    name: "Agent dispatch capability match",
    description:
      "Dispatch integration selects an enabled agent when requested capabilities match.",
    buildRequest: () =>
      createTestRequest({
        question: "Agent dispatch capability match check.",
      }),
    validate: (context) => {
      resetAgentTaskSequence();
      const store = new DefaultAgentTaskStore();
      const integration = new DefaultAgentDispatchIntegration(store);
      const agent = createAgentDefinition({
        id: "harness-research-agent",
        name: "Harness Research Agent",
        version: "1.0.0",
        description: "Research capability test agent.",
        category: "test",
        status: "enabled",
        capabilities: [AGENT_CAPABILITY_RESEARCH],
      });
      const task = createAgentTask({
        agentId: "unassigned",
        requestId: context.request.id,
        title: "Capability match dispatch test",
        taskRequest: createTaskRequest({
          intent: "general",
          requestedCapabilities: [AGENT_CAPABILITY_RESEARCH],
        }),
      });

      const preparation = integration.prepareDispatch({ task, availableAgents: [agent] });
      const validation = integration.validateDispatch(
        preparation.task,
        preparation.dispatchResult,
      );

      if (preparation.diagnostics.decision !== "selected") {
        return fail(
          `Expected selected dispatch decision, received ${preparation.diagnostics.decision}.`,
        );
      }

      if (!preparation.diagnostics.dispatchReady) {
        return fail("Expected dispatchReady true for capability match.");
      }

      if (preparation.task.status !== "queued") {
        return fail(
          `Expected task status queued after successful dispatch, received ${preparation.task.status}.`,
        );
      }

      if (preparation.task.agentId !== agent.id) {
        return fail("Expected task agentId to match selected agent.");
      }

      if (!validation.valid) {
        return fail(`Expected valid dispatch validation, received: ${validation.reason}`);
      }

      if (!preparation.task.dispatchMetadata?.dispatchReady) {
        return fail("Expected dispatchMetadata.dispatchReady true on stored task.");
      }

      return pass();
    },
  },
  {
    id: "agent-dispatch-capability-mismatch",
    name: "Agent dispatch capability mismatch",
    description:
      "Dispatch integration rejects when no agent satisfies requested capabilities.",
    buildRequest: () =>
      createTestRequest({
        question: "Agent dispatch capability mismatch check.",
      }),
    validate: (context) => {
      resetAgentTaskSequence();
      const store = new DefaultAgentTaskStore();
      const integration = new DefaultAgentDispatchIntegration(store);
      const agent = createAgentDefinition({
        id: "harness-search-agent",
        name: "Harness Search Agent",
        version: "1.0.0",
        description: "Search-only test agent.",
        category: "test",
        status: "enabled",
        capabilities: [AGENT_CAPABILITY_SEARCH],
      });
      const task = createAgentTask({
        agentId: "unassigned",
        requestId: context.request.id,
        title: "Capability mismatch dispatch test",
        taskRequest: createTaskRequest({
          intent: "general",
          requestedCapabilities: [AGENT_CAPABILITY_RESEARCH],
        }),
      });

      const preparation = integration.prepareDispatch({ task, availableAgents: [agent] });

      if (preparation.diagnostics.decision !== "rejected") {
        return fail(
          `Expected rejected dispatch decision, received ${preparation.diagnostics.decision}.`,
        );
      }

      if (preparation.diagnostics.dispatchReady) {
        return fail("Expected dispatchReady false for capability mismatch.");
      }

      if (preparation.task.status !== "created") {
        return fail(
          `Expected task status created after capability mismatch, received ${preparation.task.status}.`,
        );
      }

      if (preparation.task.dispatchMetadata?.selectedAgentId) {
        return fail("Expected no selectedAgentId in dispatch metadata after rejection.");
      }

      return pass();
    },
  },
  {
    id: "execution-ready",
    name: "Execution foundation ready",
    description:
      "Dispatch-ready task passes contract prepare, validate, describe, and health — executionReady true.",
    buildRequest: () =>
      createTestRequest({
        question: "Execution foundation ready check.",
      }),
    validate: (context) => {
      const { store, agent, preparation } = prepareDispatchReadyHarnessTask(context);

      if (!preparation.diagnostics.dispatchReady) {
        return fail("Expected dispatch-ready task before execution foundation.");
      }

      const result = runAgentExecutionFoundation({
        task: preparation.task,
        agentDefinition: agent,
        providerKind: PROVIDER_KIND_LOCAL,
        coordinator: new DefaultAgentExecutionCoordinator(store),
      });

      if (!result.executionReady) {
        return fail("Expected executionReady true for healthy contract foundation.");
      }

      if (!result.prepared || !result.validated || !result.healthy) {
        return fail("Expected prepared, validated, and healthy execution foundation checks.");
      }

      if (result.state !== "ready") {
        return fail(`Expected execution state ready, received ${result.state}.`);
      }

      if (result.agentId !== agent.id) {
        return fail("Expected execution result agentId to match dispatched agent.");
      }

      return pass();
    },
  },
  {
    id: "execution-unhealthy-provider",
    name: "Execution foundation unhealthy provider",
    description:
      "Unhealthy runtime contract health check blocks execution readiness.",
    buildRequest: () =>
      createTestRequest({
        question: "Execution unhealthy provider check.",
      }),
    validate: (context) => {
      const { store, agent, preparation } = prepareDispatchReadyHarnessTask(context);
      const unhealthyCoordinator = new DefaultAgentExecutionCoordinator(store, (providerKind) =>
        wrapUnhealthyAgentRuntimeContract(resolveAgentRuntimeContract(providerKind)),
      );

      const result = runAgentExecutionFoundation({
        task: preparation.task,
        agentDefinition: agent,
        providerKind: PROVIDER_KIND_LOCAL,
        coordinator: unhealthyCoordinator,
      });

      if (result.executionReady) {
        return fail("Expected executionReady false for unhealthy provider.");
      }

      if (result.healthy) {
        return fail("Expected healthy false for unhealthy provider wrapper.");
      }

      if (result.state !== "blocked") {
        return fail(`Expected blocked execution state, received ${result.state}.`);
      }

      if (result.errors.length === 0) {
        return fail("Expected execution errors when provider health fails.");
      }

      return pass();
    },
  },
  {
    id: "execution-validation-failure",
    name: "Execution foundation validation failure",
    description:
      "Contract validate() failure blocks execution readiness.",
    buildRequest: () =>
      createTestRequest({
        question: "Execution validation failure check.",
      }),
    validate: (context) => {
      const { store, agent, preparation } = prepareDispatchReadyHarnessTask(context);
      const failingValidateCoordinator = new DefaultAgentExecutionCoordinator(store, (providerKind) =>
        wrapFailingValidateAgentRuntimeContract(resolveAgentRuntimeContract(providerKind)),
      );

      const result = runAgentExecutionFoundation({
        task: preparation.task,
        agentDefinition: agent,
        providerKind: PROVIDER_KIND_LOCAL,
        coordinator: failingValidateCoordinator,
      });

      if (result.executionReady) {
        return fail("Expected executionReady false when contract validate() fails.");
      }

      if (result.validated) {
        return fail("Expected validated false when contract validate() fails.");
      }

      if (result.state !== "blocked") {
        return fail(`Expected blocked execution state, received ${result.state}.`);
      }

      if (result.errors.length === 0) {
        return fail("Expected execution errors when validation fails.");
      }

      return pass();
    },
  },
  {
    id: "local-runtime-execution",
    name: "Local runtime execution",
    description:
      "Local adapter execute() produces deterministic completed execution after foundation checks.",
    buildRequest: () =>
      createTestRequest({
        question: "Local runtime execution check.",
      }),
    validateAsync: async (context) => {
      const { store, agent, preparation } = prepareDispatchReadyHarnessTask(context);
      const result = await runAgentExecutionPipeline({
        task: preparation.task,
        agentDefinition: agent,
        providerKind: PROVIDER_KIND_LOCAL,
        coordinator: new DefaultAgentExecutionCoordinator(store),
      });

      if (!result.executed) {
        return fail("Expected executed true for local runtime pipeline.");
      }

      if (result.executionType !== "deterministic") {
        return fail(`Expected executionType deterministic, received ${result.executionType ?? "unknown"}.`);
      }

      if (result.executionSummary !== LOCAL_RUNTIME_EXECUTION_SUMMARY) {
        return fail("Expected deterministic local execution summary.");
      }

      if (result.providerKind !== PROVIDER_KIND_LOCAL) {
        return fail("Expected providerKind local.");
      }

      if ((result.executionDurationMs ?? -1) < 0) {
        return fail("Expected non-negative executionDurationMs.");
      }

      return pass();
    },
  },
  {
    id: "local-runtime-health",
    name: "Local runtime health",
    description:
      "Local runtime adapter reports healthy available status.",
    buildRequest: () =>
      createTestRequest({
        question: "Local runtime health check.",
      }),
    validate: (context) => {
      void context;
      const health = localRuntimeAdapter.health();

      if (!health.healthy) {
        return fail("Expected local runtime adapter health.healthy true.");
      }

      if (health.providerKind !== PROVIDER_KIND_LOCAL) {
        return fail("Expected local runtime health providerKind local.");
      }

      if (health.status !== "available") {
        return fail(`Expected health status available, received ${health.status}.`);
      }

      return pass();
    },
  },
  {
    id: "local-runtime-summary",
    name: "Local runtime execution summary",
    description:
      "Local execution diagnostics include providerKind, executionType, and executionDuration.",
    buildRequest: () =>
      createTestRequest({
        question: "Local runtime summary check.",
      }),
    validateAsync: async (context) => {
      const { store, agent, preparation } = prepareDispatchReadyHarnessTask(context);
      const result = await runAgentExecutionPipeline({
        task: preparation.task,
        agentDefinition: agent,
        providerKind: PROVIDER_KIND_LOCAL,
        coordinator: new DefaultAgentExecutionCoordinator(store),
      });

      if (!result.executed) {
        return fail("Expected local execution to complete.");
      }

      const diagnostics = buildLocalRuntimeExecutionDiagnostics({
        status: "completed",
        providerKind: PROVIDER_KIND_LOCAL,
        executionType: "deterministic",
        warnings: [],
        errors: [],
        executionSummary: result.executionSummary ?? "",
        executionDurationMs: result.executionDurationMs ?? 0,
      });

      if (diagnostics.providerKind !== PROVIDER_KIND_LOCAL) {
        return fail("Expected diagnostics providerKind local.");
      }

      if (diagnostics.executionType !== "deterministic") {
        return fail("Expected diagnostics executionType deterministic.");
      }

      if (diagnostics.executionDurationMs !== result.executionDurationMs) {
        return fail("Expected diagnostics executionDurationMs to match result.");
      }

      if (!result.executionReady) {
        return fail("Expected executionReady true after successful local execution foundation.");
      }

      return pass();
    },
  },
  {
    id: "agent-queue-enqueue",
    name: "Agent queue enqueue",
    description:
      "Enqueue adds task to store with queued status and creates a pending runtime queue item.",
    buildRequest: () =>
      createTestRequest({
        question: "Agent queue enqueue check.",
      }),
    validate: (context) => {
      resetAgentTaskSequence();
      resetQueueItemSequence();
      const store = new DefaultAgentTaskStore();
      const queue = new DefaultRuntimeQueue();
      const integration = new DefaultAgentQueueIntegration(store, queue);
      const task = createAgentTask({
        agentId: "queue-agent",
        requestId: context.request.id,
        title: "Queue enqueue test task",
        taskRequest: createTaskRequest({
          intent: "general",
          requestedCapabilities: [AGENT_CAPABILITY_RESEARCH],
        }),
      });

      const result = integration.enqueueTask(task);

      if (!result.accepted) {
        return fail(`Expected enqueue accepted, received: ${result.reason}`);
      }

      if (result.task?.status !== "queued") {
        return fail(`Expected task status queued, received ${result.task?.status ?? "unknown"}.`);
      }

      if (result.queueItem?.status !== "pending") {
        return fail(`Expected queue item pending, received ${result.queueItem?.status ?? "unknown"}.`);
      }

      if (!result.diagnostics?.queueItemId) {
        return fail("Expected diagnostics queueItemId after enqueue.");
      }

      if (result.diagnostics.readyForDispatch) {
        return fail("Expected readyForDispatch false while queue item is pending.");
      }

      if (!store.get(task.id)) {
        return fail("Expected task in store after enqueue.");
      }

      return pass();
    },
  },
  {
    id: "agent-queue-dequeue",
    name: "Agent queue dequeue",
    description:
      "Dequeue resolves task from store and marks queue item running — no agent execution.",
    buildRequest: () =>
      createTestRequest({
        question: "Agent queue dequeue check.",
      }),
    validate: (context) => {
      resetAgentTaskSequence();
      resetQueueItemSequence();
      const store = new DefaultAgentTaskStore();
      const queue = new DefaultRuntimeQueue();
      const integration = new DefaultAgentQueueIntegration(store, queue);
      const task = createAgentTask({
        agentId: "queue-agent",
        requestId: context.request.id,
        title: "Queue dequeue test task",
        taskRequest: createTaskRequest({
          intent: "general",
          requestedCapabilities: [AGENT_CAPABILITY_RESEARCH],
        }),
      });

      const enqueue = integration.enqueueTask(task);

      if (!enqueue.accepted) {
        return fail(`Expected enqueue to succeed before dequeue: ${enqueue.reason}`);
      }

      const dequeue = integration.dequeueTask();

      if (!dequeue.dequeued) {
        return fail(`Expected dequeue success, received: ${dequeue.reason}`);
      }

      if (dequeue.queueItem?.status !== "running") {
        return fail(`Expected queue item running after dequeue, received ${dequeue.queueItem?.status ?? "unknown"}.`);
      }

      if (dequeue.task?.id !== task.id) {
        return fail("Expected dequeued task id to match enqueued task.");
      }

      if (!dequeue.diagnostics?.readyForDispatch) {
        return fail("Expected readyForDispatch true after dequeue for queued task.");
      }

      if (dequeue.diagnostics.taskStatus !== "queued") {
        return fail(`Expected diagnostics taskStatus queued, received ${dequeue.diagnostics.taskStatus}.`);
      }

      return pass();
    },
  },
  {
    id: "agent-queue-reject-terminal-task",
    name: "Agent queue reject terminal task",
    description:
      "Terminal agent tasks are rejected by queue integration policy.",
    buildRequest: () =>
      createTestRequest({
        question: "Agent queue reject terminal task check.",
      }),
    validate: (context) => {
      resetAgentTaskSequence();
      resetQueueItemSequence();
      const store = new DefaultAgentTaskStore();
      const queue = new DefaultRuntimeQueue();
      const integration = new DefaultAgentQueueIntegration(store, queue);
      const task = createAgentTask({
        agentId: "queue-agent",
        requestId: context.request.id,
        title: "Terminal queue reject test task",
        taskRequest: createTaskRequest({
          intent: "general",
          requestedCapabilities: [AGENT_CAPABILITY_RESEARCH],
        }),
      });
      const terminalTask = withAgentTaskStatus(task, "failed");

      const result = integration.enqueueTask(terminalTask);

      if (result.accepted) {
        return fail("Expected enqueue rejected for terminal task.");
      }

      if (!result.reason?.includes("terminal")) {
        return fail("Expected rejection reason to mention terminal task status.");
      }

      if (queue.size() !== 0) {
        return fail("Expected runtime queue to remain empty after terminal task rejection.");
      }

      return pass();
    },
  },
  {
    id: "agent-scheduler-schedule",
    name: "Agent scheduler schedule",
    description:
      "Schedule stores task and creates schedule item without immediate queue enqueue.",
    buildRequest: () =>
      createTestRequest({
        question: "Agent scheduler schedule check.",
      }),
    validate: (context) => {
      resetAgentTaskSequence();
      resetQueueItemSequence();
      resetScheduleItemSequence();
      const store = new DefaultAgentTaskStore();
      const queue = new DefaultRuntimeQueue();
      const scheduler = new DefaultRuntimeScheduler();
      const queueIntegration = new DefaultAgentQueueIntegration(store, queue);
      const bridge = new DefaultAgentSchedulerBridge(store, scheduler, queueIntegration);
      const task = createAgentTask({
        agentId: "scheduler-agent",
        requestId: context.request.id,
        title: "Scheduler schedule test task",
        taskRequest: createTaskRequest({
          intent: "general",
          requestedCapabilities: [AGENT_CAPABILITY_RESEARCH],
        }),
      });

      const result = bridge.scheduleTask(task, "2026-07-10T00:00:00.000Z", {
        referenceAt: "2026-07-05T00:00:00.000Z",
      });

      if (!result.accepted) {
        return fail(`Expected schedule accepted, received: ${result.reason}`);
      }

      if (result.scheduleItem?.status !== "scheduled") {
        return fail(`Expected schedule item scheduled, received ${result.scheduleItem?.status ?? "unknown"}.`);
      }

      if (result.diagnostics?.queued) {
        return fail("Expected queued false immediately after schedule.");
      }

      if (queue.size() !== 0) {
        return fail("Expected runtime queue empty before ready evaluation.");
      }

      if (!store.get(task.id)) {
        return fail("Expected task in store after schedule.");
      }

      return pass();
    },
  },
  {
    id: "agent-scheduler-ready-to-queue",
    name: "Agent scheduler ready to queue",
    description:
      "Caller-driven evaluateReadyTasks promotes due scheduled tasks to the runtime queue.",
    buildRequest: () =>
      createTestRequest({
        question: "Agent scheduler ready to queue check.",
      }),
    validate: (context) => {
      resetAgentTaskSequence();
      resetQueueItemSequence();
      resetScheduleItemSequence();
      const store = new DefaultAgentTaskStore();
      const queue = new DefaultRuntimeQueue();
      const scheduler = new DefaultRuntimeScheduler();
      const queueIntegration = new DefaultAgentQueueIntegration(store, queue);
      const bridge = new DefaultAgentSchedulerBridge(store, scheduler, queueIntegration);
      const task = createAgentTask({
        agentId: "scheduler-agent",
        requestId: context.request.id,
        title: "Scheduler ready to queue test task",
        taskRequest: createTaskRequest({
          intent: "general",
          requestedCapabilities: [AGENT_CAPABILITY_RESEARCH],
        }),
      });

      const scheduledFor = "2026-07-06T00:00:00.000Z";
      const schedule = bridge.scheduleTask(task, scheduledFor, {
        referenceAt: "2026-07-05T00:00:00.000Z",
      });

      if (!schedule.accepted) {
        return fail(`Expected schedule accepted before evaluation: ${schedule.reason}`);
      }

      const evaluation = bridge.evaluateReadyTasks(scheduledFor);

      if (evaluation.enqueuedCount !== 1) {
        return fail(`Expected one enqueued task, received ${evaluation.enqueuedCount}.`);
      }

      const entry = evaluation.entries[0];

      if (!entry?.queued) {
        return fail(`Expected queued entry, received: ${entry?.reason ?? "unknown"}`);
      }

      if (!entry.diagnostics.queued) {
        return fail("Expected diagnostics queued true after promotion.");
      }

      if (entry.diagnostics.taskStatus !== "queued") {
        return fail(`Expected task status queued after promotion, received ${entry.diagnostics.taskStatus}.`);
      }

      if (queue.size() !== 1) {
        return fail("Expected one item in runtime queue after promotion.");
      }

      return pass();
    },
  },
  {
    id: "agent-scheduler-cancel",
    name: "Agent scheduler cancel",
    description:
      "Cancel removes schedule item and updates task lifecycle when allowed.",
    buildRequest: () =>
      createTestRequest({
        question: "Agent scheduler cancel check.",
      }),
    validate: (context) => {
      resetAgentTaskSequence();
      resetQueueItemSequence();
      resetScheduleItemSequence();
      const store = new DefaultAgentTaskStore();
      const queue = new DefaultRuntimeQueue();
      const scheduler = new DefaultRuntimeScheduler();
      const queueIntegration = new DefaultAgentQueueIntegration(store, queue);
      const bridge = new DefaultAgentSchedulerBridge(store, scheduler, queueIntegration);
      const task = createAgentTask({
        agentId: "scheduler-agent",
        requestId: context.request.id,
        title: "Scheduler cancel test task",
        taskRequest: createTaskRequest({
          intent: "general",
          requestedCapabilities: [AGENT_CAPABILITY_RESEARCH],
        }),
      });

      const schedule = bridge.scheduleTask(task, "2026-07-10T00:00:00.000Z", {
        referenceAt: "2026-07-05T00:00:00.000Z",
      });

      if (!schedule.accepted) {
        return fail(`Expected schedule accepted before cancel: ${schedule.reason}`);
      }

      const cancel = bridge.cancelScheduledTask(task.id);

      if (!cancel.cancelled) {
        return fail(`Expected cancel success, received: ${cancel.reason}`);
      }

      if (cancel.scheduleItem?.status !== "cancelled") {
        return fail(`Expected schedule item cancelled, received ${cancel.scheduleItem?.status ?? "unknown"}.`);
      }

      if (cancel.task?.status !== "cancelled") {
        return fail(`Expected task status cancelled, received ${cancel.task?.status ?? "unknown"}.`);
      }

      if (cancel.diagnostics?.queued) {
        return fail("Expected diagnostics queued false after cancel.");
      }

      return pass();
    },
  },
  {
    id: "observability-empty-state",
    name: "Observability empty state",
    description:
      "Observability collect returns healthy snapshot when runtime and agent stores are empty.",
    buildRequest: () =>
      createTestRequest({
        question: "Observability empty state check.",
      }),
    validate: () => {
      resetAgentTaskSequence();
      resetQueueItemSequence();
      resetScheduleItemSequence();
      const store = new DefaultAgentTaskStore();
      const queue = new DefaultRuntimeQueue();
      const scheduler = new DefaultRuntimeScheduler();
      const sessionRegistry = new DefaultSessionRegistry();
      const observability = new DefaultObservabilityService({
        sessionRegistry,
        queue,
        scheduler,
        taskStore: store,
        localAdapter: localRuntimeAdapter,
      });

      const snapshot = observability.collect({
        evaluatedAt: "2026-07-06T00:00:00.000Z",
      });

      if (snapshot.health.status !== "healthy") {
        return fail(`Expected healthy status, received ${snapshot.health.status}.`);
      }

      if (snapshot.runtime.sessionRegistry.total !== 0) {
        return fail("Expected empty session registry snapshot.");
      }

      if (snapshot.runtime.queue.total !== 0) {
        return fail("Expected empty queue snapshot.");
      }

      if (snapshot.runtime.scheduler.total !== 0) {
        return fail("Expected empty scheduler snapshot.");
      }

      if (snapshot.agent.taskStore.total !== 0) {
        return fail("Expected empty task store snapshot.");
      }

      if (!snapshot.agent.localAdapterAvailable) {
        return fail("Expected local runtime adapter available.");
      }

      if (!snapshot.health.recommendedNextAction.includes("No runtime activity")) {
        return fail("Expected empty-state recommended next action.");
      }

      return pass();
    },
  },
  {
    id: "observability-with-queued-task",
    name: "Observability with queued task",
    description:
      "Observability collect reflects pending queue items and degraded health after enqueue.",
    buildRequest: () =>
      createTestRequest({
        question: "Observability queued task check.",
      }),
    validate: (context) => {
      resetAgentTaskSequence();
      resetQueueItemSequence();
      resetScheduleItemSequence();
      const store = new DefaultAgentTaskStore();
      const queue = new DefaultRuntimeQueue();
      const scheduler = new DefaultRuntimeScheduler();
      const sessionRegistry = new DefaultSessionRegistry();
      const queueIntegration = new DefaultAgentQueueIntegration(store, queue);
      const observability = new DefaultObservabilityService({
        sessionRegistry,
        queue,
        scheduler,
        taskStore: store,
        localAdapter: localRuntimeAdapter,
      });
      const task = createAgentTask({
        agentId: "observability-agent",
        requestId: context.request.id,
        title: "Observability queued task test",
        taskRequest: createTaskRequest({
          intent: "general",
          requestedCapabilities: [AGENT_CAPABILITY_RESEARCH],
        }),
      });

      const enqueue = queueIntegration.enqueueTask(task);

      if (!enqueue.accepted) {
        return fail(`Expected enqueue accepted: ${enqueue.reason}`);
      }

      const snapshot = observability.collect({
        evaluatedAt: "2026-07-06T00:00:00.000Z",
      });

      if (snapshot.health.status !== "degraded") {
        return fail(`Expected degraded status, received ${snapshot.health.status}.`);
      }

      if (snapshot.runtime.queue.pending !== 1) {
        return fail(`Expected one pending queue item, received ${snapshot.runtime.queue.pending}.`);
      }

      if (snapshot.agent.taskStore.total !== 1) {
        return fail("Expected one task in task store snapshot.");
      }

      if (!snapshot.health.warnings.some((warning) => warning.includes("pending dispatch preparation"))) {
        return fail("Expected queue pending warning in health summary.");
      }

      if (!snapshot.health.recommendedNextAction.includes("Dequeue pending tasks")) {
        return fail("Expected dequeue recommended next action.");
      }

      return pass();
    },
  },
  {
    id: "observability-with-scheduled-task",
    name: "Observability with scheduled task",
    description:
      "Observability collect reflects scheduled items and degraded health before evaluation.",
    buildRequest: () =>
      createTestRequest({
        question: "Observability scheduled task check.",
      }),
    validate: (context) => {
      resetAgentTaskSequence();
      resetQueueItemSequence();
      resetScheduleItemSequence();
      const store = new DefaultAgentTaskStore();
      const queue = new DefaultRuntimeQueue();
      const scheduler = new DefaultRuntimeScheduler();
      const sessionRegistry = new DefaultSessionRegistry();
      const queueIntegration = new DefaultAgentQueueIntegration(store, queue);
      const bridge = new DefaultAgentSchedulerBridge(store, scheduler, queueIntegration);
      const observability = new DefaultObservabilityService({
        sessionRegistry,
        queue,
        scheduler,
        taskStore: store,
        localAdapter: localRuntimeAdapter,
      });
      const task = createAgentTask({
        agentId: "observability-agent",
        requestId: context.request.id,
        title: "Observability scheduled task test",
        taskRequest: createTaskRequest({
          intent: "general",
          requestedCapabilities: [AGENT_CAPABILITY_RESEARCH],
        }),
      });

      const schedule = bridge.scheduleTask(task, "2026-07-10T00:00:00.000Z", {
        referenceAt: "2026-07-05T00:00:00.000Z",
      });

      if (!schedule.accepted) {
        return fail(`Expected schedule accepted: ${schedule.reason}`);
      }

      const snapshot = observability.collect({
        evaluatedAt: "2026-07-06T00:00:00.000Z",
      });

      if (snapshot.health.status !== "degraded") {
        return fail(`Expected degraded status, received ${snapshot.health.status}.`);
      }

      if (snapshot.runtime.scheduler.scheduled !== 1) {
        return fail(
          `Expected one scheduled item, received ${snapshot.runtime.scheduler.scheduled}.`,
        );
      }

      if (snapshot.runtime.queue.total !== 0) {
        return fail("Expected queue empty before ready evaluation.");
      }

      if (snapshot.agent.taskStore.total !== 1) {
        return fail("Expected one task in task store snapshot.");
      }

      if (!snapshot.health.warnings.some((warning) => warning.includes("scheduled item(s) awaiting evaluation"))) {
        return fail("Expected scheduler warning in health summary.");
      }

      if (!snapshot.health.recommendedNextAction.includes("evaluateReadyTasks")) {
        return fail("Expected evaluateReadyTasks recommended next action when ready items exist.");
      }

      return pass();
    },
  },
  {
    id: "worker-initialize",
    name: "Worker initialize",
    description:
      "Runtime worker initialize moves lifecycle from created to initialized.",
    buildRequest: () =>
      createTestRequest({
        question: "Worker initialize check.",
      }),
    validate: () => {
      resetAgentTaskSequence();
      resetQueueItemSequence();
      resetScheduleItemSequence();
      const store = new DefaultAgentTaskStore();
      const queue = new DefaultRuntimeQueue();
      const scheduler = new DefaultRuntimeScheduler();
      const queueIntegration = new DefaultAgentQueueIntegration(store, queue);
      const bridge = new DefaultAgentSchedulerBridge(store, scheduler, queueIntegration);
      const worker = new DefaultRuntimeWorker({
        taskStore: store,
        queueIntegration,
        schedulerBridge: bridge,
        scheduler,
        queue,
      });

      const initial = worker.snapshot();

      if (initial.workerState !== "created") {
        return fail(`Expected initial worker state created, received ${initial.workerState}.`);
      }

      const initResult = worker.initialize();

      if (!initResult.accepted) {
        return fail(`Expected initialize accepted: ${initResult.reason}`);
      }

      if (initResult.workerState !== "initialized") {
        return fail(`Expected initialized state, received ${initResult.workerState}.`);
      }

      const snapshot = worker.snapshot();

      if (snapshot.workerState !== "initialized") {
        return fail(`Expected snapshot state initialized, received ${snapshot.workerState}.`);
      }

      if (snapshot.processedItems !== 0) {
        return fail("Expected zero processed items after initialize.");
      }

      const duplicateInit = worker.initialize();

      if (duplicateInit.accepted) {
        return fail("Expected duplicate initialize rejected.");
      }

      return pass();
    },
  },
  {
    id: "worker-tick",
    name: "Worker tick",
    description:
      "Runtime worker tick evaluates scheduler and dequeues one task without agent execution.",
    buildRequest: () =>
      createTestRequest({
        question: "Worker tick check.",
      }),
    validate: (context) => {
      resetAgentTaskSequence();
      resetQueueItemSequence();
      resetScheduleItemSequence();
      const store = new DefaultAgentTaskStore();
      const queue = new DefaultRuntimeQueue();
      const scheduler = new DefaultRuntimeScheduler();
      const queueIntegration = new DefaultAgentQueueIntegration(store, queue);
      const bridge = new DefaultAgentSchedulerBridge(store, scheduler, queueIntegration);
      const worker = new DefaultRuntimeWorker({
        taskStore: store,
        queueIntegration,
        schedulerBridge: bridge,
        scheduler,
        queue,
      });
      const task = createAgentTask({
        agentId: "worker-agent",
        requestId: context.request.id,
        title: "Worker tick test task",
        taskRequest: createTaskRequest({
          intent: "general",
          requestedCapabilities: [AGENT_CAPABILITY_RESEARCH],
        }),
      });

      const scheduledFor = "2026-07-06T00:00:00.000Z";
      const schedule = bridge.scheduleTask(task, scheduledFor, {
        referenceAt: "2026-07-05T00:00:00.000Z",
      });

      if (!schedule.accepted) {
        return fail(`Expected schedule accepted before tick: ${schedule.reason}`);
      }

      const initResult = worker.initialize();

      if (!initResult.accepted) {
        return fail(`Expected initialize accepted: ${initResult.reason}`);
      }

      const startResult = worker.start();

      if (!startResult.accepted) {
        return fail(`Expected start accepted: ${startResult.reason}`);
      }

      const tickResult = worker.tick({ evaluatedAt: scheduledFor });

      if (!tickResult.accepted) {
        return fail(`Expected tick accepted: ${tickResult.reason}`);
      }

      if (tickResult.schedulerEnqueuedCount !== 1) {
        return fail(
          `Expected one scheduler enqueue during tick, received ${tickResult.schedulerEnqueuedCount}.`,
        );
      }

      if (!tickResult.dequeued) {
        return fail("Expected tick to dequeue one task after scheduler promotion.");
      }

      if (!tickResult.dequeuedTaskId) {
        return fail("Expected dequeued task id after tick.");
      }

      const snapshot = worker.snapshot();

      if (snapshot.processedItems < 2) {
        return fail(`Expected at least two processed items, received ${snapshot.processedItems}.`);
      }

      if (snapshot.lastTick !== scheduledFor) {
        return fail(`Expected lastTick ${scheduledFor}, received ${snapshot.lastTick ?? "null"}.`);
      }

      return pass();
    },
  },
  {
    id: "worker-stop",
    name: "Worker stop",
    description:
      "Runtime worker stop moves lifecycle to stopped and rejects further tick calls.",
    buildRequest: () =>
      createTestRequest({
        question: "Worker stop check.",
      }),
    validate: () => {
      resetAgentTaskSequence();
      resetQueueItemSequence();
      resetScheduleItemSequence();
      const store = new DefaultAgentTaskStore();
      const queue = new DefaultRuntimeQueue();
      const scheduler = new DefaultRuntimeScheduler();
      const queueIntegration = new DefaultAgentQueueIntegration(store, queue);
      const bridge = new DefaultAgentSchedulerBridge(store, scheduler, queueIntegration);
      const worker = new DefaultRuntimeWorker({
        taskStore: store,
        queueIntegration,
        schedulerBridge: bridge,
        scheduler,
        queue,
      });

      const initResult = worker.initialize();

      if (!initResult.accepted) {
        return fail(`Expected initialize accepted: ${initResult.reason}`);
      }

      const startResult = worker.start();

      if (!startResult.accepted) {
        return fail(`Expected start accepted: ${startResult.reason}`);
      }

      const stopResult = worker.stop();

      if (!stopResult.accepted) {
        return fail(`Expected stop accepted: ${stopResult.reason}`);
      }

      if (stopResult.workerState !== "stopped") {
        return fail(`Expected stopped state, received ${stopResult.workerState}.`);
      }

      const snapshot = worker.snapshot();

      if (snapshot.workerState !== "stopped") {
        return fail(`Expected snapshot state stopped, received ${snapshot.workerState}.`);
      }

      const tickResult = worker.tick({ evaluatedAt: "2026-07-06T00:00:00.000Z" });

      if (tickResult.accepted) {
        return fail("Expected tick rejected after stop.");
      }

      if (!tickResult.reason?.includes("running")) {
        return fail("Expected tick rejection reason to mention running state requirement.");
      }

      const duplicateStop = worker.stop();

      if (duplicateStop.accepted) {
        return fail("Expected duplicate stop rejected.");
      }

      return pass();
    },
  },
];

/**
 * Resolve a built-in scenario by id.
 */
export function getIntelligenceTestScenario(id: string): IntelligenceTestScenario | undefined {
  return INTELLIGENCE_TEST_SCENARIOS.find((scenario) => scenario.id === id);
}

/**
 * Reset internal scenario sequence counter — useful for deterministic ids in repeated runs.
 */
export function resetTestRequestSequence(): void {
  scenarioSequence = 0;
}
