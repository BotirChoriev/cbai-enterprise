import type { ScheduleItem } from "@/lib/intelligence/runtime/scheduler/types";

/** Schedule item sequence for deterministic id generation within a process. */
let scheduleItemSequence = 0;

/**
 * Reset schedule item sequence — useful for deterministic tests.
 */
export function resetScheduleItemSequence(): void {
  scheduleItemSequence = 0;
}

/**
 * Generate a unique schedule item identifier.
 */
export function createScheduleItemId(requestId: string): string {
  scheduleItemSequence += 1;
  return `schedule-item-${requestId}-${scheduleItemSequence}`;
}

/**
 * Create a new scheduled queue item.
 */
export function createScheduleItem(input: {
  requestId: string;
  scheduledFor: string;
  priority: number;
  reason?: string;
  timestamp?: string;
}): ScheduleItem {
  const timestamp = input.timestamp ?? new Date().toISOString();

  return {
    id: createScheduleItemId(input.requestId),
    requestId: input.requestId,
    status: "scheduled",
    scheduledFor: input.scheduledFor,
    createdAt: timestamp,
    updatedAt: timestamp,
    priority: input.priority,
    reason: input.reason,
  };
}

/**
 * Produce an updated schedule item with cancelled status.
 */
export function cancelScheduleItem(
  item: ScheduleItem,
  timestamp: string = new Date().toISOString(),
  reason?: string,
): ScheduleItem {
  return {
    ...item,
    status: "cancelled",
    updatedAt: timestamp,
    cancelledAt: timestamp,
    reason: reason ?? item.reason,
  };
}

/**
 * Compare schedule items for deterministic ready-list ordering.
 */
export function compareScheduleItemsForReady(a: ScheduleItem, b: ScheduleItem): number {
  if (b.priority !== a.priority) {
    return b.priority - a.priority;
  }

  const scheduledCompare = a.scheduledFor.localeCompare(b.scheduledFor);

  if (scheduledCompare !== 0) {
    return scheduledCompare;
  }

  return a.id.localeCompare(b.id);
}

/**
 * Returns true when a scheduled item is ready at the supplied evaluation time.
 */
export function isScheduleItemReady(item: ScheduleItem, evaluatedAt: string): boolean {
  if (item.status !== "scheduled") {
    return false;
  }

  return item.scheduledFor.localeCompare(evaluatedAt) <= 0;
}

/**
 * Returns true when a scheduled item is expired at the supplied evaluation time.
 */
export function isScheduleItemExpired(item: ScheduleItem, evaluatedAt: string): boolean {
  if (item.status !== "scheduled") {
    return false;
  }

  return item.scheduledFor.localeCompare(evaluatedAt) < 0;
}
