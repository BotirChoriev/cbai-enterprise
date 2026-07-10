import type { ResearchEvidence } from "@/lib/research/evidence/evidence-model";
import type {
  EvidenceSourceType,
  EvidenceStatus,
  EvidenceStrength,
} from "@/lib/research/evidence/evidence-types";

/** Find a single evidence record by its ID. */
export function getEvidenceById(
  evidenceList: readonly ResearchEvidence[],
  id: string,
): ResearchEvidence | undefined {
  return evidenceList.find((evidence) => evidence.id === id);
}

/** List all evidence related to a research topic. */
export function getEvidenceByTopic(
  evidenceList: readonly ResearchEvidence[],
  researchTopicId: string,
): readonly ResearchEvidence[] {
  return evidenceList.filter((evidence) => evidence.researchTopicId === researchTopicId);
}

/** List all evidence with a given status. */
export function getEvidenceByStatus(
  evidenceList: readonly ResearchEvidence[],
  status: EvidenceStatus,
): readonly ResearchEvidence[] {
  return evidenceList.filter((evidence) => evidence.status === status);
}

/** List all evidence with a given strength. */
export function getEvidenceByStrength(
  evidenceList: readonly ResearchEvidence[],
  strength: EvidenceStrength,
): readonly ResearchEvidence[] {
  return evidenceList.filter((evidence) => evidence.strength === strength);
}

/** List all evidence with a given source type. */
export function getEvidenceBySourceType(
  evidenceList: readonly ResearchEvidence[],
  sourceType: EvidenceSourceType,
): readonly ResearchEvidence[] {
  return evidenceList.filter((evidence) => evidence.sourceType === sourceType);
}

/** Return a new array of evidence sorted by most recently updated first. */
export function getLatestEvidence(
  evidenceList: readonly ResearchEvidence[],
): readonly ResearchEvidence[] {
  return [...evidenceList].sort(
    (left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
  );
}

/** List all evidence with verified status. */
export function getVerifiedEvidence(
  evidenceList: readonly ResearchEvidence[],
): readonly ResearchEvidence[] {
  return getEvidenceByStatus(evidenceList, "verified");
}

/** List all evidence with disputed status. */
export function getDisputedEvidence(
  evidenceList: readonly ResearchEvidence[],
): readonly ResearchEvidence[] {
  return getEvidenceByStatus(evidenceList, "disputed");
}
