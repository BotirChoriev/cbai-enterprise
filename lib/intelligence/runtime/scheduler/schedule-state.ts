import {
  isScheduleItemExpired,
  isScheduleItemReady,
} from "@/lib/intelligence/runtime/scheduler/schedule-item";
import type {
  RuntimeSchedulerPolicy,
  RuntimeSchedulerSnapshot,
  ScheduleItem,
} from "@/lib/intelligence/runtime/scheduler/types";
import { RUNTIME_SCHEDULER_VERSION } from "@/lib/intelligence/runtime/scheduler/types";

/**
 * Count schedule items by status.
 */
export function countScheduleItemsByStatus(
  items: readonly ScheduleItem[],
  status: ScheduleItem["status"],
): number {
  return items.filter((item) => item.status === status).length;
}

/**
 * List items ready at the supplied evaluation timestamp — does not execute them.
 */
export function listReadyScheduleItems(
  items: readonly ScheduleItem[],
  evaluatedAt: string,
): ScheduleItem[] {
  return items
    .filter((item) => isScheduleItemReady(item, evaluatedAt))
    .map((item) => ({ ...item }))
    .sort((a, b) => {
      const priorityCompare = b.priority - a.priority;

      if (priorityCompare !== 0) {
        return priorityCompare;
      }

      return a.scheduledFor.localeCompare(b.scheduledFor);
    });
}

/**
 * Count expired scheduled items at evaluation time.
 */
export function countExpiredScheduleItems(
  items: readonly ScheduleItem[],
  evaluatedAt: string,
): number {
  return items.filter((item) => isScheduleItemExpired(item, evaluatedAt)).length;
}

/**
 * Count active scheduled items (status scheduled, not expired at evaluation time).
 */
export function countActiveScheduledItems(
  items: readonly ScheduleItem[],
  evaluatedAt: string,
): number {
  return items.filter(
    (item) => item.status === "scheduled" && !isScheduleItemExpired(item, evaluatedAt),
  ).length;
}

/**
 * Build an immutable runtime scheduler state snapshot.
 */
export function buildRuntimeSchedulerSnapshot(
  items: readonly ScheduleItem[],
  policy: RuntimeSchedulerPolicy,
  evaluatedAt: string = new Date().toISOString(),
): RuntimeSchedulerSnapshot {
  const readyItems = listReadyScheduleItems(items, evaluatedAt);

  return {
    total: items.length,
    scheduled: countActiveScheduledItems(items, evaluatedAt),
    cancelled: countScheduleItemsByStatus(items, "cancelled"),
    expired: countExpiredScheduleItems(items, evaluatedAt),
    readyCount: readyItems.length,
    evaluatedAt,
    policy: { ...policy },
    schedulerVersion: RUNTIME_SCHEDULER_VERSION,
  };
}

/**
 * Collect request ids with active scheduled status.
 */
export function collectActiveScheduledRequestIds(
  items: readonly ScheduleItem[],
): Set<string> {
  const ids = new Set<string>();

  for (const item of items) {
    if (item.status === "scheduled") {
      ids.add(item.requestId);
    }
  }

  return ids;
}
