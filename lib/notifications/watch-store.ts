/**
 * Device-local watch subscriptions for verified changes.
 *
 * Watches record *what a person asked to be told about*. They never synthesise
 * notifications: verified-change events are only created by a real detection
 * pipeline. Until such a pipeline is configured, `describeUpdateCapability`
 * reports `manual_refresh_only` and the interface says so.
 *
 * Storage is per-identity via resolveStorageKey, so signing in does not merge
 * one person's watchlist into another's.
 */

import { resolveStorageKey } from "@/lib/storage/namespaced-key";
import type {
  CountryWatch,
  VerifiedChangeNotification,
  WatchTargetType,
} from "@/lib/notifications/verified-change-model";

const WATCH_KEY = "cbai-verified-change-watches";
const EVENT_KEY = "cbai-verified-change-events";

const memoryWatches: CountryWatch[] = [];
const memoryEvents: VerifiedChangeNotification[] = [];

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function read<T>(key: string, fallback: T[]): T[] {
  if (!isBrowser()) return [...fallback];
  try {
    const raw = window.localStorage.getItem(resolveStorageKey(key));
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function write<T>(key: string, items: readonly T[], fallback: T[]): void {
  if (!isBrowser()) {
    fallback.length = 0;
    fallback.push(...items);
    return;
  }
  window.localStorage.setItem(resolveStorageKey(key), JSON.stringify(items));
}

/** Every watch, newest first. */
export function listWatches(): readonly CountryWatch[] {
  return [...read<CountryWatch>(WATCH_KEY, memoryWatches)].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}

/**
 * Adds a watch. Idempotent per target: re-running never creates a duplicate and
 * never deletes an existing record.
 */
export function addWatch(input: {
  readonly targetType: WatchTargetType;
  readonly targetId: string;
  readonly targetLabel: string;
  readonly contentLocale: string;
  readonly pollingIntervalMinutes?: number | null;
}): CountryWatch {
  const existingAll = read<CountryWatch>(WATCH_KEY, memoryWatches);
  const existing = existingAll.find(
    (item) => item.targetType === input.targetType && item.targetId === input.targetId,
  );
  if (existing) return existing;

  const interval = input.pollingIntervalMinutes ?? null;
  const watch: CountryWatch = {
    id: `watch-${input.targetType}-${input.targetId}`,
    targetType: input.targetType,
    targetId: input.targetId,
    targetLabel: input.targetLabel,
    createdAt: new Date().toISOString(),
    contentLocale: input.contentLocale,
    enabled: true,
    pollingDisclosure: interval && interval > 0 ? "scheduled_polling" : "manual_refresh",
    pollingIntervalMinutes: interval,
  };
  write(WATCH_KEY, [...existingAll, watch], memoryWatches);
  return watch;
}

/** Removes one watch by id. Returns true when a record was removed. */
export function removeWatch(watchId: string): boolean {
  const all = read<CountryWatch>(WATCH_KEY, memoryWatches);
  const next = all.filter((item) => item.id !== watchId);
  if (next.length === all.length) return false;
  write(WATCH_KEY, next, memoryWatches);
  return true;
}

/** True when the given target is already watched. */
export function isWatched(targetType: WatchTargetType, targetId: string): boolean {
  return read<CountryWatch>(WATCH_KEY, memoryWatches).some(
    (item) => item.targetType === targetType && item.targetId === targetId,
  );
}

/**
 * Verified-change events detected so far. Empty until a real detection pipeline
 * writes to this store; the interface must not imply pending events exist.
 */
export function listVerifiedChangeEvents(): readonly VerifiedChangeNotification[] {
  return [...read<VerifiedChangeNotification>(EVENT_KEY, memoryEvents)].sort((a, b) =>
    b.detectedAt.localeCompare(a.detectedAt),
  );
}

/** Marks an event read. Returns true when the event existed and was unread. */
export function markVerifiedChangeRead(eventId: string): boolean {
  const all = read<VerifiedChangeNotification>(EVENT_KEY, memoryEvents);
  const index = all.findIndex((item) => item.id === eventId);
  if (index < 0 || all[index]!.readAt) return false;
  const next = [...all];
  next[index] = { ...all[index]!, readAt: new Date().toISOString() };
  write(EVENT_KEY, next, memoryEvents);
  return true;
}

/** Test-only reset. */
export function clearWatchStoreForTests(): void {
  memoryWatches.length = 0;
  memoryEvents.length = 0;
  if (!isBrowser()) return;
  window.localStorage.removeItem(resolveStorageKey(WATCH_KEY));
  window.localStorage.removeItem(resolveStorageKey(EVENT_KEY));
}
