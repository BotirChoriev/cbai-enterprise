/** Shared attention selectors for operator and cabinet. */

import { loadExecutionTasks } from "@/lib/genesis/execution-store";
import { loadProgressUpdates } from "@/lib/genesis/progress-update-store";

export function tasksNeedingProgressCount(): number {
  const weekAgo = Date.now() - 7 * 86400000;
  return loadExecutionTasks().filter((t) => {
    if (t.status === "Completed" || t.status === "Cancelled") return false;
    const latest = loadProgressUpdates({ taskId: t.id })[0];
    return !latest || new Date(latest.reportedDate).getTime() < weekAgo;
  }).length;
}
