import type { EntityComponentProps } from "@/lib/entity/entity.types";
import { formatMetadataValue } from "@/lib/entity/entity.helpers";

type EntityOverviewProps = EntityComponentProps & {
  metadataFields?: { key: string; label: string }[];
};

export default function EntityOverview({
  entity,
  metadataFields,
}: EntityOverviewProps) {
  const fields =
    metadataFields ??
    Object.keys(entity.metadata).map((key) => ({
      key,
      label: key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (s) => s.toUpperCase()),
    }));

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950">
      <div className="border-b border-zinc-800 px-6 py-4">
        <h3 className="text-sm font-semibold text-zinc-50">Overview</h3>
        <p className="text-xs text-zinc-500">Entity profile & key attributes</p>
      </div>

      <div className="px-6 py-5">
        <p className="text-sm leading-relaxed text-zinc-400">{entity.overview}</p>
      </div>

      {fields.length > 0 && (
        <div className="grid gap-px border-t border-zinc-800 bg-zinc-800 sm:grid-cols-2 lg:grid-cols-3">
          {fields.map(({ key, label }) => {
            const value = entity.metadata[key];
            if (value === undefined) return null;
            return (
              <div key={key} className="bg-zinc-950 px-5 py-4">
                <p className="text-[10px] font-medium uppercase tracking-widest text-zinc-600">
                  {label}
                </p>
                <p className="mt-1 text-sm font-medium text-zinc-200">
                  {formatMetadataValue(value)}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
