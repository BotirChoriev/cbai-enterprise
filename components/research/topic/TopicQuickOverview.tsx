"use client";

import Link from "next/link";
import type { ResearchTopic } from "@/lib/research/research-topics";
import { getCrossTopicDiscoveriesForTopic } from "@/lib/research/discovery/discovery-query";
import { getResearchTopicById, getResearchTopicPath } from "@/lib/research/research-topics";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";
import { useTranslation } from "@/lib/i18n/use-translation";
import { getDictionary } from "@/lib/i18n/translate";
import { translateResearchTopicStatus } from "@/lib/i18n/research-topic-status-translation";

export const TOPIC_EXPERIENCE_NOTICE = "Research Intelligence currently uses catalog information and verified platform models. Live scientific databases are not connected yet.";

type TopicQuickOverviewProps = {
  topic: ResearchTopic;
};

function statusClass(status: ResearchTopic["status"]): string {
  switch (status) {
    case "catalog_available":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
    case "workspace_not_available":
      return "border-teal-500/25 bg-teal-500/5 text-teal-300";
    case "evidence_not_connected":
      return "border-zinc-700 bg-zinc-900/60 text-zinc-400";
  }
}

export default function TopicQuickOverview({ topic }: TopicQuickOverviewProps) {
  const { t, language } = useTranslation();
  const statusLabel = translateResearchTopicStatus(getDictionary(language), topic.status);
  const relatedTopics = getCrossTopicDiscoveriesForTopic(topic, 3);

  return (
    <section aria-labelledby="topic-quick-overview-heading" className="space-y-4">
      <div>
        <p className={cbaiSectionEyebrow}>{t("researchTopic.overviewEyebrow")}</p>
        <h2 id="topic-quick-overview-heading" className="text-lg font-semibold text-zinc-100">
          {t("researchTopic.quickOverview")}
        </h2>
      </div>

      <div className={`${cbaiGlassCard} grid gap-4 p-5 sm:grid-cols-2`}>
        <div className="sm:col-span-2">
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
            {t("researchTopic.topicLabel")}
          </p>
          <p className="mt-1 text-sm font-medium text-zinc-100">{topic.topicName}</p>
          <p className="mt-1 text-xs text-zinc-500">{topic.description}</p>
        </div>

        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
            {t("researchTopic.domainLabel")}
          </p>
          <p className="mt-1 text-sm text-zinc-300">{topic.domain}</p>
        </div>

        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
            {t("researchTopic.currentStatus")}
          </p>
          <span
            className={`mt-2 inline-flex rounded border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${statusClass(topic.status)}`}
          >
            {statusLabel}
          </span>
        </div>

        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
            {t("researchTopic.methods")}
          </p>
          <p className="mt-1 text-xs text-zinc-400">{topic.relatedMethods.join(" · ")}</p>
        </div>

        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
            {t("researchTopic.evidenceTypes")}
          </p>
          <p className="mt-1 text-xs text-zinc-400">{topic.relatedEvidenceTypes.join(" · ")}</p>
        </div>

        <div className="sm:col-span-2">
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
            {t("researchTopic.relatedTopics")}
          </p>
          {relatedTopics.length > 0 ? (
            <ul className="mt-2 flex flex-wrap gap-2">
              {relatedTopics.map((discovery) => {
                const related = getResearchTopicById(discovery.relatedTopicId);
                if (!related) return null;
                return (
                  <li key={discovery.discoveryId}>
                    <Link
                      href={getResearchTopicPath(related.topicId)}
                      className="rounded-md border border-zinc-800 bg-zinc-900/50 px-2 py-1 text-xs text-teal-400 transition-colors hover:border-teal-500/30 hover:text-teal-300"
                    >
                      {related.topicName}
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-1 text-xs text-zinc-600">{t("researchTopic.noRelatedTopics")}</p>
          )}
        </div>

        <div className="sm:col-span-2 border-t border-zinc-800/80 pt-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
            {t("researchTopic.humanReview")}
          </p>
          <p className="mt-1 text-xs text-zinc-500">{t("researchTopic.humanReviewDetail")}</p>
        </div>
      </div>
    </section>
  );
}
