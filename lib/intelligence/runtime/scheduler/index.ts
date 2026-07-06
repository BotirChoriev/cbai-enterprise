/**
 * CBAI Intelligence Runtime — Scheduler Foundation (BUILD-043).
 *
 * In-memory scheduler for future timed intelligence executions.
 * No timers, workers, persistence, browser APIs, or orchestrator wiring yet.
 *
 * @see docs/build-043-report.md
 */

export {
  DEFAULT_RUNTIME_SCHEDULER_ID,
  DefaultRuntimeScheduler,
  defaultRuntimeScheduler,
  listReadyAt,
  type RuntimeScheduler,
} from "@/lib/intelligence/runtime/scheduler/scheduler";

export {
  cancelScheduleItem,
  compareScheduleItemsForReady,
  createScheduleItem,
  createScheduleItemId,
  isScheduleItemExpired,
  isScheduleItemReady,
  resetScheduleItemSequence,
} from "@/lib/intelligence/runtime/scheduler/schedule-item";

export {
  DEFAULT_RUNTIME_SCHEDULER_POLICY,
  SCHEDULER_POLICY_CANCELLATION_REQUIRED_BEFORE_RESCHEDULE,
  SCHEDULER_POLICY_MAX_SCHEDULED_ITEMS,
  SCHEDULER_POLICY_REJECT_DUPLICATE_REQUEST_ID,
  SCHEDULER_POLICY_REJECT_PAST_SCHEDULED_TIME,
  resolveScheduleItemPriority,
  resolveScheduleReferenceAt,
  validateSchedule,
} from "@/lib/intelligence/runtime/scheduler/schedule-policy";

export {
  buildRuntimeSchedulerSnapshot,
  collectActiveScheduledRequestIds,
  countActiveScheduledItems,
  countExpiredScheduleItems,
  countScheduleItemsByStatus,
  listReadyScheduleItems,
} from "@/lib/intelligence/runtime/scheduler/schedule-state";

export type {
  RuntimeSchedulerPolicy,
  RuntimeSchedulerSnapshot,
  ScheduleInput,
  ScheduleItem,
  ScheduleItemStatus,
  ScheduleResult,
} from "@/lib/intelligence/runtime/scheduler/types";

export { RUNTIME_SCHEDULER_VERSION } from "@/lib/intelligence/runtime/scheduler/types";
