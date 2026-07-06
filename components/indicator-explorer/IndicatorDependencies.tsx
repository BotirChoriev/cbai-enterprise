import type { IndicatorExplorerRecord } from "@/lib/indicator-explorer";

type IndicatorDependenciesProps = {
  record: IndicatorExplorerRecord;
};

export default function IndicatorDependencies({ record }: IndicatorDependenciesProps) {
  return (
    <section className="space-y-4" aria-labelledby="indicator-dependencies-heading">
      <div>
        <h4
          id="indicator-dependencies-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          Dependencies
        </h4>
        <p className="mt-1 text-sm text-zinc-500">
          Entities, missions, and reports that reference this indicator.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
            Supported entities
          </p>
          <ul className="mt-3 space-y-1 text-sm text-zinc-400">
            {record.supportedEntities.map((entity) => (
              <li key={entity} className="capitalize">
                {entity}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
            Supported missions ({record.supportedMissions.length})
          </p>
          {record.supportedMissions.length === 0 ? (
            <p className="mt-3 text-sm text-zinc-500">No missions require this indicator.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm text-zinc-400">
              {record.supportedMissions.map((mission) => (
                <li key={mission.missionId}>
                  <p>{mission.missionName}</p>
                  <p className="font-mono text-[10px] text-zinc-600">{mission.missionId}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
            Supported reports ({record.supportedReports.length})
          </p>
          <ul className="mt-3 space-y-2 text-sm text-zinc-400">
            {record.supportedReports.map((report) => (
              <li key={report.reportId}>
                <p>{report.reportTitle}</p>
                <p className="text-[10px] text-zinc-600">Scope: {report.entityScope}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
