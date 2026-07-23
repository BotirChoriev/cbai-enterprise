export type {
  EvidenceLifecycleStatus,
  EvidenceProvenance,
  EvidenceRecord,
  EvidenceRecordDraft,
  EvidenceStatusTransitionResult,
} from "@/lib/evidence-engine/types";

export { EVIDENCE_LIFECYCLE_STATUSES } from "@/lib/evidence-engine/types";

export {
  isEvidenceLifecycleStatus,
  canTransitionEvidenceStatus,
  evidenceStatusDisplayLabel,
  isEvidencePresentedAsVerified,
  transitionEvidenceStatus,
  listAllowedEvidenceTransitions,
} from "@/lib/evidence-engine/lifecycle";

export {
  loadEvidenceRecords,
  loadEvidenceRecord,
  createEvidenceRecord,
  updateEvidenceRecord,
  transitionEvidenceRecordStatus,
  linkEvidenceToMission,
  linkEvidenceToReport,
  EVIDENCE_ENGINE_STORAGE_KEY,
} from "@/lib/evidence-engine/evidence-store";
