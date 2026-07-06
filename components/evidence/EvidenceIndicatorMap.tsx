import type { EvidenceExplorerModel } from "@/lib/evidence-explorer";
import { explorerStatusClass } from "@/lib/evidence-explorer";
import { IndicatorExploreLink } from "@/components/indicator-explorer/IndicatorExplorerPanel";

type EvidenceIndicatorMapProps = {
  indicatorsByDomain: EvidenceExplorerModel["indicatorsByDomain"];
  onExploreIndicator?: (indicatorId: string) => void;
};

function formatEntityList(entities: readonly string[]): string {
  return entities
    .map((e) => e.charAt(0).toUpperCase() + e.slice(1))
    .join(", ");
}

export default function EvidenceIndicatorMap({
  indicatorsByDomain,
  onExploreIndicator,
}: EvidenceIndicatorMapProps) {
  return (
    <section className="space-y-4" aria-labelledby="evidence-indicator-map-heading">
      <div>
        <h2
          id="evidence-indicator-map-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          Indicator Evidence Map
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Global Indicator Framework — grouped by domain with required sources and
          current evidence status.
        </p>
      </div>

      <div className="space-y-6">
        {indicatorsByDomain.map((group) => (
          <div
            key={group.domainId}
            className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950"
          >
            <div className="border-b border-zinc-800 px-5 py-3">
              <h3 className="text-sm font-semibold text-zinc-100">{group.domainTitle}</h3>
              <p className="text-xs text-zinc-500">
                {group.indicators.length} indicator
                {group.indicators.length === 1 ? "" : "s"}
              </p>
            </div>
            <ul className="divide-y divide-zinc-800">
              {group.indicators.map((indicator) => (
                <li key={indicator.id} className="px-5 py-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-zinc-100">
                        {indicator.title}
                      </p>
                      <p className="mt-0.5 font-mono text-[10px] text-zinc-600">
                        {indicator.slug}
                      </p>
                      <div className="mt-2 space-y-1 text-xs text-zinc-500">
                        <p>
                          <span className="text-zinc-400">Required: </span>
                          {indicator.requiredSources.length > 0
                            ? indicator.requiredSources.join(", ")
                            : "None registered"}
                        </p>
                        {indicator.optionalSources.length > 0 && (
                          <p>
                            <span className="text-zinc-400">Optional: </span>
                            {indicator.optionalSources.join(", ")}
                          </p>
                        )}
                        <p>
                          <span className="text-zinc-400">Entities: </span>
                          {formatEntityList(indicator.applicableEntities)}
                        </p>
                      </div>
                      {onExploreIndicator && (
                        <div className="mt-3">
                          <IndicatorExploreLink
                            indicatorId={indicator.id}
                            indicatorName={indicator.title}
                            onExplore={onExploreIndicator}
                          />
                        </div>
                      )}
                    </div>
                    <span
                      className={`shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${explorerStatusClass(indicator.evidenceStatusLabel)}`}
                    >
                      {indicator.evidenceStatusLabel}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
