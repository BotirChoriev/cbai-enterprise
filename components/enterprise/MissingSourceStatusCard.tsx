import type { EvidenceGapRecord } from "@/lib/evidence-gap";
import { gapStatusClass, gapStatusLabel } from "@/lib/evidence-gap";
import { buildMissingSourceStatus } from "@/lib/enterprise/missing-source-status";

type MissingSourceStatusCardProps = {
  gap: EvidenceGapRecord;
};

/** Professional missing-source card — replaces generic planned-source sentences. */
export default function MissingSourceStatusCard({ gap }: MissingSourceStatusCardProps) {
  const model = buildMissingSourceStatus(gap);

  return (
    <article className="rounded-xl border border-zinc-800/80 bg-zinc-900/50 px-4 py-4">
      <div className="flex items-start justify-between gap-3">
        <h4 className="text-sm font-semibold text-zinc-100">{model.indicatorTitle}</h4>
        <span
          className={`shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${gapStatusClass(gap.currentStatus)}`}
        >
          {gapStatusLabel(gap.currentStatus)}
        </span>
      </div>

      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <dt className="text-[10px] uppercase tracking-wider text-zinc-600">Expected Source</dt>
          <dd className="mt-1 text-sm text-zinc-300">{model.expectedSource}</dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-wider text-zinc-600">Integration Status</dt>
          <dd className="mt-1 text-sm text-zinc-300">{model.integrationStatus}</dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-wider text-zinc-600">Last Checked</dt>
          <dd className="mt-1 text-sm text-zinc-400">{model.lastChecked}</dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-wider text-zinc-600">Next Planned Update</dt>
          <dd className="mt-1 text-sm text-zinc-400">{model.nextPlannedUpdate}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-[10px] uppercase tracking-wider text-zinc-600">Why Missing</dt>
          <dd className="mt-1 text-sm text-zinc-400">{model.whyMissing}</dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-wider text-zinc-600">Priority</dt>
          <dd className="mt-1 text-sm text-zinc-300">{model.priority}</dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-wider text-zinc-600">Estimated Availability</dt>
          <dd className="mt-1 text-sm text-zinc-400">{model.estimatedAvailability}</dd>
        </div>
      </dl>

      <div className="mt-4">
        <button
          type="button"
          disabled
          title="Source connection is not available in this Preview build"
          className="inline-flex min-h-9 cursor-not-allowed items-center rounded-lg border border-zinc-700/80 bg-zinc-900/80 px-3 text-xs font-medium text-zinc-500"
        >
          {model.connectLabel}
        </button>
      </div>
    </article>
  );
}
