"use client";

import type { ReasoningStage } from "@/lib/reasoning/reasoning.types";

type ReasoningPipelineProps = {
  stages: ReasoningStage[];
  isRunning: boolean;
};

export default function ReasoningPipeline({
  stages,
  isRunning,
}: ReasoningPipelineProps) {
  const activeIndex = stages.findIndex((s) => s.status === "active");

  return (
    <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-violet-500/5 to-transparent"
      />

      <div className="border-b border-zinc-800 px-5 py-4">
        <h2 className="text-sm font-semibold tracking-wide text-zinc-50">
          Reasoning Pipeline
        </h2>
        <p className="text-xs text-zinc-500">
          Step-by-step cognitive processing
        </p>
      </div>

      <div className="relative max-h-[520px] overflow-y-auto px-5 py-6">
        <div
          aria-hidden="true"
          className="absolute left-[2.125rem] top-10 bottom-10 w-px bg-gradient-to-b from-violet-500/40 via-sky-500/40 to-cyan-500/40"
        />

        <div className="space-y-1">
          {stages.map((stage, index) => {
            const isActive = stage.status === "active";
            const isPast = stage.status === "complete";

            return (
              <div key={stage.id}>
                <div
                  className={`relative flex items-start gap-4 rounded-lg px-3 py-3 transition-all ${
                    isActive
                      ? "bg-violet-500/10 ring-1 ring-violet-500/30"
                      : isPast
                        ? "opacity-80"
                        : "opacity-40"
                  }`}
                >
                  <div
                    className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold ${
                      isActive
                        ? "border-violet-400 bg-violet-500/20 text-violet-300"
                        : isPast
                          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                          : "border-zinc-700 bg-zinc-900 text-zinc-500"
                    }`}
                  >
                    {isPast ? (
                      <svg
                        className="h-3 w-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4.5 12.75l6 6 9-13.5"
                        />
                      </svg>
                    ) : isActive ? (
                      <span className="h-2 w-2 animate-pulse rounded-full bg-violet-400" />
                    ) : (
                      index + 1
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm font-medium ${
                        isActive ? "text-violet-300" : "text-zinc-300"
                      }`}
                    >
                      {stage.label}
                    </p>
                    <p className="text-[10px] text-zinc-600">
                      {stage.description}
                    </p>
                    {isPast && stage.output && (
                      <p className="mt-1.5 font-mono text-[10px] text-emerald-400/80">
                        → {stage.output}
                      </p>
                    )}
                  </div>

                  {isActive && isRunning && (
                    <span className="shrink-0 font-mono text-[10px] text-violet-400">
                      processing…
                    </span>
                  )}
                </div>

                {index < stages.length - 1 && (
                  <div className="flex justify-center py-0.5">
                    <svg
                      className={`h-4 w-4 ${
                        isPast || isActive ? "text-violet-500/50" : "text-zinc-700"
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3"
                      />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {activeIndex >= 0 && isRunning && (
        <div className="border-t border-zinc-800 px-5 py-3">
          <div className="h-1 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-sky-500 transition-all duration-300"
              style={{
                width: `${((activeIndex + 1) / stages.length) * 100}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
