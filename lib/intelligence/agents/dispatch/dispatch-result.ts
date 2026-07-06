import type {
  DispatchCandidateAgent,
  DispatchDecision,
} from "@/lib/intelligence/agents/dispatch/types";
import { AGENT_DISPATCH_VERSION } from "@/lib/intelligence/agents/dispatch/types";

/**
 * Agent dispatch result envelope (BUILD-049).
 *
 * Selection metadata only — no agent execution or fabricated output.
 */
export interface DispatchResult {
  /** Selected agent id when decision is selected. */
  selectedAgentId: string | null;
  /** Dispatch decision outcome. */
  decision: DispatchDecision;
  /** Deterministic selection reason. */
  reason: string;
  /** Non-blocking warnings collected during selection. */
  warnings: readonly string[];
  /** All evaluated candidates with eligibility metadata. */
  candidateAgents: readonly DispatchCandidateAgent[];
  /** ISO-8601 timestamp when dispatch completed. */
  timestamp: string;
  /** Dispatch foundation semantic version. */
  dispatchVersion: string;
}

/**
 * Create a dispatch result envelope.
 */
export function createDispatchResult(input: {
  selectedAgentId: string | null;
  decision: DispatchDecision;
  reason: string;
  warnings?: readonly string[];
  candidateAgents: readonly DispatchCandidateAgent[];
  timestamp: string;
}): DispatchResult {
  return {
    selectedAgentId: input.selectedAgentId,
    decision: input.decision,
    reason: input.reason,
    warnings: input.warnings ? [...input.warnings] : [],
    candidateAgents: [...input.candidateAgents],
    timestamp: input.timestamp,
    dispatchVersion: AGENT_DISPATCH_VERSION,
  };
}

/**
 * Create a rejected dispatch result.
 */
export function createRejectedDispatchResult(input: {
  reason: string;
  warnings?: readonly string[];
  candidateAgents: readonly DispatchCandidateAgent[];
  timestamp: string;
}): DispatchResult {
  return createDispatchResult({
    selectedAgentId: null,
    decision: "rejected",
    reason: input.reason,
    warnings: input.warnings,
    candidateAgents: input.candidateAgents,
    timestamp: input.timestamp,
  });
}

/**
 * Create an unsupported dispatch result for reserved policies.
 */
export function createUnsupportedDispatchResult(input: {
  reason: string;
  candidateAgents?: readonly DispatchCandidateAgent[];
  timestamp: string;
}): DispatchResult {
  return createDispatchResult({
    selectedAgentId: null,
    decision: "unsupported",
    reason: input.reason,
    warnings: [],
    candidateAgents: input.candidateAgents ?? [],
    timestamp: input.timestamp,
  });
}

/**
 * Produce a shallow copy of a dispatch result.
 */
export function copyDispatchResult(result: DispatchResult): DispatchResult {
  return {
    ...result,
    warnings: [...result.warnings],
    candidateAgents: result.candidateAgents.map((candidate) => ({ ...candidate })),
  };
}

/**
 * Returns true when dispatch selected an agent.
 */
export function isDispatchSelected(result: DispatchResult): boolean {
  return result.decision === "selected" && result.selectedAgentId !== null;
}
