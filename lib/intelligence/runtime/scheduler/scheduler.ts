import {
  cancelScheduleItem,
  compareScheduleItemsForReady,
  createScheduleItem,
} from "@/lib/intelligence/runtime/scheduler/schedule-item";
import {
  DEFAULT_RUNTIME_SCHEDULER_POLICY,
  resolveScheduleItemPriority,
  resolveScheduleReferenceAt,
  validateSchedule,
} from "@/lib/intelligence/runtime/scheduler/schedule-policy";
import {
  buildRuntimeSchedulerSnapshot,
  collectActiveScheduledRequestIds,
  listReadyScheduleItems,
} from "@/lib/intelligence/runtime/scheduler/schedule-state";
import type {
  RuntimeSchedulerPolicy,
  RuntimeSchedulerSnapshot,
  ScheduleInput,
  ScheduleItem,
  ScheduleResult,
} from "@/lib/intelligence/runtime/scheduler/types";

/** Stable identifier for the default runtime scheduler. */
export const DEFAULT_RUNTIME_SCHEDULER_ID = "default-runtime-scheduler";

/**
 * Contract for the CBAI Runtime Scheduler (BUILD-043).
 *
 * In-memory foundation for future scheduled intelligence executions.
 * No timers, workers, persistence, or browser APIs.
 */
export interface RuntimeScheduler {
  /** Active scheduler policy. */
  readonly policy: RuntimeSchedulerPolicy;

  /** Schedule a new intelligence execution for a future time. */
  schedule(input: ScheduleInput): ScheduleResult;

  /** Cancel a scheduled item by id. */
  cancel(itemId: string, reason?: string): ScheduleItem | null;

  /** Retrieve a schedule item by id. */
  get(itemId: string): ScheduleItem | null;

  /** List all schedule items in deterministic createdAt order. */
  list(): readonly ScheduleItem[];

  /** Immutable scheduler state snapshot at an evaluation timestamp. */
  snapshot(evaluatedAt?: string): RuntimeSchedulerSnapshot;

  /** Remove all schedule items. */
  clear(): void;
}

/**
 * List items ready at the supplied timestamp — deterministic, no auto-execution.
 */
export function listReadyAt(
  scheduler: RuntimeScheduler,
  evaluatedAt: string,
): ScheduleItem[] {
  return listReadyScheduleItems(scheduler.list(), evaluatedAt).sort(
    compareScheduleItemsForReady,
  );
}

/**
 * Default in-memory runtime scheduler (BUILD-043).
 */
export class DefaultRuntimeScheduler implements RuntimeScheduler {
  readonly policy: RuntimeSchedulerPolicy;
  private items: ScheduleItem[] = [];

  constructor(policy: RuntimeSchedulerPolicy = DEFAULT_RUNTIME_SCHEDULER_POLICY) {
    this.policy = { ...policy };
  }

  schedule(input: ScheduleInput): ScheduleResult {
    const validation = validateSchedule(
      input,
      this.policy,
      collectActiveScheduledRequestIds(this.items),
      this.items.length,
    );

    if (!validation.accepted) {
      return { accepted: false, reason: validation.reason };
    }

    const referenceAt = resolveScheduleReferenceAt(input);
    const item = createScheduleItem({
      requestId: input.requestId.trim(),
      scheduledFor: input.scheduledFor.trim(),
      priority: resolveScheduleItemPriority(input),
      reason: input.reason,
      timestamp: referenceAt,
    });

    this.items.push(item);

    return { accepted: true, item };
  }

  cancel(itemId: string, reason?: string): ScheduleItem | null {
    const index = this.items.findIndex((item) => item.id === itemId);

    if (index === -1) {
      return null;
    }

    const current = this.items[index];

    if (current.status === "cancelled") {
      return { ...current };
    }

    const cancelled = cancelScheduleItem(current, new Date().toISOString(), reason);
    this.items[index] = cancelled;

    return { ...cancelled };
  }

  get(itemId: string): ScheduleItem | null {
    const item = this.items.find((entry) => entry.id === itemId);
    return item ? { ...item } : null;
  }

  list(): readonly ScheduleItem[] {
    return [...this.items].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  snapshot(evaluatedAt: string = new Date().toISOString()): RuntimeSchedulerSnapshot {
    return buildRuntimeSchedulerSnapshot(this.items, this.policy, evaluatedAt);
  }

  clear(): void {
    this.items = [];
  }
}

/** Shared default runtime scheduler singleton. */
export const defaultRuntimeScheduler = new DefaultRuntimeScheduler();
