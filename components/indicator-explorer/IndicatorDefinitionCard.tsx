import type { IndicatorExplorerRecord } from "@/lib/indicator-explorer";
import { coverageStatusClass, coverageStatusLabel } from "@/lib/indicator-explorer";

type IndicatorDefinitionCardProps = {
  record: IndicatorExplorerRecord;
};

export default function IndicatorDefinitionCard({ record }: IndicatorDefinitionCardProps) {
  return (
    <article className="rounded-xl border border-zinc-800 bg-zinc-950 px-6 py-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
            {record.domain}
          </p>
          <h3 className="mt-1 text-xl font-semibold text-zinc-50">{record.indicatorName}</h3>
          <p className="mt-0.5 font-mono text-xs text-zinc-600">{record.indicatorId}</p>
        </div>
        <span
          className={`rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${coverageStatusClass(record.coverageStatus)}`}
        >
          {coverageStatusLabel(record.coverageStatus)}
        </span>
      </div>
      <p className="mt-4 text-sm text-zinc-400">{record.description}</p>
    </article>
  );
}
