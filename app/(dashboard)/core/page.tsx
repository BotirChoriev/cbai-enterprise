"use client";

import { useCallback, useEffect, useState } from "react";
import MissionControl from "@/components/core/MissionControl";
import CommandCenter from "@/components/core/CommandCenter";
import ThinkingPipeline from "@/components/core/ThinkingPipeline";
import ModuleStatusPanel from "@/components/core/ModuleStatus";
import MemoryPanel from "@/components/core/MemoryPanel";
import { platformModules, pipelineStages } from "@/lib/core";

export default function CorePage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeStage, setActiveStage] = useState<string | null>(null);

  const handleCommandSubmit = useCallback((command: string) => {
    void command;
    setIsProcessing(true);
    setActiveStage(pipelineStages[0].id);
  }, []);

  useEffect(() => {
    if (!isProcessing || !activeStage) return;

    const currentIndex = pipelineStages.findIndex((s) => s.id === activeStage);
    if (currentIndex >= pipelineStages.length - 1) {
      const timeout = setTimeout(() => {
        setIsProcessing(false);
        setActiveStage(null);
      }, 1500);
      return () => clearTimeout(timeout);
    }

    const timeout = setTimeout(() => {
      setActiveStage(pipelineStages[currentIndex + 1].id);
    }, 800);

    return () => clearTimeout(timeout);
  }, [isProcessing, activeStage]);

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 px-6 py-5">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-sky-500/5 via-violet-500/10 to-cyan-500/5"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-violet-500/10 blur-3xl"
        />
        <div className="relative flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 via-violet-500 to-cyan-400 shadow-lg shadow-violet-500/20">
            <svg
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
              />
            </svg>
          </div>
          <div>
            <h1 className="bg-gradient-to-r from-sky-300 via-violet-300 to-cyan-300 bg-clip-text text-2xl font-semibold tracking-tight text-transparent">
              CBAI Core
            </h1>
            <p className="text-sm text-zinc-500">
              Central intelligence engine — the brain of CBAI Enterprise
            </p>
          </div>
          <div className="ml-auto hidden items-center gap-2 sm:flex">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <span className="font-mono text-xs text-emerald-400">
              NEURAL LINK ACTIVE
            </span>
          </div>
        </div>
      </div>

      <MissionControl />

      <div className="grid gap-6 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <CommandCenter onSubmit={handleCommandSubmit} />
        </div>
        <div className="xl:col-span-2">
          <ThinkingPipeline
            activeStage={activeStage}
            isProcessing={isProcessing}
          />
        </div>
      </div>

      <ModuleStatusPanel modules={platformModules} />

      <MemoryPanel />
    </div>
  );
}
