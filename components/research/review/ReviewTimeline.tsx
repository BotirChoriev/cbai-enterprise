import type { ResearchReview } from "@/lib/research/review/review-model";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";
import StatusBadge from "@/components/shared/StatusBadge";

const TIMELINE_DATE_FORMAT = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

function formatTimelineDate(value: string | undefined): string | null {
  return value ? TIMELINE_DATE_FORMAT.format(new Date(value)) : null;
}

type ReviewTimelineProps = {
  review: ResearchReview;
};

// ResearchReview currently only records a creation timestamp. Submitted, assigned, decision, and
// archived events live on separate ReviewAssignment/ReviewDecision/ReviewHistory records this
// single-prop component does not receive — one trailing sentence explains all four rather than
// repeating the same reason four times.
export default function ReviewTimeline({ review }: ReviewTimelineProps) {
  const milestones = [
    { label: "Created", value: formatTimelineDate(review.createdAt) },
    { label: "Submitted", value: null },
    { label: "Assigned", value: null },
    { label: "Decision", value: null },
    { label: "Archived", value: null },
  ];

  return (
    <section aria-label="Review timeline" className={`${cbaiGlassCard} space-y-3 p-4`}>
      <p className={cbaiSectionEyebrow}>Timeline</p>
      <ol className="space-y-2">
        {milestones.map((milestone) => (
          <li
            key={milestone.label}
            className="flex items-center justify-between gap-3 rounded-lg border border-zinc-800/80 bg-slate-950/50 px-3 py-2"
          >
            <span className="text-sm font-medium text-zinc-200">{milestone.label}</span>
            {milestone.value ? (
              <span className="text-xs text-zinc-500">{milestone.value}</span>
            ) : (
              <StatusBadge status="waiting_for_verified_data" />
            )}
          </li>
        ))}
      </ol>
      <p className="text-xs text-zinc-600">
        Submitted, assigned, decision, and archived events connect once assignment and history
        tracking are wired to this workspace.
      </p>
    </section>
  );
}
