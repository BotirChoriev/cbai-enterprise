"use client";

import Link from "next/link";
import AssistantCommandCenter from "@/components/assistant/AssistantCommandCenter";

// One persistent Command Center, part of the workspace chrome on every route — never a floating
// overlay, never hidden. Routes typed, spoken, and searched input to the same real destinations.
export default function Topbar() {
  return (
    <header className="flex h-14 min-w-0 shrink-0 items-center gap-4 border-b border-cyan-500/10 bg-slate-950/90 px-6 backdrop-blur-md">
      <AssistantCommandCenter />
      <Link
        href="/search"
        className="ml-auto hidden shrink-0 text-sm font-medium text-cyan-400 transition-colors hover:text-cyan-300 sm:inline-flex"
      >
        Search →
      </Link>
    </header>
  );
}
