import type { EvidenceGapRecord } from "@/lib/evidence-gap";
import { gapStatusClass, gapStatusLabel } from "@/lib/evidence-gap";

type EvidenceGapCardProps = {
  gap: EvidenceGapRecord;
};

export default function EvidenceGapCard({ gap }: EvidenceGapCardProps) {
  return (
    <article className="rounded-xl border border-zinc-800 bg-zinc-950 px-5 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
            {gap.domainTitle}
          </p>
          <h4 className="mt-1 text-sm font-medium text-zinc-200">{gap.indicatorTitle}</h4>
          <p className="mt-0.5 font-mono text-[10px] text-zinc-600">{gap.indicatorId}</p>
        </div>
        <span
          className={`shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${gapStatusClass(gap.currentStatus)}`}
        >
          {gapStatusLabel(gap.currentStatus)}
        </span>
      </div>

      <dl className="mt-4 space-y-2 text-sm">
        {gap.missingReason && (
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
              Why missing
            </dt>
            <dd className="mt-0.5 text-zinc-400">{gap.missingReason}</dd>
          </div>
        )}
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
            Expected official source
          </dt>
          <dd className="mt-0.5 text-zinc-400">{gap.expectedSource}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
            Expected connector
          </dt>
          <dd className="mt-0.5 text-zinc-400">{gap.expectedConnector}</dd>
        </div>
        {gap.verificationBlocker && (
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
              Verification blocker
            </dt>
            <dd className="mt-0.5 text-zinc-400">{gap.verificationBlocker}</dd>
          </div>
        )}
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
            Next possible step
          </dt>
          <dd className="mt-0.5 text-xs text-zinc-500">{gap.nextPossibleStep}</dd>
        </div>
      </dl>
    </article>
  );
}
