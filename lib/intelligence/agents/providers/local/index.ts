/**
 * CBAI Intelligence — Local Runtime Adapter (BUILD-055).
 *
 * Deterministic placeholder execution for the local provider.
 * Not an AI model — no external APIs or provider SDKs.
 *
 * @see docs/build-055-report.md
 */

export {
  LOCAL_RUNTIME_ADAPTER_CONTRACT_ID,
  LocalRuntimeAdapter,
  localRuntimeAdapter,
  isLocalRuntimeExecutionEnabled,
} from "@/lib/intelligence/agents/providers/local/local-runtime-adapter";

export {
  buildCompletedLocalExecutionResult,
  buildFailedLocalExecutionResult,
  isTerminalLocalRuntimeState,
  resolveLocalRuntimeState,
  type LocalRuntimeState,
} from "@/lib/intelligence/agents/providers/local/local-runtime-state";

export {
  buildLocalRuntimeExecutionDiagnostics,
  createCompletedLocalRuntimeExecution,
  createFailedLocalRuntimeExecution,
  createLocalExecutionAgentResponse,
} from "@/lib/intelligence/agents/providers/local/local-runtime-result";

export { LOCAL_RUNTIME_EXECUTION_SUMMARY, LOCAL_RUNTIME_ADAPTER_VERSION } from "@/lib/intelligence/agents/providers/local/types";

export type {
  LocalExecutionStatus,
  LocalExecutionType,
  LocalRuntimeExecutionDiagnostics,
  LocalRuntimeExecutionResult,
} from "@/lib/intelligence/agents/providers/local/types";
