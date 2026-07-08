import type { ResearchTopic } from "@/lib/research/research-topics";
import { getNegativeResultsForTopic } from "@/lib/research/negative-results/negative-result-query";
import {
  NEGATIVE_RESULT_PRESERVATION_PURPOSE,
  NEGATIVE_RESULT_STATUS_LABELS,
  NEGATIVE_RESULTS_NOT_CONNECTED_MESSAGE,
} from "@/lib/research/negative-results/negative-result-types";
import { cbaiGlassCard } from "@/components/brand/brand-classes";

type NegativeResultsOverviewProps = {
  topic: ResearchTopic;
};

export default function NegativeResultsOverview({ topic }: NegativeResultsOverviewProps) {
  const { readiness, isTopicSpecific } = getNegativeResultsForTopic(topic);

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-zinc-100">Negative results</h3>
        <p className="mt-1 text-xs text-zinc-500">{NEGATIVE_RESULTS_NOT_CONNECTED_MESSAGE}</p>
      </div>

      <div className={`${cbaiGlassCard} space-y-3 p-3`}>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-600">
            Why it matters
          </p>
          <ul className="mt-2 space-y-1.5">
            {NEGATIVE_RESULT_PRESERVATION_PURPOSE.map((purpose) => (
              <li key={purpose} className="flex items-start gap-2 text-[11px] text-zinc-500">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-zinc-600" />
                {purpose}
              </li>
            ))}
          </ul>
        </div>

        <dl className="space-y-2 text-[11px]">
          <div>
            <dt className="font-medium uppercase tracking-wider text-zinc-600">Status</dt>
            <dd className="mt-0.5 text-zinc-400">
              {NEGATIVE_RESULT_STATUS_LABELS[readiness.status]}
            </dd>
          </div>
          <div>
            <dt className="font-medium uppercase tracking-wider text-zinc-600">
              Future workspace support
            </dt>
            <dd className="mt-0.5 text-zinc-500">
              Future experiment types: {readiness.futureExperimentTypes.join(" · ")}
            </dd>
            <dd className="mt-1 text-zinc-500">
              Future evidence: {readiness.futureEvidenceSources.join(" · ")}
            </dd>
          </div>
        </dl>

        {readiness.humanReviewRequired ? (
          <p className="border-t border-zinc-800/80 pt-2 text-[10px] text-zinc-600">
            Human scientific review required before any negative result supports a decision.
          </p>
        ) : null}
      </div>

      {!isTopicSpecific ? (
        <p className="text-[11px] text-zinc-600">
          Generic negative result readiness applies — topic-specific records not configured yet.
        </p>
      ) : null}
    </div>
  );
}
