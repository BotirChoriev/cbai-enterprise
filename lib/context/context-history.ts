import type { ContextEntityRef } from "@/lib/context/context-types";
import { resolveStorageKey } from "@/lib/storage/namespaced-key";
import { getSyncedCloudUserId } from "@/lib/supabase/cloud-session-sync";
import { enqueueSync } from "@/lib/supabase/outbox";

const RECENT_STORAGE_KEY = "cbai-platform-recent-entities";
const PINNED_STORAGE_KEY = "cbai-platform-pinned-entities";
const MAX_RECENT = 8;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function parseEntityList(raw: string | null): ContextEntityRef[] {
  if (!raw) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (item): item is ContextEntityRef =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as ContextEntityRef).id === "string" &&
        typeof (item as ContextEntityRef).name === "string" &&
        ((item as ContextEntityRef).kind === "country" ||
          (item as ContextEntityRef).kind === "company" ||
          (item as ContextEntityRef).kind === "university" ||
          (item as ContextEntityRef).kind === "research_topic" ||
          (item as ContextEntityRef).kind === "project" ||
          (item as ContextEntityRef).kind === "evidence"),
    );
  } catch {
    return [];
  }
}

function writeEntityList(key: string, entities: readonly ContextEntityRef[]): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(resolveStorageKey(key), JSON.stringify(entities));
}

/** Load recently viewed entities from local storage — architecture-backed, no fake entries.
 * Real-user-namespaced (Authentication + User Platform Foundation mission): a signed-in user sees
 * only their own recent activity. */
export function loadRecentEntities(): ContextEntityRef[] {
  if (!isBrowser()) return [];
  return parseEntityList(window.localStorage.getItem(resolveStorageKey(RECENT_STORAGE_KEY)));
}

/** Load pinned entities (Bookmarks) — real-user-namespaced, same as loadRecentEntities. */
export function loadPinnedEntities(): ContextEntityRef[] {
  if (!isBrowser()) return [];
  return parseEntityList(window.localStorage.getItem(resolveStorageKey(PINNED_STORAGE_KEY)));
}

/** Record an entity view in recent history — deduplicated, capped. */
export function recordRecentEntity(entity: ContextEntityRef): ContextEntityRef[] {
  const existing = loadRecentEntities().filter(
    (item) => !(item.kind === entity.kind && item.id === entity.id),
  );
  const next = [entity, ...existing].slice(0, MAX_RECENT);
  writeEntityList(RECENT_STORAGE_KEY, next);
  return next;
}

function syncBookmarkRow(entity: ContextEntityRef): void {
  const ownerId = getSyncedCloudUserId();
  if (!ownerId) return;
  enqueueSync(ownerId, "bookmarks", "upsert", `${entity.kind}:${entity.id}`, {
    owner_id: ownerId,
    local_id: `${entity.kind}:${entity.id}`,
    entity_kind: entity.kind,
    entity_id: entity.id,
    entity_name: entity.name,
    entity_code: entity.code ?? null,
    entity_country_name: entity.countryName ?? null,
  });
}

function syncDeleteBookmark(kind: ContextEntityRef["kind"], id: string): void {
  const ownerId = getSyncedCloudUserId();
  if (!ownerId) return;
  enqueueSync(ownerId, "bookmarks", "delete", `${kind}:${id}`);
}

/** Pin an entity — real Bookmark, synced to the cloud when a cloud session is active. */
export function pinEntity(entity: ContextEntityRef): ContextEntityRef[] {
  const existing = loadPinnedEntities();
  if (existing.some((item) => item.kind === entity.kind && item.id === entity.id)) {
    return existing;
  }
  const next = [...existing, entity];
  writeEntityList(PINNED_STORAGE_KEY, next);
  syncBookmarkRow(entity);
  return next;
}

/** Unpin an entity — real Bookmark removal, synced to the cloud when a cloud session is active. */
export function unpinEntity(kind: ContextEntityRef["kind"], id: string): ContextEntityRef[] {
  const next = loadPinnedEntities().filter(
    (item) => !(item.kind === kind && item.id === id),
  );
  writeEntityList(PINNED_STORAGE_KEY, next);
  syncDeleteBookmark(kind, id);
  return next;
}

export const RECENT_ENTITIES_ARCHITECTURE_NOTE =
  "Profiles you open will appear here. Search a country, company, or university to begin.";

export const PINNED_ENTITIES_ARCHITECTURE_NOTE =
  "Nothing pinned yet. Pin a profile from search to save it here.";
