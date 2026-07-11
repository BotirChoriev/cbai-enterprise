import type { ResearchReview } from "@/lib/research/review/review-model";
import type { ResearchReviewStatus } from "@/lib/research/review/review-types";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";
import StatusBadge from "@/components/shared/StatusBadge";

const STATUS_LABELS: Record<ResearchReviewStatus, string> = {
  draft: "Draft",
  pending_review: "Pending Review",
  in_review: "In Review",
  completed: "Completed",
  archived: "Archived",
};

type ReviewDecisionPanelProps = {
  review: ResearchReview;
};

// ResearchReview does not carry a decision outcome today — that lives on a
// separate ReviewDecision record this single-prop component does not
// receive, so "Current decision" is the one waiting-for-data field here;
// status, priority, visibility, and the human-review flag are all real.
export default function ReviewDecisionPanel({ review }: ReviewDecisionPanelProps) {
  const fields = [
    { label: "Review status", value: STATUS_LABELS[review.status] },
    { label: "Priority", value: review.priority },
    { label: "Visibility", value: review.visibility },
    {
      label: "Human review required",
      value: review.humanReviewRequired ? "Required" : "Not required",
    },
  ];

  return (
    <section aria-label="Review decision" className={`${cbaiGlassCard} space-y-3 p-4`}>
      <p className={cbaiSectionEyebrow}>Decision</p>
      <div className="flex items-center justify-between gap-3 rounded-lg border border-zinc-800/80 bg-slate-950/50 px-3 py-2">
        <dt className="text-sm font-medium text-zinc-200">Current decision</dt>
        <StatusBadge status="waiting_for_verified_data" />
      </div>
      <dl className="space-y-2">
        {fields.map((field) => (
          <div
            key={field.label}
            className="flex items-center justify-between gap-3 rounded-lg border border-zinc-800/80 bg-slate-950/50 px-3 py-2"
          >
            <dt className="text-sm font-medium text-zinc-200">{field.label}</dt>
            <dd className="text-xs text-zinc-500">{field.value}</dd>
          </div>
        ))}
      </dl>
      <p className="text-xs text-zinc-600">
        A decision record connects once a separate ReviewDecision source is wired to this
        workspace.
      </p>
    </section>
  );
}
