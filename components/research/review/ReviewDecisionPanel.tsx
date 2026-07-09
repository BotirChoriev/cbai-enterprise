import type { ResearchReview } from "@/lib/research/review/review-model";
import type { ResearchReviewStatus } from "@/lib/research/review/review-types";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

const NOT_YET = "Not yet";

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
// receive, so "Current decision" renders as "Not yet" until a future
// build wires real decisions through.
export default function ReviewDecisionPanel({ review }: ReviewDecisionPanelProps) {
  const fields = [
    { label: "Current decision", value: NOT_YET },
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
    </section>
  );
}
