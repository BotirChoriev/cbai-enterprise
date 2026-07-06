import type { IntelligencePipelineStageId } from "@/lib/intelligence/pipeline-stage.types";
import { IntelligencePipelineError } from "@/lib/intelligence/engine/errors";
import {
  stageConfidenceAssessment,
  stageContradictionDetection,
  stageEvidenceCollection,
  stageGraphContext,
  stageIntelligenceResult,
  stageMemoryContext,
  stageReasoningTrace,
  stageRequest,
  stageTrustAssessment,
  type PipelineContext,
} from "@/lib/intelligence/engine/stages";
import {
  attachDiagnosticsToResult,
  defaultDiagnosticsBuilder,
} from "@/lib/intelligence/diagnostics";
import { extractRuntimePolicyDiagnostics } from "@/lib/intelligence/runtime/integration/runtime-policy-diagnostics";
import {
  evaluateAndEnforceRuntimePolicy,
  registerRuntimeSession,
  updateRuntimeSessionRegistry,
} from "@/lib/intelligence/runtime/integration/runtime-integration";
import { isTestRuntimeCancelRequest } from "@/lib/intelligence/runtime/integration/runtime-policy-diagnostics";
import {
  appendContextBlockingIssues,
  appendContextWarnings,
  createOrchestratorExecutionContext,
  finalizeExecutionContext,
  markStageComplete,
  markStageFailed,
  markStageRunning,
  markStagesSkipped,
  type OrchestratorExecutionContext,
} from "@/lib/intelligence/orchestrator/execution-context";
import { buildExecutionPlan } from "@/lib/intelligence/orchestrator/execution-plan";
import {
  DEFAULT_ORCHESTRATOR_POLICIES,
  shouldStopOnBlockingConflict,
  shouldStopOnCriticalFailure,
  shouldStopOnWarning,
  type OrchestratorPolicies,
} from "@/lib/intelligence/orchestrator/policies";
import type {
  OrchestrationSummary,
  OrchestratorRunOutcome,
  OrchestratorRunResult,
  OrchestratorStageId,
} from "@/lib/intelligence/orchestrator/types";
import type { IntelligenceRequest } from "@/lib/intelligence/request.types";
import type { IntelligenceResult } from "@/lib/intelligence/result.types";
import type { PolicyDecision } from "@/lib/intelligence/runtime/policy/types";
import { createTimelineEntry } from "@/lib/intelligence/trace";
import { defaultIntelligenceRuntime } from "@/lib/intelligence/runtime";
import { defaultSessionRegistry } from "@/lib/intelligence/runtime/registry";

/** Semantic version of the default intelligence orchestrator. */
export const INTELLIGENCE_ORCHESTRATOR_VERSION = "0.1.1-runtime-integration";

/** Stable identifier for audit metadata. */
export const DEFAULT_INTELLIGENCE_ORCHESTRATOR_ID = "default-intelligence-orchestrator";

/** Maps orchestrator stages to pipeline timeline stage ids. */
const ORCHESTRATOR_TO_PIPELINE_STAGE: Partial<
  Record<OrchestratorStageId, IntelligencePipelineStageId>
> = {
  request: "request",
  evidence: "evidence-collection",
  contradictions: "contradiction-detection",
  confidence: "confidence-assessment",
  trust: "trust-assessment",
  graph: "graph-context",
  memory: "memory-context",
  trace: "reasoning-trace",
  result: "intelligence-result",
};

/**
 * Contract for the CBAI Intelligence Orchestrator (BUILD-040).
 *
 * Coordinates existing intelligence modules — does not generate intelligence.
 */
export interface IntelligenceOrchestrator {
  /**
   * Execute an intelligence run with deterministic stage orchestration.
   */
  execute(
    request: IntelligenceRequest,
    policies?: OrchestratorPolicies,
  ): Promise<OrchestratorRunResult>;

  /**
   * Build an execution plan without running stages.
   */
  plan(
    request: IntelligenceRequest,
    policies?: OrchestratorPolicies,
  ): ReturnType<typeof buildExecutionPlan>;
}

/**
 * Generate a unique run identifier for orchestration correlation.
 */
export function createOrchestratorRunId(request: IntelligenceRequest): string {
  return `run-${request.id}-${Date.now()}`;
}

/**
 * Default intelligence orchestrator for the CBAI Intelligence Engine (BUILD-040).
 */
export class DefaultIntelligenceOrchestrator implements IntelligenceOrchestrator {
  plan(
    request: IntelligenceRequest,
    policies: OrchestratorPolicies = DEFAULT_ORCHESTRATOR_POLICIES,
  ) {
    return buildExecutionPlan(request, policies);
  }

  /**
   * Coordinate all intelligence engine modules for a single request.
   */
  async execute(
    request: IntelligenceRequest,
    policies: OrchestratorPolicies = DEFAULT_ORCHESTRATOR_POLICIES,
  ): Promise<OrchestratorRunResult> {
    const runId = createOrchestratorRunId(request);
    const startedAt = new Date().toISOString();
    const plan = buildExecutionPlan(request, policies);
    const context = createOrchestratorExecutionContext({
      runId,
      requestId: request.id,
      startedAt,
      plan,
    });

    const runtimeSession = defaultIntelligenceRuntime.createSession(request, policies);
    registerRuntimeSession(runtimeSession, defaultSessionRegistry, startedAt);
    runtimeSession.start(startedAt);
    updateRuntimeSessionRegistry(runtimeSession, defaultSessionRegistry, startedAt);

    if (isTestRuntimeCancelRequest(request.id)) {
      runtimeSession.cancel("Deterministic harness cancel trigger.", startedAt);
      updateRuntimeSessionRegistry(runtimeSession, defaultSessionRegistry, startedAt);
    }

    let stoppedEarly = false;
    let lastPolicyDecision: PolicyDecision | undefined;

    const policyOutcome = evaluateAndEnforceRuntimePolicy({
      session: runtimeSession,
      context,
      plan,
      registry: defaultSessionRegistry,
      evaluatedAt: startedAt,
    });

    lastPolicyDecision = policyOutcome.decision;

    if (!policyOutcome.continueExecution) {
      stoppedEarly = true;
      markStagesSkipped(context, plan.stages.find((stage) => stage.enabled)?.id ?? "request");
    }

    try {
      for (const stage of plan.stages) {
        if (!stage.enabled || stage.status !== "pending") {
          continue;
        }

        if (stoppedEarly) {
          stage.status = "skipped";
          context.skippedStages.push(stage.id);
          continue;
        }

        const preStagePolicy = evaluateAndEnforceRuntimePolicy({
          session: runtimeSession,
          context,
          plan,
          registry: defaultSessionRegistry,
        });

        lastPolicyDecision = preStagePolicy.decision;

        if (!preStagePolicy.continueExecution) {
          stoppedEarly = true;
          stage.status = "skipped";
          context.skippedStages.push(stage.id);
          markStagesSkipped(context, stage.id);
          updateRuntimeSessionRegistry(runtimeSession, defaultSessionRegistry);
          break;
        }

        markStageRunning(context, stage.id);
        runtimeSession.onStageStarted(stage.id);
        updateRuntimeSessionRegistry(runtimeSession, defaultSessionRegistry);

        try {
          await this.executeStage(context, stage.id, policies, request);
          markStageComplete(context, stage.id);
          runtimeSession.onStageCompleted(stage.id);
          updateRuntimeSessionRegistry(runtimeSession, defaultSessionRegistry);

          if (stage.id === "contradictions") {
            const postContradictionPolicy = evaluateAndEnforceRuntimePolicy({
              session: runtimeSession,
              context,
              plan,
              registry: defaultSessionRegistry,
            });

            lastPolicyDecision = postContradictionPolicy.decision;

            if (!postContradictionPolicy.continueExecution) {
              stoppedEarly = true;
              markStagesSkipped(context, "confidence");
            } else {
              stoppedEarly = this.applyBlockingConflictPolicy(context, policies);
            }
          }

          if (
            shouldStopOnWarning(policies, context.warnings.length > 0) &&
            stage.id !== "diagnostics"
          ) {
            stoppedEarly = true;
            context.stoppedReason =
              context.stoppedReason ??
              "Stopped due to warnings — ContinueOnWarning is false.";
          }
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Unknown orchestrator stage failure";

          markStageFailed(context, stage.id, message);
          runtimeSession.onStageFailed(stage.id, message);
          updateRuntimeSessionRegistry(runtimeSession, defaultSessionRegistry);

          if (shouldStopOnCriticalFailure(policies, stage.required)) {
            context.stoppedReason = `Critical failure at stage ${stage.id}: ${message}`;
            const failedAt = new Date().toISOString();
            finalizeExecutionContext(context, "failed", failedAt);
            runtimeSession.fail(context.stoppedReason, failedAt);
            updateRuntimeSessionRegistry(runtimeSession, defaultSessionRegistry);

            throw new IntelligencePipelineError(
              message,
              ORCHESTRATOR_TO_PIPELINE_STAGE[stage.id] ?? "request",
            );
          }

          stoppedEarly = true;
          context.stoppedReason =
            context.stoppedReason ?? `Non-critical failure at stage ${stage.id}: ${message}`;
        }
      }

      const finishedAt = new Date().toISOString();
      const postRunPolicy = evaluateAndEnforceRuntimePolicy({
        session: runtimeSession,
        context,
        plan,
        registry: defaultSessionRegistry,
        evaluatedAt: finishedAt,
      });

      lastPolicyDecision = postRunPolicy.decision;

      const outcome = resolveOrchestratorOutcome(context, stoppedEarly);
      finalizeExecutionContext(context, outcome, finishedAt);

      if (runtimeSession.status === "cancelled") {
        updateRuntimeSessionRegistry(runtimeSession, defaultSessionRegistry, finishedAt);
      } else if (outcome === "failed") {
        runtimeSession.fail(context.stoppedReason ?? "Orchestrator run failed.", finishedAt);
        updateRuntimeSessionRegistry(runtimeSession, defaultSessionRegistry, finishedAt);
      } else if (outcome === "stopped" && lastPolicyDecision?.decision === "deny") {
        runtimeSession.fail(
          context.stoppedReason ?? lastPolicyDecision.reason,
          finishedAt,
        );
        updateRuntimeSessionRegistry(runtimeSession, defaultSessionRegistry, finishedAt);
      } else if (outcome === "stopped") {
        runtimeSession.appendWarning(context.stoppedReason ?? "Orchestrator run stopped early.");
        updateRuntimeSessionRegistry(runtimeSession, defaultSessionRegistry, finishedAt);
      } else {
        runtimeSession.complete(finishedAt);
        updateRuntimeSessionRegistry(runtimeSession, defaultSessionRegistry, finishedAt);
      }

      runtimeSession.appendWarnings(context.warnings);
      updateRuntimeSessionRegistry(runtimeSession, defaultSessionRegistry, finishedAt);

      context.lastPolicyDecision = lastPolicyDecision;

      return {
        result: context.result ?? null,
        context,
        summary: buildOrchestrationSummary(
          context,
          outcome,
          policies,
          startedAt,
          finishedAt,
          lastPolicyDecision,
        ),
        runtime: runtimeSession.snapshot(),
      };
    } catch (error) {
      const finishedAt = new Date().toISOString();
      finalizeExecutionContext(context, "failed", finishedAt);

      if (runtimeSession.status !== "failed" && runtimeSession.status !== "cancelled") {
        const message = error instanceof Error ? error.message : "Unknown orchestrator failure";
        runtimeSession.fail(message, finishedAt);
      }

      updateRuntimeSessionRegistry(runtimeSession, defaultSessionRegistry, finishedAt);

      if (policies.runDiagnosticsAlways && context.result) {
        await this.runDiagnosticsStage(context);
      }

      throw error;
    }
  }

  /**
   * Execute a single orchestrator stage, delegating to existing modules.
   */
  private async executeStage(
    context: OrchestratorExecutionContext,
    stageId: OrchestratorStageId,
    policies: OrchestratorPolicies,
    incomingRequest: IntelligenceRequest,
  ): Promise<void> {
    switch (stageId) {
      case "request":
        context.request = await this.runTimelineStage(context, "request", () =>
          stageRequest(incomingRequest),
        );
        return;

      case "evidence":
        context.evidence = await this.runTimelineStage(context, "evidence-collection", () =>
          stageEvidenceCollection(context.request!),
        );
        this.collectEvidenceWarnings(context);
        return;

      case "quality":
        this.verifyQualityStage(context);
        return;

      case "contradictions":
        context.evidence = await this.runTimelineStage(
          context,
          "contradiction-detection",
          () => stageContradictionDetection(context.request!, context.evidence!),
        );
        this.collectContradictionSignals(context);
        return;

      case "confidence":
        context.confidence = await this.runTimelineStage(
          context,
          "confidence-assessment",
          () => stageConfidenceAssessment(context.request!, context.evidence!),
        );
        return;

      case "trust":
        context.trust = await this.runTimelineStage(context, "trust-assessment", () =>
          stageTrustAssessment(context.request!, context.evidence!, context.confidence!),
        );
        return;

      case "graph":
        context.graphContext = await this.runTimelineStage(context, "graph-context", () =>
          stageGraphContext(context.request!, context.evidence!),
        );
        return;

      case "memory":
        context.memoryContext = await this.runTimelineStage(context, "memory-context", () =>
          stageMemoryContext(context.request!, context.evidence!),
        );
        return;

      case "trace":
        context.reasoningTrace = await this.runTimelineStage(context, "reasoning-trace", () =>
          stageReasoningTrace({
            runId: context.runId,
            pipelineStartedAt: context.startedAt,
            timeline: [...context.timeline],
            request: context.request!,
            evidence: context.evidence!,
            confidence: context.confidence!,
            trust: context.trust!,
            graphContext: context.graphContext!,
            memoryContext: context.memoryContext!,
          }),
        );
        appendContextWarnings(context, context.reasoningTrace.warnings);
        return;

      case "result": {
        const pipelineContext: PipelineContext = {
          request: context.request!,
          runId: context.runId,
          startedAt: context.startedAt,
          evidence: context.evidence!,
          confidence: context.confidence!,
          trust: context.trust!,
          graphContext: context.graphContext,
          memoryContext: context.memoryContext,
          reasoningTrace: context.reasoningTrace!,
          result: {} as IntelligenceResult,
        };

        context.result = await this.runTimelineStage(context, "intelligence-result", () =>
          stageIntelligenceResult(pipelineContext),
        );
        appendContextWarnings(context, context.result.warnings);
        return;
      }

      case "diagnostics":
        await this.runDiagnosticsStage(context);
        return;

      default:
        void policies;
        return;
    }
  }

  /**
   * Run diagnostics and attach to result when available.
   */
  private async runDiagnosticsStage(context: OrchestratorExecutionContext): Promise<void> {
    if (
      !context.request ||
      !context.evidence ||
      !context.confidence ||
      !context.trust ||
      !context.graphContext ||
      !context.memoryContext ||
      !context.reasoningTrace ||
      !context.result
    ) {
      context.warnings.push("Diagnostics skipped — required pipeline artifacts unavailable.");
      return;
    }

    const policyFields = extractRuntimePolicyDiagnostics(context.lastPolicyDecision);

    context.diagnostics = await defaultDiagnosticsBuilder.build({
      request: context.request,
      evidence: context.evidence,
      confidence: context.confidence,
      trust: context.trust,
      graphContext: context.graphContext,
      memoryContext: context.memoryContext,
      reasoningTrace: context.reasoningTrace,
      result: context.result,
      ...policyFields,
    });

    context.result = attachDiagnosticsToResult(context.result, context.diagnostics);
    appendContextBlockingIssues(
      context,
      context.diagnostics.issues
        .filter((issue) => issue.severity === "blocking")
        .map((issue) => issue.message),
    );
  }

  /**
   * Verify quality assessment present on evidence collection.
   */
  private verifyQualityStage(context: OrchestratorExecutionContext): void {
    if (!context.evidence) {
      throw new Error("Quality stage requires evidence collection output.");
    }

    if (!context.evidence.quality) {
      context.warnings.push("Quality stage: evidence collection quality summary is absent.");
    }
  }

  /**
   * Collect warnings from evidence metadata.
   */
  private collectEvidenceWarnings(context: OrchestratorExecutionContext): void {
    if (!context.evidence?.metadata?.warnings) {
      return;
    }

    appendContextWarnings(context, context.evidence.metadata.warnings);
  }

  /**
   * Collect contradiction blocking signals into context.
   */
  private collectContradictionSignals(context: OrchestratorExecutionContext): void {
    if (!context.evidence?.contradictionSummary?.hasBlockingConflict) {
      return;
    }

    appendContextBlockingIssues(context, [
      `Blocking evidence contradiction detected (${context.evidence.contradictionSummary.totalContradictions} conflict(s)).`,
    ]);
  }

  /**
   * Apply stop-on-blocking-conflict policy after contradictions stage.
   */
  private applyBlockingConflictPolicy(
    context: OrchestratorExecutionContext,
    policies: OrchestratorPolicies,
  ): boolean {
    const hasBlocking = context.evidence?.contradictionSummary?.hasBlockingConflict === true;

    if (!shouldStopOnBlockingConflict(policies, hasBlocking)) {
      return false;
    }

    context.stoppedReason =
      context.stoppedReason ??
      "Stopped after contradictions — StopOnBlockingConflict policy active.";
    markStagesSkipped(context, "confidence");
    return true;
  }

  /**
   * Execute a pipeline stage with timeline capture for trace assembly.
   */
  private async runTimelineStage<T>(
    context: OrchestratorExecutionContext,
    pipelineStageId: IntelligencePipelineStageId,
    execute: () => T | Promise<T>,
  ): Promise<T> {
    const startedAt = new Date().toISOString();

    try {
      const result = await execute();
      context.timeline.push(
        createTimelineEntry(pipelineStageId, startedAt, new Date().toISOString(), "complete"),
      );
      return result;
    } catch (error) {
      context.timeline.push(
        createTimelineEntry(pipelineStageId, startedAt, new Date().toISOString(), "failed"),
      );
      throw error;
    }
  }
}

/** Shared default orchestrator singleton. */
export const defaultIntelligenceOrchestrator = new DefaultIntelligenceOrchestrator();

/**
 * Execute orchestration and return the intelligence result for engine consumers.
 */
export async function executeOrchestratedRun(
  request: IntelligenceRequest,
  policies?: OrchestratorPolicies,
): Promise<IntelligenceResult> {
  const orchestrator = defaultIntelligenceOrchestrator;
  const run = await orchestrator.execute(request, policies);

  if (!run.result) {
    throw new IntelligencePipelineError(
      run.context.stoppedReason ?? "Orchestrator completed without an intelligence result.",
      "intelligence-result",
    );
  }

  return {
    ...run.result,
    orchestration: run.summary,
    runtime: run.runtime,
  };
}

function resolveOrchestratorOutcome(
  context: OrchestratorExecutionContext,
  stoppedEarly: boolean,
): OrchestratorRunOutcome {
  if (context.failedStages.length > 0) {
    return "failed";
  }

  if (stoppedEarly || context.stoppedReason) {
    return "stopped";
  }

  return "complete";
}

function buildOrchestrationSummary(
  context: OrchestratorExecutionContext,
  outcome: OrchestratorRunOutcome,
  policies: OrchestratorPolicies,
  startedAt: string,
  finishedAt: string,
  lastPolicyDecision?: PolicyDecision,
): OrchestrationSummary {
  const startedMs = Date.parse(startedAt);
  const finishedMs = Date.parse(finishedAt);
  const policyFields = extractRuntimePolicyDiagnostics(lastPolicyDecision);

  return {
    runId: context.runId,
    outcome,
    stoppedReason: context.stoppedReason,
    stagesCompleted: context.completedStages.length,
    stagesFailed: context.failedStages.length,
    stagesSkipped: context.skippedStages.length,
    durationMs:
      Number.isFinite(startedMs) && Number.isFinite(finishedMs)
        ? Math.max(0, finishedMs - startedMs)
        : 0,
    policies: { ...policies },
    orchestratorVersion: INTELLIGENCE_ORCHESTRATOR_VERSION,
    ...policyFields,
  };
}
