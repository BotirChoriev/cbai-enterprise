import type { ReasoningInput } from "@/lib/foundation/reasoning-types";
import type { PlatformValidationResult } from "@/lib/foundation/validation-types";

/** Promoted to lib/foundation/validation-types.ts — re-exported here so existing imports keep working. */
export type ReasoningInputValidationResult = PlatformValidationResult;

/**
 * Deterministic structural validation only — confirms the input is complete enough to reason
 * over, not that its content is true. An empty evidence array is not an issue: the framework
 * must be able to honestly reason over "no evidence yet" rather than refuse to run.
 */
export function validateReasoningInput(input: ReasoningInput): ReasoningInputValidationResult {
  const issues: string[] = [];

  if (!input.subjectId.trim()) {
    issues.push("Reasoning input is missing a subjectId.");
  }
  if (!input.question.questionId.trim()) {
    issues.push("Reasoning input's question is missing a questionId.");
  }
  if (!input.question.question.trim()) {
    issues.push("Reasoning input's question is missing question text.");
  }

  return { valid: issues.length === 0, issues };
}
