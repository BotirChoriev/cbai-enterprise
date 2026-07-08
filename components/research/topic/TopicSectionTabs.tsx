"use client";

import type { ResearchTopic } from "@/lib/research/research-topics";
import ResearchTopicMethods from "@/components/research/topic/ResearchTopicMethods";
import ResearchTopicEvidenceMap from "@/components/research/topic/ResearchTopicEvidenceMap";
import ResearchNotebookPanel from "@/components/research/notebook/ResearchNotebookPanel";
import ResearchGraphPanel from "@/components/research/graph/ResearchGraphPanel";
import KnowledgeTimeline from "@/components/research/timeline/KnowledgeTimeline";
import ResearchEvidenceReadiness from "@/components/research/topic/ResearchEvidenceReadiness";
import OpenResearchQuestions from "@/components/research/topic/OpenResearchQuestions";
import NegativeResultsOverview from "@/components/research/topic/NegativeResultsOverview";
import { cbaiGlassCard } from "@/components/brand/brand-classes";

export type TopicTabId = "overview" | "notebook" | "graph" | "timeline" | "evidence";

const TABS: { id: TopicTabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "notebook", label: "Notebook" },
  { id: "graph", label: "Graph" },
  { id: "timeline", label: "Timeline" },
  { id: "evidence", label: "Evidence" },
];

type TopicSectionTabsProps = {
  topic: ResearchTopic;
  activeTab: TopicTabId;
  onTabChange: (tab: TopicTabId) => void;
};

export default function TopicSectionTabs({
  topic,
  activeTab,
  onTabChange,
}: TopicSectionTabsProps) {
  return (
    <section aria-labelledby="topic-section-tabs-heading" className="space-y-4">
      <h2 id="topic-section-tabs-heading" className="sr-only">
        Topic workspace
      </h2>

      <div
        className={`${cbaiGlassCard} flex flex-wrap gap-1 p-1`}
        role="tablist"
        aria-label="Topic sections"
      >
        {TABS.map((tab) => {
          const selected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`topic-panel-${tab.id}`}
              id={`topic-tab-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              className={`rounded-md px-3 py-2 text-xs font-medium transition-colors ${
                selected
                  ? "bg-cyan-500/15 text-cyan-300"
                  : "text-zinc-500 hover:bg-zinc-900/60 hover:text-zinc-300"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div
        id={`topic-panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`topic-tab-${activeTab}`}
        className="min-h-[12rem]"
      >
        {activeTab === "overview" ? (
          <div className="space-y-8">
            <ResearchTopicMethods topic={topic} />
            <ResearchTopicEvidenceMap topic={topic} />
          </div>
        ) : null}

        {activeTab === "notebook" ? (
          <ResearchNotebookPanel topic={topic} embedded />
        ) : null}

        {activeTab === "graph" ? (
          <ResearchGraphPanel variant="topic" topic={topic} embedded />
        ) : null}

        {activeTab === "timeline" ? (
          <KnowledgeTimeline topic={topic} embedded />
        ) : null}

        {activeTab === "evidence" ? (
          <div className="space-y-6">
            <ResearchEvidenceReadiness topic={topic} />
            <div className={`${cbaiGlassCard} grid gap-5 p-5 lg:grid-cols-2`}>
              <OpenResearchQuestions topic={topic} />
              <NegativeResultsOverview topic={topic} />
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
