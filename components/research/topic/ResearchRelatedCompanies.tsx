"use client";

import type { ResearchTopic } from "@/lib/research/research-topics";
import { buildEntityRelationships } from "@/lib/entity/entity-relationships";
import EntityRelatedPanel from "@/components/shared/EntityRelatedPanel";
import { useTranslation } from "@/lib/i18n/use-translation";
import { cbaiGlassCard } from "@/components/brand/brand-classes";

type ResearchRelatedCompaniesProps = {
  topic: ResearchTopic;
};

export default function ResearchRelatedCompanies({ topic }: ResearchRelatedCompaniesProps) {
  const { t } = useTranslation();
  const relationships = buildEntityRelationships("research_topic", topic.topicId);

  if (relationships.length === 0) return null;

  return (
    <div className={`${cbaiGlassCard} p-4`}>
      <EntityRelatedPanel
        title={t("researchTopicPanels.relatedCompaniesTitle")}
        relationships={relationships}
        emptyLabel={t("researchTopicPanels.relatedCompaniesEmpty")}
        note={t("researchTopicPanels.relatedCompaniesNote")}
      />
    </div>
  );
}
