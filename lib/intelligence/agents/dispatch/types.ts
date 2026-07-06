import type { AgentCapability } from "@/lib/intelligence/agents/registry/types";

/** Semantic version of the agent dispatch foundation. */
export const AGENT_DISPATCH_VERSION = "0.1.0-agent-dispatch";

/** Dispatch policy mode (BUILD-049). */
export type DispatchPolicyMode =
  | "first-matching-agent"
  | "highest-capability-score"
  | "single-agent-only"
  | "future-multi-agent";

/** Dispatch decision outcome. */
export type DispatchDecision =
  | "selected"
  | "rejected"
  | "deferred"
  | "unsupported";

/** Candidate agent summary for dispatch audit. */
export interface DispatchCandidateAgent {
  /** Agent id. */
  agentId: string;
  /** Agent display name. */
  name: string;
  /** Whether the agent passed eligibility checks. */
  eligible: boolean;
  /** Deterministic eligibility reason. */
  reason: string;
  /** Count of requested capabilities matched. */
  capabilityScore: number;
}

/** Summary of active dispatch policy for audit. */
export interface DispatchPolicySummary {
  /** Active policy mode. */
  mode: DispatchPolicyMode;
  /** Human-readable policy label. */
  label: string;
  /** Whether multi-agent dispatch is reserved. */
  multiAgentReserved: boolean;
}

/** Dispatch policy configuration. */
export interface DispatchPolicy {
  /** Selection algorithm mode. */
  mode: DispatchPolicyMode;
}

/** Assignment validation result. */
export interface DispatchAssignmentValidation {
  /** Whether assignment is valid. */
  valid: boolean;
  /** Agent id validated. */
  agentId: string;
  /** Deterministic validation reason. */
  reason: string;
}

/** Rejection reason codes for deterministic filtering. */
export type DispatchRejectionReason =
  | "agent-disabled"
  | "agent-deprecated"
  | "agent-not-enabled"
  | "capability-mismatch"
  | "entity-mismatch"
  | "intelligence-type-mismatch"
  | "agent-not-found"
  | "single-agent-mismatch";

/** Labels for dispatch policy modes. */
export const DISPATCH_POLICY_MODE_LABELS: Record<DispatchPolicyMode, string> = {
  "first-matching-agent": "First Matching Agent",
  "highest-capability-score": "Highest Capability Score",
  "single-agent-only": "Single Agent Only",
  "future-multi-agent": "Future Multi-Agent (Reserved)",
};

/** Capability score weight is count-only in BUILD-049. */
export type DispatchCapabilityScore = number;

/** Reserved capability list type alias for policy scoring. */
export type DispatchRequiredCapabilities = readonly AgentCapability[];
