import type { ResearchTopic } from "@/lib/research/research-topics";
import {
  getExperimentReadinessForTopic,
  getLaboratoryReadinessForTopic,
  getPublicationReadinessForTopic,
  getResearcherReadinessForTopic,
  RESEARCHER_TOPIC_NOT_CONNECTED_MESSAGE,
} from "@/lib/research";
import ResearcherLayerOverview from "@/components/research/researchers/ResearcherLayerOverview";
import ResearcherVerificationReadiness from "@/components/research/researchers/ResearcherVerificationReadiness";
import ResearcherContributionModel from "@/components/research/researchers/ResearcherContributionModel";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type FutureWorkspaceGroup = {
  title: string;
  items: readonly string[];
};

function buildFutureWorkspaceGroups(topic: ResearchTopic): FutureWorkspaceGroup[] {
  const publication = getPublicationReadinessForTopic(topic);
  const experiment = getExperimentReadinessForTopic(topic);
  const laboratory = getLaboratoryReadinessForTopic(topic);
  const researcher = getResearcherReadinessForTopic(topic);

  return [
    {
      title: "Research literature",
      items: publication.layer.futureCapabilities.slice(0, 3),
    },
    {
      title: "Experiments and replication",
      items: [
        ...experiment.layer.futureCapabilities.slice(0, 2),
        experiment.layer.replicationSupported
          ? "Document replication status when study records connect"
          : null,
        experiment.layer.negativeResultsSupported
          ? "Track negative results without overstating conclusions"
          : null,
      ].filter((item): item is string => item !== null),
    },
    {
      title: "Laboratories and equipment",
      items: [
        ...laboratory.layer.futureCapabilities.slice(0, 2),
        laboratory.layer.equipmentSupported
          ? "Equipment inventories and project metadata per lab profile"
          : null,
        laboratory.layer.affiliationSupported
          ? "Institutional affiliations when official sources connect"
          : null,
      ].filter((item): item is string => item !== null),
    },
    {
      title: "Verified researchers and contributors",
      items: researcher.layer.futureCapabilities.slice(0, 3),
    },
    {
      title: "Open questions",
      items: ["Track unresolved research questions and evidence gaps for this topic"],
    },
    {
      title: "Evidence discussions",
      items: ["Structured evidence discussions linked to topic catalog profile"],
    },
    {
      title: "AI Notebook",
      items: ["Research notebook for catalog notes and human-reviewed observations"],
    },
  ];
}

type ResearchFutureWorkspaceProps = {
  topic: ResearchTopic;
};

export default function ResearchFutureWorkspace({ topic }: ResearchFutureWorkspaceProps) {
  const groups = buildFutureWorkspaceGroups(topic);
  const researcherReadiness = getResearcherReadinessForTopic(topic);

  return (
    <section aria-labelledby="topic-future-workspace-heading" className="space-y-4">
      <div>
        <p className={cbaiSectionEyebrow}>Future workspace</p>
        <h2 id="topic-future-workspace-heading" className="text-xl font-semibold text-zinc-100">
          Future research workspace
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          This topic will support the following when sources are connected — none are active today.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">{topic.futureWorkspace}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {groups.map((group) => (
          <div key={group.title} className={`${cbaiGlassCard} p-4`}>
            <h3 className="text-sm font-medium text-zinc-200">{group.title}</h3>
            <ul className="mt-2 space-y-1.5">
              {group.items.map((item) => (
                <li key={item} className="flex items-start gap-2 text-xs text-zinc-500">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-teal-500/60" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className={`${cbaiGlassCard} space-y-4 p-5`}>
        <div>
          <h3 className="text-sm font-semibold text-zinc-100">Researcher readiness</h3>
          <p className="mt-1 text-sm text-zinc-500">{RESEARCHER_TOPIC_NOT_CONNECTED_MESSAGE}</p>
          <p className="mt-1 text-xs text-zinc-600">
            Verified researchers and academic contributors will be supported in the future workspace
            — affiliations, research areas, and verification sources are not connected yet.
          </p>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          <ResearcherLayerOverview layer={researcherReadiness.layer} />
          <ResearcherVerificationReadiness layer={researcherReadiness.layer} />
          <ResearcherContributionModel layer={researcherReadiness.layer} />
        </div>
      </div>

      <p className="text-xs text-zinc-600">
        Future workspace capabilities require human review before supporting any decision.
      </p>
    </section>
  );
}
