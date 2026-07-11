import type { ResearchReview } from "@/lib/research/review/review-model";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";
import StatusBadge from "@/components/shared/StatusBadge";

type ReviewCommentsPanelProps = {
  review: ResearchReview;
};

// ResearchReview does not carry comment data — reviewer comments, AI review notes, and author
// responses live on separate ReviewComment records that this single-prop component does not
// receive. All three are unavailable for the same reason, so this is one compact explanation
// rather than three repeated "Not yet" rows.
export default function ReviewCommentsPanel({ review }: ReviewCommentsPanelProps) {
  void review;

  return (
    <section aria-label="Review comments" className={`${cbaiGlassCard} space-y-3 p-4`}>
      <div className="flex items-center justify-between gap-3">
        <p className={cbaiSectionEyebrow}>Comments</p>
        <StatusBadge status="waiting_for_verified_data" />
      </div>
      <p className="text-xs leading-relaxed text-zinc-500">
        Reviewer comments, AI review notes, and author responses are not connected yet — this
        review has no comment records linked to it. They become available once reviewer
        assignment and response tracking connect real data.
      </p>
    </section>
  );
}
