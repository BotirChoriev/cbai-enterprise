/**
 * @mentions extracted from comments — organization-scoped, never cross-tenant.
 * Syntax: @userId (exact participant id token).
 */

import { resolveStorageKey } from "@/lib/storage/namespaced-key";
import type { EnterpriseComment, EnterpriseMention } from "@/lib/enterprise-collaboration/types";
import { assertUserBelongsToOrganization } from "@/lib/enterprise-collaboration/isolation";
import { createUserNotification } from "@/lib/notifications/user-notification-store";
import { loadMembershipForUser } from "@/lib/organization-os/organization-membership-store";

const KEY = "cbai-enterprise-mentions";
const memory: EnterpriseMention[] = [];
const MENTION_RE = /@([a-zA-Z0-9_-]+)/g;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readAll(): EnterpriseMention[] {
  if (!isBrowser()) return [...memory];
  try {
    const raw = window.localStorage.getItem(resolveStorageKey(KEY));
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as EnterpriseMention[]) : [];
  } catch {
    return [];
  }
}

function writeAll(items: readonly EnterpriseMention[]): void {
  if (!isBrowser()) {
    memory.length = 0;
    memory.push(...items);
    return;
  }
  window.localStorage.setItem(resolveStorageKey(KEY), JSON.stringify(items));
}

export function extractMentionUserIds(body: string): string[] {
  const ids = new Set<string>();
  for (const match of body.matchAll(MENTION_RE)) {
    if (match[1]) ids.add(match[1]);
  }
  return [...ids];
}

export function createMentionsFromComment(comment: EnterpriseComment): EnterpriseMention[] {
  const mentioned = extractMentionUserIds(comment.body);
  const created: EnterpriseMention[] = [];
  const now = comment.createdAt;
  for (const mentionedUserId of mentioned) {
    if (mentionedUserId === comment.authorId) continue;
    // Only mention users who belong to the same organization.
    if (!loadMembershipForUser(mentionedUserId, comment.organizationId)) continue;
    const mention: EnterpriseMention = {
      id: `men-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      organizationId: comment.organizationId,
      commentId: comment.id,
      mentionedUserId,
      mentionedBy: comment.authorId,
      targetType: comment.targetType,
      targetId: comment.targetId,
      createdAt: now,
      readAt: null,
    };
    created.push(mention);
    createUserNotification({
      recipientUserId: mentionedUserId,
      notificationType: "access_changed",
      actorId: comment.authorId,
      organizationId: comment.organizationId,
      objectType: "mention",
      objectId: mention.id,
      safeMetadata: { kind: "mention", commentId: comment.id },
    });
  }
  if (created.length > 0) writeAll([...readAll(), ...created]);
  return created;
}

export function loadMentionsForUser(userId: string): EnterpriseMention[] {
  return readAll()
    .filter((m) => m.mentionedUserId === userId)
    .filter((m) => Boolean(loadMembershipForUser(userId, m.organizationId)))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function countUnreadMentions(userId: string): number {
  return loadMentionsForUser(userId).filter((m) => !m.readAt).length;
}

export function markMentionRead(
  mentionId: string,
  userId: string,
): EnterpriseMention | { readonly error: string } {
  const all = readAll();
  const mention = all.find((m) => m.id === mentionId);
  if (!mention) return { error: "Mention not found." };
  if (mention.mentionedUserId !== userId) return { error: "Access denied." };
  const gate = assertUserBelongsToOrganization(userId, mention.organizationId);
  if (!gate.ok) return { error: gate.error };
  const updated: EnterpriseMention = { ...mention, readAt: new Date().toISOString() };
  writeAll(all.map((m) => (m.id === mentionId ? updated : m)));
  return updated;
}

export function clearEnterpriseMentionsForTests(): void {
  memory.length = 0;
  if (isBrowser()) window.localStorage.removeItem(resolveStorageKey(KEY));
}
