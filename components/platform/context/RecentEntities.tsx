"use client";

import Link from "next/link";
import { buildContextualHref, snapshotWithEntityFocus, type ContextEntityRef } from "@/lib/context";
import { usePlatformContext } from "@/components/platform/context/PlatformContextProvider";
import { getResearchTopicPath } from "@/lib/research/research-topics";
import { evidenceItemHref } from "@/lib/research/evidence/evidence-bookmark";
import { useTranslation } from "@/lib/i18n/use-translation";

type RecentEntitiesProps = {
  entities: readonly ContextEntityRef[];
};

function entityRoute(kind: "country" | "company" | "university"): string {
  switch (kind) {
    case "country":
      return "/countries";
    case "company":
      return "/companies";
    case "university":
      return "/universities";
  }
}

/** Research topics/Projects/Evidence are routed by path segment/query flag/owning-topic, not the
 * query-param focus system — see PinnedEntities.tsx. In practice this list never actually contains
 * an "evidence" entry (recordEntityView, which populates Recent, is never called for a bookmark
 * action), but this stays correct for any real ContextEntityRef kind. */
function entityHref(entity: ContextEntityRef, context: Parameters<typeof snapshotWithEntityFocus>[0]): string {
  if (entity.kind === "research_topic") {
    return getResearchTopicPath(entity.id);
  }
  if (entity.kind === "project") {
    return `/my-work?project=${entity.id}`;
  }
  if (entity.kind === "evidence") {
    return evidenceItemHref(entity.id);
  }
  return buildContextualHref(entityRoute(entity.kind), snapshotWithEntityFocus(context, entity));
}

export default function RecentEntities({ entities }: RecentEntitiesProps) {
  const { context } = usePlatformContext();
  const { t } = useTranslation();

  return (
    <div>
      <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
        {t("myWork.recentHeading")}
      </p>
      {entities.length > 0 ? (
        <ul className="mt-2 flex flex-wrap gap-2">
          {entities.map((entity) => (
            <li key={`${entity.kind}-${entity.id}`}>
              <Link
                href={entityHref(entity, context)}
                className="rounded-md border border-zinc-800 px-2 py-1 text-[11px] text-zinc-400 hover:text-teal-300"
              >
                {entity.name}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-[11px] text-zinc-600">{t("myWork.recentEmpty")}</p>
      )}
    </div>
  );
}
