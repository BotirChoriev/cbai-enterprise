import type { ResearchGap } from "@/lib/research/gaps/research-gap-types";
import { RESEARCH_GAP_STATUS_LABELS, RESEARCH_GAP_TYPE_LABELS } from "@/lib/research/gaps/research-gap-types";
import { cbaiGlassCard } from "@/components/brand/brand-classes";

type ResearchGapCardProps = {
  gap: ResearchGap;
  compact?: boolean;
};

function statusClass(gap: ResearchGap): string {
  switch (gap.currentStatus) {
    case "available_catalog_only":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
    case "future_workspace":
      return "border-teal-500/25 bg-teal-500/5 text-teal-300";
    case "not_connected_yet":
      return "border-zinc-700 bg-zinc-900/60 text-zinc-400";
  }
}

export default function ResearchGapCard({ gap, compact = false }: ResearchGapCardProps) {
  return (
    <article className={`${cbaiGlassCard} flex flex-col gap-2 p-3`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className={`font-semibold text-zinc-100 ${compact ? "text-xs" : "text-sm"}`}>
          {RESEARCH_GAP_TYPE_LABELS[gap.gapType]}
        </h3>
        <span
          className={`shrink-0 rounded border px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider ${statusClass(gap)}`}
        >
          {RESEARCH_GAP_STATUS_LABELS[gap.currentStatus]}
        </span>
      </div>

      <p className={`leading-relaxed text-zinc-500 ${compact ? "text-[11px]" : "text-xs"}`}>
        {gap.missingReason}
      </p>

      <dl className={`space-y-2 ${compact ? "text-[10px]" : "text-[11px]"}`}>
        <div>
          <dt className="font-medium uppercase tracking-wider text-zinc-600">
            Related workspace area
          </dt>
          <dd className="mt-0.5 text-zinc-400">{gap.relatedWorkspaceArea}</dd>
        </div>
        <div>
          <dt className="font-medium uppercase tracking-wider text-zinc-600">
            Future evidence needed
          </dt>
          <dd className="mt-0.5 text-zinc-400">
            {gap.futureEvidenceNeeded.slice(0, compact ? 3 : 5).join(" · ")}
            {gap.futureEvidenceNeeded.length > (compact ? 3 : 5)
              ? ` · +${gap.futureEvidenceNeeded.length - (compact ? 3 : 5)} more`
              : null}
          </dd>
        </div>
      </dl>

      {gap.humanReviewRequired ? (
        <p className="border-t border-zinc-800/80 pt-2 text-[10px] text-zinc-600">
          Human scientific review required.
        </p>
      ) : null}
    </article>
  );
}
