import type { ResearchEvidence } from "@/lib/research/evidence/evidence-model";
import type { EvidenceStatus } from "@/lib/research/evidence/evidence-types";
import {
  archiveEvidence as buildArchivedEvidence,
  restoreEvidence as buildRestoredEvidence,
  updateEvidence,
} from "@/lib/research/evidence/evidence-builder";

function assertTransition(
  evidence: ResearchEvidence,
  allowedStatuses: readonly EvidenceStatus[],
  action: string,
): void {
  if (!allowedStatuses.includes(evidence.status)) {
    throw new Error(
      `Cannot ${action} evidence "${evidence.id}" from status "${evidence.status}".`,
    );
  }
}

/** Validate an evidence record's required fields, returning it unchanged if valid. */
export function validateEvidence(evidence: ResearchEvidence): ResearchEvidence {
  const requiredFields: Array<[string, string]> = [
    ["id", evidence.id],
    ["researchTopicId", evidence.researchTopicId],
    ["title", evidence.title],
    ["summary", evidence.summary],
    ["sourceId", evidence.sourceId],
  ];

  const missingField = requiredFields.find(([, value]) => value.trim().length === 0);
  if (missingField) {
    throw new Error(`Evidence "${evidence.id}" is missing required field "${missingField[0]}".`);
  }

  return evidence;
}

/** Move a draft evidence record into the verified status. */
export function verifyEvidence(evidence: ResearchEvidence): ResearchEvidence {
  validateEvidence(evidence);
  assertTransition(evidence, ["draft"], "verify");
  return updateEvidence(evidence, { status: "verified" });
}

/** Move a verified evidence record into the disputed status. */
export function rejectEvidence(evidence: ResearchEvidence): ResearchEvidence {
  validateEvidence(evidence);
  assertTransition(evidence, ["verified"], "reject");
  return updateEvidence(evidence, { status: "disputed" });
}

/** Resolve a disputed evidence record back into the verified status. */
export function approveEvidence(evidence: ResearchEvidence): ResearchEvidence {
  validateEvidence(evidence);
  assertTransition(evidence, ["disputed"], "approve");
  return updateEvidence(evidence, { status: "verified" });
}

/** Archive an evidence record that is not already archived. */
export function archiveEvidence(evidence: ResearchEvidence): ResearchEvidence {
  validateEvidence(evidence);
  assertTransition(evidence, ["draft", "verified", "disputed", "deprecated"], "archive");
  return buildArchivedEvidence(evidence);
}

/** Restore an archived evidence record to the status it held before archiving. */
export function restoreEvidence(evidence: ResearchEvidence): ResearchEvidence {
  validateEvidence(evidence);
  assertTransition(evidence, ["archived"], "restore");
  return buildRestoredEvidence(evidence);
}
