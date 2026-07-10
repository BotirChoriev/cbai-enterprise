import type {
  EvidenceSourceType,
  EvidenceStatus,
  EvidenceStrength,
} from "@/lib/research/evidence/evidence-types";

export interface ResearchEvidence {
  id: string;
  researchTopicId: string;
  title: string;
  summary: string;
  sourceType: EvidenceSourceType;
  sourceId: string;
  status: EvidenceStatus;
  strength: EvidenceStrength;
  /** Status held before archiveEvidence() ran, so restoreEvidence() can revert to it. */
  previousStatus?: EvidenceStatus;
  createdAt: string;
  updatedAt: string;
}
