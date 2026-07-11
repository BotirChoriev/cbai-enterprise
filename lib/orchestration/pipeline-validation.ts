import type { IntelligencePipelineProviders } from "@/lib/orchestration/pipeline-types";

export interface PipelineProvidersValidationResult {
  valid: boolean;
  issues: readonly string[];
}

/**
 * Deterministic structural validation only — confirms a domain has supplied the required,
 * domain-specific provider functions before the pipeline is run, not that they behave
 * correctly. `reason` and `buildWorkflow` are optional (they default to the real engines), so
 * their absence is never an issue.
 */
export function validateIntelligencePipelineProviders(
  providers: IntelligencePipelineProviders,
): PipelineProvidersValidationResult {
  const issues: string[] = [];

  if (typeof providers.resolveFoundation !== "function") {
    issues.push("Pipeline providers must supply resolveFoundation.");
  }
  if (typeof providers.discoverEvidence !== "function") {
    issues.push("Pipeline providers must supply discoverEvidence.");
  }
  if (typeof providers.resolveRelationships !== "function") {
    issues.push("Pipeline providers must supply resolveRelationships.");
  }

  return { valid: issues.length === 0, issues };
}
