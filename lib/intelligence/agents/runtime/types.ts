import type { AgentResponse } from "@/lib/intelligence/agents/runtime/agent-response";
import type { ProviderKind } from "@/lib/intelligence/agents/runtime/provider-kinds";

/** Semantic version of the agent runtime contract foundation. */
export const AGENT_RUNTIME_CONTRACT_VERSION = "0.1.0-agent-runtime-contract";

/** Result of an agent support check. */
export interface AgentSupportResult {
  /** Whether this backend declares support for the request. */
  supported: boolean;
  /** Deterministic reason for the support decision. */
  reason: string;
  /** Provider kind evaluated. */
  providerKind: ProviderKind;
}

/** Agent backend health status (metadata only). */
export type AgentHealthStatus = "available" | "unconfigured" | "unsupported";

/** Result of an agent health check — no external calls in BUILD-047. */
export interface AgentHealthResult {
  /** Whether the backend reports a healthy catalog state. */
  healthy: boolean;
  /** Provider kind checked. */
  providerKind: ProviderKind;
  /** Health classification. */
  status: AgentHealthStatus;
  /** Deterministic health reason. */
  reason: string;
  /** ISO-8601 timestamp when health was checked. */
  checkedAt: string;
}

/** Result of prepare / validate / describe operations. */
export interface AgentOperationResult {
  /** Whether the operation succeeded. */
  accepted: boolean;
  /** Optional response envelope when accepted. */
  response?: AgentResponse;
  /** Rejection or note reason when not accepted. */
  reason?: string;
}
