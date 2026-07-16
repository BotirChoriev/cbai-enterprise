export { buildEvidence } from "@/lib/evidence/evidence-builder";
export { validateEvidenceRecord } from "@/lib/evidence/evidence-validation";
export {
  compareEvidence,
  traceEvidence,
  findEvidenceForSubject,
  groupEvidenceBySourceType,
  groupEvidenceByVerificationStatus,
} from "@/lib/evidence/evidence-query";
export { linkSupportingEvidence, linkConflictingEvidence } from "@/lib/evidence/evidence-linking";
export * from "@/lib/evidence-runtime";
