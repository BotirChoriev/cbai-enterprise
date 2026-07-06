import type { EvidenceComparisonRecord } from "@/lib/evidence-comparison";
import { comparisonNoteClass } from "@/lib/evidence-comparison";
import { gapStatusClass, gapStatusLabel } from "@/lib/evidence-gap";
import type { EvidenceGapStatus } from "@/lib/evidence-gap";

type EvidenceComparisonMatrixProps = {
  comparison: EvidenceComparisonRecord;
};

function statusLabel(status: string): string {
  return gapStatusLabel(status as EvidenceGapStatus);
}

function statusClass(status: string): string {
  return gapStatusClass(status as EvidenceGapStatus);
}

export default function EvidenceComparisonMatrix({ comparison }: EvidenceComparisonMatrixProps) {
  return (
    <section className="space-y-4" aria-labelledby="comparison-matrix-heading">
      <div>
        <h4
          id="comparison-matrix-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          Indicator Comparison Matrix
        </h4>
        <p className="mt-1 text-sm text-zinc-500">
          Shared indicators with evidence status on each entity — not ranking or scoring.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="min-w-full text-sm">
          <thead className="border-b border-zinc-800 bg-zinc-950">
            <tr>
              <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                Indicator
              </th>
              <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                {comparison.leftEntityLabel}
              </th>
              <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                {comparison.rightEntityLabel}
              </th>
              <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                Comparison note
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800 bg-zinc-950/50">
            {comparison.indicatorRows.map((row) => (
              <tr key={row.indicatorId}>
                <td className="px-4 py-3">
                  <p className="font-medium text-zinc-300">{row.indicatorTitle}</p>
                  <p className="font-mono text-[10px] text-zinc-600">{row.indicatorId}</p>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${statusClass(row.leftStatus)}`}
                  >
                    {statusLabel(row.leftStatus)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${statusClass(row.rightStatus)}`}
                  >
                    {statusLabel(row.rightStatus)}
                  </span>
                </td>
                <td className={`px-4 py-3 text-xs ${comparisonNoteClass(row.note)}`}>
                  {row.note}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
