import type { PipelineStageReadiness } from "@/lib/pipeline-readiness";
import { PipelineStatusBadge } from "@/components/pipeline/PipelineStatusBadge";

type PipelineStageListProps = {
  stages: readonly PipelineStageReadiness[];
  headingId?: string;
};

export default function PipelineStageList({
  stages,
  headingId = "pipeline-stages-heading",
}: PipelineStageListProps) {
  return (
    <section className="space-y-4" aria-labelledby={headingId}>
      <div>
        <h3
          id={headingId}
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          Evidence flow stages
        </h3>
        <p className="mt-1 text-sm text-zinc-500">
          How official evidence will move through CBAI — architecture defined, live processing
          not active.
        </p>
      </div>

      <ol className="space-y-2">
        {stages.map((stage) => (
          <li
            key={stage.stageId}
            className="flex flex-col gap-2 rounded-lg border border-zinc-800 bg-zinc-950/50 px-4 py-3 sm:flex-row sm:items-start sm:justify-between"
          >
            <div className="min-w-0 flex-1">
              <p className="text-xs font-mono text-zinc-600">
                {String(stage.order).padStart(2, "0")}
              </p>
              <p className="mt-0.5 text-sm font-medium text-zinc-200">{stage.label}</p>
              <p className="mt-1 text-xs text-zinc-500">{stage.description}</p>
            </div>
            <PipelineStatusBadge state={stage.state} />
          </li>
        ))}
      </ol>
    </section>
  );
}
