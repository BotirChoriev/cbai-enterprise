import type { ResearcherLayer } from "@/lib/research/researchers";
import {
  RESEARCHER_LAYER_EVIDENCE_STATUS_LABELS,
  RESEARCHER_LAYER_SOURCE_STATUS_LABELS,
  listVerificationSources,
} from "@/lib/research/researchers";

type ResearcherVerificationReadinessProps = {
  layer: ResearcherLayer;
};

export default function ResearcherVerificationReadiness({
  layer,
}: ResearcherVerificationReadinessProps) {
  const verificationSources = listVerificationSources();

  return (
    <div className="space-y-3">
      <dl className="grid gap-3 text-xs sm:grid-cols-2">
        <div>
          <dt className="font-medium uppercase tracking-wider text-zinc-600">Source status</dt>
          <dd className="mt-1 text-zinc-400">
            {RESEARCHER_LAYER_SOURCE_STATUS_LABELS[layer.sourceStatus]}
          </dd>
        </div>
        <div>
          <dt className="font-medium uppercase tracking-wider text-zinc-600">Evidence status</dt>
          <dd className="mt-1 text-zinc-400">
            {RESEARCHER_LAYER_EVIDENCE_STATUS_LABELS[layer.evidenceStatus]}
          </dd>
        </div>
      </dl>
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Verification sources
        </h4>
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {verificationSources.map((source) => (
            <li
              key={source}
              className="rounded-md border border-teal-500/10 bg-teal-500/5 px-2 py-0.5 text-[11px] text-zinc-500"
            >
              {source}
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[11px] text-zinc-600">Not connected yet — future integration.</p>
      </div>
    </div>
  );
}
