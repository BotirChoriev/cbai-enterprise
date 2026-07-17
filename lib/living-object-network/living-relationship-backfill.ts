/**
 * BUILD-030A — Idempotent backfill from verified persisted records.
 */

import { loadOrganizations } from "@/lib/organization-os/organization-store";
import { loadOrganizationMemberships } from "@/lib/organization-os/organization-membership-store";
import { loadCurrentMission, loadMissions } from "@/lib/intelligence-os/mission-store";
import { loadProjects, loadProjectEvidence } from "@/lib/project/project-store";
import { loadSavedKnowledgeSources } from "@/lib/knowledge-ingestion/saved-source-store";
import { loadReviewedEvidenceRelations } from "@/lib/knowledge-ingestion/source-review-store";
import {
  createLivingRelationship,
  findDuplicateRelationship,
  loadLivingRelationships,
} from "@/lib/living-object-network/living-relationship-store";
import type { LivingObjectReference } from "@/lib/living-object-network/living-object.types";

export type LivingRelationshipBackfillReport = {
  readonly eligibleObjects: number;
  readonly relationshipsCreated: number;
  readonly skipped: number;
  readonly invalid: number;
  readonly unresolved: number;
};

function ref(objectType: LivingObjectReference["objectType"], objectId: string): LivingObjectReference {
  return { objectType, objectId };
}

export function backfillLivingRelationships(actorId: string): LivingRelationshipBackfillReport {
  let eligibleObjects = 0;
  let relationshipsCreated = 0;
  let skipped = 0;
  let invalid = 0;
  let unresolved = 0;

  const beforeCount = loadLivingRelationships({ includeArchived: true }).length;

  for (const org of loadOrganizations()) {
    eligibleObjects += 1;
    for (const member of loadOrganizationMemberships(org.id)) {
      eligibleObjects += 1;
      const source = ref("user", member.userId);
      const target = ref("organization", org.id);
      if (findDuplicateRelationship(source, target, "member_of")) {
        skipped += 1;
        continue;
      }
      const result = createLivingRelationship({
        source,
        target,
        relationshipType: "member_of",
        status: "human_confirmed",
        provenanceKind: "system_derived",
        createdBy: actorId,
        organizationId: org.id,
      });
      if ("error" in result) invalid += 1;
      else relationshipsCreated += 1;
    }
  }

  for (const mission of loadMissions()) {
    eligibleObjects += 1;
    if (mission.projectId) {
      eligibleObjects += 1;
      const source = ref("mission", mission.id);
      const target = ref("project", mission.projectId);
      if (findDuplicateRelationship(source, target, "contains")) {
        skipped += 1;
      } else {
        const result = createLivingRelationship({
          source,
          target,
          relationshipType: "contains",
          createdBy: actorId,
          missionId: mission.id,
        });
        if ("error" in result) invalid += 1;
        else relationshipsCreated += 1;
      }
    }
  }

  for (const source of loadSavedKnowledgeSources()) {
    eligibleObjects += 1;
    for (const relation of source.missionRelations) {
      const srcRef = ref("source", source.id);
      const missionRef = ref("mission", relation.missionId);
      if (findDuplicateRelationship(srcRef, missionRef, "linked_to")) {
        skipped += 1;
        continue;
      }
      const result = createLivingRelationship({
        source: srcRef,
        target: missionRef,
        relationshipType: "linked_to",
        status: source.lifecycleState === "reviewed_evidence" ? "human_confirmed" : "asserted",
        createdBy: actorId,
        missionId: relation.missionId,
      });
      if ("error" in result) invalid += 1;
      else relationshipsCreated += 1;
    }
  }

  for (const evidence of loadProjects().flatMap((p) => loadProjectEvidence(p.id))) {
    if (!evidence.savedSourceId) continue;
    eligibleObjects += 1;
    const evRef = ref("evidence", evidence.evidenceRefId);
    const srcRef = ref("source", evidence.savedSourceId);
    if (findDuplicateRelationship(evRef, srcRef, "derived_from")) {
      skipped += 1;
      continue;
    }
    const result = createLivingRelationship({
      source: evRef,
      target: srcRef,
      relationshipType: "derived_from",
      status: evidence.reviewOutcome === "accepted_as_evidence" ? "human_confirmed" : "asserted",
      createdBy: actorId,
    });
    if ("error" in result) invalid += 1;
    else relationshipsCreated += 1;
  }

  for (const rel of loadReviewedEvidenceRelations()) {
    if (rel.relation !== "supports" && rel.relation !== "contradicts") continue;
    eligibleObjects += 1;
    const evRef = ref("evidence", rel.sourceId);
    const type = rel.relation === "supports" ? "supports" : "contradicts";
    const targetRef = rel.claimId
      ? ref("claim", rel.claimId)
      : ref("research_question", rel.questionId ?? rel.missionId);
    if (findDuplicateRelationship(evRef, targetRef, type)) {
      skipped += 1;
      continue;
    }
    const result = createLivingRelationship({
      source: evRef,
      target: targetRef,
      relationshipType: type,
      status: "human_confirmed",
      createdBy: rel.createdBy,
      missionId: rel.missionId,
    });
    if ("error" in result) invalid += 1;
    else relationshipsCreated += 1;
  }

  const afterCount = loadLivingRelationships({ includeArchived: true }).length;
  if (afterCount === beforeCount && relationshipsCreated > 0) {
    unresolved += 1;
  }

  void loadCurrentMission();

  return { eligibleObjects, relationshipsCreated, skipped, invalid, unresolved };
}
