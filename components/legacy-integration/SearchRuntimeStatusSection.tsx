import type { LegacyBuildIntegrationModel } from "@/lib/legacy-build-integration";

type SearchRuntimeStatusSectionProps = {
  model: LegacyBuildIntegrationModel;
};

export default function SearchRuntimeStatusSection({
  model,
}: SearchRuntimeStatusSectionProps) {
  return (
    <section className="space-y-3" aria-labelledby="search-runtime-status-heading">
      <div>
        <h3
          id="search-runtime-status-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          Runtime Integration Status
        </h3>
        <p className="mt-1 text-sm text-zinc-500">
          Legacy intelligence foundations — navigation only, not live search execution.
        </p>
      </div>
      <p className="rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-500">
        Observability: {model.observability.health} · Sessions:{" "}
        {model.sessionRegistry.total === 0
          ? "No runtime activity recorded"
          : `${model.sessionRegistry.total} registered`}
      </p>
    </section>
  );
}
