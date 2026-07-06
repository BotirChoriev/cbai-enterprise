import type { ReasoningDomainEvidenceRow } from "@/lib/reasoning-explorer";
import { reasoningStatusClass } from "@/lib/reasoning-explorer";

type ReasoningEvidenceIndicatorMapProps = {
  domains: readonly ReasoningDomainEvidenceRow[];
};

export default function ReasoningEvidenceIndicatorMap({
  domains,
}: ReasoningEvidenceIndicatorMapProps) {
  return (
    <section className="space-y-4" aria-labelledby="reasoning-evidence-map-heading">
      <div>
        <h2
          id="reasoning-evidence-map-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          Evidence-to-Indicator Map
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Indicator domains from the Global Indicator Framework — evidence needs and current
          status by domain.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
              <th className="px-5 py-3 font-medium">Domain</th>
              <th className="px-5 py-3 font-medium">Indicators</th>
              <th className="px-5 py-3 font-medium">Connected</th>
              <th className="px-5 py-3 font-medium">Evidence needs</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {domains.map((domain) => (
              <tr key={domain.domainId}>
                <td className="px-5 py-4 font-semibold text-zinc-100">
                  {domain.domainTitle}
                </td>
                <td className="px-5 py-4 text-zinc-400">{domain.indicatorCount}</td>
                <td className="px-5 py-4 text-zinc-400">{domain.connectedCount}</td>
                <td className="px-5 py-4 text-xs text-zinc-500">
                  {domain.evidenceNeedsSummary}
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`inline-block rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${reasoningStatusClass(domain.statusLabel)}`}
                  >
                    {domain.statusLabel === "Not connected"
                      ? "Evidence Source Not Connected"
                      : domain.statusLabel}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
