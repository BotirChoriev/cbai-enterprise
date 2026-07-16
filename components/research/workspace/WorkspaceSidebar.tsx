"use client";

import type { ResearchTopic } from "@/lib/research/research-topics";
import { RESEARCH_TOPIC_STATUS_LABELS } from "@/lib/research/research-topics";
import { cbaiGlassCard } from "@/components/brand/brand-classes";

type WorkspaceSidebarProps = {
  topics: readonly ResearchTopic[];
  selectedTopicId: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectTopic: (topicId: string) => void;
};

export default function WorkspaceSidebar({
  topics,
  selectedTopicId,
  searchQuery,
  onSearchChange,
  onSelectTopic,
}: WorkspaceSidebarProps) {
  return (
    <aside className={`${cbaiGlassCard} flex h-full flex-col p-3`} aria-label="Research topics">
      <p className="text-[10px] font-medium uppercase tracking-wider text-teal-400/90">
        Research topics
      </p>

      <label htmlFor="workspace-topic-search" className="sr-only">
        Filter research topics
      </label>
      <input
        id="workspace-topic-search"
        type="search"
        value={searchQuery}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Filter topics..."
        className="mt-3 w-full rounded-md border border-zinc-800 bg-slate-950/70 px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-500/30"
      />

      <p className="mt-2 text-[10px] text-zinc-600">{topics.length} topics</p>

      <ul className="mt-2 flex-1 space-y-1 overflow-y-auto pr-1">
        {topics.map((topic) => {
          const selected = topic.topicId === selectedTopicId;
          return (
            <li key={topic.topicId}>
              <button
                type="button"
                onClick={() => onSelectTopic(topic.topicId)}
                className={`w-full rounded-md border px-2 py-2 text-left transition-colors ${
                  selected
                    ? "border-teal-500/30 bg-teal-500/10"
                    : "border-transparent hover:border-zinc-800 hover:bg-zinc-900/50"
                }`}
              >
                <p className="text-xs font-medium text-zinc-200">{topic.topicName}</p>
                <p className="mt-0.5 text-[10px] text-zinc-600">
                  {topic.domain} · {RESEARCH_TOPIC_STATUS_LABELS[topic.status]}
                </p>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
