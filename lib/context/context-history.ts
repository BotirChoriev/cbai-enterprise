import type { ContextEntityRef } from "@/lib/context/context-types";

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
          (item as ContextEntityRef).kind === "project"),
    );
  } catch {
    return [];
  }
}

function writeEntityList(key: string, entities: readonly ContextEntityRef[]): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(key, JSON.stringify(entities));
}

/** Load recently viewed entities from local storage — architecture-backed, no fake entries. */
export function loadRecentEntities(): ContextEntityRef[] {
  if (!isBrowser()) return [];
  return parseEntityList(window.localStorage.getItem(RECENT_STORAGE_KEY));
}

/** Load pinned entities — architecture only; empty until user pinning ships. */
export function loadPinnedEntities(): ContextEntityRef[] {
  if (!isBrowser()) return [];
  return parseEntityList(window.localStorage.getItem(PINNED_STORAGE_KEY));
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

/** Pin an entity — architecture hook for future UI. */
export function pinEntity(entity: ContextEntityRef): ContextEntityRef[] {
  const existing = loadPinnedEntities();
  if (existing.some((item) => item.kind === entity.kind && item.id === entity.id)) {
    return existing;
  }
  const next = [...existing, entity];
  writeEntityList(PINNED_STORAGE_KEY, next);
  return next;
}

/** Unpin an entity — architecture hook for future UI. */
export function unpinEntity(kind: ContextEntityRef["kind"], id: string): ContextEntityRef[] {
  const next = loadPinnedEntities().filter(
    (item) => !(item.kind === kind && item.id === id),
  );
  writeEntityList(PINNED_STORAGE_KEY, next);
  return next;
}

export const RECENT_ENTITIES_ARCHITECTURE_NOTE =
  "Recent history stores locally viewed registry entities only — no fabricated activity.";

export const PINNED_ENTITIES_ARCHITECTURE_NOTE =
  "No entities pinned to this workspace yet — no default pins, nothing fabricated.";
