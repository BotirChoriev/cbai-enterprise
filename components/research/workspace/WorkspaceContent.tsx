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
  const { topic, knowledgeSummary, evidenceStatuses, notebook, timeline, graph } = context;
  const previewStages = timeline.stages.slice(0, 4);

  return (
    <div className="space-y-6">
      <WorkspaceTopicNavigator topic={topic} />

      <div>
        <p className={cbaiSectionEyebrow}>Evidence navigation</p>
        <p className="text-xs text-zinc-500">
          Explore one research topic from catalog notebook, timeline, graph, and future knowledge
          perspectives.
        </p>
      </div>

      <WorkspaceKnowledgeSummary summary={knowledgeSummary} />
      <WorkspaceEvidenceOverview evidenceStatuses={evidenceStatuses} />
      <CrossTopicDiscovery topic={topic} variant="workspace" onSelectTopic={onSelectTopic} />

      <section aria-labelledby="workspace-notebook-preview-heading" className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 id="workspace-notebook-preview-heading" className="text-sm font-semibold text-zinc-100">
              Notebook preview
            </h2>
            <p className="mt-1 text-xs text-zinc-600">{NOTEBOOK_CATALOG_ONLY_NOTICE}</p>
          </div>
          <span className="rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider text-emerald-300">
            Catalog available
          </span>
        </div>
        <ResearchNotebookSummary notebook={notebook} />
        <div className={`${cbaiGlassCard} p-3`}>
          <ResearchNotebookEvidence notebook={notebook} />
          <p className="mt-3 border-t border-zinc-800/80 pt-2 text-[10px] text-zinc-600">
            {NOTEBOOK_STATUS_LABELS[notebook.status]} · Human review required before decisions.
          </p>
        </div>
      </section>

      <section aria-labelledby="workspace-timeline-preview-heading" className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 id="workspace-timeline-preview-heading" className="text-sm font-semibold text-zinc-100">
              Timeline preview
            </h2>
            <p className="mt-1 text-xs text-zinc-600">{TIMELINE_WORKFLOW_NOTICE}</p>
          </div>
          <span className="rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider text-emerald-300">
            Catalog available
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
            <p className="border-t border-zinc-800/80 pt-2 text-center text-[10px] text-zinc-600">
              +{timeline.stages.length - previewStages.length} more stages on topic page
            </p>
          ) : null}
        </div>
      </section>

      <section aria-labelledby="workspace-graph-preview-heading" className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 id="workspace-graph-preview-heading" className="text-sm font-semibold text-zinc-100">
              Graph preview
            </h2>
            <p className="mt-1 text-xs text-zinc-600">{RESEARCH_GRAPH_HONEST_NOTICE}</p>
          </div>
          <span className="rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider text-emerald-300">
            Catalog available
          </span>
        </div>
        <ResearchGraphCanvas graph={graph} compact />
      </section>

      <section aria-labelledby="workspace-future-knowledge-heading" className="space-y-4">
        <div>
          <p className={cbaiSectionEyebrow}>Future knowledge</p>
          <h2 id="workspace-future-knowledge-heading" className="text-sm font-semibold text-zinc-100">
            Open questions & negative results
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
