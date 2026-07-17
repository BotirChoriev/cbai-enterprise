"use client";

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
import { useTranslation } from "@/lib/i18n/use-translation";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type FutureWorkspaceGroup = {
  title: string;
  items: readonly string[];
};

type ResearchFutureWorkspaceProps = {
  topic: ResearchTopic;
};

export default function ResearchFutureWorkspace({ topic }: ResearchFutureWorkspaceProps) {
  const { t } = useTranslation();
  const publication = getPublicationReadinessForTopic(topic);
  const experiment = getExperimentReadinessForTopic(topic);
  const laboratory = getLaboratoryReadinessForTopic(topic);
  const researcher = getResearcherReadinessForTopic(topic);

  const groups: FutureWorkspaceGroup[] = [
    {
      title: t("researchTopicPanels.futureLiterature"),
      items: publication.layer.futureCapabilities.slice(0, 3),
    },
    {
      title: t("researchTopicPanels.futureExperiments"),
      items: [
        ...experiment.layer.futureCapabilities.slice(0, 2),
        experiment.layer.replicationSupported ? t("researchTopicPanels.futureReplicationStatus") : null,
        experiment.layer.negativeResultsSupported ? t("researchTopicPanels.futureNegativeResults") : null,
      ].filter((item): item is string => item !== null),
    },
    {
      title: t("researchTopicPanels.futureLaboratory"),
      items: [
        ...laboratory.layer.futureCapabilities.slice(0, 2),
        laboratory.layer.equipmentSupported ? t("researchTopicPanels.futureEquipmentInventories") : null,
        laboratory.layer.affiliationSupported ? t("researchTopicPanels.futureAffiliations") : null,
      ].filter((item): item is string => item !== null),
    },
    {
      title: t("researchTopicPanels.futureResearchers"),
      items: researcher.layer.futureCapabilities.slice(0, 3),
    },
    {
      title: t("researchTopicPanels.futureOpenQuestions"),
      items: [t("researchTopicPanels.futureOpenQuestionsItem")],
    },
    {
      title: t("researchTopicPanels.futureEvidenceDiscussions"),
      items: [t("researchTopicPanels.futureEvidenceDiscussionsItem")],
    },
    {
      title: t("researchTopicPanels.futureAiNotebook"),
      items: [t("researchTopicPanels.futureAiNotebookItem")],
    },
  ];

  return (
    <section aria-labelledby="topic-future-workspace-heading" className="space-y-4">
      <div>
        <p className={cbaiSectionEyebrow}>{t("researchTopicPanels.futureWorkspaceEyebrow")}</p>
        <h2 id="topic-future-workspace-heading" className="text-xl font-semibold text-zinc-100">
          {t("researchTopicPanels.futureWorkspaceTitle")}
        </h2>
        <p className="mt-1 text-sm text-zinc-500">{t("researchTopicPanels.futureWorkspaceDetail")}</p>
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
          <h3 className="text-sm font-semibold text-zinc-100">{t("researchTopicPanels.researcherReadiness")}</h3>
          <p className="mt-1 text-sm text-zinc-500">{RESEARCHER_TOPIC_NOT_CONNECTED_MESSAGE}</p>
          <p className="mt-1 text-xs text-zinc-600">{t("researchTopicPanels.researcherReadinessDetail")}</p>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          <ResearcherLayerOverview layer={researcher.layer} />
          <ResearcherVerificationReadiness layer={researcher.layer} />
          <ResearcherContributionModel layer={researcher.layer} />
        </div>
      </div>

      <p className="text-xs text-zinc-600">{t("researchTopicPanels.futureHumanReview")}</p>
    </section>
  );
}
