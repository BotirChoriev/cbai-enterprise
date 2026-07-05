import type { EntityComponentProps } from "@/lib/entity/entity.types";
import { formatMetricValue } from "@/lib/entity/entity.helpers";

const changeColors = {
  positive: "text-emerald-400",
  negative: "text-red-400",
  neutral: "text-zinc-500",
};

export default function EntityMetrics({ entity }: EntityComponentProps) {
  if (entity.metrics.length === 0) return null;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950">
      <div className="border-b border-zinc-800 px-6 py-4">
        <h3 className="text-sm font-semibold text-zinc-50">Metrics</h3>
        <p className="text-xs text-zinc-500">
          {entity.metrics.length} tracked indicators
        </p>
      </div>

      <div className="grid gap-px bg-zinc-800 sm:grid-cols-2 lg:grid-cols-3">
        {entity.metrics.map((metric) => (
          <div
            key={metric.id}
            className={`bg-zinc-950 px-5 py-4 ${
              metric.highlight ? "ring-1 ring-inset ring-sky-500/20" : ""
            }`}
          >
            <p className="text-[10px] font-medium uppercase tracking-widest text-zinc-600">
              {metric.label}
            </p>
            <p className="mt-1 text-lg font-semibold tracking-tight text-zinc-100">
              {formatMetricValue(metric.value, metric.unit)}
            </p>
            {metric.change && (
              <p
                className={`mt-0.5 text-xs ${
                  changeColors[metric.changeType ?? "neutral"]
                }`}
              >
                {metric.change}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
