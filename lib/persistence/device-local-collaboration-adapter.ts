/**
 * BUILD-039 — Device-local collaboration repository.
 * development_only · single_device · not_collaboration_safe
 */

import {
  assignCollaborationReview,
  createMissionCollaboration,
  loadCollaboration,
  loadCollaborationParticipants,
  loadMissionCollaborations,
  loadSharedObjects,
} from "@/lib/collaboration/collaboration-store";
import type { CollaborationRepository } from "@/lib/persistence/collaboration-repository.types";
import type { RepositoryResult } from "@/lib/persistence/organization-repository.types";

function ok<T>(value: T): RepositoryResult<T> {
  return { ok: true, value };
}

function err(code: string, message: string): RepositoryResult<never> {
  return { ok: false, code, message };
}

export class DeviceLocalCollaborationRepository implements CollaborationRepository {
  readonly adapterKind = "device_local" as const;
  readonly isShared = false;

  async listCollaborationsForUser(userId: string) {
    return loadMissionCollaborations().filter((c) => c.createdBy === userId);
  }

  async getCollaboration(id: string) {
    return loadCollaboration(id);
  }

  async createCollaboration(input: {
    missionId: string;
    createdBy: string;
    title: string;
    description?: string | null;
  }) {
    const result = createMissionCollaboration(input);
    if ("error" in result) return err("validation_failed", result.error);
    return ok(result);
  }

  async listParticipants(collaborationId: string) {
    return loadCollaborationParticipants(collaborationId);
  }

  async listSharedObjects(collaborationId: string, actorId: string) {
    return loadSharedObjects(collaborationId, actorId);
  }

  async assignReview(input: {
    collaborationId: string;
    assignedBy: string;
    assignedTo: string;
    object: import("@/lib/living-object-network/living-object.types").LivingObjectReference;
  }) {
    const result = assignCollaborationReview(input);
    if ("error" in result) return err("validation_failed", result.error);
    return ok(result);
  }
}
