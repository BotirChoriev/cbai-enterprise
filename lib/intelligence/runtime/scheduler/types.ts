/** Schedule item lifecycle status (BUILD-043). */
export type ScheduleItemStatus = "scheduled" | "cancelled";

/**
 * Policy governing runtime scheduler behavior (BUILD-043).
 */
export interface RuntimeSchedulerPolicy {
  /** Maximum number of schedule items allowed. */
  maxScheduledItems: number;
  /** Reject schedule when request id already has an active scheduled item. */
  rejectDuplicateRequestId: boolean;
  /** Reject schedule when scheduledFor is before reference time. */
  rejectPastScheduledTime: boolean;
  /** Require cancellation before rescheduling the same request id. */
  cancellationRequiredBeforeReschedule: boolean;
}

/**
 * A scheduled intelligence execution item.
 */
export interface ScheduleItem {
  /** Unique schedule item identifier. */
  id: string;
  /** Source intelligence request id. */
  requestId: string;
  /** Current schedule item status. */
  status: ScheduleItemStatus;
  /** ISO-8601 timestamp when execution should become ready. */
  scheduledFor: string;
  /** ISO-8601 timestamp when the item was scheduled. */
  createdAt: string;
  /** ISO-8601 timestamp when the item was last updated. */
  updatedAt: string;
  /** ISO-8601 timestamp when the item was cancelled, if applicable. */
  cancelledAt?: string;
  /** Optional factual reason or note — no business intelligence. */
  reason?: string;
  /** Stored priority for future dispatch ordering — not used for execution in BUILD-043. */
  priority: number;
}

/**
 * Input for scheduling a new intelligence execution.
 */
export interface ScheduleInput {
  /** Intelligence request id to schedule. */
  requestId: string;
  /** ISO-8601 timestamp when execution should become ready. */
  scheduledFor: string;
  /** Stored priority (default 0). */
  priority?: number;
  /** Optional schedule reason. */
  reason?: string;
  /** Reference time for past-time validation (defaults to now). */
  referenceAt?: string;
}

/**
 * Result of a schedule operation.
 */
export interface ScheduleResult {
  /** Whether the schedule was accepted. */
  accepted: boolean;
  /** Scheduled item when accepted. */
  item?: ScheduleItem;
  /** Rejection reason when not accepted. */
  reason?: string;
}

/**
 * Immutable runtime scheduler state snapshot (BUILD-043).
 */
export interface RuntimeSchedulerSnapshot {
  /** Total items tracked by the scheduler. */
  total: number;
  /** Items with status scheduled and not yet expired at evaluation time. */
  scheduled: number;
  /** Items with status cancelled. */
  cancelled: number;
  /** Items with status scheduled but scheduledFor before evaluation time. */
  expired: number;
  /** Items ready for dispatch at evaluation time (scheduled and due). */
  readyCount: number;
  /** ISO-8601 timestamp used for ready/expired evaluation. */
  evaluatedAt: string;
  /** Active scheduler policy at snapshot time. */
  policy: RuntimeSchedulerPolicy;
  /** Scheduler semantic version. */
  schedulerVersion: string;
}

/** Semantic version of the runtime scheduler foundation. */
export const RUNTIME_SCHEDULER_VERSION = "0.1.0-scheduler-foundation";
