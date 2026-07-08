import type { ResearchGap } from "@/lib/research/gaps/research-gap-types";
import { cbaiGlassCard } from "@/components/brand/brand-classes";

type ResearchGapSourcesProps = {
  gaps: readonly ResearchGap[];
  compact?: boolean;
};

export default function ResearchGapSources({ gaps, compact = false }: ResearchGapSourcesProps) {
  const sources = [...new Set(gaps.flatMap((gap) => gap.futureEvidenceNeeded))];

  if (sources.length === 0) {
    return null;
  }

  return (
    <div className={`${cbaiGlassCard} space-y-2 p-3`}>
      <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
        Future evidence needed
      </p>
      <ul className={`flex flex-wrap gap-1.5 ${compact ? "text-[10px]" : "text-xs"}`}>
        {sources.slice(0, compact ? 8 : 12).map((source) => (
          <li
            key={source}
            className="rounded-md border border-zinc-800 bg-zinc-900/50 px-2 py-0.5 text-zinc-400"
          >
            {source}
          </li>
        ))}
      </ul>
      {sources.length > (compact ? 8 : 12) ? (
        <p className="text-[10px] text-zinc-600">
          +{sources.length - (compact ? 8 : 12)} additional future sources
        </p>
      ) : null}
    </div>
  );
}
