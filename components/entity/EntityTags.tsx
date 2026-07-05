import type { EntityComponentProps } from "@/lib/entity/entity.types";
import { tagVariantStyles } from "@/lib/entity/entity.icons";

export default function EntityTags({ entity }: EntityComponentProps) {
  if (entity.tags.length === 0) return null;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-6 py-4">
      <h3 className="mb-3 text-[10px] font-medium uppercase tracking-widest text-zinc-500">
        Tags
      </h3>
      <div className="flex flex-wrap gap-2">
        {entity.tags.map((tag) => (
          <span
            key={tag.id}
            className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${
              tagVariantStyles[tag.variant ?? "default"]
            }`}
          >
            {tag.label}
          </span>
        ))}
      </div>
    </div>
  );
}
