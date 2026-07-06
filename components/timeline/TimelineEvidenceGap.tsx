import type { CountryTimelineModel } from "@/lib/timeline";
import { TIMELINE_EVIDENCE_NOT_CONNECTED_LABEL } from "@/lib/timeline";

type TimelineEvidenceGapProps = {
  model: CountryTimelineModel;
};

export default function TimelineEvidenceGap({ model }: TimelineEvidenceGapProps) {
  const gapYears = model.missingEvidenceYears;
  const futureYears = model.futureEvidenceYears;

  return (
    <section className="space-y-4" aria-labelledby="timeline-gaps-heading">
      <div>
        <h4
          id="timeline-gaps-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          Missing Years &amp; Future Evidence Availability
        </h4>
        <p className="mt-1 text-sm text-zinc-500">
          Years without connected time-series evidence and slots reserved for future source
          publication.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
            Missing years ({gapYears.length})
          </p>
          {gapYears.length === 0 ? (
            <p className="mt-3 text-sm text-zinc-400">No missing year slots.</p>
          ) : (
            <ul className="mt-3 space-y-1">
              {gapYears.map((year) => (
                <li key={year} className="font-mono text-sm text-zinc-400">
                  {year}: {TIMELINE_EVIDENCE_NOT_CONNECTED_LABEL}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
            Future evidence availability ({futureYears.length})
          </p>
          {futureYears.length === 0 ? (
            <p className="mt-3 text-sm text-zinc-400">
              No future year slots currently marked for planned source publication.
            </p>
          ) : (
            <ul className="mt-3 space-y-1">
              {futureYears.map((year) => (
                <li key={year} className="font-mono text-sm text-zinc-400">
                  {year}: Awaiting official source time-series connection
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
