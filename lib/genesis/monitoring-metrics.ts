/**
 * Leadership monitoring — real derived metrics from Genesis execution records.
 */

import {
  loadDirectives,
  loadExecutionTasks,
  loadMeetings,
  loadDecisions,
} from "@/lib/genesis/execution-store";
import {
  loadContributionClaims,
  loadRecognitionRecords,
} from "@/lib/genesis/contribution-store";
import { loadProgressUpdates } from "@/lib/genesis/progress-update-store";
import { loadOpenBlockers, loadBlockers } from "@/lib/genesis/blocker-store";
import { loadOutcomes } from "@/lib/genesis/outcome-store";

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
  readonly recordIds?: readonly string[];
};

export function deriveLeadershipMetrics(organizationId: string): MonitoringMetric[] {
  const now = new Date().toISOString();
  const period = "all-time (device-local)";
  const directives = loadDirectives(organizationId);
  const tasks = loadExecutionTasks(organizationId);
  const meetings = loadMeetings(organizationId);
  const decisions = loadDecisions(organizationId);
  const contributions = loadContributionClaims({ organizationId });
  const recognition = loadRecognitionRecords();
  const progressUpdates = loadProgressUpdates({ organizationId });
  const openBlockers = loadOpenBlockers(organizationId);
  const allBlockers = loadBlockers({ organizationId });
  const outcomes = loadOutcomes({ organizationId });

  const base = {
    scope: `organization:${organizationId}`,
    period,
    lastUpdated: now,
  };

  const humanDecisionBlockers = openBlockers.filter(
    (b) => b.blockerType === "Human Decision Required" || b.status === "Action Required",
  );

  return [
    {
      id: "progress-updates",
      label: "Progress updates recorded",
      value: progressUpdates.length,
      definition: "Progress update records for this organization.",
      sourceRecords: "cbai-genesis-progress-updates",
      calculation: "count(all progress updates for organization)",
      limitation: "No inferred progress percentages.",
      recordIds: progressUpdates.slice(0, 5).map((p) => p.id),
      ...base,
    },
    {
      id: "open-blockers",
      label: "Open blockers",
      value: openBlockers.length,
      definition: "Blockers with Open, Under Review, or Action Required status.",
      sourceRecords: "cbai-genesis-blockers",
      calculation: "count(open blocker records)",
      limitation: "Self-reported; not a risk score.",
      recordIds: openBlockers.map((b) => b.id),
      ...base,
    },
    {
      id: "blockers-human-decision",
      label: "Blockers requiring human decision",
      value: humanDecisionBlockers.length,
      definition: "Open blockers flagged for human decision.",
      sourceRecords: "cbai-genesis-blockers",
      calculation: "count(open AND Human Decision Required or Action Required)",
      limitation: "Human must decide — CBAI does not decide.",
      recordIds: humanDecisionBlockers.map((b) => b.id),
      ...base,
    },
    {
      id: "resolved-blockers",
      label: "Resolved blockers",
      value: allBlockers.filter((b) => b.status === "Resolved" || b.status === "Closed").length,
      definition: "Blockers marked Resolved or Closed with resolution text.",
      sourceRecords: "cbai-genesis-blockers",
      calculation: "count(status in Resolved, Closed)",
      limitation: "Resolution is user-recorded.",
      recordIds: allBlockers.filter((b) => b.status === "Resolved").slice(0, 5).map((b) => b.id),
      ...base,
    },
    {
      id: "active-directives",
      label: "Active directives",
      value: directives.filter((d) => d.status === "Active" || d.status === "Approved").length,
      definition: "Directives with status Active or Approved.",
      sourceRecords: "cbai-genesis-directives",
      calculation: "count(status in Active, Approved)",
      limitation: "Device-local only; not a team performance score.",
      recordIds: directives.filter((d) => d.status === "Active").slice(0, 5).map((d) => d.id),
      ...base,
    },
    {
      id: "overdue-tasks",
      label: "Overdue tasks (not blocked)",
      value: tasks.filter(
        (t) =>
          t.deadline &&
          new Date(t.deadline).getTime() < Date.now() &&
          t.status !== "Completed" &&
          t.status !== "Cancelled" &&
          t.status !== "Blocked",
      ).length,
      definition: "Execution tasks past deadline, excluding blocked tasks.",
      sourceRecords: "cbai-genesis-execution-tasks",
      calculation: "count(deadline < now AND not Completed/Cancelled/Blocked)",
      limitation: "Blocked and overdue are counted separately.",
      recordIds: tasks
        .filter(
          (t) =>
            t.deadline &&
            new Date(t.deadline).getTime() < Date.now() &&
            t.status !== "Completed" &&
            t.status !== "Blocked",
        )
        .slice(0, 5)
        .map((t) => t.id),
      ...base,
    },
    {
      id: "blocked-tasks",
      label: "Blocked tasks",
      value: tasks.filter((t) => t.status === "Blocked" || Boolean(t.blocker)).length,
      definition: "Tasks with Blocked status or open blocker link.",
      sourceRecords: "cbai-genesis-execution-tasks",
      calculation: "count(status = Blocked OR blocker present)",
      limitation: "Distinct from overdue metric.",
      recordIds: tasks.filter((t) => t.status === "Blocked").slice(0, 5).map((t) => t.id),
      ...base,
    },
    {
      id: "outcomes-awaiting-evidence",
      label: "Outcomes awaiting evidence",
      value: outcomes.filter(
        (o) => o.verificationStatus === "Draft" || o.verificationStatus === "Evidence Missing",
      ).length,
      definition: "Outcomes not yet submitted with evidence.",
      sourceRecords: "cbai-genesis-outcomes",
      calculation: "count(verification in Draft, Evidence Missing)",
      limitation: "Output ≠ outcome ≠ impact — kept separate.",
      recordIds: outcomes
        .filter((o) => o.verificationStatus === "Evidence Missing")
        .slice(0, 5)
        .map((o) => o.id),
      ...base,
    },
    {
      id: "outcomes-awaiting-review",
      label: "Outcomes awaiting review",
      value: outcomes.filter((o) => o.verificationStatus === "Submitted for Review").length,
      definition: "Outcomes submitted for human review.",
      sourceRecords: "cbai-genesis-outcomes",
      calculation: "count(verification = Submitted for Review)",
      limitation: "Review is human, not automatic.",
      recordIds: outcomes.filter((o) => o.verificationStatus === "Submitted for Review").map((o) => o.id),
      ...base,
    },
    {
      id: "supported-outcomes",
      label: "Supported outcomes",
      value: outcomes.filter((o) => o.verificationStatus === "Supported").length,
      definition: "Outcomes with Supported verification and evidence.",
      sourceRecords: "cbai-genesis-outcomes",
      calculation: "count(verification = Supported)",
      limitation: "Requires evidence and reviewer.",
      recordIds: outcomes.filter((o) => o.verificationStatus === "Supported").map((o) => o.id),
      ...base,
    },
    {
      id: "disputed-outcomes",
      label: "Disputed outcomes",
      value: outcomes.filter((o) => o.verificationStatus === "Disputed").length,
      definition: "Outcomes marked Disputed.",
      sourceRecords: "cbai-genesis-outcomes",
      calculation: "count(verification = Disputed)",
      limitation: "Disputes are preserved, not hidden.",
      recordIds: outcomes.filter((o) => o.verificationStatus === "Disputed").map((o) => o.id),
      ...base,
    },
    {
      id: "contributions-under-review",
      label: "Contributions under review",
      value: contributions.filter(
        (c) => c.state === "Under Review" || c.state === "Claimed" || c.state === "Evidence Submitted",
      ).length,
      definition: "Contribution claims not yet supported.",
      sourceRecords: "cbai-genesis-contributions",
      calculation: "count(state in Claimed, Evidence Submitted, Under Review)",
      limitation: "No automatic attribution to leaders.",
      recordIds: contributions.filter((c) => c.state === "Under Review").map((c) => c.id),
      ...base,
    },
    {
      id: "recognition-under-review",
      label: "Recognition under review",
      value: recognition.filter(
        (r) => r.status === "Under Independent Review" || r.status === "Evidence Incomplete",
      ).length,
      definition: "Recognition records pending independent/human review.",
      sourceRecords: "cbai-genesis-recognition",
      calculation: "count(status in Under Independent Review, Evidence Incomplete)",
      limitation: "Local demo — not independent review unless configured.",
      recordIds: recognition.filter((r) => r.status === "Under Independent Review").map((r) => r.id),
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
      recordIds: recognition.filter((r) => r.status === "Supported").map((r) => r.id),
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
  ];
}
