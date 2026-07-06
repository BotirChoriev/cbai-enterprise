"use client";

import { useState } from "react";
import { exampleCommands } from "@/lib/core";

type CommandCenterProps = {
  onSubmit?: (command: string) => void;
};

export default function CommandCenter({ onSubmit }: CommandCenterProps) {
  const [input, setInput] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    onSubmit?.(input.trim());
  }

  function selectCommand(command: string) {
    setInput(command);
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full bg-sky-500/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 right-0 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl"
      />

      <div className="relative border-b border-zinc-800 px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="relative inline-flex h-3 w-3 rounded-full bg-zinc-600" />
          </span>
          <div>
            <h2 className="text-sm font-semibold tracking-wide text-zinc-50">
              Command Interface
            </h2>
            <p className="text-xs text-zinc-500">
              Extended route shell — not connected to runtime
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="relative p-6">
        <p className="mb-4 rounded-lg border border-dashed border-zinc-800 px-3 py-2 text-xs text-zinc-500">
          Command execution is disabled in static export. This panel shows layout only.
        </p>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-1 opacity-60">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Command interface not connected…"
            rows={3}
            disabled
            aria-disabled="true"
            className="w-full resize-none bg-transparent px-4 py-3 font-mono text-sm text-zinc-100 placeholder:text-zinc-600 outline-none disabled:cursor-not-allowed"
          />
          <div className="flex items-center justify-between border-t border-zinc-800/80 px-4 py-3">
            <span className="font-mono text-[10px] text-zinc-600">
              static export · no gateway
            </span>
            <button
              type="submit"
              disabled
              aria-disabled="true"
              className="flex items-center gap-2 rounded-lg bg-zinc-800 px-5 py-2 text-sm font-medium text-zinc-500 disabled:cursor-not-allowed"
            >
              Execute
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </button>
          </div>
        </div>

        {exampleCommands.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {exampleCommands.map((command) => (
              <button
                key={command}
                type="button"
                onClick={() => selectCommand(command)}
                className="rounded-full border border-zinc-800 bg-zinc-900/40 px-3 py-1.5 font-mono text-xs text-zinc-400"
              >
                {command}
              </button>
            ))}
          </div>
        )}
      </form>
    </div>
  );
}
