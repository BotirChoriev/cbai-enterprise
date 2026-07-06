import type { ProviderKind } from "@/lib/intelligence/agents/runtime/provider-kinds";
import { PROVIDER_KIND_LOCAL } from "@/lib/intelligence/agents/runtime/provider-kinds";

/** Semantic version of the local runtime adapter foundation. */
export const LOCAL_RUNTIME_ADAPTER_VERSION = "0.1.0-local-runtime-adapter";

/** Local execution classification — deterministic placeholder only. */
export type LocalExecutionType = "deterministic";

/** Completed local execution status. */
export type LocalExecutionStatus = "completed" | "failed";

/**
 * Deterministic local runtime execution result (BUILD-055).
 *
 * Placeholder output only — no AI reasoning or business conclusions.
 */
export interface LocalRuntimeExecutionResult {
  /** Execution outcome status. */
  status: LocalExecutionStatus;
  /** Provider kind — always local. */
  providerKind: typeof PROVIDER_KIND_LOCAL;
  /** Execution classification. */
  executionType: LocalExecutionType;
  /** Non-blocking warnings. */
  warnings: readonly string[];
  /** Blocking errors. */
  errors: readonly string[];
  /** Factual execution summary — no intelligence content. */
  executionSummary: string;
  /** Wall-clock execution duration in milliseconds. */
  executionDurationMs: number;
}

/**
 * Diagnostics surfaced after local runtime execution.
 */
export interface LocalRuntimeExecutionDiagnostics {
  /** Provider kind. */
  providerKind: ProviderKind;
  /** Execution classification. */
  executionType: LocalExecutionType;
  /** Wall-clock execution duration in milliseconds. */
  executionDurationMs: number;
}

/** Default deterministic execution summary text. */
export const LOCAL_RUNTIME_EXECUTION_SUMMARY =
  "Local deterministic execution completed.";
