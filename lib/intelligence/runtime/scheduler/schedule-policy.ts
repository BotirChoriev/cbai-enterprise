import type {
  RuntimeSchedulerPolicy,
  ScheduleInput,
} from "@/lib/intelligence/runtime/scheduler/types";

/** Default runtime scheduler policy (BUILD-043). */
export const DEFAULT_RUNTIME_SCHEDULER_POLICY: RuntimeSchedulerPolicy = {
  maxScheduledItems: 100,
  rejectDuplicateRequestId: true,
  rejectPastScheduledTime: true,
  cancellationRequiredBeforeReschedule: true,
};

/** Policy flag label: max scheduled items. */
export const SCHEDULER_POLICY_MAX_SCHEDULED_ITEMS = "maxScheduledItems" as const;

/** Policy flag label: reject duplicate request id. */
export const SCHEDULER_POLICY_REJECT_DUPLICATE_REQUEST_ID =
  "rejectDuplicateRequestId" as const;

/** Policy flag label: reject past scheduled time. */
export const SCHEDULER_POLICY_REJECT_PAST_SCHEDULED_TIME =
  "rejectPastScheduledTime" as const;

/** Policy flag label: cancellation required before reschedule. */
export const SCHEDULER_POLICY_CANCELLATION_REQUIRED_BEFORE_RESCHEDULE =
  "cancellationRequiredBeforeReschedule" as const;

/**
 * Resolve reference time for schedule validation.
 */
export function resolveScheduleReferenceAt(input: ScheduleInput): string {
  return input.referenceAt ?? new Date().toISOString();
}

/**
 * Resolve stored priority for a schedule item.
 */
export function resolveScheduleItemPriority(input: ScheduleInput): number {
  if (input.priority === undefined || !Number.isFinite(input.priority)) {
    return 0;
  }

  return Math.round(input.priority);
}

/**
 * Validate schedule input against policy and existing active scheduled items.
 */
export function validateSchedule(
  input: ScheduleInput,
  policy: RuntimeSchedulerPolicy,
  activeScheduledRequestIds: ReadonlySet<string>,
  currentSize: number,
): { accepted: true } | { accepted: false; reason: string } {
  if (!input.requestId.trim()) {
    return { accepted: false, reason: "Schedule reject: request id is required." };
  }

  if (!input.scheduledFor.trim()) {
    return { accepted: false, reason: "Schedule reject: scheduledFor is required." };
  }

  if (currentSize >= policy.maxScheduledItems) {
    return {
      accepted: false,
      reason: `Schedule reject: max scheduled items (${policy.maxScheduledItems}) reached.`,
    };
  }

  const referenceAt = resolveScheduleReferenceAt(input);

  if (
    policy.rejectPastScheduledTime &&
    input.scheduledFor.localeCompare(referenceAt) < 0
  ) {
    return {
      accepted: false,
      reason: "Schedule reject: scheduledFor is in the past.",
    };
  }

  if (
    (policy.rejectDuplicateRequestId || policy.cancellationRequiredBeforeReschedule) &&
    activeScheduledRequestIds.has(input.requestId)
  ) {
    return {
      accepted: false,
      reason: `Schedule reject: active schedule exists for request id "${input.requestId}" — cancel before rescheduling.`,
    };
  }

  return { accepted: true };
}
