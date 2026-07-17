/**
 * BUILD-030A — Canonical object resolver for Inspector and Graph.
 */

import { loadSavedKnowledgeSource } from "@/lib/knowledge-ingestion/saved-source-store";
import { deriveKnowledgeTrustStateFromSavedSource } from "@/lib/intelligence-os/trust-derivation";
import { loadMission } from "@/lib/intelligence-os/mission-store";
import { loadProject, loadProjectEvidence, loadProjects } from "@/lib/project/project-store";
import { loadOrganization } from "@/lib/organization-os/organization-store";
import { authorizeOrganizationAction } from "@/lib/organization-os/authorization-policy";
import { loadLivingRelationships } from "@/lib/living-object-network/living-relationship-store";
import type {
  LivingObjectReference,
  LivingObjectResolveResult,
  ResolvedLivingObject,
} from "@/lib/living-object-network/living-object.types";

export function resolveLivingObject(
  reference: LivingObjectReference,
  actorId: string | null,
): LivingObjectResolveResult {
  const relationships = loadLivingRelationships({ objectRef: reference });

  switch (reference.objectType) {
    case "source": {
      const source = loadSavedKnowledgeSource(reference.objectId);
      if (!source) return { ok: false, code: "not_found", message: "Source not found." };
      const trust = deriveKnowledgeTrustStateFromSavedSource(source);
      const object: ResolvedLivingObject = {
        reference,
        label: source.title,
        lifecycleState: source.lifecycleState,
        trustState: trust.state,
        provenanceAvailable: Boolean(source.provenance.originalSourceName),
        limitations: trust.limitations,
        missionRelevance:
          source.missionRelations.length > 0
            ? `Linked to ${source.missionRelations.length} mission(s)`
            : null,
        nextAction: trust.nextActionLabel,
        accessDenied: false,
      };
      return { ok: true, object, relationships };
    }
    case "mission": {
      const mission = loadMission(reference.objectId);
      if (!mission) return { ok: false, code: "not_found", message: "Mission not found." };
      return {
        ok: true,
        object: {
          reference,
          label: mission.problem,
          lifecycleState: mission.status,
          trustState: "needs_review",
          provenanceAvailable: false,
          limitations: [],
          missionRelevance: "Active mission context",
          nextAction: "Open mission workspace",
          accessDenied: false,
        },
        relationships,
      };
    }
    case "project": {
      const project = loadProject(reference.objectId);
      if (!project) return { ok: false, code: "not_found", message: "Project not found." };
      return {
        ok: true,
        object: {
          reference,
          label: project.title,
          lifecycleState: project.status,
          trustState: "needs_review",
          provenanceAvailable: false,
          limitations: ["Project evidence requires human review."],
          missionRelevance: null,
          nextAction: "Open project",
          accessDenied: false,
        },
        relationships,
      };
    }
    case "evidence": {
      const found = findEvidenceById(reference.objectId);
      if (!found) return { ok: false, code: "not_found", message: "Evidence not found." };
      const ev = found;
      return {
        ok: true,
        object: {
          reference,
          label: ev.title,
          lifecycleState: ev.reviewOutcome ?? "candidate",
          trustState: ev.reviewOutcome === "accepted_as_evidence" ? "supported" : "needs_review",
          provenanceAvailable: Boolean(ev.savedSourceId),
          limitations: [],
          missionRelevance: null,
          nextAction: ev.reviewOutcome === "accepted_as_evidence" ? null : "Complete review",
          accessDenied: false,
        },
        relationships,
      };
    }
    case "organization": {
      const org = loadOrganization(reference.objectId);
      if (!org) return { ok: false, code: "not_found", message: "Organization not found." };
      const auth = authorizeOrganizationAction({
        actorId,
        organizationId: org.id,
        action: "organization.view",
      });
      if (!auth.ok) return { ok: false, code: "not_authorized", message: auth.message };
      return {
        ok: true,
        object: {
          reference,
          label: org.name,
          lifecycleState: org.identityKind,
          trustState: org.identityKind === "workspace_organization" ? "needs_review" : "source_available",
          provenanceAvailable: true,
          limitations: [
            org.identityKind === "workspace_organization"
              ? "User-created workspace — not an officially verified institution."
              : "External entity reference.",
          ],
          missionRelevance: null,
          nextAction: "Open organization workspace",
          accessDenied: false,
        },
        relationships,
      };
    }
    default:
      return { ok: false, code: "not_found", message: "Object type not yet resolvable." };
  }
}

function findEvidenceById(evidenceRefId: string) {
  for (const project of loadProjects()) {
    const match = loadProjectEvidence(project.id).find((e) => e.evidenceRefId === evidenceRefId);
    if (match) return match;
  }
  return null;
}

export function livingRefToUniversalInspectorPath(reference: LivingObjectReference): string | null {
  switch (reference.objectType) {
    case "source":
      return `/knowledge#source-${reference.objectId}`;
    case "mission":
      return "/";
    case "project":
      return `/my-work?project=${reference.objectId}`;
    case "organization":
      return `/organization?org=${reference.objectId}`;
    default:
      return null;
  }
}
