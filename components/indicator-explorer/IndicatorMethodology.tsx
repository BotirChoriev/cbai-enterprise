import type { IndicatorExplorerRecord } from "@/lib/indicator-explorer";

type IndicatorMethodologyProps = {
  record: IndicatorExplorerRecord;
};

export default function IndicatorMethodology({ record }: IndicatorMethodologyProps) {
  const methodology = record.methodologyReferences;

  return (
    <section className="space-y-4" aria-labelledby="indicator-methodology-heading">
      <div>
        <h4
          id="indicator-methodology-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          Methodology
        </h4>
        <p className="mt-1 text-sm text-zinc-500">
          Why this indicator exists and what evidence it requires — explain before evaluate.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
            Why it exists
          </p>
          <p className="mt-2 text-sm text-zinc-400">{methodology.whyItExists}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
            Required evidence
          </p>
          <p className="mt-2 text-sm text-zinc-400">{methodology.requiredEvidence}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
            Missing evidence
          </p>
          <p className="mt-2 text-sm text-zinc-400">{methodology.missingEvidence}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
            Standard reference
          </p>
          <p className="mt-2 font-mono text-xs text-zinc-500">{methodology.standardReference}</p>
          <p className="mt-3 text-xs text-zinc-600">
            Future derivation (not implemented): {methodology.futureScoringDerivation}
          </p>
        </div>
      </div>
    </section>
  );
}
