import type { ResearchTopic } from "@/lib/research/research-topics";
import ResearchTopicHero from "@/components/research/topic/ResearchTopicHero";
import ResearchTopicMethods from "@/components/research/topic/ResearchTopicMethods";
import ResearchTopicEvidenceMap from "@/components/research/topic/ResearchTopicEvidenceMap";
import ResearchTopicWorkspaceStatus from "@/components/research/topic/ResearchTopicWorkspaceStatus";
import ResearchTopicLimitations from "@/components/research/topic/ResearchTopicLimitations";
import ResearchEntityTypeOverview from "@/components/research/entities/ResearchEntityTypeOverview";
import ResearchEntityRelationshipPreview from "@/components/research/entities/ResearchEntityRelationshipPreview";
import ResearchEvidenceReadiness from "@/components/research/topic/ResearchEvidenceReadiness";
import OpenResearchQuestions from "@/components/research/topic/OpenResearchQuestions";
import NegativeResultsOverview from "@/components/research/topic/NegativeResultsOverview";
import ResearchFutureWorkspace from "@/components/research/topic/ResearchFutureWorkspace";
import ResearchGraphPanel from "@/components/research/graph/ResearchGraphPanel";
import CrossTopicDiscovery from "@/components/research/discovery/CrossTopicDiscovery";
import ResearchGapExplorer from "@/components/research/gaps/ResearchGapExplorer";
import ResearchNotebookPanel from "@/components/research/notebook/ResearchNotebookPanel";
import KnowledgeTimeline from "@/components/research/timeline/KnowledgeTimeline";
import { cbaiGlassCard, cbaiHeroGlow, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type ResearchTopicDetailProps = {
  topic: ResearchTopic;
};

export default function ResearchTopicDetail({ topic }: ResearchTopicDetailProps) {
  return (
    <div
      className={`mx-auto max-w-5xl space-y-10 px-4 py-10 sm:px-6 sm:py-12 ${cbaiHeroGlow}`}
    >
      <ResearchTopicHero topic={topic} />
      <ResearchTopicWorkspaceStatus topic={topic} />
      <ResearchGapExplorer topic={topic} variant="topic" limit={6} />
      <ResearchNotebookPanel topic={topic} />
      <KnowledgeTimeline topic={topic} />
      <ResearchTopicMethods topic={topic} />
      <ResearchTopicEvidenceMap topic={topic} />
      <ResearchGraphPanel variant="topic" topic={topic} />
      <CrossTopicDiscovery topic={topic} variant="topic" limit={6} />
      <ResearchEvidenceReadiness topic={topic} />

      <section aria-labelledby="topic-future-knowledge-heading" className="space-y-4">
        <div>
          <p className={cbaiSectionEyebrow}>Living knowledge</p>
          <h2 id="topic-future-knowledge-heading" className="text-xl font-semibold text-zinc-100">
            Future scientific knowledge
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Structured research objects for open questions and negative results — not connected yet.
            No discussion system or user-generated content.
          </p>
        </div>

        <div className={`${cbaiGlassCard} grid gap-5 p-5 lg:grid-cols-2`}>
          <OpenResearchQuestions topic={topic} />
          <NegativeResultsOverview topic={topic} />
        </div>
      </section>

      <ResearchTopicLimitations />

      <section aria-labelledby="topic-entity-model-heading" className="space-y-4">
        <div>
          <p className={cbaiSectionEyebrow}>Research entity model</p>
          <h2 id="topic-entity-model-heading" className="text-xl font-semibold text-zinc-100">
            Research object architecture
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Model preview using available catalog information — related research objects are static
            references, not connected yet. Human review required before any future use in decisions.
          </p>
        </div>

        <div className={`${cbaiGlassCard} space-y-6 p-5`}>
          <ResearchEntityTypeOverview />
          <ResearchEntityRelationshipPreview topic={topic} />
        </div>
      </section>

      <ResearchFutureWorkspace topic={topic} />
    </div>
  );
}
