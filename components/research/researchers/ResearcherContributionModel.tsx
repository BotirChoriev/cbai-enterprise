import type { ResearcherLayer } from "@/lib/research/researchers";

type ResearcherContributionModelProps = {
  layer: ResearcherLayer;
};

export default function ResearcherContributionModel({ layer }: ResearcherContributionModelProps) {
  return (
    <div className="space-y-3">
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
          Limitations
        </h4>
        <ul className="mt-2 space-y-1.5">
          {layer.limitations.slice(0, 4).map((limitation) => (
            <li key={limitation} className="flex items-start gap-2 text-[11px] text-zinc-500">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-zinc-600" />
              {limitation}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan-400/80">
          Future capabilities
        </h4>
        <ul className="mt-2 space-y-1.5">
          {layer.futureCapabilities.slice(0, 3).map((capability) => (
            <li key={capability} className="flex items-start gap-2 text-[11px] text-zinc-400">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-cyan-500/60" />
              {capability}
            </li>
          ))}
        </ul>
      </div>
      {layer.humanReviewRequired ? (
        <p className="text-[11px] text-zinc-600">
          Human review required before any verified researcher reference supports a decision.
        </p>
      ) : null}
    </div>
  );
}
