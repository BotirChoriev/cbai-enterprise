/**
 * Cloud-backed enterprise comments / mentions / approvals / notifications.
 * Uses Supabase when shared backend is active; otherwise device-local stores.
 * Tables from migrations 0009/0010 are accessed via untyped client until Database types regenerate.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isOrganizationCollaborationShared } from "@/lib/persistence/persistence-capability";
import type {
  CollaborationTargetType,
  EnterpriseApproval,
  EnterpriseComment,
  EnterpriseMention,
} from "@/lib/enterprise-collaboration/types";
import {
  createEnterpriseComment as localCreateComment,
  loadEnterpriseCommentsForOrganization as localLoadComments,
} from "@/lib/enterprise-collaboration/comment-store";
import {
  countUnreadMentions as localCountMentions,
  extractMentionUserIds,
  loadMentionsForUser as localLoadMentions,
  markMentionRead as localMarkMention,
} from "@/lib/enterprise-collaboration/mention-store";
import {
  decideEnterpriseApproval as localDecide,
  loadApprovalsForUser as localLoadApprovals,
  requestEnterpriseApproval as localRequest,
} from "@/lib/enterprise-collaboration/approval-store";
import {
  countUnreadNotifications as localCountNotifs,
  loadUserNotifications as localLoadNotifs,
  markNotificationRead as localMarkNotif,
  type UserNotification,
} from "@/lib/notifications/user-notification-store";

function db(): any | null {
  if (!isOrganizationCollaborationShared()) return null;
  return getSupabaseBrowserClient() as any;
}

function sharedReady(): boolean {
  return Boolean(db());
}

export async function persistEnterpriseComment(input: {
  readonly organizationId: string;
  readonly authorId: string;
  readonly targetType: CollaborationTargetType;
  readonly targetId: string;
  readonly body: string;
  readonly parentId?: string | null;
}): Promise<EnterpriseComment | { readonly error: string }> {
  const client = db();
  if (!client) return localCreateComment(input);

  const { data, error } = await client
    .from("enterprise_comments")
    .insert({
      organization_id: input.organizationId,
      author_id: input.authorId,
      target_type: input.targetType,
      target_id: input.targetId,
      body: input.body.trim(),
      parent_id: input.parentId ?? null,
    })
    .select("*")
    .single();
  if (error || !data) return { error: error?.message ?? "Comment insert denied." };

  const comment: EnterpriseComment = {
    id: String(data.id),
    organizationId: String(data.organization_id),
    targetType: data.target_type as CollaborationTargetType,
    targetId: String(data.target_id),
    authorId: String(data.author_id),
    body: String(data.body),
    createdAt: String(data.created_at),
    updatedAt: String(data.updated_at),
  };

  for (const mentionedUserId of extractMentionUserIds(comment.body)) {
    if (mentionedUserId === input.authorId) continue;
    await client.from("enterprise_mentions").insert({
      organization_id: input.organizationId,
      comment_id: comment.id,
      mentioned_user_id: mentionedUserId,
      mentioned_by: input.authorId,
      target_type: input.targetType,
      target_id: input.targetId,
    });
    await client.from("user_notifications").insert({
      recipient_user_id: mentionedUserId,
      notification_type: "access_changed",
      actor_id: input.authorId,
      organization_id: input.organizationId,
      object_type: "mention",
      object_id: comment.id,
      safe_metadata: { kind: "mention" },
    });
  }

  await client.rpc("append_organization_activity", {
    p_organization_id: input.organizationId,
    p_action: "comment_created",
    p_target_type: input.targetType,
    p_target_id: input.targetId,
  });

  return comment;
}

export async function fetchOrganizationComments(
  userId: string,
  organizationId: string,
): Promise<EnterpriseComment[] | { readonly error: string }> {
  const client = db();
  if (!client) return localLoadComments(userId, organizationId);
  const { data, error } = await client
    .from("enterprise_comments")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });
  if (error) return { error: error.message };
  return ((data ?? []) as Record<string, unknown>[]).map((row) => ({
    id: String(row.id),
    organizationId: String(row.organization_id),
    targetType: row.target_type as CollaborationTargetType,
    targetId: String(row.target_id),
    authorId: String(row.author_id),
    body: String(row.body),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  }));
}

export async function fetchMentionsForUser(userId: string): Promise<EnterpriseMention[]> {
  const client = db();
  if (!client) return localLoadMentions(userId);
  const { data } = await client
    .from("enterprise_mentions")
    .select("*")
    .eq("mentioned_user_id", userId)
    .order("created_at", { ascending: false });
  return ((data ?? []) as Record<string, unknown>[]).map((row) => ({
    id: String(row.id),
    organizationId: String(row.organization_id),
    commentId: String(row.comment_id),
    mentionedUserId: String(row.mentioned_user_id),
    mentionedBy: String(row.mentioned_by),
    targetType: row.target_type as CollaborationTargetType,
    targetId: String(row.target_id),
    createdAt: String(row.created_at),
    readAt: (row.read_at as string | null) ?? null,
  }));
}

export async function persistApprovalRequest(input: {
  readonly organizationId: string;
  readonly requestedBy: string;
  readonly assignedTo: string;
  readonly targetType: CollaborationTargetType;
  readonly targetId: string;
  readonly title: string;
}): Promise<EnterpriseApproval | { readonly error: string }> {
  const client = db();
  if (!client) return localRequest(input);
  const { data, error } = await client
    .from("enterprise_approvals")
    .insert({
      organization_id: input.organizationId,
      requested_by: input.requestedBy,
      assigned_to: input.assignedTo,
      target_type: input.targetType,
      target_id: input.targetId,
      title: input.title,
      status: "pending",
    })
    .select("*")
    .single();
  if (error || !data) return { error: error?.message ?? "Approval request denied." };

  await client.from("user_notifications").insert({
    recipient_user_id: input.assignedTo,
    notification_type: "review_assigned",
    actor_id: input.requestedBy,
    organization_id: input.organizationId,
    object_type: "approval",
    object_id: String(data.id),
    safe_metadata: { title: input.title },
  });
  await client.rpc("append_organization_activity", {
    p_organization_id: input.organizationId,
    p_action: "approval_requested",
    p_target_type: "approval",
    p_target_id: String(data.id),
  });

  return {
    id: String(data.id),
    organizationId: String(data.organization_id),
    targetType: data.target_type as CollaborationTargetType,
    targetId: String(data.target_id),
    title: String(data.title),
    requestedBy: String(data.requested_by),
    assignedTo: String(data.assigned_to),
    status: data.status as EnterpriseApproval["status"],
    decisionNote: (data.decision_note as string | null) ?? null,
    createdAt: String(data.created_at),
    updatedAt: String(data.updated_at),
  };
}

export async function persistApprovalDecision(input: {
  readonly approvalId: string;
  readonly actorId: string;
  readonly decision: "approved" | "rejected" | "changes_requested";
  readonly note?: string | null;
}): Promise<EnterpriseApproval | { readonly error: string }> {
  const client = db();
  if (!client) {
    return localDecide({
      approvalId: input.approvalId,
      actorId: input.actorId,
      decision: input.decision,
      note: input.note,
    });
  }
  const { data, error } = await client
    .from("enterprise_approvals")
    .update({
      status: input.decision,
      decision_note: input.note ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.approvalId)
    .eq("assigned_to", input.actorId)
    .eq("status", "pending")
    .select("*")
    .maybeSingle();
  if (error || !data) return { error: error?.message ?? "Approval decision denied by RLS or role." };

  await client.from("user_notifications").insert({
    recipient_user_id: String(data.requested_by),
    notification_type: input.decision === "approved" ? "review_completed" : "changes_requested",
    actor_id: input.actorId,
    organization_id: String(data.organization_id),
    object_type: "approval",
    object_id: String(data.id),
  });
  await client.rpc("append_organization_activity", {
    p_organization_id: String(data.organization_id),
    p_action: `approval_${input.decision}`,
    p_target_type: "approval",
    p_target_id: String(data.id),
  });

  return {
    id: String(data.id),
    organizationId: String(data.organization_id),
    targetType: data.target_type as CollaborationTargetType,
    targetId: String(data.target_id),
    title: String(data.title),
    requestedBy: String(data.requested_by),
    assignedTo: String(data.assigned_to),
    status: data.status as EnterpriseApproval["status"],
    decisionNote: (data.decision_note as string | null) ?? null,
    createdAt: String(data.created_at),
    updatedAt: String(data.updated_at),
  };
}

export async function fetchApprovalsForUser(
  userId: string,
  organizationId?: string | null,
): Promise<EnterpriseApproval[]> {
  const client = db();
  if (!client) return localLoadApprovals(userId, organizationId);
  let query = client
    .from("enterprise_approvals")
    .select("*")
    .or(`assigned_to.eq.${userId},requested_by.eq.${userId}`)
    .order("created_at", { ascending: false });
  if (organizationId) query = query.eq("organization_id", organizationId);
  const { data } = await query;
  return ((data ?? []) as Record<string, unknown>[]).map((row) => ({
    id: String(row.id),
    organizationId: String(row.organization_id),
    targetType: row.target_type as CollaborationTargetType,
    targetId: String(row.target_id),
    title: String(row.title),
    requestedBy: String(row.requested_by),
    assignedTo: String(row.assigned_to),
    status: row.status as EnterpriseApproval["status"],
    decisionNote: (row.decision_note as string | null) ?? null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  }));
}

export async function fetchInboxNotifications(userId: string): Promise<UserNotification[]> {
  const client = db();
  if (!client) return localLoadNotifs(userId);
  const { data } = await client
    .from("user_notifications")
    .select("*")
    .eq("recipient_user_id", userId)
    .order("created_at", { ascending: false });
  return ((data ?? []) as Record<string, unknown>[]).map((row) => ({
    id: String(row.id),
    recipientUserId: String(row.recipient_user_id),
    notificationType: row.notification_type as UserNotification["notificationType"],
    actorId: (row.actor_id as string | null) ?? null,
    organizationId: (row.organization_id as string | null) ?? null,
    collaborationId: (row.collaboration_id as string | null) ?? null,
    objectType: (row.object_type as string | null) ?? null,
    objectId: (row.object_id as string | null) ?? null,
    safeMetadata: (row.safe_metadata as Record<string, string>) ?? {},
    readAt: (row.read_at as string | null) ?? null,
    createdAt: String(row.created_at),
  }));
}

export async function markInboxNotificationRead(
  notificationId: string,
  userId: string,
): Promise<boolean> {
  const client = db();
  if (!client) return localMarkNotif(notificationId, userId);
  const { error } = await client
    .from("user_notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .eq("recipient_user_id", userId)
    .is("read_at", null);
  return !error;
}

export async function markAllInboxNotificationsRead(userId: string): Promise<number> {
  const client = db();
  if (!client) {
    const items = localLoadNotifs(userId).filter((n) => !n.readAt);
    for (const n of items) localMarkNotif(n.id, userId);
    return items.length;
  }
  const { data } = await client
    .from("user_notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("recipient_user_id", userId)
    .is("read_at", null)
    .select("id");
  return data?.length ?? 0;
}

export async function countInboxUnread(userId: string): Promise<number> {
  const client = db();
  if (!client) return localCountNotifs(userId);
  const { count } = await client
    .from("user_notifications")
    .select("id", { count: "exact", head: true })
    .eq("recipient_user_id", userId)
    .is("read_at", null);
  return count ?? 0;
}

export async function countUnreadMentionsCloud(userId: string): Promise<number> {
  if (!sharedReady()) return localCountMentions(userId);
  const mentions = await fetchMentionsForUser(userId);
  return mentions.filter((m) => !m.readAt).length;
}

export async function markMentionReadCloud(
  mentionId: string,
  userId: string,
): Promise<EnterpriseMention | { readonly error: string }> {
  const client = db();
  if (!client) return localMarkMention(mentionId, userId);
  const { data, error } = await client
    .from("enterprise_mentions")
    .update({ read_at: new Date().toISOString() })
    .eq("id", mentionId)
    .eq("mentioned_user_id", userId)
    .select("*")
    .maybeSingle();
  if (error || !data) return { error: error?.message ?? "Mention update denied." };
  return {
    id: String(data.id),
    organizationId: String(data.organization_id),
    commentId: String(data.comment_id),
    mentionedUserId: String(data.mentioned_user_id),
    mentionedBy: String(data.mentioned_by),
    targetType: data.target_type as CollaborationTargetType,
    targetId: String(data.target_id),
    createdAt: String(data.created_at),
    readAt: (data.read_at as string | null) ?? null,
  };
}

export type OrganizationActivityEvent = {
  readonly id: string;
  readonly organizationId: string | null;
  readonly actorUserId: string | null;
  readonly action: string;
  readonly targetType: string | null;
  readonly targetId: string | null;
  readonly createdAt: string;
};

/**
 * Membership-scoped activity_events via RLS (anon key + user JWT).
 * Never uses service role.
 */
export async function fetchOrganizationActivityEvents(
  organizationId: string,
): Promise<OrganizationActivityEvent[] | { readonly error: string }> {
  const client = db();
  if (!client) {
    return { error: "Shared backend not configured — organization activity requires Preview Supabase." };
  }
  const { data, error } = await client
    .from("activity_events")
    .select("id,organization_id,actor_user_id,action,target_type,target_id,created_at")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) return { error: error.message };
  return ((data ?? []) as Record<string, unknown>[]).map((row) => ({
    id: String(row.id),
    organizationId: row.organization_id ? String(row.organization_id) : null,
    actorUserId: row.actor_user_id ? String(row.actor_user_id) : null,
    action: String(row.action ?? row.event_type ?? "event"),
    targetType: row.target_type ? String(row.target_type) : null,
    targetId: row.target_id ? String(row.target_id) : null,
    createdAt: String(row.created_at),
  }));
}

export function isEnterpriseCloudPersistenceActive(): boolean {
  return sharedReady();
}
