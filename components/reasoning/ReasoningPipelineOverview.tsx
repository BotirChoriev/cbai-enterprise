import type { ReasoningPipelineStage } from "@/lib/reasoning-explorer";

type ReasoningPipelineOverviewProps = {
  stages: readonly ReasoningPipelineStage[];
};

export default function ReasoningPipelineOverview({
  stages,
}: ReasoningPipelineOverviewProps) {
  return (
    <section className="space-y-4" aria-labelledby="reasoning-pipeline-heading">
      <div>
        <h2
          id="reasoning-pipeline-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          Reasoning Pipeline
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          How CBAI separates evidence, indicators, methodology, and judgment — no hidden AI
          stages.
        </p>
      </div>

      <ol className="relative space-y-0">
        {stages.map((stage, index) => (
          <li
            key={stage.id}
            className="relative flex gap-4 pb-8 last:pb-0 sm:gap-6"
          >
            {index < stages.length - 1 && (
              <span
                aria-hidden="true"
                className="absolute left-[11px] top-6 h-full w-px bg-zinc-800 sm:left-[15px]"
              />
            )}
            <span className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-cyan-500/30 bg-cyan-500/10 text-[10px] font-semibold text-cyan-400 sm:h-8 sm:w-8 sm:text-xs">
              {index + 1}
            </span>
            <div className="min-w-0 flex-1 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 sm:px-5 sm:py-4">
              <p className="text-sm font-semibold text-zinc-100">{stage.title}</p>
              <p className="mt-1 text-sm text-zinc-400">{stage.description}</p>
              <p className="mt-2 text-xs text-zinc-500">
                <span className="text-zinc-400">User-facing: </span>
                {stage.userFacingOutput}
              </p>
            </div>
            {index < stages.length - 1 && (
              <span
                aria-hidden="true"
                className="hidden shrink-0 self-center text-zinc-700 xl:inline"
              >
                →
              </span>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
