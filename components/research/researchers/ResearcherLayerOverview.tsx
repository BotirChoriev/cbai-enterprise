import type { ResearcherLayer } from "@/lib/research/researchers";
import {
  RESEARCHER_EXPECTED_PROFILE_METADATA_LABELS,
  listResearcherTypes,
} from "@/lib/research/researchers";

type ResearcherLayerOverviewProps = {
  layer: ResearcherLayer;
};

export default function ResearcherLayerOverview({ layer }: ResearcherLayerOverviewProps) {
  const researcherTypes = listResearcherTypes();

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
        Future researcher types
      </h4>
      <ul className="flex flex-wrap gap-1.5">
        {researcherTypes.map((type) => (
          <li
            key={type}
            className="rounded-md border border-zinc-800 bg-zinc-900/50 px-2 py-0.5 text-[11px] text-zinc-500"
          >
            {type}
          </li>
        ))}
      </ul>
      <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
        Expected profile metadata
      </h4>
      <ul className="grid gap-1 sm:grid-cols-2">
        {layer.expectedProfileMetadata.map((field) => (
          <li key={field} className="text-[11px] text-zinc-500">
            {RESEARCHER_EXPECTED_PROFILE_METADATA_LABELS[field]}
          </li>
        ))}
      </ul>
    </div>
  );
}
