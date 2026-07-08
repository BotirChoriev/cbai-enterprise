import type { ResearchTopic } from "@/lib/research/research-topics";
import ResearchTopicHero from "@/components/research/topic/ResearchTopicHero";
import ResearchTopicMethods from "@/components/research/topic/ResearchTopicMethods";
import ResearchTopicEvidenceMap from "@/components/research/topic/ResearchTopicEvidenceMap";
import ResearchTopicWorkspaceStatus from "@/components/research/topic/ResearchTopicWorkspaceStatus";
import ResearchTopicLimitations from "@/components/research/topic/ResearchTopicLimitations";
import ResearchEntityTypeOverview from "@/components/research/entities/ResearchEntityTypeOverview";
import ResearchEntityRelationshipPreview from "@/components/research/entities/ResearchEntityRelationshipPreview";
import ResearchEvidenceReadiness from "@/components/research/topic/ResearchEvidenceReadiness";
import ResearchFutureWorkspace from "@/components/research/topic/ResearchFutureWorkspace";
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
      <ResearchTopicMethods topic={topic} />
      <ResearchTopicEvidenceMap topic={topic} />
      <ResearchEvidenceReadiness topic={topic} />
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
