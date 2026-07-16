"use client";

import type { ResearchTopic } from "@/lib/research/research-topics";
import ResearchTopicMethods from "@/components/research/topic/ResearchTopicMethods";
import ResearchNotebookPanel from "@/components/research/notebook/ResearchNotebookPanel";
import ResearchGraphPanel from "@/components/research/graph/ResearchGraphPanel";
import KnowledgeTimeline from "@/components/research/timeline/KnowledgeTimeline";
import ResearchEvidenceReadiness from "@/components/research/topic/ResearchEvidenceReadiness";
import OpenResearchQuestions from "@/components/research/topic/OpenResearchQuestions";
import NegativeResultsOverview from "@/components/research/topic/NegativeResultsOverview";
import { cbaiChip, cbaiChipActive, cbaiGlassCard } from "@/components/brand/brand-classes";
import { useTranslation } from "@/lib/i18n/use-translation";

export type TopicTabId = "overview" | "notebook" | "graph" | "timeline" | "evidence";

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
  const { t } = useTranslation();

  const tabs: { id: TopicTabId; labelKey: string }[] = [
    { id: "overview", labelKey: "zeroLearningCurve.topicTabOverview" },
    { id: "notebook", labelKey: "zeroLearningCurve.topicTabNotebook" },
    { id: "graph", labelKey: "zeroLearningCurve.topicTabGraph" },
    { id: "timeline", labelKey: "zeroLearningCurve.topicTabTimeline" },
    { id: "evidence", labelKey: "zeroLearningCurve.topicTabEvidence" },
  ];

  return (
    <section aria-labelledby="topic-section-tabs-heading" className="space-y-4">
      <h2 id="topic-section-tabs-heading" className="sr-only">
        {t("zeroLearningCurve.topicWorkspaceSr")}
      </h2>

      <div
        className={`${cbaiGlassCard} flex flex-wrap gap-1 p-1`}
        role="tablist"
        aria-label={t("zeroLearningCurve.topicSectionsAria")}
      >
        {tabs.map((tab) => {
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
              className={selected ? cbaiChipActive : cbaiChip}
            >
              {t(tab.labelKey)}
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
