"use client";

import { RESEARCH_TOPIC_STATUS_LABELS } from "@/lib/research/research-topics";
import type { ResearchTopic } from "@/lib/research/research-topics";
import type { TopicEvidenceReview } from "@/lib/research/evidence/evidence-topic-builder";
import { useTranslation } from "@/lib/i18n/use-translation";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

export function buildMissionStatement(
  topic: ResearchTopic,
  t: (key: string, params?: Record<string, string>) => string,
): string {
  return t("researchTopicPanels.missionStatement", {
    topic: topic.topicName,
    domain: topic.domain,
  });
}

type MissionSection = {
  title: string;
  items: readonly string[];
};

type ResearchMissionWorkspaceProps = {
  review: TopicEvidenceReview;
};

export default function ResearchMissionWorkspace({ review }: ResearchMissionWorkspaceProps) {
  const { t } = useTranslation();
  const { topic } = review;

  function buildKnownInformation(): readonly string[] {
    const items: string[] = [t("researchTopicPanels.knownClassified", { domain: topic.domain })];
    if (topic.relatedMethods.length > 0) {
      items.push(
        t("researchTopicPanels.knownMethods", { methods: topic.relatedMethods.join(", ") }),
      );
    }
    if (topic.relatedEvidenceTypes.length > 0) {
      items.push(
        t("researchTopicPanels.knownEvidenceTypes", {
          types: topic.relatedEvidenceTypes.join(", "),
        }),
      );
    }
    items.push(
      t("researchTopicPanels.knownCatalogStatus", {
        status: RESEARCH_TOPIC_STATUS_LABELS[topic.status],
      }),
    );
    return items;
  }

  function buildUnknowns(): readonly string[] {
    const items: string[] = [
      t("researchTopicPanels.unknownLiveFindings", { topic: topic.topicName }),
    ];
    const reviewRequired = review.evidenceItems.filter((item) => item.status === "human_review_required");
    if (reviewRequired.length > 0) {
      items.push(
        t("researchTopicPanels.unknownReviewRequired", {
          count: String(reviewRequired.length),
          categoryWord:
            reviewRequired.length === 1
              ? t("researchTopicPanels.categoryWordSingular")
              : t("researchTopicPanels.categoryWordPlural"),
        }),
      );
    }
    return items;
  }

  function buildEvidenceGaps(): readonly string[] {
    const gaps: string[] = review.evidenceItems
      .filter((item) => item.status === "source_not_connected")
      .map((item) => t("researchTopicPanels.gapSourceNotConnected", { label: item.label }));
    if (!review.reviewReadiness.reviewOpened) {
      gaps.push(t("researchTopicPanels.reviewNotStarted"));
    }
    return gaps;
  }

  function buildRecommendedNextAction(): string {
    return review.nextActions[0] ?? t("researchTopicPanels.notEnoughEvidence");
  }

  const sections: MissionSection[] = [
    { title: t("researchTopicPanels.missionSection"), items: [buildMissionStatement(topic, t)] },
    { title: t("researchTopicPanels.knownInformation"), items: buildKnownInformation() },
    { title: t("researchTopicPanels.unknowns"), items: buildUnknowns() },
    { title: t("researchTopicPanels.evidenceGaps"), items: buildEvidenceGaps() },
    {
      title: t("researchTopicPanels.recommendedNextAction"),
      items: [buildRecommendedNextAction()],
    },
  ];

  return (
    <section aria-labelledby="research-mission-heading" className="space-y-4">
      <div>
        <p className={cbaiSectionEyebrow}>{t("researchTopicPanels.missionWorkspaceEyebrow")}</p>
        <h2 id="research-mission-heading" className="text-xl font-semibold text-zinc-100">
          {t("researchTopicPanels.missionWorkspaceHeading", { topic: topic.topicName })}
        </h2>
        <p className="mt-1 text-sm text-zinc-500">{t("researchTopicPanels.missionWorkspaceDetail")}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => (
          <div key={section.title} className={`${cbaiGlassCard} p-4`}>
            <h3 className="text-sm font-medium text-zinc-200">{section.title}</h3>
            {section.items.length > 0 ? (
              <ul className="mt-2 space-y-1.5">
                {section.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs text-zinc-500">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-teal-500/60" />
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-xs text-zinc-600">{t("researchTopicPanels.notEnoughEvidence")}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
