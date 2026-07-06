import { pipelineStages } from "@/lib/core";

export default function ThinkingPipeline() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-violet-500/5 to-transparent"
      />

      <div className="border-b border-zinc-800 px-5 py-4">
        <h2 className="text-sm font-semibold tracking-wide text-zinc-50">
          Pipeline Structure
        </h2>
        <p className="text-xs text-zinc-500">
          Architectural stages — illustrative only, not live processing
        </p>
      </div>

      <div className="relative px-5 py-6">
        <div
          aria-hidden="true"
          className="absolute left-[2.125rem] top-10 bottom-10 w-px bg-gradient-to-b from-sky-500/40 via-violet-500/40 to-cyan-500/40"
        />

        <ol className="space-y-1">
          {pipelineStages.map((stage, index) => (
            <li key={stage.id}>
              <div className="relative flex items-center gap-4 rounded-lg px-3 py-3">
                <div className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-[10px] font-bold text-zinc-500">
                  {index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-zinc-300">{stage.label}</p>
                  <p className="text-[10px] text-zinc-600">{stage.description}</p>
                </div>
              </div>

              {index < pipelineStages.length - 1 && (
                <div className="flex justify-center py-0.5">
                  <svg
                    className="h-4 w-4 text-zinc-700"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3"
                    />
                  </svg>
                </div>
              )}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
