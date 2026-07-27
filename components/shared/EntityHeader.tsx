"use client";

import type { Entity, EntityType } from "@/lib/entity/entity.types";
import { getEntityTypeLabel } from "@/lib/entity/entity.helpers";
import EntityOverviewSection, { type EntityOverviewFacts } from "@/components/shared/EntityOverviewSection";
import { useTranslation } from "@/lib/i18n/use-translation";
import { localizeResearchDomainLabel } from "@/lib/i18n/entity-domain-labels";

type EntityHeaderFromEntityProps = {
  entity: Entity;
  /** Override the facts derived from entity.metrics, for callers with a richer bespoke set. */
  facts?: readonly EntityOverviewFacts[];
  /** False when the page's own hero already shows this entity's name — see EntityOverviewSection. */
  showName?: boolean;
};

type EntityHeaderExplicitProps = {
  entity?: undefined;
  name: string;
  entityType: string;
  country: string | null;
  region?: string | null;
  subtitle?: string;
  availableInformation: string;
  facts?: readonly EntityOverviewFacts[];
  showName?: boolean;
};

type EntityHeaderProps = EntityHeaderFromEntityProps | EntityHeaderExplicitProps;

type TFunc = (path: string, vars?: Record<string, string>) => string;

function localizeEntityType(type: EntityType, t: TFunc): string {
  const map: Partial<Record<EntityType, string>> = {
    country: "entityUi.entityTypeCountry",
    company: "entityUi.entityTypeCompany",
    university: "entityUi.entityTypeUniversity",
    research_topic: "entityUi.entityTypeResearchTopic",
  };
  const key = map[type];
  return key ? t(key) : getEntityTypeLabel(type);
}

function localizeMetricLabel(label: string, unit: string | undefined, value: string | number, t: TFunc): {
  label: string;
  value: string;
} {
  const isRelatedCompanies =
    label === "Related Companies (subject-matter match)" || label === "related-companies";
  const displayLabel = isRelatedCompanies ? t("entityUi.relatedCompaniesMetric") : label;
  const displayUnit =
    unit === "records" || unit === "yozuv" ? t("entityUi.recordsUnit") : unit;
  return {
    label: displayLabel,
    value: displayUnit ? `${value} ${displayUnit}` : String(value),
  };
}

/**
 * Universal Entity Header — one header component for any entity type.
 * Platform-controlled type/metric labels are localized at render time.
 */
export default function EntityHeader(props: EntityHeaderProps) {
  const { t, language } = useTranslation();

  if (props.entity) {
    const { entity, facts, showName } = props;
    const derivedFacts =
      facts ??
      entity.metrics.map((metric) =>
        localizeMetricLabel(metric.label, metric.unit, metric.value, t),
      );
    const subtitle =
      entity.type === "research_topic" && typeof entity.subtitle === "string"
        ? localizeResearchDomainLabel(entity.subtitle, language)
        : entity.subtitle;

    return (
      <EntityOverviewSection
        name={entity.name}
        entityType={localizeEntityType(entity.type, t)}
        country={entity.country ?? null}
        subtitle={subtitle}
        availableInformation={entity.aiSummary}
        facts={derivedFacts}
        showName={showName}
      />
    );
  }

  const { name, entityType, country, region, subtitle, availableInformation, facts, showName } = props;
  return (
    <EntityOverviewSection
      name={name}
      entityType={entityType}
      country={country}
      region={region}
      subtitle={subtitle}
      availableInformation={availableInformation}
      facts={facts}
      showName={showName}
    />
  );
}
