import { validateEvidenceRecord } from "@/lib/evidence/evidence-validation";
import type { EvidenceRuntimeRecord } from "@/lib/evidence-runtime/types";

export function deriveEvidenceValidationIssues(record: EvidenceRuntimeRecord): readonly string[] {
  const structural = validateEvidenceRecord(record.evidence).issues;
  const operational: string[] = [...structural];
  if (!record.evidence.originalSource?.trim()) {
    operational.push("Source URL missing — human verification required.");
  }
  if (record.freshness === "outdated") {
    operational.push("Reference may be outdated — confirm it remains current.");
  }
  return operational;
}
