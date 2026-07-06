import type { ContextEntityRef } from "@/lib/context";
import { PINNED_ENTITIES_ARCHITECTURE_NOTE } from "@/lib/context";

type PinnedEntitiesProps = {
  entities: readonly ContextEntityRef[];
};

export default function PinnedEntities({ entities }: PinnedEntitiesProps) {
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
              className="rounded-md border border-zinc-800 px-2 py-1 text-[11px] text-zinc-400"
            >
              {entity.name}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-[11px] text-zinc-600">{PINNED_ENTITIES_ARCHITECTURE_NOTE}</p>
      )}
    </div>
  );
}
