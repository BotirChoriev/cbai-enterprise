/**
 * CBAI Intelligence Engine — Orchestrator (BUILD-040).
 *
 * Central coordinator for intelligence module execution.
 * Does not generate intelligence — coordinates existing modules only.
 *
 * @see docs/build-040-report.md
 */

export {
  DEFAULT_INTELLIGENCE_ORCHESTRATOR_ID,
  DefaultIntelligenceOrchestrator,
  INTELLIGENCE_ORCHESTRATOR_VERSION,
  createOrchestratorRunId,
  defaultIntelligenceOrchestrator,
  executeOrchestratedRun,
  type IntelligenceOrchestrator,
} from "@/lib/intelligence/orchestrator/orchestrator";

export {
  appendContextBlockingIssues,
  appendContextWarnings,
  createOrchestratorExecutionContext,
  finalizeExecutionContext,
  markStageComplete,
  markStageFailed,
  markStageRunning,
  markStagesSkipped,
  type OrchestratorExecutionContext,
  type OrchestratorExecutionStatus,
} from "@/lib/intelligence/orchestrator/execution-context";

export {
  ORCHESTRATOR_REQUIRED_STAGES,
  ORCHESTRATOR_STAGE_NAMES,
  ORCHESTRATOR_STAGE_ORDER,
  buildExecutionPlan,
  findNextEnabledStage,
  isExecutionPlanComplete,
  resolveStageEnabled,
} from "@/lib/intelligence/orchestrator/execution-plan";

export {
  DEFAULT_ORCHESTRATOR_POLICIES,
  ORCHESTRATOR_POLICY_LABELS,
  POLICY_CONTINUE_ON_WARNING,
  POLICY_RUN_DIAGNOSTICS_ALWAYS,
  POLICY_STOP_ON_BLOCKING_CONFLICT,
  POLICY_STOP_ON_CRITICAL_FAILURE,
  shouldStopOnBlockingConflict,
  shouldStopOnCriticalFailure,
  shouldStopOnWarning,
  type OrchestratorPolicies,
} from "@/lib/intelligence/orchestrator/policies";

export type {
  ExecutionPlan,
  ExecutionPlanStage,
  OrchestrationSummary,
  OrchestratorRunOutcome,
  OrchestratorRunResult,
  OrchestratorStageId,
  OrchestratorStageStatus,
} from "@/lib/intelligence/orchestrator/types";
