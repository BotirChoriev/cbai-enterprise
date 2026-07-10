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
  createdAt: string;
  updatedAt: string;
}
