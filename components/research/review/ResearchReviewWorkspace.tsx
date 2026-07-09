import type { ResearchReview, ReviewAssignment } from "@/lib/research/review/review-model";
import type { ResearchReviewStatus } from "@/lib/research/review/review-types";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

const STATUS_LABELS: Record<ResearchReviewStatus, string> = {
  draft: "Draft",
  pending_review: "Pending Review",
  in_review: "In Review",
  completed: "Completed",
  archived: "Archived",
};

function statusAccent(status: ResearchReviewStatus): string {
  switch (status) {
    case "draft":
      return "border-zinc-700 bg-zinc-900/40 text-zinc-400";
    case "pending_review":
      return "border-amber-500/25 bg-amber-500/5 text-amber-300";
    case "in_review":
      return "border-cyan-500/25 bg-cyan-500/5 text-cyan-300";
    case "completed":
      return "border-emerald-500/25 bg-emerald-500/5 text-emerald-300";
    case "archived":
      return "border-zinc-700 bg-zinc-900/40 text-zinc-500";
  }
}

type ResearchReviewWorkspaceProps = {
  review: ResearchReview;
  assignment?: ReviewAssignment;
};

export default function ResearchReviewWorkspace({
  review,
  assignment,
}: ResearchReviewWorkspaceProps) {
  return (
    <section aria-labelledby="research-review-workspace-heading" className="space-y-4">
      <header className="space-y-2">
        <p className={cbaiSectionEyebrow}>Research Review</p>
        <h2
          id="research-review-workspace-heading"
          className="text-xl font-semibold tracking-tight text-zinc-100"
        >
          {review.title}
        </h2>
      </header>

      <article className={`${cbaiGlassCard} space-y-4 p-5`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="max-w-2xl text-sm text-zinc-400">{review.summary}</p>
          <span
            className={`inline-flex shrink-0 rounded-md border px-2 py-0.5 text-xs font-medium ${statusAccent(review.status)}`}
          >
            {STATUS_LABELS[review.status]}
          </span>
        </div>

        <dl className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-zinc-800/80 bg-slate-950/50 px-3 py-2">
            <dt className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
              Kind
            </dt>
            <dd className="mt-1 text-sm text-zinc-200">{review.kind}</dd>
          </div>
          <div className="rounded-lg border border-zinc-800/80 bg-slate-950/50 px-3 py-2">
            <dt className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
              Priority
            </dt>
            <dd className="mt-1 text-sm text-zinc-200">{review.priority}</dd>
          </div>
          <div className="rounded-lg border border-zinc-800/80 bg-slate-950/50 px-3 py-2">
            <dt className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
              Visibility
            </dt>
            <dd className="mt-1 text-sm text-zinc-200">{review.visibility}</dd>
          </div>
          <div className="rounded-lg border border-zinc-800/80 bg-slate-950/50 px-3 py-2">
            <dt className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
              Human review
            </dt>
            <dd className="mt-1 text-sm text-zinc-300">
              {review.humanReviewRequired ? "Required" : "Not required"}
            </dd>
          </div>
        </dl>
      </article>

      <section aria-label="Reviewer information" className={`${cbaiGlassCard} space-y-2 p-4`}>
        <p className={cbaiSectionEyebrow}>Reviewer</p>
        {assignment ? (
          <div className="space-y-1">
            <p className="text-sm font-medium text-zinc-200">{assignment.assigneeName}</p>
            <p className="text-xs text-zinc-500">
              Assignment status: {STATUS_LABELS[assignment.status]}
            </p>
          </div>
        ) : (
          <p className="text-xs text-zinc-500">Not assigned yet.</p>
        )}
      </section>

      <section aria-label="Review timeline" className={`${cbaiGlassCard} space-y-2 p-4`}>
        <p className={cbaiSectionEyebrow}>Timeline</p>
        <p className="text-xs text-zinc-500">
          Review history will appear here once the timeline is connected.
        </p>
      </section>

      <section aria-label="Review comments" className={`${cbaiGlassCard} space-y-2 p-4`}>
        <p className={cbaiSectionEyebrow}>Comments</p>
        <p className="text-xs text-zinc-500">
          Reviewer comments will appear here once commenting is connected.
        </p>
      </section>

      <section aria-label="Review decision" className={`${cbaiGlassCard} space-y-2 p-4`}>
        <p className={cbaiSectionEyebrow}>Decision</p>
        <p className="text-xs text-zinc-500">
          The review decision will appear here once a decision is recorded.
        </p>
      </section>
    </section>
  );
}
