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
          Available evidence by profile
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Evidence status across countries, companies, and universities.
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
                    ? `${module.registryCount} profiles available`
                    : "No profiles available yet"}
                </p>
              </div>
              <Link
                href={module.route}
                className="inline-flex min-h-9 shrink-0 items-center rounded-lg border border-zinc-700 bg-zinc-900 px-3 text-xs font-medium text-teal-400 transition-colors hover:border-zinc-600 hover:bg-zinc-800"
              >
                Open →
              </Link>
            </div>

            <dl className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between gap-4">
                <dt className="text-zinc-500">Information connected</dt>
                <dd className="font-medium text-zinc-300">
                  {module.indicatorsConnected} / {module.indicatorTotal}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-zinc-500">Sources connected</dt>
                <dd className="font-medium text-zinc-300">
                  {module.connectedSourceCount} / {module.totalSourceCount}
                </dd>
              </div>
            </dl>

            <div className="mt-4">
              <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                Missing information
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
                  No missing information recorded for applicable topics.
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
