import type { ResearchEvidence } from "@/lib/research/evidence/evidence-model";

type EvidenceInput = Omit<ResearchEvidence, "id" | "createdAt" | "updatedAt" | "previousStatus">;

/** Construct a new evidence record with a generated ID and timestamps. */
export function createEvidence(input: EvidenceInput): ResearchEvidence {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    ...input,
  };
}

/** Return a new evidence list with a newly created record appended. */
export function appendEvidence(
  evidenceList: readonly ResearchEvidence[],
  input: EvidenceInput,
): readonly ResearchEvidence[] {
  return [...evidenceList, createEvidence(input)];
}

/** Return a new evidence record with the given fields patched in. */
export function updateEvidence(
  evidence: ResearchEvidence,
  patch: Partial<EvidenceInput>,
): ResearchEvidence {
  return {
    ...evidence,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
}

/** Return a new evidence record archived, preserving its prior status for restoreEvidence(). */
export function archiveEvidence(evidence: ResearchEvidence): ResearchEvidence {
  return {
    ...evidence,
    previousStatus: evidence.status,
    status: "archived",
    updatedAt: new Date().toISOString(),
  };
}

/** Return a new evidence record restored to the status it held before archiveEvidence() ran. */
export function restoreEvidence(evidence: ResearchEvidence): ResearchEvidence {
  const { previousStatus, ...rest } = evidence;
  return {
    ...rest,
    status: previousStatus ?? evidence.status,
    updatedAt: new Date().toISOString(),
  };
}
