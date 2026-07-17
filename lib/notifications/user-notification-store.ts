/**
 * BUILD-035 — Persisted user notifications (device-local until shared backend sync).
 */

import { resolveStorageKey } from "@/lib/storage/namespaced-key";

export type NotificationType =
  | "invitation_received"
  | "invitation_accepted"
  | "invitation_declined"
  | "access_changed"
  | "object_shared"
  | "object_revoked"
  | "review_assigned"
  | "review_started"
  | "changes_requested"
  | "review_completed"
  | "participant_revoked"
  | "collaboration_revoked";

export type UserNotification = {
  readonly id: string;
  readonly recipientUserId: string;
  readonly notificationType: NotificationType;
  readonly actorId?: string | null;
  readonly organizationId?: string | null;
  readonly collaborationId?: string | null;
  readonly objectType?: string | null;
  readonly objectId?: string | null;
  readonly safeMetadata: Record<string, string>;
  readonly readAt?: string | null;
  readonly createdAt: string;
};

const STORAGE_KEY = "cbai-user-notifications";
const memory: UserNotification[] = [];

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readAll(): UserNotification[] {
  if (!isBrowser()) return [...memory];
  try {
    const raw = window.localStorage.getItem(resolveStorageKey(STORAGE_KEY));
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as UserNotification[]) : [];
  } catch {
    return [];
  }
}

function writeAll(items: readonly UserNotification[]): void {
  if (!isBrowser()) {
    memory.length = 0;
    memory.push(...items);
    return;
  }
  window.localStorage.setItem(resolveStorageKey(STORAGE_KEY), JSON.stringify(items));
}

export function createUserNotification(input: {
  readonly recipientUserId: string;
  readonly notificationType: NotificationType;
  readonly actorId?: string | null;
  readonly organizationId?: string | null;
  readonly collaborationId?: string | null;
  readonly objectType?: string | null;
  readonly objectId?: string | null;
  readonly safeMetadata?: Record<string, string>;
}): UserNotification {
  const notification: UserNotification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    recipientUserId: input.recipientUserId,
    notificationType: input.notificationType,
    actorId: input.actorId ?? null,
    organizationId: input.organizationId ?? null,
    collaborationId: input.collaborationId ?? null,
    objectType: input.objectType ?? null,
    objectId: input.objectId ?? null,
    safeMetadata: input.safeMetadata ?? {},
    readAt: null,
    createdAt: new Date().toISOString(),
  };
  writeAll([...readAll(), notification]);
  return notification;
}

export function loadUserNotifications(userId: string): UserNotification[] {
  return readAll()
    .filter((n) => n.recipientUserId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function countUnreadNotifications(userId: string): number {
  return loadUserNotifications(userId).filter((n) => !n.readAt).length;
}

export function markNotificationRead(notificationId: string, userId: string): boolean {
  const all = readAll();
  const index = all.findIndex((n) => n.id === notificationId && n.recipientUserId === userId);
  if (index < 0) return false;
  const now = new Date().toISOString();
  all[index] = { ...all[index]!, readAt: now };
  writeAll(all);
  return true;
}

export function clearNotificationsForTests(): void {
  memory.length = 0;
  if (!isBrowser()) return;
  window.localStorage.removeItem(resolveStorageKey(STORAGE_KEY));
}
