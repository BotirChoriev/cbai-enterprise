import type { ConfidenceAssessment } from "@/lib/intelligence/confidence.types";
import type { GraphContext, MemoryContext } from "@/lib/intelligence/context.types";
import type { EvidenceCollection } from "@/lib/intelligence/evidence.types";
import type { IntelligenceRequest } from "@/lib/intelligence/request.types";
import {
  TRACE_TIMELINE_STAGE_ORDER,
  type StageTimelineEntry,
} from "@/lib/intelligence/trace/timeline";
import type {
  TraceVerificationResult,
  TraceVerificationSummary,
} from "@/lib/intelligence/trace.types";
import type { TrustAssessment } from "@/lib/intelligence/trust.types";

/**
 * Input required for pipeline trace verification (BUILD-028).
 */
export interface PipelineTraceVerificationInput {
  request: IntelligenceRequest;
  evidence: EvidenceCollection;
  confidence: ConfidenceAssessment;
  trust: TrustAssessment;
  graphContext: GraphContext;
  memoryContext: MemoryContext;
  timeline: StageTimelineEntry[];
}

/**
 * Derive factual audit warnings from layer outputs — no fabricated reasoning.
 */
export function collectPipelineWarnings(
  input: PipelineTraceVerificationInput,
): string[] {
  const warnings: string[] = [];

  if (input.evidence.items.length === 0) {
    warnings.push("Evidence collection returned zero items.");
  }

  if (input.evidence.metadata?.status === "no-sources-connected") {
    warnings.push("Evidence source adapters are not connected.");
  }

  if (input.confidence.degraded) {
    warnings.push(
      input.confidence.degradationReason ??
        "Confidence assessment is in degraded mode.",
    );
  }

  if (input.trust.trustScore === 0) {
    warnings.push(
      "Trust score is zero — organizational reliance is not supported.",
    );
  }

  if (input.graphContext.metadata?.status === "graph-context-not-connected") {
    warnings.push(
      "Graph context requested but Knowledge Graph adapter is not connected.",
    );
  }

  if (input.graphContext.metadata?.status === "disabled") {
    warnings.push("Graph context was disabled for this run.");
  }

  if (input.memoryContext.metadata?.status === "memory-not-connected") {
    warnings.push(
      "Memory context requested but memory store is not connected.",
    );
  }

  if (input.memoryContext.metadata?.status === "disabled") {
    warnings.push("Memory context was disabled for this run.");
  }

  for (const cap of input.trust.capsApplied) {
    warnings.push(`Trust cap applied: ${cap}`);
  }

  return warnings;
}

/**
 * Identify requested context layers that are not connected.
 */
export function collectMissingContext(
  input: PipelineTraceVerificationInput,
): string[] {
  const missing: string[] = [];

  if (
    input.request.includeGraph === true &&
    input.graphContext.metadata?.status === "graph-context-not-connected"
  ) {
    missing.push("graph");
  }

  if (
    input.request.includeMemory === true &&
    input.memoryContext.metadata?.status === "memory-not-connected"
  ) {
    missing.push("memory");
  }

  if (input.evidence.metadata?.status === "no-sources-connected") {
    missing.push("evidence-sources");
  }

  return missing;
}

/**
 * Verify required pipeline stages executed with complete status.
 */
export function verifyRequiredStagesExecuted(
  timeline: StageTimelineEntry[],
): boolean {
  for (const stageId of TRACE_TIMELINE_STAGE_ORDER) {
    const entry = timeline.find((item) => item.stageId === stageId);

    if (!entry || entry.status !== "complete") {
      return false;
    }
  }

  return true;
}

/**
 * Verify timeline stage order matches canonical pipeline order.
 */
export function verifyPipelineIntegrity(timeline: StageTimelineEntry[]): boolean {
  const executedIds = timeline.map((entry) => entry.stageId);

  let lastIndex = -1;

  for (const stageId of executedIds) {
    const index = TRACE_TIMELINE_STAGE_ORDER.indexOf(stageId);

    if (index === -1) {
      return false;
    }

    if (index < lastIndex) {
      return false;
    }

    lastIndex = index;
  }

  return true;
}

/**
 * Resolve overall verification result from check outcomes.
 */
export function resolveVerificationResult(
  requiredStagesExecuted: boolean,
  pipelineIntegrity: boolean,
  degradedExecution: boolean,
): TraceVerificationResult {
  if (!requiredStagesExecuted || !pipelineIntegrity) {
    return "fail";
  }

  if (degradedExecution) {
    return "degraded";
  }

  return "pass";
}

/**
 * Verify pipeline execution and return summary only — no AI reasoning.
 */
export function verifyPipelineTrace(
  input: PipelineTraceVerificationInput,
): TraceVerificationSummary {
  const warnings = collectPipelineWarnings(input);
  const missingContext = collectMissingContext(input);
  const requiredStagesExecuted = verifyRequiredStagesExecuted(input.timeline);
  const pipelineIntegrity = verifyPipelineIntegrity(input.timeline);
  const degradedExecution =
    input.confidence.degraded ||
    input.evidence.items.length === 0 ||
    missingContext.length > 0 ||
    warnings.length > 0;

  const result = resolveVerificationResult(
    requiredStagesExecuted,
    pipelineIntegrity,
    degradedExecution,
  );

  return {
    result,
    requiredStagesExecuted,
    pipelineIntegrity,
    missingContext,
    degradedExecution,
    warnings,
  };
}
