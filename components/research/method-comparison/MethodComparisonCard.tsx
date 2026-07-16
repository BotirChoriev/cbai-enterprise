import type { MethodEvidenceRow } from "@/lib/research/method-comparison/method-comparison-types";
import { METHOD_COMPARISON_STATUS_LABELS } from "@/lib/research/method-comparison/method-comparison-types";
import { cbaiGlassCard } from "@/components/brand/brand-classes";

type MethodComparisonCardProps = {
  row: MethodEvidenceRow;
  compact?: boolean;
};

function statusClass(status: MethodEvidenceRow["status"]): string {
  switch (status) {
    case "catalog_available":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
    case "human_review_required":
      return "border-teal-500/25 bg-teal-500/5 text-teal-300";
    case "evidence_not_connected":
      return "border-zinc-700 bg-zinc-900/60 text-zinc-400";
  }
}

export default function MethodComparisonCard({ row, compact = false }: MethodComparisonCardProps) {
  return (
    <article className={`${cbaiGlassCard} flex flex-col gap-2 p-3`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className={`font-semibold text-zinc-100 ${compact ? "text-xs" : "text-sm"}`}>
          {row.methodName}
        </h3>
        <span
          className={`shrink-0 rounded border px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider ${statusClass(row.status)}`}
        >
          {METHOD_COMPARISON_STATUS_LABELS[row.status]}
        </span>
      </div>

      <div>
        <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
          Evidence needed
        </p>
        <p className={`mt-1 text-zinc-400 ${compact ? "text-[11px]" : "text-xs"}`}>
          {row.relatedEvidenceTypes.join(" · ")}
        </p>
      </div>

      {!compact ? (
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
            Available catalog information
          </p>
          <ul className="mt-1 space-y-1">
            {row.availableCatalogInfo.map((info) => (
              <li
                key={info}
                className="flex items-start gap-2 text-[11px] text-zinc-500"
              >
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-400/80" />
                {info}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div>
        <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
          Missing evidence
        </p>
        <p className={`mt-1 text-zinc-500 ${compact ? "text-[10px]" : "text-[11px]"}`}>
          {row.missingEvidence.slice(0, compact ? 2 : 4).join(" · ")}
        </p>
      </div>

      <p className="border-t border-zinc-800/80 pt-2 text-[10px] text-zinc-600">
        Not connected yet · Human scientific review required
      </p>
    </article>
  );
}
