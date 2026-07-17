/** BUILD-039 — Collaboration repository contract. */

import type {
  CollaborationParticipant,
  CollaborationReviewAssignment,
  MissionCollaboration,
  SharedLivingObject,
} from "@/lib/collaboration/collaboration.types";
import type { LivingObjectReference } from "@/lib/living-object-network/living-object.types";
import type { RepositoryResult } from "@/lib/persistence/organization-repository.types";

export interface CollaborationRepository {
  readonly adapterKind: "supabase_shared" | "device_local";
  readonly isShared: boolean;
  listCollaborationsForUser(userId: string): Promise<readonly MissionCollaboration[]>;
  getCollaboration(id: string): Promise<MissionCollaboration | null>;
  createCollaboration(input: {
    readonly missionId: string;
    readonly createdBy: string;
    readonly title: string;
    readonly description?: string | null;
  }): Promise<RepositoryResult<MissionCollaboration>>;
  listParticipants(collaborationId: string): Promise<readonly CollaborationParticipant[]>;
  listSharedObjects(collaborationId: string, actorId: string): Promise<readonly SharedLivingObject[]>;
  assignReview(input: {
    readonly collaborationId: string;
    readonly assignedBy: string;
    readonly assignedTo: string;
    readonly object: LivingObjectReference;
  }): Promise<RepositoryResult<CollaborationReviewAssignment>>;
}
