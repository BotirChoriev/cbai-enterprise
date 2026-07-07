import type { EvidenceComparisonRecord } from "@/lib/evidence-comparison";

type EvidenceComparisonLimitationsProps = {
  comparison: EvidenceComparisonRecord | null;
  limitations: readonly string[];
  unsupportedMessage: string | null;
};

export default function EvidenceComparisonLimitations({
  comparison,
  limitations,
  unsupportedMessage,
}: EvidenceComparisonLimitationsProps) {
  const items = comparison?.limitations ?? limitations;

  return (
    <section className="space-y-4" aria-labelledby="comparison-limitations-heading">
      <div>
        <h4
          id="comparison-limitations-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          Before you decide
        </h4>
      </div>

      {unsupportedMessage && (
        <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950 px-5 py-4">
          <p className="text-sm text-zinc-400">{unsupportedMessage}</p>
        </div>
      )}

      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-5 py-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-400/80">
          Human review required
        </p>
        <p className="mt-2 text-sm text-zinc-400">
          Comparison output describes evidence readiness only — not superiority claims, evaluative
          metrics, ordinals, or policy advice.
        </p>
      </div>

      <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-500">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
