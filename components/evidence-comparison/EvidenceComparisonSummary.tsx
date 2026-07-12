import type { EvidenceComparisonRecord } from "@/lib/evidence-comparison";
import {
  comparisonReadinessStatusClass,
} from "@/lib/evidence-comparison";
import { userComparisonReadinessLabel } from "@/components/shared/user-facing-copy";

type EvidenceComparisonSummaryProps = {
  comparison: EvidenceComparisonRecord;
};

export default function EvidenceComparisonSummary({ comparison }: EvidenceComparisonSummaryProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-zinc-400">
          <span className="font-medium text-zinc-200">{comparison.leftEntityLabel}</span>
          {" vs "}
          <span className="font-medium text-zinc-200">{comparison.rightEntityLabel}</span>
        </p>
        <span
          className={`rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${comparisonReadinessStatusClass(comparison.readinessStatus)}`}
        >
          {userComparisonReadinessLabel(comparison.readinessStatus)}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-4">
          <p className="truncate text-[10px] font-semibold uppercase tracking-wider text-zinc-600" title={comparison.leftEntityLabel}>
            {comparison.leftEntityLabel} — connected
          </p>
          <p className="mt-2 font-mono text-2xl font-semibold text-zinc-100">
            {comparison.leftAvailableEvidence.length}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-4">
          <p className="truncate text-[10px] font-semibold uppercase tracking-wider text-zinc-600" title={comparison.rightEntityLabel}>
            {comparison.rightEntityLabel} — connected
          </p>
          <p className="mt-2 font-mono text-2xl font-semibold text-zinc-100">
            {comparison.rightAvailableEvidence.length}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
            Shared topics
          </p>
          <p className="mt-2 font-mono text-2xl font-semibold text-zinc-100">
            {comparison.sharedIndicators.length}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
            Shared source references
          </p>
          <p className="mt-2 font-mono text-2xl font-semibold text-zinc-100">
            {comparison.sharedSources.length}
          </p>
        </div>
      </div>
      <p className="text-xs text-zinc-600">
        &quot;Connected&quot; counts are official sources actually linked for that profile.
        &quot;Shared source references&quot; counts sources expected by both profiles — connected
        or not; it is not a claim that evidence is available from all of them.
      </p>
    </div>
  );
}
