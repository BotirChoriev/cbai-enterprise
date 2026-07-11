"use client";

import Link from "next/link";
import { buildContextualHref, snapshotWithEntityFocus, type ContextEntityRef } from "@/lib/context";
import { usePlatformContext } from "@/components/platform/context/PlatformContextProvider";
import { PINNED_ENTITIES_ARCHITECTURE_NOTE } from "@/lib/context";

type PinnedEntitiesProps = {
  entities: readonly ContextEntityRef[];
};

function entityRoute(kind: ContextEntityRef["kind"]): string {
  switch (kind) {
    case "country":
      return "/countries";
    case "company":
      return "/companies";
    case "university":
      return "/universities";
  }
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
              <Link
                href={buildContextualHref(
                  entityRoute(entity.kind),
                  snapshotWithEntityFocus(context, entity),
                )}
                className="hover:text-cyan-300"
              >
                {entity.name}
              </Link>
              <button
                type="button"
                onClick={() => unpinEntityFromWorkspace(entity.kind, entity.id)}
                title={`Remove ${entity.name} from workspace`}
                className="rounded px-1 text-zinc-600 hover:text-red-400"
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
