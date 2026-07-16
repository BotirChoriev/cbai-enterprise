"use client";

import Link from "next/link";
import { getResearchTopicPath } from "@/lib/research/research-topics";
import { cbaiBtnPrimary, cbaiBtnSecondary } from "@/components/brand/brand-classes";

type ResearchNetworkControlsProps = {
  focusedTopicId: string | null;
  topicName?: string;
  onClearFocus: () => void;
  onShowAll: () => void;
  compact?: boolean;
};

export default function ResearchNetworkControls({
  focusedTopicId,
  topicName,
  onClearFocus,
  onShowAll,
  compact = false,
}: ResearchNetworkControlsProps) {
  if (!focusedTopicId) {
    return null;
  }

  const topicPath = getResearchTopicPath(focusedTopicId);

  return (
    <div
      className={`flex flex-wrap items-center gap-2 ${compact ? "" : "rounded-lg border border-teal-500/15 bg-slate-950/70 p-3 backdrop-blur-sm"}`}
      role="toolbar"
      aria-label="Network focus controls"
    >
      <button
        type="button"
        onClick={onClearFocus}
        className={cbaiBtnSecondary}
        aria-label="Clear focus"
      >
        Clear focus
      </button>
      <Link
        href={topicPath}
        className={cbaiBtnPrimary}
        aria-label={topicName ? `Open ${topicName}` : "Open topic"}
      >
        Open topic
      </Link>
      <button
        type="button"
        onClick={onShowAll}
        className={cbaiBtnSecondary}
        aria-label="Show all topics"
      >
        Show all
      </button>
    </div>
  );
}
