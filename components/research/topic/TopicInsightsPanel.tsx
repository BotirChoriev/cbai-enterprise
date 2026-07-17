"use client";

import type { ResearchTopic } from "@/lib/research/research-topics";
import { RESEARCH_TOPIC_AVAILABLE_TODAY, RESEARCH_TOPIC_NOT_AVAILABLE_YET } from "@/lib/research/research-topics";
import { getTopicDetailResearchGaps } from "@/lib/research/gaps/research-gap-query";
import { getOpenQuestionsForTopic } from "@/lib/research/open-questions/question-query";
import { useTranslation } from "@/lib/i18n/use-translation";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type TopicInsightsPanelProps = {
  topic: ResearchTopic;
};

export default function TopicInsightsPanel({ topic }: TopicInsightsPanelProps) {
  const { t } = useTranslation();
  const gaps = getTopicDetailResearchGaps(topic, 6);
  const openQuestions = getOpenQuestionsForTopic(topic);

  const cards = [
    {
      title: t("researchTopicPanels.insightsAvailableToday"),
      value: String(RESEARCH_TOPIC_AVAILABLE_TODAY.length),
      detail: RESEARCH_TOPIC_AVAILABLE_TODAY.slice(0, 2).join(" · "),
      accent: "border-emerald-500/25 bg-emerald-500/5",
    },
    {
      title: t("researchTopicPanels.insightsFutureEvidence"),
      value: String(RESEARCH_TOPIC_NOT_AVAILABLE_YET.length),
      detail: RESEARCH_TOPIC_NOT_AVAILABLE_YET.slice(0, 2).join(" · "),
      accent: "border-teal-500/25 bg-teal-500/5",
    },
    {
      title: t("researchTopicPanels.insightsKnowledgeGaps"),
      value: String(gaps.length),
      detail: gaps.slice(0, 2).map((gap) => gap.relatedWorkspaceArea).join(" · "),
      accent: "border-zinc-700 bg-zinc-900/40",
    },
    {
      title: t("researchTopicPanels.insightsOpenQuestions"),
      value: String(openQuestions.questions.length),
      detail: openQuestions.questions
        .slice(0, 2)
        .map((question) => question.questionCategory)
        .join(" · "),
      accent: "border-violet-500/25 bg-violet-500/5",
    },
  ];

  return (
    <section aria-labelledby="topic-insights-heading" className="space-y-3">
      <h2 id="topic-insights-heading" className="sr-only">
        {t("researchTopicPanels.insightsAriaLabel")}
      </h2>
      <p className={cbaiSectionEyebrow}>{t("researchTopicPanels.insightsAtGlance")}</p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <article key={card.title} className={`${cbaiGlassCard} border ${card.accent} p-4`}>
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">{card.title}</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-zinc-100">{card.value}</p>
            <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-zinc-500">{card.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
