"use client";

import Link from "next/link";
import { buildContextualHref, snapshotWithEntityFocus, type ContextEntityRef } from "@/lib/context";
import { usePlatformContext } from "@/components/platform/context/PlatformContextProvider";
import { PINNED_ENTITIES_ARCHITECTURE_NOTE } from "@/lib/context";
import { getResearchTopicPath } from "@/lib/research/research-topics";
import { evidenceItemHref } from "@/lib/research/evidence/evidence-bookmark";

type PinnedEntitiesProps = {
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

/**
 * Research topics, Projects, and Evidence are routed by path segment/query flag/owning-topic
 * (`/research/[topicId]`, `/my-work?project=id`, evidenceItemHref()), not the country/company/
 * university query-param focus system — so a pinned one of any of the three gets a direct link
 * instead of going through buildContextualHref/snapshotWithEntityFocus. In practice this
 * component only ever renders non-"evidence" bookmarks (see components/my-work/SavedEvidence.tsx
 * for the dedicated, distinct Evidence bookmark surface), but this stays fully generic and
 * correct for any real ContextEntityRef kind.
 */
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

export default function PinnedEntities({ entities }: PinnedEntitiesProps) {
  const { context, unpinEntityFromWorkspace } = usePlatformContext();

  return (
    <div>
      <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
        Pinned
      </p>
      {entities.length > 0 ? (
        <ul className="mt-2 flex flex-wrap gap-2">
          {entities.map((entity) => (
            <li
              key={`${entity.kind}-${entity.id}`}
              className="flex items-center gap-1 rounded-md border border-zinc-800 pl-2 pr-1 py-1 text-[11px] text-zinc-400"
            >
              <Link href={entityHref(entity, context)} className="hover:text-teal-300">
                {entity.name}
              </Link>
              <button
                type="button"
                onClick={() => unpinEntityFromWorkspace(entity.kind, entity.id)}
                title={`Remove ${entity.name} from workspace`}
                className="rounded px-1 text-zinc-600 hover:text-amber-400"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-[11px] text-zinc-600">{PINNED_ENTITIES_ARCHITECTURE_NOTE}</p>
      )}
    </div>
  );
}
