import {
  advanceToPrepared,
  advanceToReady,
  advanceToValidated,
} from "@/lib/intelligence/agents/runtime/agent-lifecycle";
import {
  createAgentRequest,
  validateAgentRequestEnvelope,
  type AgentRequest,
} from "@/lib/intelligence/agents/runtime/agent-request";
import {
  createAgentResponse,
  createFailedAgentResponse,
  createUnsupportedExecutionResponse,
  type AgentResponse,
} from "@/lib/intelligence/agents/runtime/agent-response";
import {
  ALL_PROVIDER_KINDS,
  PROVIDER_KIND_DESCRIPTIONS,
  PROVIDER_KIND_LABELS,
  type ProviderKind,
} from "@/lib/intelligence/agents/runtime/provider-kinds";
import type {
  AgentHealthResult,
  AgentOperationResult,
  AgentSupportResult,
} from "@/lib/intelligence/agents/runtime/types";
import { AGENT_RUNTIME_CONTRACT_VERSION } from "@/lib/intelligence/agents/runtime/types";

/** Stable contract identifier prefix. */
export const AGENT_RUNTIME_CONTRACT_ID_PREFIX = "agent-runtime-contract";

/**
 * Contract all agent backends must implement (BUILD-047).
 *
 * Defines prepare, validate, describe, supports, and health operations.
 * execute() exists as a signature only — no provider execution in BUILD-047.
 */
export interface AgentRuntimeContract {
  /** Provider kind served by this backend. */
  readonly providerKind: ProviderKind;

  /** Stable contract identifier. */
  readonly contractId: string;

  /** Contract semantic version. */
  readonly contractVersion: string;

  /** Prepare an agent request envelope for validation. */
  prepare(request: AgentRequest): AgentOperationResult;

  /** Validate an agent request envelope against contract rules. */
  validate(request: AgentRequest): AgentOperationResult;

  /** Describe the backend and linked agent metadata. */
  describe(request: AgentRequest): AgentOperationResult;

  /** Declare whether this backend supports the request envelope. */
  supports(request: AgentRequest): AgentSupportResult;

  /** Report backend health — no external calls in BUILD-047. */
  health(): AgentHealthResult;

  /**
   * Execute an agent request — reserved signature only.
   *
   * Stub implementations MUST NOT call provider SDKs or return fabricated output.
   */
  execute(request: AgentRequest): Promise<AgentResponse>;
}

/**
 * Base stub implementation shared by all provider backends (BUILD-047).
 */
abstract class StubAgentRuntimeContract implements AgentRuntimeContract {
  abstract readonly providerKind: ProviderKind;

  get contractId(): string {
    return `${AGENT_RUNTIME_CONTRACT_ID_PREFIX}-${this.providerKind}`;
  }

  get contractVersion(): string {
    return AGENT_RUNTIME_CONTRACT_VERSION;
  }

  prepare(request: AgentRequest): AgentOperationResult {
    const validation = validateAgentRequestEnvelope(request);

    if (!validation.valid) {
      return { accepted: false, reason: validation.reason };
    }

    if (request.providerKind !== this.providerKind) {
      return {
        accepted: false,
        reason: `Prepare reject: provider kind "${request.providerKind}" does not match "${this.providerKind}".`,
      };
    }

    const lifecycle = advanceToPrepared(request.lifecycle);
    const response = createAgentResponse({
      requestEnvelopeId: request.envelopeId,
      agentId: request.agentId,
      providerKind: this.providerKind,
      status: "prepared",
      lifecycle,
      reason: `Agent request prepared for ${PROVIDER_KIND_LABELS[this.providerKind]} backend.`,
    });

    return { accepted: true, response };
  }

  validate(request: AgentRequest): AgentOperationResult {
    const validation = validateAgentRequestEnvelope(request);

    if (!validation.valid) {
      return { accepted: false, reason: validation.reason };
    }

    if (request.providerKind !== this.providerKind) {
      return {
        accepted: false,
        reason: `Validate reject: provider kind "${request.providerKind}" does not match "${this.providerKind}".`,
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
      providerKind: this.providerKind,
      status: "validated",
      lifecycle,
      reason: `Agent request validated for ${PROVIDER_KIND_LABELS[this.providerKind]} backend.`,
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
      providerKind: this.providerKind,
      status: "described",
      lifecycle: request.lifecycle,
      reason: `${PROVIDER_KIND_DESCRIPTIONS[this.providerKind]}${definitionDescription}`,
    });

    return { accepted: true, response };
  }

  supports(request: AgentRequest): AgentSupportResult {
    const validation = validateAgentRequestEnvelope(request);

    if (!validation.valid) {
      return {
        supported: false,
        reason: validation.reason,
        providerKind: this.providerKind,
      };
    }

    if (request.providerKind !== this.providerKind) {
      return {
        supported: false,
        reason: `Support reject: provider kind "${request.providerKind}" does not match "${this.providerKind}".`,
        providerKind: this.providerKind,
      };
    }

    return {
      supported: true,
      reason: `${PROVIDER_KIND_LABELS[this.providerKind]} backend declares support for this request envelope.`,
      providerKind: this.providerKind,
    };
  }

  health(): AgentHealthResult {
    const checkedAt = new Date().toISOString();

    return {
      healthy: true,
      providerKind: this.providerKind,
      status: "unconfigured",
      reason: `${PROVIDER_KIND_LABELS[this.providerKind]} backend contract is available — provider not connected in BUILD-047.`,
      checkedAt,
    };
  }

  async execute(request: AgentRequest): Promise<AgentResponse> {
    const validation = validateAgentRequestEnvelope(request);

    if (!validation.valid) {
      return createFailedAgentResponse({
        requestEnvelopeId: request.envelopeId,
        agentId: request.agentId,
        providerKind: this.providerKind,
        lifecycle: "failed",
        reason: validation.reason,
      });
    }

    const lifecycle = advanceToReady(advanceToValidated(advanceToPrepared(request.lifecycle)));

    return createUnsupportedExecutionResponse({
      requestEnvelopeId: request.envelopeId,
      agentId: request.agentId,
      providerKind: this.providerKind,
      lifecycle,
    });
  }
}

/** Stub OpenAI agent backend — contract only, no SDK calls. */
export class StubOpenAIAgentBackend extends StubAgentRuntimeContract {
  readonly providerKind = "openai" as const;
}

/** Stub Anthropic agent backend — contract only, no SDK calls. */
export class StubAnthropicAgentBackend extends StubAgentRuntimeContract {
  readonly providerKind = "anthropic" as const;
}

/** Stub Gemini agent backend — contract only, no SDK calls. */
export class StubGeminiAgentBackend extends StubAgentRuntimeContract {
  readonly providerKind = "gemini" as const;
}

/** Stub local agent backend — contract only, no execution. */
export class StubLocalAgentBackend extends StubAgentRuntimeContract {
  readonly providerKind = "local" as const;
}

/** Shared stub backend instances keyed by provider kind. */
export const STUB_AGENT_RUNTIME_CONTRACTS: Readonly<Record<ProviderKind, AgentRuntimeContract>> = {
  openai: new StubOpenAIAgentBackend(),
  anthropic: new StubAnthropicAgentBackend(),
  gemini: new StubGeminiAgentBackend(),
  local: new StubLocalAgentBackend(),
};

/**
 * Resolve a stub agent runtime contract by provider kind.
 */
export function resolveAgentRuntimeContract(
  providerKind: ProviderKind,
): AgentRuntimeContract {
  return STUB_AGENT_RUNTIME_CONTRACTS[providerKind];
}

/**
 * List all stub agent runtime contracts in deterministic provider order.
 */
export function listAgentRuntimeContracts(): readonly AgentRuntimeContract[] {
  return ALL_PROVIDER_KINDS.map((kind) => STUB_AGENT_RUNTIME_CONTRACTS[kind]);
}

export { createAgentRequest, type AgentRequest };
