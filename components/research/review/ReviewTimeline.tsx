import type { ResearchReview } from "@/lib/research/review/review-model";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

const NOT_YET = "Not yet";

const TIMELINE_DATE_FORMAT = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

function formatTimelineDate(value: string | undefined): string {
  if (!value) {
    return NOT_YET;
  }
  return TIMELINE_DATE_FORMAT.format(new Date(value));
}

type ReviewTimelineProps = {
  review: ResearchReview;
};

// ResearchReview currently only records a creation timestamp. Submitted,
// assigned, decision, and archived events live on separate
// ReviewAssignment/ReviewDecision/ReviewHistory records that this
// single-prop component does not receive, so they render as "Not yet"
// until a future build wires that data through.
export default function ReviewTimeline({ review }: ReviewTimelineProps) {
  const milestones = [
    { label: "Created", value: formatTimelineDate(review.createdAt) },
    { label: "Submitted", value: NOT_YET },
    { label: "Assigned", value: NOT_YET },
    { label: "Decision", value: NOT_YET },
    { label: "Archived", value: NOT_YET },
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
            <span className="text-xs text-zinc-500">{milestone.value}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
