import type { Entity } from "@/lib/entity/entity.types";
import { getEntityTypeLabel } from "@/lib/entity/entity.helpers";
import EntityOverviewSection, { type EntityOverviewFacts } from "@/components/shared/EntityOverviewSection";

type EntityHeaderFromEntityProps = {
  entity: Entity;
  /** Override the facts derived from entity.metrics, for callers with a richer bespoke set. */
  facts?: readonly EntityOverviewFacts[];
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
};

type EntityHeaderProps = EntityHeaderFromEntityProps | EntityHeaderExplicitProps;

/**
 * Universal Entity Header (Platform Core mission, completed in the Platform Core Completion
 * mission) — one header component for any entity type, built on the already-real
 * EntityOverviewSection rather than a second renderer.
 *
 * Two modes, both rendering through the exact same EntityOverviewSection:
 * - `entity` mode derives everything from a universal Entity object (used by Research topics,
 *   which never had a structured overview card before).
 * - explicit-prop mode accepts the same bespoke fields EntityOverviewSection always took
 *   (Country/Company/University keep their richer per-kind facts — Government, Founded, Official
 *   website — losslessly; this mode exists so those three pages could migrate their import site
 *   onto EntityHeader without losing any detail or changing any rendered output).
 */
export default function EntityHeader(props: EntityHeaderProps) {
  if (props.entity) {
    const { entity, facts } = props;
    const derivedFacts =
      facts ??
      entity.metrics.map((metric) => ({
        label: metric.label,
        value: metric.unit ? `${metric.value} ${metric.unit}` : String(metric.value),
      }));

    return (
      <EntityOverviewSection
        name={entity.name}
        entityType={getEntityTypeLabel(entity.type)}
        country={entity.country ?? null}
        subtitle={entity.subtitle}
        availableInformation={entity.aiSummary}
        facts={derivedFacts}
      />
    );
  }

  const { name, entityType, country, region, subtitle, availableInformation, facts } = props;
  return (
    <EntityOverviewSection
      name={name}
      entityType={entityType}
      country={country}
      region={region}
      subtitle={subtitle}
      availableInformation={availableInformation}
      facts={facts}
    />
  );
}
