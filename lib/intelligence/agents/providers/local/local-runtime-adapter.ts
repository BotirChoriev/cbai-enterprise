import type { AgentRuntimeContract } from "@/lib/intelligence/agents/runtime/agent-contract";
import {
  advanceToPrepared,
  advanceToReady,
  advanceToValidated,
} from "@/lib/intelligence/agents/runtime/agent-lifecycle";
import {
  validateAgentRequestEnvelope,
  type AgentRequest,
} from "@/lib/intelligence/agents/runtime/agent-request";
import {
  createAgentResponse,
  createFailedAgentResponse,
  type AgentResponse,
} from "@/lib/intelligence/agents/runtime/agent-response";
import {
  PROVIDER_KIND_DESCRIPTIONS,
  PROVIDER_KIND_LABELS,
  PROVIDER_KIND_LOCAL,
} from "@/lib/intelligence/agents/runtime/provider-kinds";
import type {
  AgentHealthResult,
  AgentOperationResult,
  AgentSupportResult,
} from "@/lib/intelligence/agents/runtime/types";
import {
  createCompletedLocalRuntimeExecution,
} from "@/lib/intelligence/agents/providers/local/local-runtime-result";
import {
  LOCAL_RUNTIME_ADAPTER_VERSION,
} from "@/lib/intelligence/agents/providers/local/types";

/** Stable contract identifier for the local runtime adapter. */
export const LOCAL_RUNTIME_ADAPTER_CONTRACT_ID = "agent-runtime-contract-local-adapter";

/**
 * Local Runtime Adapter (BUILD-055).
 *
 * First Agent Runtime Contract implementation with deterministic execute().
 * Not an AI model — placeholder execution only.
 */
export class LocalRuntimeAdapter implements AgentRuntimeContract {
  readonly providerKind = PROVIDER_KIND_LOCAL;

  get contractId(): string {
    return LOCAL_RUNTIME_ADAPTER_CONTRACT_ID;
  }

  get contractVersion(): string {
    return LOCAL_RUNTIME_ADAPTER_VERSION;
  }

  prepare(request: AgentRequest): AgentOperationResult {
    const validation = validateAgentRequestEnvelope(request);

    if (!validation.valid) {
      return { accepted: false, reason: validation.reason };
    }

    if (request.providerKind !== PROVIDER_KIND_LOCAL) {
      return {
        accepted: false,
        reason: `Prepare reject: provider kind "${request.providerKind}" does not match "${PROVIDER_KIND_LOCAL}".`,
      };
    }

    const lifecycle = advanceToPrepared(request.lifecycle);
    const response = createAgentResponse({
      requestEnvelopeId: request.envelopeId,
      agentId: request.agentId,
      providerKind: PROVIDER_KIND_LOCAL,
      status: "prepared",
      lifecycle,
      reason: `Agent request prepared for ${PROVIDER_KIND_LABELS.local} runtime adapter.`,
    });

    return { accepted: true, response };
  }

  validate(request: AgentRequest): AgentOperationResult {
    const validation = validateAgentRequestEnvelope(request);

    if (!validation.valid) {
      return { accepted: false, reason: validation.reason };
    }

    if (request.providerKind !== PROVIDER_KIND_LOCAL) {
      return {
        accepted: false,
        reason: `Validate reject: provider kind "${request.providerKind}" does not match "${PROVIDER_KIND_LOCAL}".`,
      };
    }

    if (request.agentDefinition && request.agentDefinition.id !== request.agentId) {
      return {
        accepted: false,
        reason: "Validate reject: agent definition id does not match request agent id.",
      };
    }

    const lifecycle = advanceToValidated(advanceToPrepared(request.lifecycle));
    const response = createAgentResponse({
      requestEnvelopeId: request.envelopeId,
      agentId: request.agentId,
      providerKind: PROVIDER_KIND_LOCAL,
      status: "validated",
      lifecycle,
      reason: `Agent request validated for ${PROVIDER_KIND_LABELS.local} runtime adapter.`,
    });

    return { accepted: true, response };
  }

  describe(request: AgentRequest): AgentOperationResult {
    const validation = validateAgentRequestEnvelope(request);

    if (!validation.valid) {
      return { accepted: false, reason: validation.reason };
    }

    const definitionDescription = request.agentDefinition
      ? ` Agent registry entry: ${request.agentDefinition.name} v${request.agentDefinition.version}.`
      : "";

    const response = createAgentResponse({
      requestEnvelopeId: request.envelopeId,
      agentId: request.agentId,
      providerKind: PROVIDER_KIND_LOCAL,
      status: "described",
      lifecycle: request.lifecycle,
      reason: `${PROVIDER_KIND_DESCRIPTIONS.local} Deterministic placeholder adapter.${definitionDescription}`,
    });

    return { accepted: true, response };
  }

  supports(request: AgentRequest): AgentSupportResult {
    const validation = validateAgentRequestEnvelope(request);

    if (!validation.valid) {
      return {
        supported: false,
        reason: validation.reason,
        providerKind: PROVIDER_KIND_LOCAL,
      };
    }

    if (request.providerKind !== PROVIDER_KIND_LOCAL) {
      return {
        supported: false,
        reason: `Support reject: provider kind "${request.providerKind}" does not match "${PROVIDER_KIND_LOCAL}".`,
        providerKind: PROVIDER_KIND_LOCAL,
      };
    }

    return {
      supported: true,
      reason: `${PROVIDER_KIND_LABELS.local} runtime adapter declares support for this request envelope.`,
      providerKind: PROVIDER_KIND_LOCAL,
    };
  }

  health(): AgentHealthResult {
    const checkedAt = new Date().toISOString();

    return {
      healthy: true,
      providerKind: PROVIDER_KIND_LOCAL,
      status: "available",
      reason: `${PROVIDER_KIND_LABELS.local} runtime adapter is available for deterministic placeholder execution.`,
      checkedAt,
    };
  }

  async execute(request: AgentRequest): Promise<AgentResponse> {
    const validation = validateAgentRequestEnvelope(request);

    if (!validation.valid) {
      return createFailedAgentResponse({
        requestEnvelopeId: request.envelopeId,
        agentId: request.agentId,
        providerKind: PROVIDER_KIND_LOCAL,
        lifecycle: "failed",
        reason: validation.reason,
      });
    }

    if (request.providerKind !== PROVIDER_KIND_LOCAL) {
      return createFailedAgentResponse({
        requestEnvelopeId: request.envelopeId,
        agentId: request.agentId,
        providerKind: PROVIDER_KIND_LOCAL,
        lifecycle: "failed",
        reason: `Execute reject: provider kind "${request.providerKind}" does not match "${PROVIDER_KIND_LOCAL}".`,
      });
    }

    const startedAtMs = Date.now();
    const lifecycle = advanceToReady(advanceToValidated(advanceToPrepared(request.lifecycle)));
    const { response } = createCompletedLocalRuntimeExecution({
      request: { ...request, lifecycle },
      startedAtMs,
    });

    return response;
  }
}

/** Shared local runtime adapter singleton. */
export const localRuntimeAdapter = new LocalRuntimeAdapter();

/**
 * Resolve whether execute() may be invoked for a provider kind.
 */
export function isLocalRuntimeExecutionEnabled(providerKind: string): boolean {
  return providerKind === PROVIDER_KIND_LOCAL;
}
