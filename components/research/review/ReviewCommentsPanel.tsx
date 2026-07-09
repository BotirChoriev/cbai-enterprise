import type { ResearchReview } from "@/lib/research/review/review-model";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

const NOT_YET = "Not yet";

type ReviewCommentsPanelProps = {
  review: ResearchReview;
};

// ResearchReview does not carry comment data — reviewer comments, AI
// review notes, and author responses live on separate ReviewComment
// records that this single-prop component does not receive, so all
// three render honestly as "Not yet" until a future build wires real
// comment data through.
export default function ReviewCommentsPanel({ review }: ReviewCommentsPanelProps) {
  void review;

  const fields = [
    { label: "Reviewer comments", value: NOT_YET },
    { label: "AI review notes", value: NOT_YET },
    { label: "Author response", value: NOT_YET },
  ];

  return (
    <section aria-label="Review comments" className={`${cbaiGlassCard} space-y-3 p-4`}>
      <p className={cbaiSectionEyebrow}>Comments</p>
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
