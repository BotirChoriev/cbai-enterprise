"use client";

import { usePlatformContext } from "@/components/platform/context/PlatformContextProvider";
import type { ContextEntityRef } from "@/lib/context";

type SaveToWorkspaceButtonProps = {
  entity: ContextEntityRef;
  className?: string;
};

/**
 * Real bookmark/save action (Companies Intelligence mission) — backed by the existing
 * pinEntity/unpinEntity localStorage architecture (lib/context/context-history.ts), which
 * already existed but had zero UI consumers before this. Persists via the current storage
 * architecture only — no new storage model.
 */
export default function SaveToWorkspaceButton({ entity, className = "" }: SaveToWorkspaceButtonProps) {
  const { isEntityPinned, pinEntityToWorkspace, unpinEntityFromWorkspace } = usePlatformContext();
  const pinned = isEntityPinned(entity.kind, entity.id);

  return (
    <button
      type="button"
      onClick={() =>
        pinned ? unpinEntityFromWorkspace(entity.kind, entity.id) : pinEntityToWorkspace(entity)
      }
      aria-pressed={pinned}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 ${
        pinned
          ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-300 hover:border-cyan-500/60"
          : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-100"
      } ${className}`}
    >
      <svg className="h-3.5 w-3.5" fill={pinned ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
        />
      </svg>
      {pinned ? "Saved to workspace" : "Save to workspace"}
    </button>
  );
}
