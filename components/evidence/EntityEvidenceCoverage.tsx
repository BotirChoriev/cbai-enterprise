import Link from "next/link";
import type { ExplorerEntityModule } from "@/lib/evidence-explorer";

type EntityEvidenceCoverageProps = {
  entityModules: readonly ExplorerEntityModule[];
};

export default function EntityEvidenceCoverage({
  entityModules,
}: EntityEvidenceCoverageProps) {
  return (
    <section className="space-y-4" aria-labelledby="entity-evidence-coverage-heading">
      <div>
        <h2
          id="entity-evidence-coverage-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          Entity Evidence Coverage
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Registry availability and indicator coverage across Countries, Companies, and
          Universities intelligence routes.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {entityModules.map((module) => (
          <div
            key={module.entityType}
            className="rounded-xl border border-zinc-800 bg-zinc-950 p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-zinc-100">{module.label}</h3>
                <p className="mt-0.5 text-xs text-zinc-500">
                  {module.registryAvailable
                    ? `${module.registryCount} entities in registry`
                    : "Registry not available"}
                </p>
              </div>
              <Link
                href={module.route}
                className="shrink-0 text-xs text-cyan-400 underline-offset-2 hover:underline"
              >
                Open route
              </Link>
            </div>

            <dl className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between gap-4">
                <dt className="text-zinc-500">Indicators connected</dt>
                <dd className="font-medium text-zinc-300">
                  {module.indicatorsConnected} / {module.indicatorTotal}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-zinc-500">Connected sources</dt>
                <dd className="font-medium text-zinc-300">
                  {module.connectedSourceCount} / {module.totalSourceCount}
                </dd>
              </div>
            </dl>

            <div className="mt-4">
              <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                Missing evidence categories
              </p>
              {module.missingEvidenceCategories.length > 0 ? (
                <ul className="mt-2 space-y-1">
                  {module.missingEvidenceCategories.map((category) => (
                    <li key={category} className="text-xs text-zinc-400">
                      {category}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-xs text-zinc-600">
                  No domain gaps — all applicable domains have at least one connected
                  indicator.
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
