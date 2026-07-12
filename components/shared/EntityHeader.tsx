import type { Entity } from "@/lib/entity/entity.types";
import { getEntityTypeLabel } from "@/lib/entity/entity.helpers";
import EntityOverviewSection from "@/components/shared/EntityOverviewSection";

type EntityHeaderProps = {
  entity: Entity;
};

/**
 * Universal Entity Header (Platform Core mission) — one header that adapts to any entity type,
 * built on the already-real EntityOverviewSection rather than a new render. Country/Company/
 * University keep their existing, richer hand-built EntityOverviewSection call sites (bespoke
 * per-kind facts like Government/Founded/Official website — mapping those onto a generic Entity
 * object without losing that detail is a real future migration, not attempted here to avoid
 * regressing three already-correct pages). EntityHeader is the header path for entity types that
 * don't have one yet — e.g. Research topics, which used to have no EntityOverviewSection-style
 * identity block at all.
 */
export default function EntityHeader({ entity }: EntityHeaderProps) {
  const facts = entity.metrics.map((metric) => ({
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
      facts={facts}
    />
  );
}
