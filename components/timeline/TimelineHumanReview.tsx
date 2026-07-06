import type { CountryTimelineModel } from "@/lib/timeline";

type TimelineHumanReviewProps = {
  model: CountryTimelineModel;
};

export default function TimelineHumanReview({ model }: TimelineHumanReviewProps) {
  return (
    <section className="space-y-4" aria-labelledby="timeline-human-review-heading">
      <div>
        <h4
          id="timeline-human-review-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          Human Review Notice
        </h4>
        <p className="mt-1 text-sm text-zinc-500">
          Mandatory oversight before timeline use in any decision context.
        </p>
      </div>

      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-5 py-4">
        <ul className="space-y-2 text-sm text-zinc-400">
          <li>Human review is required — this timeline does not replace expert judgment.</li>
          <li>
            Timeline shows evidence readiness structure for {model.entityLabel} only — not
            historical events, political interpretation, or recommendations.
          </li>
          <li>
            Reviewers must verify official source applicability and year coverage before use.
          </li>
        </ul>
      </div>

      {model.limitations.length > 0 && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
            Limitations
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-4 text-sm text-zinc-500">
            {model.limitations.map((limitation) => (
              <li key={limitation}>{limitation}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
