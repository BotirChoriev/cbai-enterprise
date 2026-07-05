"use client";

import { SAMPLE_REASONING_QUESTIONS } from "@/lib/reasoning/reasoning.mock";

type ReasoningInputProps = {
  question: string;
  onQuestionChange: (question: string) => void;
  onSubmit: () => void;
  isRunning: boolean;
};

export default function ReasoningInput({
  question,
  onQuestionChange,
  onSubmit,
  isRunning,
}: ReasoningInputProps) {
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim() || isRunning) return;
    onSubmit();
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-950 via-zinc-950 to-violet-950/20 p-6">
      <div className="mb-4">
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-violet-500/80">
          BUILD-014 · Cognitive Engine
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-50">
          CBAI Reasoning Engine
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-400">
          Demonstrates how CBAI reasons across Global Search, Knowledge Graph,
          and the Entity Framework — step by step, with evidence and confidence.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <label htmlFor="reasoning-question" className="sr-only">
          Intelligence question
        </label>
        <textarea
          id="reasoning-question"
          value={question}
          onChange={(e) => onQuestionChange(e.target.value)}
          placeholder="Ask an intelligence question… e.g. Which country has the strongest AI investment potential?"
          rows={3}
          disabled={isRunning}
          className="w-full resize-none rounded-lg border border-zinc-800 bg-zinc-900/80 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30 disabled:opacity-60"
        />
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="submit"
            disabled={!question.trim() || isRunning}
            className="rounded-lg bg-violet-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isRunning ? "Reasoning…" : "Run Reasoning"}
          </button>
          {isRunning && (
            <span className="font-mono text-[10px] text-violet-400">
              Pipeline executing…
            </span>
          )}
        </div>
      </form>

      <div className="mt-4 border-t border-zinc-800/60 pt-4">
        <p className="mb-2 text-[10px] font-medium uppercase tracking-widest text-zinc-600">
          Sample Questions
        </p>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_REASONING_QUESTIONS.map((sample) => (
            <button
              key={sample}
              type="button"
              disabled={isRunning}
              onClick={() => onQuestionChange(sample)}
              className="rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 text-[11px] text-zinc-400 transition-colors hover:border-violet-500/30 hover:text-violet-300 disabled:opacity-40"
            >
              {sample}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
