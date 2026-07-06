import { ISSUE_BLOCKING_EXECUTION_DENIED } from "@/lib/intelligence/diagnostics/issues";
import {
  DefaultAgentDispatchIntegration,
} from "@/lib/intelligence/agents/integration/agent-dispatch-integration";
import {
  AGENT_CAPABILITY_RESEARCH,
  AGENT_CAPABILITY_SEARCH,
} from "@/lib/intelligence/agents/registry/agent-capabilities";
import { createAgentDefinition } from "@/lib/intelligence/agents/registry/agent-definition";
import {
  createAgentTask,
  resetAgentTaskSequence,
} from "@/lib/intelligence/agents/tasks/task";
import { createTaskRequest } from "@/lib/intelligence/agents/tasks/task-request";
import {
  DefaultAgentTaskStore,
} from "@/lib/intelligence/agents/tasks/store/task-store";
import { TEST_RUNTIME_CANCEL_REQUEST_PREFIX } from "@/lib/intelligence/runtime/integration/runtime-policy-diagnostics";
import {
  queryByRequestId,
  defaultSessionRegistry,
} from "@/lib/intelligence/runtime/registry";
import type { IntelligenceRequest } from "@/lib/intelligence/request.types";
import type {
  IntelligenceTestScenario,
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
  context: Parameters<IntelligenceTestScenario["validate"]>[0],
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
  context: Parameters<IntelligenceTestScenario["validate"]>[0],
): IntelligenceTestValidationResult | null {
  if (context.error) {
    return fail(`Pipeline threw unexpectedly: ${context.error}`);
  }

  if (!context.result) {
    return fail("Pipeline returned no result.");
  }

  return null;
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
