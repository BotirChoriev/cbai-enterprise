import Link from "next/link";
import { buildContextualHref, snapshotWithEntityFocus, type ContextEntityRef } from "@/lib/context";
import { usePlatformContext } from "@/components/platform/context/PlatformContextProvider";
import { RECENT_ENTITIES_ARCHITECTURE_NOTE } from "@/lib/context";
import { getResearchTopicPath } from "@/lib/research/research-topics";

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

/** Research topics are routed by path segment, not the query-param focus system — see PinnedEntities.tsx. */
function entityHref(entity: ContextEntityRef, context: Parameters<typeof snapshotWithEntityFocus>[0]): string {
  if (entity.kind === "research_topic") {
    return getResearchTopicPath(entity.id);
  }
  return buildContextualHref(entityRoute(entity.kind), snapshotWithEntityFocus(context, entity));
}

export default function RecentEntities({ entities }: RecentEntitiesProps) {
  const { context } = usePlatformContext();

  return (
    <div>
      <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
        Recent
      </p>
      {entities.length > 0 ? (
        <ul className="mt-2 flex flex-wrap gap-2">
          {entities.map((entity) => (
            <li key={`${entity.kind}-${entity.id}`}>
              <Link
                href={entityHref(entity, context)}
                className="rounded-md border border-zinc-800 px-2 py-1 text-[11px] text-zinc-400 hover:text-cyan-300"
              >
                {entity.name}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-[11px] text-zinc-600">{RECENT_ENTITIES_ARCHITECTURE_NOTE}</p>
      )}
    </div>
  );
}
