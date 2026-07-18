/**
 * Leadership monitoring — real derived metrics from Genesis execution records.
 */

import {
  loadDirectives,
  loadExecutionTasks,
  loadMeetings,
  loadDecisions,
} from "@/lib/genesis/execution-store";
import { loadContributionClaims, loadRecognitionRecords } from "@/lib/genesis/contribution-store";

export type MonitoringMetric = {
  readonly id: string;
  readonly label: string;
  readonly value: number;
  readonly definition: string;
  readonly sourceRecords: string;
  readonly scope: string;
  readonly period: string;
  readonly calculation: string;
  readonly lastUpdated: string;
  readonly limitation: string;
};

export function deriveLeadershipMetrics(organizationId: string): MonitoringMetric[] {
  const now = new Date().toISOString();
  const period = "all-time (device-local)";
  const directives = loadDirectives(organizationId);
  const tasks = loadExecutionTasks(organizationId);
  const meetings = loadMeetings(organizationId);
  const decisions = loadDecisions(organizationId);
  const contributions = loadContributionClaims().filter((c) => c.organizationId === organizationId);
  const recognition = loadRecognitionRecords();

  const base = {
    scope: `organization:${organizationId}`,
    period,
    lastUpdated: now,
  };

  return [
    {
      id: "active-directives",
      label: "Active directives",
      value: directives.filter((d) => d.status === "Active" || d.status === "Approved").length,
      definition: "Directives with status Active or Approved.",
      sourceRecords: "cbai-genesis-directives",
      calculation: "count(status in Active, Approved)",
      limitation: "Device-local only; not a team performance score.",
      ...base,
    },
    {
      id: "completed-directives",
      label: "Completed directives",
      value: directives.filter((d) => d.status === "Completed").length,
      definition: "Directives marked Completed.",
      sourceRecords: "cbai-genesis-directives",
      calculation: "count(status = Completed)",
      limitation: "Completion requires explicit status — not inferred.",
      ...base,
    },
    {
      id: "overdue-tasks",
      label: "Overdue tasks",
      value: tasks.filter(
        (t) =>
          t.deadline &&
          new Date(t.deadline).getTime() < Date.now() &&
          t.status !== "Completed" &&
          t.status !== "Cancelled",
      ).length,
      definition: "Execution tasks past deadline and not completed.",
      sourceRecords: "cbai-genesis-execution-tasks",
      calculation: "count(deadline < now AND status not Completed/Cancelled)",
      limitation: "Based on user-entered deadlines only.",
      ...base,
    },
    {
      id: "blocked-tasks",
      label: "Blocked tasks",
      value: tasks.filter((t) => t.status === "Blocked" || Boolean(t.blocker)).length,
      definition: "Tasks with Blocked status or a recorded blocker.",
      sourceRecords: "cbai-genesis-execution-tasks",
      calculation: "count(status = Blocked OR blocker present)",
      limitation: "Blockers are self-reported.",
      ...base,
    },
    {
      id: "awaiting-review",
      label: "Tasks awaiting review",
      value: tasks.filter((t) => t.approvalState === "pending" || t.status === "Awaiting Review").length,
      definition: "Tasks pending human review or approval.",
      sourceRecords: "cbai-genesis-execution-tasks",
      calculation: "count(approvalState = pending OR status = Awaiting Review)",
      limitation: "Not an employee ranking.",
      ...base,
    },
    {
      id: "meetings-held",
      label: "Meetings recorded",
      value: meetings.length,
      definition: "Meeting records created in Execution OS.",
      sourceRecords: "cbai-genesis-meetings",
      calculation: "count(all meetings for organization)",
      limitation: "User-created records only.",
      ...base,
    },
    {
      id: "decisions-recorded",
      label: "Decisions recorded",
      value: decisions.length,
      definition: "Human decisions linked to meetings.",
      sourceRecords: "cbai-genesis-decisions",
      calculation: "count(all decisions for organization)",
      limitation: "Does not verify decision quality.",
      ...base,
    },
    {
      id: "contributions-under-review",
      label: "Contributions under review",
      value: contributions.filter((c) => c.state === "Under Review" || c.state === "Claimed").length,
      definition: "Contribution claims not yet supported.",
      sourceRecords: "cbai-genesis-contributions",
      calculation: "count(state in Claimed, Under Review)",
      limitation: "No automatic attribution to leaders.",
      ...base,
    },
    {
      id: "supported-recognition",
      label: "Supported recognition records",
      value: recognition.filter((r) => r.status === "Supported").length,
      definition: "Recognition records with Supported status and linked evidence.",
      sourceRecords: "cbai-genesis-recognition",
      calculation: "count(status = Supported)",
      limitation: "Recognition is never sold or boosted.",
      ...base,
    },
  ];
}
