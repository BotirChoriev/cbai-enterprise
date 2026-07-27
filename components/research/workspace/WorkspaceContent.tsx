"use client";

import type { WorkspaceExplorerContext } from "@/lib/research/workspace/workspace-explorer";
import ResearchNotebookSummary from "@/components/research/notebook/ResearchNotebookSummary";
import ResearchNotebookEvidence from "@/components/research/notebook/ResearchNotebookEvidence";
import ResearchGraphCanvas from "@/components/research/graph/ResearchGraphCanvas";
import TimelineStage from "@/components/research/timeline/TimelineStage";
import TimelineConnector from "@/components/research/timeline/TimelineConnector";
import OpenResearchQuestions from "@/components/research/topic/OpenResearchQuestions";
import NegativeResultsOverview from "@/components/research/topic/NegativeResultsOverview";
import WorkspaceKnowledgeSummary from "@/components/research/workspace/WorkspaceKnowledgeSummary";
import WorkspaceEvidenceOverview from "@/components/research/workspace/WorkspaceEvidenceOverview";
import WorkspaceTopicNavigator from "@/components/research/workspace/WorkspaceTopicNavigator";
import CrossTopicDiscovery from "@/components/research/discovery/CrossTopicDiscovery";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";
import { useTranslation } from "@/lib/i18n/use-translation";
import {
  NOTEBOOK_CATALOG_ONLY_NOTICE,
  NOTEBOOK_STATUS_LABELS,
} from "@/lib/research/notebook/notebook-types";
import { TIMELINE_WORKFLOW_NOTICE } from "@/lib/research/timeline/timeline-types";
import { RESEARCH_GRAPH_HONEST_NOTICE } from "@/lib/research/graph/research-graph-types";

type WorkspaceContentProps = {
  context: WorkspaceExplorerContext;
  onSelectTopic?: (topicId: string) => void;
};

export default function WorkspaceContent({ context, onSelectTopic }: WorkspaceContentProps) {
  const { t, language } = useTranslation();
  const { topic, knowledgeSummary, evidenceStatuses, notebook, timeline, graph } = context;
  const previewStages = timeline.stages.slice(0, 4);
  const showSourceLanguage = language !== "en";

  return (
    <div className="space-y-6">
      <WorkspaceTopicNavigator topic={topic} />

      <div>
        <p className={cbaiSectionEyebrow}>{t("researchTopicDepth.evidenceNavigationEyebrow")}</p>
        <p className="text-xs text-[var(--cbai-text-muted)]">{t("researchTopicDepth.evidenceNavigationBody")}</p>
        {showSourceLanguage ? (
          <p className="mt-1 text-[10px] text-[var(--cbai-text-muted)]">
            {t("researchTopicDepth.catalogMetadataNotice")} ·{" "}
            {t("researchTopicDepth.sourceLanguageLabel", { language: "English" })}
          </p>
        ) : null}
      </div>

      <WorkspaceKnowledgeSummary summary={knowledgeSummary} />
      <WorkspaceEvidenceOverview evidenceStatuses={evidenceStatuses} />
      <CrossTopicDiscovery topic={topic} variant="workspace" onSelectTopic={onSelectTopic} />

      <section aria-labelledby="workspace-notebook-preview-heading" className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 id="workspace-notebook-preview-heading" className="text-sm font-semibold text-[var(--cbai-text-primary)]">
              {t("researchTopicDepth.notebookPreviewTitle")}
            </h2>
            <p className="mt-1 text-xs text-[var(--cbai-text-muted)]">{NOTEBOOK_CATALOG_ONLY_NOTICE}</p>
          </div>
          <span className="rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider text-emerald-300">
            {t("researchTopicDepth.catalogAvailableBadge")}
          </span>
        </div>
        <ResearchNotebookSummary notebook={notebook} />
        <div className={`${cbaiGlassCard} p-3`}>
          <ResearchNotebookEvidence notebook={notebook} />
          <p className="mt-3 border-t border-[var(--cbai-border-subtle)] pt-2 text-[10px] text-[var(--cbai-text-muted)]">
            {NOTEBOOK_STATUS_LABELS[notebook.status]} · {t("researchTopicDepth.humanReviewRequired")}
          </p>
        </div>
      </section>

      <section aria-labelledby="workspace-timeline-preview-heading" className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 id="workspace-timeline-preview-heading" className="text-sm font-semibold text-[var(--cbai-text-primary)]">
              {t("researchTopicDepth.timelinePreviewTitle")}
            </h2>
            <p className="mt-1 text-xs text-[var(--cbai-text-muted)]">{TIMELINE_WORKFLOW_NOTICE}</p>
          </div>
          <span className="rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider text-emerald-300">
            {t("researchTopicDepth.catalogAvailableBadge")}
          </span>
        </div>
        <div className={`${cbaiGlassCard} space-y-0 p-3`}>
          <ol className="space-y-0">
            {previewStages.map((stage, index) => (
              <li key={stage.stageId}>
                <TimelineStage stage={stage} />
                {index < previewStages.length - 1 ? <TimelineConnector /> : null}
              </li>
            ))}
          </ol>
          {timeline.stages.length > previewStages.length ? (
            <p className="border-t border-[var(--cbai-border-subtle)] pt-2 text-center text-[10px] text-[var(--cbai-text-muted)]">
              {t("researchTopicDepth.moreStagesOnTopic", {
                count: String(timeline.stages.length - previewStages.length),
              })}
            </p>
          ) : null}
        </div>
      </section>

      <section aria-labelledby="workspace-graph-preview-heading" className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 id="workspace-graph-preview-heading" className="text-sm font-semibold text-[var(--cbai-text-primary)]">
              {t("researchTopicDepth.graphPreviewTitle")}
            </h2>
            <p className="mt-1 text-xs text-[var(--cbai-text-muted)]">{RESEARCH_GRAPH_HONEST_NOTICE}</p>
          </div>
          <span className="rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider text-emerald-300">
            {t("researchTopicDepth.catalogAvailableBadge")}
          </span>
        </div>
        <ResearchGraphCanvas graph={graph} compact />
      </section>

      <section aria-labelledby="workspace-future-knowledge-heading" className="space-y-4">
        <div>
          <p className={cbaiSectionEyebrow}>{t("researchTopicDepth.futureKnowledgeEyebrow")}</p>
          <h2 id="workspace-future-knowledge-heading" className="text-sm font-semibold text-[var(--cbai-text-primary)]">
            {t("researchTopicDepth.openQuestionsNegativeTitle")}
          </h2>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className={`${cbaiGlassCard} p-3`}>
            <OpenResearchQuestions topic={topic} />
          </div>
          <div className={`${cbaiGlassCard} p-3`}>
            <NegativeResultsOverview topic={topic} />
          </div>
        </div>
      </section>
    </div>
  );
}
