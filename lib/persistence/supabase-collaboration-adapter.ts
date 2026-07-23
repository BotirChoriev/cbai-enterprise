/**
 * Supabase collaboration repository — shared-backend path.
 * Requires authenticated cloud session + RLS.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { CollaborationRepository } from "@/lib/persistence/collaboration-repository.types";
import type { RepositoryResult } from "@/lib/persistence/organization-repository.types";
import type {
  CollaborationParticipant,
  CollaborationReviewAssignment,
  MissionCollaboration,
  SharedLivingObject,
} from "@/lib/collaboration/collaboration.types";
import type { LivingObjectReference } from "@/lib/living-object-network/living-object.types";

function ok<T>(value: T): RepositoryResult<T> {
  return { ok: true, value };
}

function err(code: string, message: string): RepositoryResult<never> {
  return { ok: false, code, message };
}

function client(): any | null {
  return getSupabaseBrowserClient() as any;
}

function mapCollab(row: Record<string, unknown>): MissionCollaboration {
  return {
    id: String(row.id),
    missionId: String(row.mission_id),
    ownerOrganizationId: row.owner_organization_id ? String(row.owner_organization_id) : null,
    createdBy: String(row.created_by),
    title: String(row.title),
    description: (row.description as string | null) ?? null,
    status: row.status as MissionCollaboration["status"],
    visibility: row.visibility as MissionCollaboration["visibility"],
    version: Number(row.version ?? 1),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapParticipant(row: Record<string, unknown>): CollaborationParticipant {
  return {
    id: String(row.id),
    collaborationId: String(row.collaboration_id),
    participantType: row.participant_type as "user" | "organization",
    participantId: String(row.user_id ?? row.organization_id),
    role: row.role as CollaborationParticipant["role"],
    status: row.status as CollaborationParticipant["status"],
    invitedBy: String(row.invited_by),
    invitedAt: String(row.invited_at),
    acceptedAt: (row.accepted_at as string | null) ?? null,
    revokedAt: (row.revoked_at as string | null) ?? null,
    version: Number(row.version ?? 1),
  };
}

function mapShared(row: Record<string, unknown>): SharedLivingObject {
  return {
    id: String(row.id),
    collaborationId: String(row.collaboration_id),
    object: {
      objectType: row.object_type as LivingObjectReference["objectType"],
      objectId: String(row.object_id),
    },
    sharedBy: String(row.shared_by),
    sharedAt: String(row.shared_at),
    access: (row.access_level as SharedLivingObject["access"]) ?? "view",
    status: (row.status as SharedLivingObject["status"]) ?? "active",
    version: Number(row.version ?? 1),
  };
}

function mapReview(row: Record<string, unknown>): CollaborationReviewAssignment {
  return {
    id: String(row.id),
    collaborationId: String(row.collaboration_id),
    object: {
      objectType: row.object_type as LivingObjectReference["objectType"],
      objectId: String(row.object_id),
    },
    assignedBy: String(row.assigned_by),
    assignedTo: String(row.assigned_to),
    status: row.status as CollaborationReviewAssignment["status"],
    dueAt: (row.due_at as string | null) ?? null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    version: Number(row.version ?? 1),
  };
}

export class SupabaseCollaborationRepository implements CollaborationRepository {
  readonly adapterKind = "supabase_shared" as const;
  readonly isShared = true;

  async listCollaborationsForUser(userId: string) {
    const db = client();
    if (!db) return [];
    const { data: parts } = await db
      .from("collaboration_participants")
      .select("collaboration_id")
      .eq("user_id", userId)
      .in("status", ["active", "invited"]);
    const ids = [
      ...new Set(((parts ?? []) as { collaboration_id: string }[]).map((p) => String(p.collaboration_id))),
    ];
    if (ids.length === 0) {
      const { data: owned } = await db.from("mission_collaborations").select("*").eq("created_by", userId);
      return ((owned ?? []) as Record<string, unknown>[]).map(mapCollab);
    }
    const { data } = await db.from("mission_collaborations").select("*").in("id", ids);
    return ((data ?? []) as Record<string, unknown>[]).map(mapCollab);
  }

  async getCollaboration(id: string) {
    const db = client();
    if (!db) return null;
    const { data, error } = await db.from("mission_collaborations").select("*").eq("id", id).maybeSingle();
    if (error || !data) return null;
    return mapCollab(data as Record<string, unknown>);
  }

  async createCollaboration(input: {
    missionId: string;
    createdBy: string;
    title: string;
    description?: string | null;
    ownerOrganizationId?: string | null;
  }) {
    const db = client();
    if (!db) return err("shared_backend_not_configured", "Shared backend is not configured.");

    const { data, error } = await db
      .from("mission_collaborations")
      .insert({
        mission_id: input.missionId,
        created_by: input.createdBy,
        title: input.title.trim(),
        description: input.description ?? null,
        owner_organization_id: input.ownerOrganizationId ?? null,
        status: "inviting",
        visibility: "invited_participants",
      })
      .select("*")
      .single();

    if (error || !data) {
      return err("validation_failed", error?.message ?? "Could not create collaboration.");
    }

    const collab = mapCollab(data as Record<string, unknown>);
    await db.from("collaboration_participants").insert({
      collaboration_id: collab.id,
      participant_type: "user",
      user_id: input.createdBy,
      role: "owner",
      status: "active",
      invited_by: input.createdBy,
      accepted_at: new Date().toISOString(),
    });

    if (input.ownerOrganizationId) {
      await db.rpc("append_organization_activity", {
        p_organization_id: input.ownerOrganizationId,
        p_action: "collaboration_created",
        p_target_type: "collaboration",
        p_target_id: collab.id,
      });
    }

    return ok(collab);
  }

  async listParticipants(collaborationId: string) {
    const db = client();
    if (!db) return [];
    const { data } = await db.from("collaboration_participants").select("*").eq("collaboration_id", collaborationId);
    return ((data ?? []) as Record<string, unknown>[]).map(mapParticipant);
  }

  async listSharedObjects(collaborationId: string, _actorId: string) {
    const db = client();
    if (!db) return [];
    const { data } = await db
      .from("collaboration_shared_objects")
      .select("*")
      .eq("collaboration_id", collaborationId)
      .eq("status", "active");
    return ((data ?? []) as Record<string, unknown>[]).map(mapShared);
  }

  async assignReview(input: {
    collaborationId: string;
    assignedBy: string;
    assignedTo: string;
    object: LivingObjectReference;
  }) {
    const db = client();
    if (!db) return err("shared_backend_not_configured", "Shared backend is not configured.");

    const { data, error } = await db
      .from("collaboration_review_assignments")
      .insert({
        collaboration_id: input.collaborationId,
        object_type: input.object.objectType,
        object_id: input.object.objectId,
        assigned_by: input.assignedBy,
        assigned_to: input.assignedTo,
        status: "assigned",
      })
      .select("*")
      .single();

    if (error || !data) {
      return err("validation_failed", error?.message ?? "Could not assign review.");
    }

    await db.from("user_notifications").insert({
      recipient_user_id: input.assignedTo,
      notification_type: "review_assigned",
      actor_id: input.assignedBy,
      collaboration_id: input.collaborationId,
      object_type: input.object.objectType,
      object_id: input.object.objectId,
      safe_metadata: {},
    });

    return ok(mapReview(data as Record<string, unknown>));
  }
}
