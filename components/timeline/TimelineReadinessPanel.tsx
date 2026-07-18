import type { CountryTimelineModel } from "@/lib/timeline";
import { timelineReadinessLabel, timelineReadinessStatusClass } from "@/lib/timeline";

type TimelineReadinessPanelProps = {
  model: CountryTimelineModel;
};

function TimelineStatusBadge({ status }: { status: CountryTimelineModel["readinessStatus"] }) {
  return (
    <span
      className={`inline-block rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${timelineReadinessStatusClass(status)}`}
    >
      {timelineReadinessLabel(status)}
    </span>
  );
}

export default function TimelineReadinessPanel({ model }: TimelineReadinessPanelProps) {
  return (
    <section className="space-y-4" aria-labelledby="country-timeline-heading">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3
            id="country-timeline-heading"
            className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
          >
            Evidence Readiness Timeline
          </h3>
          <p className="mt-1 text-sm text-zinc-500">
            Year-level evidence structure for {model.entityLabel} — not historical events or
            political interpretation.
          </p>
        </div>
        <TimelineStatusBadge status={model.readinessStatus} />
      </div>

      {model.evidenceNotConnected ? (
        <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950 px-5 py-6 text-center">
          <p className="font-mono text-sm text-zinc-400">{model.emptyStateMessage}</p>
          <p className="mt-2 text-xs text-zinc-600">
            Timeline year slots are structural placeholders until official time-series sources
            connect.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-5 py-4">
          <p className="text-sm text-zinc-400">{model.emptyStateMessage}</p>
        </div>
      )}

      <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-5 py-4">
        <dl className="grid gap-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-xs uppercase tracking-wider text-zinc-600">
              Verified evidence years
            </dt>
            <dd className="mt-1 font-mono text-zinc-200">
              {model.availableEvidenceYears.length}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-zinc-600">Missing years</dt>
            <dd className="mt-1 font-mono text-zinc-200">{model.missingEvidenceYears.length}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-zinc-600">
              Structural year slots
            </dt>
            <dd className="mt-1 font-mono text-zinc-200">{model.supportedYears.length}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
