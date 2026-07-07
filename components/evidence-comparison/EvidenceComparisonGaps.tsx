import type { EvidenceComparisonRecord } from "@/lib/evidence-comparison";

type EvidenceComparisonGapsProps = {
  comparison: EvidenceComparisonRecord;
};

export default function EvidenceComparisonGaps({ comparison }: EvidenceComparisonGapsProps) {
  const leftOnlyGaps = comparison.leftEvidenceGaps.filter(
    (id) => !comparison.rightEvidenceGaps.includes(id),
  );
  const rightOnlyGaps = comparison.rightEvidenceGaps.filter(
    (id) => !comparison.leftEvidenceGaps.includes(id),
  );
  const sharedGaps = comparison.leftEvidenceGaps.filter((id) =>
    comparison.rightEvidenceGaps.includes(id),
  );

  return (
    <section className="space-y-4" aria-labelledby="comparison-gaps-heading">
      <div>
        <h4
          id="comparison-gaps-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          Missing information differences
        </h4>
        <p className="mt-1 text-sm text-zinc-500">
          Where missing information differs between profiles — descriptive only.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
            Both profiles ({sharedGaps.length})
          </p>
          <p className="mt-2 text-xs text-zinc-500">
            {sharedGaps.length === 0
              ? "No shared missing information."
              : `${sharedGaps.length} topic(s) missing on both profiles.`}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
            {comparison.leftEntityLabel} only ({leftOnlyGaps.length})
          </p>
          <p className="mt-2 text-xs text-zinc-500">
            {leftOnlyGaps.length === 0
              ? "Nothing missing on this profile only."
              : `${leftOnlyGaps.length} topic(s) missing on this profile only.`}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
            {comparison.rightEntityLabel} only ({rightOnlyGaps.length})
          </p>
          <p className="mt-2 text-xs text-zinc-500">
            {rightOnlyGaps.length === 0
              ? "Nothing missing on this profile only."
              : `${rightOnlyGaps.length} topic(s) missing on this profile only.`}
          </p>
        </div>
      </div>
    </section>
  );
}
