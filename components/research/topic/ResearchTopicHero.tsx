"use client";

import Link from "next/link";
import type { ResearchTopic } from "@/lib/research/research-topics";
import { toResearchTopicEntity } from "@/lib/research-topic.adapter";
import EntityHeader from "@/components/shared/EntityHeader";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";
import { useTranslation } from "@/lib/i18n/use-translation";
import { getDictionary } from "@/lib/i18n/translate";
import { translateResearchTopicStatus } from "@/lib/i18n/research-topic-status-translation";
import { localizeResearchDomainLabel } from "@/lib/i18n/entity-domain-labels";
import { localizeResearchTopic } from "@/lib/i18n/research-catalog-locale";
import CreateLinkedWorkButton from "@/components/operational-objects/CreateLinkedWorkButton";
import EvidenceConnectAction from "@/components/evidence/EvidenceConnectAction";

function statusBadgeClass(status: ResearchTopic["status"]): string {
  switch (status) {
    case "catalog_available":
      return "border-emerald-500/35 bg-emerald-500/10 text-emerald-300";
    case "workspace_not_available":
      return "border-teal-500/25 bg-teal-500/5 text-teal-300";
    case "evidence_not_connected":
      return "border-zinc-600/80 bg-zinc-900/60 text-zinc-400";
  }
}

type ResearchTopicHeroProps = {
  topic: ResearchTopic;
};

export default function ResearchTopicHero({ topic }: ResearchTopicHeroProps) {
  const { t, language } = useTranslation();
  const statusLabel = translateResearchTopicStatus(getDictionary(language), topic.status);
  const localized = localizeResearchTopic(topic, language);

  return (
    <header className="space-y-5">
      <Link
        href="/research"
        className="inline-flex text-sm font-medium text-teal-400 transition-colors hover:text-teal-300"
      >
        {t("researchTopic.backToTopics")}
      </Link>

      <div className={`${cbaiGlassCard} space-y-4 p-6`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className={cbaiSectionEyebrow}>{localizeResearchDomainLabel(topic.domain, language)}</p>
            <h1 className="cbai-display mt-2 text-3xl text-zinc-50 sm:text-4xl">{localized.topicName}</h1>
          </div>
          <span
            className={`shrink-0 rounded-md border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${statusBadgeClass(topic.status)}`}
          >
            {statusLabel}
          </span>
        </div>
        <p className="max-w-3xl text-base leading-relaxed text-zinc-400">{localized.description}</p>
        {localized.sourceLanguage ? (
          <p className="text-[11px] text-zinc-600">
            {t("researchTopicDepth.catalogMetadataNotice")} ·{" "}
            {t("researchTopicDepth.sourceLanguageLabel", { language: localized.sourceLanguage })}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <CreateLinkedWorkButton
            variant="research"
            compact
            research={{
              topicId: topic.topicId,
              topicName: localized.topicName,
              routePath: `/research/${encodeURIComponent(topic.topicId)}`,
            }}
          />
          <EvidenceConnectAction
            category={t("operationalObject.linkedEvidenceOfficialSources")}
            relatedEntityName={localized.topicName}
            relatedEntityKind="research"
            relatedEntityId={topic.topicId}
            compact
          />
        </div>
      </div>

      <EntityHeader entity={toResearchTopicEntity(topic)} showName={false} />

      <p className="text-sm leading-relaxed text-zinc-500">{t("researchTopic.humanReviewNotice")}</p>
    </header>
  );
}
