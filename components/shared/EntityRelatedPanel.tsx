import Link from "next/link";
import type { EntityRelationship, EntityType } from "@/lib/entity/entity.types";
import { getEntityTypePluralLabel } from "@/lib/entity/entity.helpers";
import { cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type EntityRelatedPanelProps = {
  title?: string;
  relationships: readonly EntityRelationship[];
  emptyLabel: string;
  /** Optional short note about how these relationships were derived (e.g. "matched by subject matter"). */
  note?: string;
};

const GROUP_ORDER: readonly EntityType[] = [
  "country",
  "company",
  "university",
  "research_topic",
  "government",
  "investor",
  "person",
];

function groupByType(
  relationships: readonly EntityRelationship[],
): { targetType: EntityType; items: EntityRelationship[] }[] {
  const byType = new Map<EntityType, EntityRelationship[]>();
  for (const rel of relationships) {
    const list = byType.get(rel.targetType) ?? [];
    list.push(rel);
    byType.set(rel.targetType, list);
  }
  return GROUP_ORDER.filter((type) => byType.has(type)).map((targetType) => ({
    targetType,
    items: byType.get(targetType) ?? [],
  }));
}

/**
 * Universal Entity Engine — one "Related Entities" panel, grouped by real target type, replacing
 * the need for a bespoke "Related Companies"/"Related Universities"/"Related Research" component
 * per entity module. Only ever renders relationships the caller actually computed via
 * lib/entity/entity-relationships.ts's buildEntityRelationships — never fabricates a group.
 */
export default function EntityRelatedPanel({ title = "Related Entities", relationships, emptyLabel, note }: EntityRelatedPanelProps) {
  const groups = groupByType(relationships);

  if (groups.length === 0) {
    return (
      <section aria-labelledby="entity-related-panel-heading" className="space-y-2">
        <p className={cbaiSectionEyebrow} id="entity-related-panel-heading">
          {title}
        </p>
        <p className="text-sm text-zinc-500">{emptyLabel}</p>
      </section>
    );
  }

  return (
    <section aria-labelledby="entity-related-panel-heading" className="space-y-3">
      <div>
        <p className={cbaiSectionEyebrow} id="entity-related-panel-heading">
          {title}
        </p>
        {note ? <p className="mt-1 text-xs text-zinc-600">{note}</p> : null}
      </div>
      <div className="space-y-3">
        {groups.map((group) => (
          <div key={group.targetType}>
            <p className="mb-1.5 text-[10px] uppercase tracking-wider text-zinc-600">
              {getEntityTypePluralLabel(group.targetType)}
            </p>
            <ul className="flex flex-wrap gap-2">
              {group.items.map((item) => (
                <li key={`${item.type}-${item.targetType}-${item.targetId}`}>
                  {item.targetHref ? (
                    <Link
                      href={item.targetHref}
                      className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:border-cyan-500/30 hover:text-cyan-300"
                    >
                      {item.targetName}
                    </Link>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs text-zinc-500">
                      {item.targetName}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
