"use client";

import { cbaiBtnSecondarySm } from "@/components/brand/brand-classes";

type ResearchNetworkZoomControlsProps = {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  canZoomIn: boolean;
  canZoomOut: boolean;
};

export default function ResearchNetworkZoomControls({
  onZoomIn,
  onZoomOut,
  onResetView,
  canZoomIn,
  canZoomOut,
}: ResearchNetworkZoomControlsProps) {
  return (
    <div
      className="flex flex-wrap items-center gap-2 rounded-lg border border-teal-500/15 bg-slate-950/80 p-2 backdrop-blur-sm"
      role="toolbar"
      aria-label="Network zoom controls"
    >
      <button
        type="button"
        onClick={onZoomIn}
        disabled={!canZoomIn}
        className={`${cbaiBtnSecondarySm} disabled:cursor-not-allowed disabled:opacity-40`}
        aria-label="Zoom in"
      >
        Zoom in
      </button>
      <button
        type="button"
        onClick={onZoomOut}
        disabled={!canZoomOut}
        className={`${cbaiBtnSecondarySm} disabled:cursor-not-allowed disabled:opacity-40`}
        aria-label="Zoom out"
      >
        Zoom out
      </button>
      <button
        type="button"
        onClick={onResetView}
        className={cbaiBtnSecondarySm}
        aria-label="Reset view"
      >
        Reset view
      </button>
    </div>
  );
}
