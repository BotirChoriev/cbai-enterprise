import type { ResearchTopic } from "@/lib/research/research-topics";
import { RESEARCH_TOPIC_FUTURE_SUPPORTS } from "@/lib/research/research-topics";
import ResearchTopicHero from "@/components/research/topic/ResearchTopicHero";
import ResearchTopicMethods from "@/components/research/topic/ResearchTopicMethods";
import ResearchTopicEvidenceMap from "@/components/research/topic/ResearchTopicEvidenceMap";
import ResearchTopicWorkspaceStatus from "@/components/research/topic/ResearchTopicWorkspaceStatus";
import ResearchTopicLimitations from "@/components/research/topic/ResearchTopicLimitations";
import ResearchEntityTypeOverview from "@/components/research/entities/ResearchEntityTypeOverview";
import ResearchEntityRelationshipPreview from "@/components/research/entities/ResearchEntityRelationshipPreview";
import PublicationLayerOverview from "@/components/research/publications/PublicationLayerOverview";
import PublicationTopicPreview from "@/components/research/publications/PublicationTopicPreview";
import ExperimentLayerOverview from "@/components/research/experiments/ExperimentLayerOverview";
import ExperimentEvidenceTypes from "@/components/research/experiments/ExperimentEvidenceTypes";
import LaboratoryLayerOverview from "@/components/research/laboratories/LaboratoryLayerOverview";
import LaboratoryEvidenceTypes from "@/components/research/laboratories/LaboratoryEvidenceTypes";
import { cbaiGlassCard, cbaiHeroGlow, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type ResearchTopicDetailProps = {
  topic: ResearchTopic;
};

export default function ResearchTopicDetail({ topic }: ResearchTopicDetailProps) {
  return (
    <div
      className={`mx-auto max-w-5xl space-y-12 px-4 py-10 sm:px-6 sm:py-14 ${cbaiHeroGlow}`}
    >
      <ResearchTopicHero topic={topic} />
      <ResearchTopicMethods topic={topic} />
      <ResearchTopicEvidenceMap topic={topic} />
      <ResearchTopicWorkspaceStatus topic={topic} />

      <section aria-labelledby="topic-entity-model-heading" className="space-y-6">
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

      <section aria-labelledby="topic-publication-readiness-heading" className="space-y-6">
        <div>
          <p className={cbaiSectionEyebrow}>Publication readiness</p>
          <h2 id="topic-publication-readiness-heading" className="text-xl font-semibold text-zinc-100">
            Research literature
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Publications are a core evidence type. Publication sources and metadata are not
            connected yet — human review required before any future use.
          </p>
        </div>

        <div className={`${cbaiGlassCard} space-y-6 p-5`}>
          <PublicationLayerOverview />
          <PublicationTopicPreview topic={topic} />
        </div>
      </section>

      <section aria-labelledby="topic-experiment-readiness-heading" className="space-y-6">
        <div>
          <p className={cbaiSectionEyebrow}>Experiment readiness</p>
          <h2 id="topic-experiment-readiness-heading" className="text-xl font-semibold text-zinc-100">
            Experiment records
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Experiments are a core research evidence type. Experiment records, methods, variables,
            and results are not connected yet — human review required before any future use.
          </p>
        </div>

        <div className={`${cbaiGlassCard} space-y-6 p-5`}>
          <ExperimentLayerOverview />
          <ExperimentEvidenceTypes topic={topic} />
        </div>
      </section>

      <section aria-labelledby="topic-laboratory-readiness-heading" className="space-y-6">
        <div>
          <p className={cbaiSectionEyebrow}>Laboratory readiness</p>
          <h2
            id="topic-laboratory-readiness-heading"
            className="text-xl font-semibold text-zinc-100"
          >
            Laboratory records
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Laboratories are a core research object. Laboratory records, equipment, projects, and
            affiliations are not connected yet — human review required before any future use.
          </p>
        </div>

        <div className={`${cbaiGlassCard} space-y-6 p-5`}>
          <LaboratoryLayerOverview />
          <LaboratoryEvidenceTypes topic={topic} />
        </div>
      </section>

      <ResearchTopicLimitations />

      <section aria-labelledby="topic-next-steps-heading" className="space-y-4">
        <div>
          <p className={cbaiSectionEyebrow}>Next steps</p>
          <h2 id="topic-next-steps-heading" className="text-xl font-semibold text-zinc-100">
            Future workspace
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            This topic will support the following when sources are connected — none are active
            today.
          </p>
        </div>

        <div className={`${cbaiGlassCard} p-5`}>
          <ul className="grid gap-2 sm:grid-cols-2">
            {RESEARCH_TOPIC_FUTURE_SUPPORTS.map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-zinc-400">
                <span className="h-1 w-1 rounded-full bg-cyan-500/60" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
