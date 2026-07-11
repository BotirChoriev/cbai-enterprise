import type { PlatformValidationResult } from "@/lib/foundation/validation-types";
import type { ResearchWorkspaceContract } from "@/lib/research-workspace/research-workspace-contract";

/**
 * Deterministic structural validation only — confirms the contract has a real identity and a
 * real Mission Summary, not that its content is correct. Reuses the Platform Core's own
 * PlatformValidationResult (lib/foundation/validation-types.ts, EPIC-10) rather than declaring
 * an eighth independent `{ valid, issues }` interface. Every other section may honestly be
 * empty — "missing data must remain NULL or EMPTY" is the mission's own rule, not a defect this
 * validator should flag.
 */
export function validateResearchWorkspaceContract(
  contract: ResearchWorkspaceContract,
): PlatformValidationResult {
  const issues: string[] = [];

  if (!contract.subjectId.trim()) {
    issues.push("Research Workspace Contract is missing a subjectId.");
  }
  if (!contract.missionSummary.missionCenter.subject.subjectId.trim()) {
    issues.push("Research Workspace Contract's Mission Summary is missing a subject.");
  }
  if (!contract.missionSummary.missionCenter.question.question.trim()) {
    issues.push("Research Workspace Contract's Mission Summary is missing a question.");
  }

  return { valid: issues.length === 0, issues };
}
