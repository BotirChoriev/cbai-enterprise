"use client";

import Link from "next/link";
import type { EntityRelationship, EntityType } from "@/lib/entity/entity.types";
import { getEntityTypePluralLabel } from "@/lib/entity/entity.helpers";
import { cbaiSectionEyebrow } from "@/components/brand/brand-classes";
import { useTranslation } from "@/lib/i18n/use-translation";

type EntityRelatedPanelProps = {
  title?: string;
  relationships: readonly EntityRelationship[];
  emptyLabel: string;
  note?: string;
  showHeading?: boolean;
  emptyActions?: readonly { label: string; href: string }[];
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

function verifiedBadgeClass(verified: boolean): string {
  return verified
    ? "text-teal-400 bg-teal-500/10 border-teal-500/20"
    : "text-zinc-400 bg-zinc-800/50 border-zinc-700/50";
}

function RelationshipRow({
  item,
  verifiedLabel,
  missingLabel,
}: {
  item: EntityRelationship;
  verifiedLabel: string;
  missingLabel: string;
}) {
  return (
    <li className="flex flex-col gap-2 rounded-lg border border-zinc-800 bg-zinc-900/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        {item.targetHref ? (
          <Link href={item.targetHref} className="text-sm font-medium text-teal-400 hover:text-teal-300">
            {item.targetName}
          </Link>
        ) : (
          <p className="text-sm font-medium text-zinc-200">{item.targetName}</p>
        )}
        {item.label ? <p className="mt-0.5 text-xs text-zinc-600">{item.label}</p> : null}
      </div>
      {item.verified !== undefined ? (
        <span className={`self-start rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${verifiedBadgeClass(item.verified)}`}>
          {item.verified ? verifiedLabel : missingLabel}
        </span>
      ) : null}
    </li>
  );
}

function RelationshipPill({ item }: { item: EntityRelationship }) {
  return (
    <li>
      {item.targetHref ? (
        <Link
          href={item.targetHref}
          className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:border-teal-500/30 hover:text-teal-300"
        >
          {item.targetName}
        </Link>
      ) : (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs text-zinc-500">
          {item.targetName}
        </span>
      )}
    </li>
  );
}

export default function EntityRelatedPanel({
  title,
  relationships,
  emptyLabel,
  note,
  showHeading = true,
  emptyActions,
}: EntityRelatedPanelProps) {
  const { t } = useTranslation();
  const panelTitle = title ?? t("entityRelationships.relatedEntities");
  const verifiedLabel = t("entityRelationships.verifiedCatalog");
  const missingLabel = t("entityRelationships.evidenceMissing");
  const groups = groupByType(relationships);

  if (groups.length === 0) {
    return (
      <section aria-labelledby="entity-related-panel-heading" className="space-y-2">
        {showHeading ? (
          <p className={cbaiSectionEyebrow} id="entity-related-panel-heading">
            {panelTitle}
          </p>
        ) : null}
        <p className="text-sm text-zinc-500">{emptyLabel}</p>
        {emptyActions && emptyActions.length > 0 ? (
          <div className="flex flex-wrap gap-2 pt-1">
            {emptyActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="inline-flex items-center rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:border-teal-500/30 hover:text-teal-300"
              >
                {action.label} →
              </Link>
            ))}
          </div>
        ) : null}
      </section>
    );
  }

  return (
    <section aria-labelledby="entity-related-panel-heading" className="space-y-3">
      {showHeading || note ? (
        <div>
          {showHeading ? (
            <p className={cbaiSectionEyebrow} id="entity-related-panel-heading">
              {panelTitle}
            </p>
          ) : null}
          {note ? <p className="mt-1 text-xs text-zinc-600">{note}</p> : null}
        </div>
      ) : null}
      <div className="space-y-4">
        {groups.map((group) => {
          const useRows = group.items.some((item) => item.label !== undefined || item.verified !== undefined);
          return (
            <div key={group.targetType}>
              <p className="mb-1.5 text-[10px] uppercase tracking-wider text-zinc-600">
                {getEntityTypePluralLabel(group.targetType)}
              </p>
              <ul className={useRows ? "space-y-2" : "flex flex-wrap gap-2"}>
                {group.items.map((item, index) => {
                  const key = `${item.type}-${item.targetType}-${item.targetId}-${item.label ?? ""}-${index}`;
                  return useRows ? (
                    <RelationshipRow key={key} item={item} verifiedLabel={verifiedLabel} missingLabel={missingLabel} />
                  ) : (
                    <RelationshipPill key={key} item={item} />
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
