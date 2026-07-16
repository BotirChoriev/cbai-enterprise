/**
 * Bridge project evidence refs → foundation Evidence records.
 */

import { buildEvidence } from "@/lib/evidence/evidence-builder";
import type { Evidence } from "@/lib/foundation/foundation-model";
import type { ProjectEvidenceReference } from "@/lib/project/project-types";

export function projectRefToEvidence(
  ref: ProjectEvidenceReference,
  options?: { missionId?: string },
): Evidence {
  const hasSource = Boolean(ref.sourceUrl?.trim());
  return buildEvidence({
    evidenceId: ref.evidenceRefId,
    label: ref.title,
    status: hasSource ? "linked_with_source" : "linked_unverified",
    originalSource: ref.sourceUrl?.trim() || undefined,
    sourceType: "other",
    verificationStatus: hasSource ? "verification_pending" : "not_started",
    reliability: hasSource ? "moderate" : "unknown",
    relatedMissionIds: options?.missionId ? [options.missionId] : undefined,
    relatedSubjectIds: ref.linkedEntityId ? [ref.linkedEntityId] : undefined,
    publicationDate: ref.createdAt,
    limitations: hasSource
      ? ["Live API verification not connected — source URL is user-provided."]
      : ["No source URL — verification cannot begin."],
  });
}

export function projectRefsToEvidence(
  refs: readonly ProjectEvidenceReference[],
  options?: { missionId?: string },
): readonly Evidence[] {
  return refs.map((ref) => projectRefToEvidence(ref, options));
}
