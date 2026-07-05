"use client";

import { pipelineStages } from "@/lib/core";

type ThinkingPipelineProps = {
  activeStage?: string | null;
  isProcessing?: boolean;
};

export default function ThinkingPipeline({
  activeStage = null,
  isProcessing = false,
}: ThinkingPipelineProps) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-violet-500/5 to-transparent"
      />

      <div className="border-b border-zinc-800 px-5 py-4">
        <h2 className="text-sm font-semibold tracking-wide text-zinc-50">
          AI Thinking Pipeline
        </h2>
        <p className="text-xs text-zinc-500">
          Cognitive processing stages
        </p>
      </div>

      <div className="relative px-5 py-6">
        <div
          aria-hidden="true"
          className="absolute left-[2.125rem] top-10 bottom-10 w-px bg-gradient-to-b from-sky-500/40 via-violet-500/40 to-cyan-500/40"
        />

        <div className="space-y-1">
          {pipelineStages.map((stage, index) => {
            const isActive = isProcessing && activeStage === stage.id;
            const isPast =
              isProcessing &&
              activeStage &&
              pipelineStages.findIndex((s) => s.id === activeStage) > index;

            return (
              <div key={stage.id}>
                <div
                  className={`relative flex items-center gap-4 rounded-lg px-3 py-3 transition-all ${
                    isActive
                      ? "bg-sky-500/10 ring-1 ring-sky-500/30"
                      : isPast
                        ? "opacity-60"
                        : "hover:bg-zinc-900/50"
                  }`}
                >
                  <div
                    className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold ${
                      isActive
                        ? "border-sky-400 bg-sky-500/20 text-sky-300"
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
                      <span className="h-2 w-2 animate-pulse rounded-full bg-sky-400" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm font-medium ${
                        isActive ? "text-sky-300" : "text-zinc-300"
                      }`}
                    >
                      {stage.label}
                    </p>
                    <p className="text-[10px] text-zinc-600">
                      {stage.description}
                    </p>
                  </div>
                  {isActive && (
                    <span className="font-mono text-[10px] text-sky-400">
                      processing...
                    </span>
                  )}
                </div>

                {index < pipelineStages.length - 1 && (
                  <div className="flex justify-center py-0.5">
                    <svg
                      className={`h-4 w-4 ${
                        isPast || isActive ? "text-sky-500/50" : "text-zinc-700"
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
    </div>
  );
}
