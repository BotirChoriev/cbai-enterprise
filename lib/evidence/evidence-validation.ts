import type { Evidence } from "@/lib/foundation/foundation-model";
import type { PlatformValidationResult } from "@/lib/foundation/validation-types";

/** Promoted to lib/foundation/validation-types.ts — re-exported here so existing imports keep working. */
export type EvidenceValidationResult = PlatformValidationResult;

/**
 * Deterministic structural validation only — never a quality, trust, or truth score. Confirms
 * the record is internally honest and usable (has an identity, a label, a status, and does not
 * claim to both support and conflict with the same evidence, or with itself), not that its
 * content is factually correct — this platform never assesses that.
 */
export function validateEvidenceRecord(evidence: Evidence): EvidenceValidationResult {
  const issues: string[] = [];

  if (!evidence.evidenceId.trim()) {
    issues.push("Evidence is missing an identity (evidenceId).");
  }
  if (!evidence.label.trim()) {
    issues.push("Evidence is missing a label.");
  }
  if (!evidence.status.trim()) {
    issues.push("Evidence is missing a status.");
  }

  const supporting = new Set(evidence.supportingEvidenceIds ?? []);
  const conflicting = new Set(evidence.conflictingEvidenceIds ?? []);

  if (supporting.has(evidence.evidenceId) || conflicting.has(evidence.evidenceId)) {
    issues.push("Evidence cannot support or conflict with itself.");
  }

  for (const id of supporting) {
    if (conflicting.has(id)) {
      issues.push(`Evidence ${id} is listed as both supporting and conflicting.`);
    }
  }

  return { valid: issues.length === 0, issues };
}
