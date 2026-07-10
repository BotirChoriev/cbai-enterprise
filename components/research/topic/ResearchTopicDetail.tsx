"use client";

import { Suspense, useState } from "react";
import type { ResearchTopic } from "@/lib/research/research-topics";
import ResearchTopicHero from "@/components/research/topic/ResearchTopicHero";
import ResearchFutureWorkspace from "@/components/research/topic/ResearchFutureWorkspace";
import ResearchLandscape from "@/components/research/landscape/ResearchLandscape";
import ResearchGapExplorer from "@/components/research/gaps/ResearchGapExplorer";
import TopicQuickOverview, { TOPIC_EXPERIENCE_NOTICE } from "@/components/research/topic/TopicQuickOverview";
import TopicQuickActions from "@/components/research/topic/TopicQuickActions";
import TopicInsightsPanel from "@/components/research/topic/TopicInsightsPanel";
import TopicSectionTabs, { type TopicTabId } from "@/components/research/topic/TopicSectionTabs";
import TopicEvidenceReviewWorkflow from "@/components/research/topic/TopicEvidenceReviewWorkflow";
import TopicEvidenceSelection from "@/components/research/topic/TopicEvidenceSelection";
import ResearchMissionWorkspace from "@/components/research/topic/ResearchMissionWorkspace";
import ResearchDecisionCard from "@/components/research/topic/ResearchDecisionCard";
import { buildTopicEvidenceReview } from "@/lib/research/evidence/evidence-topic-builder";
import { deriveResearchDecision } from "@/lib/research/intelligence/decision-engine";
import { cbaiHeroGlow } from "@/components/brand/brand-classes";

type ResearchTopicDetailProps = {
  topic: ResearchTopic;
};

export default function ResearchTopicDetail({ topic }: ResearchTopicDetailProps) {
  const [activeTab, setActiveTab] = useState<TopicTabId>("overview");
  const evidenceReview = buildTopicEvidenceReview(topic.topicId);
  const researchDecision = deriveResearchDecision(topic.topicId);

  return (
    <div
      className={`mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 sm:py-10 ${cbaiHeroGlow}`}
    >
      <ResearchTopicHero topic={topic} />

      {researchDecision ? (
        <ResearchDecisionCard topic={topic} decision={researchDecision} />
      ) : null}

      <p className="rounded-lg border border-zinc-800/80 bg-zinc-900/40 px-4 py-3 text-sm text-zinc-500">
        {TOPIC_EXPERIENCE_NOTICE}
      </p>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_240px]">
        <TopicQuickOverview topic={topic} />
        <TopicQuickActions topic={topic} onTabChange={setActiveTab} />
      </div>

      <TopicInsightsPanel topic={topic} />

      {evidenceReview ? <ResearchMissionWorkspace review={evidenceReview} /> : null}

      {evidenceReview ? (
        <Suspense
          fallback={
            <TopicEvidenceReviewWorkflow
              review={evidenceReview}
              selectedEvidence={evidenceReview.selectedEvidence}
            />
          }
        >
          <TopicEvidenceSelection review={evidenceReview} />
        </Suspense>
      ) : null}

      <ResearchLandscape topic={topic} variant="topic" embedded />

      <TopicSectionTabs topic={topic} activeTab={activeTab} onTabChange={setActiveTab} />

      <ResearchGapExplorer topic={topic} variant="topic" limit={6} embedded />

      <ResearchFutureWorkspace topic={topic} />
    </div>
  );
}
