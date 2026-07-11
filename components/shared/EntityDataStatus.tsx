import StatusBadge from "@/components/shared/StatusBadge";
import { resolveEntityDataStatus } from "@/components/shared/entity-profile-copy";

type EntityDataStatusProps = {
  sourceConnectedCount: number;
  totalSources: number;
};

/** One consistent "Data status" summary — the same status vocabulary on every entity profile. */
export default function EntityDataStatus({ sourceConnectedCount, totalSources }: EntityDataStatusProps) {
  const status = resolveEntityDataStatus(sourceConnectedCount, totalSources);

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
      <span className="font-medium uppercase tracking-wider text-zinc-600">Data status</span>
      <StatusBadge status={status} />
      <span>
        {sourceConnectedCount} of {totalSources} evidence sources connected
      </span>
    </div>
  );
}
