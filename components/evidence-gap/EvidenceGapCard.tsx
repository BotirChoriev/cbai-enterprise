import type { EvidenceGapRecord } from "@/lib/evidence-gap";
import { gapStatusClass, gapStatusLabel } from "@/lib/evidence-gap";

type EvidenceGapCardProps = {
  gap: EvidenceGapRecord;
};

export default function EvidenceGapCard({ gap }: EvidenceGapCardProps) {
  return (
    <article className="rounded-lg bg-zinc-900/50 px-4 py-3">
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-medium text-zinc-200">{gap.indicatorTitle}</h4>
        <span
          className={`shrink-0 rounded px-2 py-0.5 text-[10px] font-medium uppercase ${gapStatusClass(gap.currentStatus)}`}
        >
          {gapStatusLabel(gap.currentStatus)}
        </span>
      </div>

      <dl className="mt-3 space-y-2 text-sm">
        {gap.missingReason ? (
          <div>
            <dt className="text-xs text-zinc-600">Why missing</dt>
            <dd className="mt-0.5 text-zinc-400">{gap.missingReason}</dd>
          </div>
        ) : null}
        <div>
          <dt className="text-xs text-zinc-600">Expected source</dt>
          <dd className="mt-0.5 text-zinc-400">{gap.expectedSource}</dd>
        </div>
        <div>
          <dt className="text-xs text-zinc-600">Next step</dt>
          <dd className="mt-0.5 text-xs text-zinc-500">{gap.nextPossibleStep}</dd>
        </div>
      </dl>
    </article>
  );
}
