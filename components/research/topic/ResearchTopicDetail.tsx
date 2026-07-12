"use client";

import { useState } from "react";
import type { ResearchTopic } from "@/lib/research/research-topics";
import ResearchTopicHero from "@/components/research/topic/ResearchTopicHero";
import ResearchFutureWorkspace from "@/components/research/topic/ResearchFutureWorkspace";
import ResearchLandscape from "@/components/research/landscape/ResearchLandscape";
import ResearchGapExplorer from "@/components/research/gaps/ResearchGapExplorer";
import TopicQuickOverview, { TOPIC_EXPERIENCE_NOTICE } from "@/components/research/topic/TopicQuickOverview";
import TopicQuickActions from "@/components/research/topic/TopicQuickActions";
import TopicInsightsPanel from "@/components/research/topic/TopicInsightsPanel";
import TopicSectionTabs, { type TopicTabId } from "@/components/research/topic/TopicSectionTabs";
import TopicReviewWorkspace from "@/components/research/topic/TopicReviewWorkspace";
import ResearchCockpit from "@/components/research/topic/ResearchCockpit";
import ContextualOperatorBanner from "@/components/assistant/ContextualOperatorBanner";
import ResearchRelatedCompanies from "@/components/research/topic/ResearchRelatedCompanies";
import ResearchTopicReportView from "@/components/research/topic/ResearchTopicReportView";
import SaveToWorkspaceButton from "@/components/shared/SaveToWorkspaceButton";
import { deriveResearchWorkflow } from "@/lib/research/workflow/workflow-engine";
import { buildEntityReport } from "@/lib/entity/entity-report";
import { cbaiHeroGlow } from "@/components/brand/brand-classes";

type ResearchTopicDetailProps = {
  topic: ResearchTopic;
};

export default function ResearchTopicDetail({ topic }: ResearchTopicDetailProps) {
  const [activeTab, setActiveTab] = useState<TopicTabId>("overview");
  const [showReport, setShowReport] = useState(false);
  const workflow = deriveResearchWorkflow(topic.topicId);

  return (
    <div
      className={`mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 sm:py-10 ${cbaiHeroGlow}`}
    >
      <ResearchTopicHero topic={topic} />

      <div className="flex justify-end">
        <SaveToWorkspaceButton entity={{ kind: "research_topic", id: topic.topicId, name: topic.topicName }} />
      </div>

      <ContextualOperatorBanner />

      <ResearchCockpit topic={topic} workflow={workflow} />

      <p className="rounded-lg border border-zinc-800/80 bg-zinc-900/40 px-4 py-3 text-sm text-zinc-500">
        {TOPIC_EXPERIENCE_NOTICE}
      </p>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_240px]">
        <TopicQuickOverview topic={topic} />
        <TopicQuickActions topic={topic} onTabChange={setActiveTab} />
      </div>

      <TopicInsightsPanel topic={topic} />

      <ResearchRelatedCompanies topic={topic} />

      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setShowReport((current) => !current)}
          className="inline-flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300 transition-colors hover:border-cyan-500/50"
        >
          {showReport ? "Hide report" : "Generate report"}
        </button>
        {showReport
          ? (() => {
              const report = buildEntityReport("research_topic", topic.topicId);
              return report ? <ResearchTopicReportView report={report} /> : null;
            })()
          : null}
      </div>

      <TopicReviewWorkspace topic={topic} workflow={workflow} />

      <ResearchLandscape topic={topic} variant="topic" embedded />

      <TopicSectionTabs topic={topic} activeTab={activeTab} onTabChange={setActiveTab} />

      <ResearchGapExplorer topic={topic} variant="topic" limit={6} embedded />

      <ResearchFutureWorkspace topic={topic} />
    </div>
  );
}
