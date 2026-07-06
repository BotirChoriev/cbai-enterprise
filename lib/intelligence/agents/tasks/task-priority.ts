/** Agent task priority tier (BUILD-048). */
export type TaskPriority = "critical" | "high" | "normal" | "low" | "background";

/** Priority: critical. */
export const TASK_PRIORITY_CRITICAL = "critical" as const;

/** Priority: high. */
export const TASK_PRIORITY_HIGH = "high" as const;

/** Priority: normal. */
export const TASK_PRIORITY_NORMAL = "normal" as const;

/** Priority: low. */
export const TASK_PRIORITY_LOW = "low" as const;

/** Priority: background. */
export const TASK_PRIORITY_BACKGROUND = "background" as const;

/** All task priority tiers in descending dispatch order. */
export const ALL_TASK_PRIORITIES: readonly TaskPriority[] = [
  TASK_PRIORITY_CRITICAL,
  TASK_PRIORITY_HIGH,
  TASK_PRIORITY_NORMAL,
  TASK_PRIORITY_LOW,
  TASK_PRIORITY_BACKGROUND,
];

const TASK_PRIORITY_SET = new Set<string>(ALL_TASK_PRIORITIES);

/** Numeric rank for deterministic priority comparison — higher dispatches first. */
export const TASK_PRIORITY_RANK: Record<TaskPriority, number> = {
  critical: 5,
  high: 4,
  normal: 3,
  low: 2,
  background: 1,
};

/**
 * Returns true when the value is a known task priority.
 */
export function isTaskPriority(value: string): value is TaskPriority {
  return TASK_PRIORITY_SET.has(value);
}

/**
 * Resolve task priority with default normal.
 */
export function resolveTaskPriority(value: string | undefined): TaskPriority {
  if (value && isTaskPriority(value)) {
    return value;
  }

  return TASK_PRIORITY_NORMAL;
}

/**
 * Compare two task priorities for deterministic ordering.
 */
export function compareTaskPriority(a: TaskPriority, b: TaskPriority): number {
  return TASK_PRIORITY_RANK[b] - TASK_PRIORITY_RANK[a];
}

/**
 * Human-readable labels for task priorities.
 */
export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  critical: "Critical",
  high: "High",
  normal: "Normal",
  low: "Low",
  background: "Background",
};
