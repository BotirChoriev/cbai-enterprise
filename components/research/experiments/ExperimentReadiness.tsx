import {
  EXPERIMENT_LAYER_EVIDENCE_STATUS_LABELS,
  EXPERIMENT_LAYER_SOURCE_STATUS_LABELS,
  type ExperimentLayer,
} from "@/lib/research/experiments";
import { cbaiGlassCard } from "@/components/brand/brand-classes";

type ExperimentReadinessProps = {
  layer: ExperimentLayer;
};

export default function ExperimentReadiness({ layer }: ExperimentReadinessProps) {
  return (
    <div className="space-y-4">
      <div className={`${cbaiGlassCard} grid gap-4 p-4 sm:grid-cols-2`}>
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
            Source status
          </p>
          <p className="mt-1 text-sm text-zinc-300">
            {EXPERIMENT_LAYER_SOURCE_STATUS_LABELS[layer.sourceStatus]}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
            Evidence status
          </p>
          <p className="mt-1 text-sm text-zinc-300">
            {EXPERIMENT_LAYER_EVIDENCE_STATUS_LABELS[layer.evidenceStatus]}
          </p>
        </div>
      </div>

      <div className={`${cbaiGlassCard} grid gap-4 p-4 sm:grid-cols-2`}>
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
            Negative results support
          </p>
          <p className="mt-1 text-sm text-zinc-300">
            {layer.negativeResultsSupported
              ? "Planned — not connected yet"
              : "Not supported in this layer"}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
            Replication support
          </p>
          <p className="mt-1 text-sm text-zinc-300">
            {layer.replicationSupported
              ? "Planned — not connected yet"
              : "Not supported in this layer"}
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className={`${cbaiGlassCard} border-zinc-700/40 p-4`}>
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
            Limitations
          </p>
          <ul className="mt-3 space-y-2">
            {layer.limitations.map((limitation) => (
              <li key={limitation} className="flex items-start gap-2 text-xs text-zinc-500">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-zinc-600" />
                {limitation}
              </li>
            ))}
          </ul>
        </div>

        <div className={`${cbaiGlassCard} p-4`}>
          <p className="text-[10px] font-medium uppercase tracking-wider text-cyan-400/80">
            Future capabilities
          </p>
          <ul className="mt-3 space-y-2">
            {layer.futureCapabilities.map((capability) => (
              <li key={capability} className="flex items-start gap-2 text-xs text-zinc-400">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-cyan-500/60" />
                {capability}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {layer.humanReviewRequired ? (
        <p className="text-xs text-zinc-600">
          Human review required before any future experiment metadata supports a decision.
        </p>
      ) : null}
    </div>
  );
}
