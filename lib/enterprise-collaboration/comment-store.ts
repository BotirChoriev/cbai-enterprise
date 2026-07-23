/**
 * Organization-scoped comments (device-local). Never crosses org boundaries.
 */

import { resolveStorageKey } from "@/lib/storage/namespaced-key";
import type { CollaborationTargetType, EnterpriseComment } from "@/lib/enterprise-collaboration/types";
import { assertUserBelongsToOrganization } from "@/lib/enterprise-collaboration/isolation";
import { createMentionsFromComment } from "@/lib/enterprise-collaboration/mention-store";

const KEY = "cbai-enterprise-comments";
const memory: EnterpriseComment[] = [];

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readAll(): EnterpriseComment[] {
  if (!isBrowser()) return [...memory];
  try {
    const raw = window.localStorage.getItem(resolveStorageKey(KEY));
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as EnterpriseComment[]) : [];
  } catch {
    return [];
  }
}

function writeAll(items: readonly EnterpriseComment[]): void {
  if (!isBrowser()) {
    memory.length = 0;
    memory.push(...items);
    return;
  }
  window.localStorage.setItem(resolveStorageKey(KEY), JSON.stringify(items));
}

function isComment(v: unknown): v is EnterpriseComment {
  const c = v as EnterpriseComment;
  return typeof c?.id === "string" && typeof c?.organizationId === "string" && typeof c?.body === "string";
}

export function createEnterpriseComment(input: {
  readonly organizationId: string;
  readonly authorId: string;
  readonly targetType: CollaborationTargetType;
  readonly targetId: string;
  readonly body: string;
  readonly parentId?: string | null;
}): EnterpriseComment | { readonly error: string } {
  const gate = assertUserBelongsToOrganization(input.authorId, input.organizationId);
  if (!gate.ok) return { error: gate.error };
  const body = input.body.trim();
  if (!body) return { error: "Comment body is required." };

  const now = new Date().toISOString();
  const comment: EnterpriseComment = {
    id: `cmt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    organizationId: input.organizationId,
    targetType: input.targetType,
    targetId: input.targetId,
    authorId: input.authorId,
    body,
    parentId: input.parentId ?? null,
    createdAt: now,
    updatedAt: now,
  };
  writeAll([...readAll().filter(isComment), comment]);
  createMentionsFromComment(comment);
  return comment;
}

export function loadEnterpriseCommentsForOrganization(
  userId: string,
  organizationId: string,
): EnterpriseComment[] | { readonly error: string } {
  const gate = assertUserBelongsToOrganization(userId, organizationId);
  if (!gate.ok) return { error: gate.error };
  return readAll()
    .filter(isComment)
    .filter((c) => c.organizationId === organizationId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function loadEnterpriseCommentsForTarget(
  userId: string,
  organizationId: string,
  targetType: CollaborationTargetType,
  targetId: string,
): EnterpriseComment[] | { readonly error: string } {
  const all = loadEnterpriseCommentsForOrganization(userId, organizationId);
  if ("error" in all) return all;
  return all.filter((c) => c.targetType === targetType && c.targetId === targetId);
}

export function clearEnterpriseCommentsForTests(): void {
  memory.length = 0;
  if (isBrowser()) window.localStorage.removeItem(resolveStorageKey(KEY));
}
