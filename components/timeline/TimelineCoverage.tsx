import type { CountryTimelineModel } from "@/lib/timeline";
import { timelineYearStatusClass } from "@/lib/timeline";

type TimelineCoverageProps = {
  model: CountryTimelineModel;
};

export default function TimelineCoverage({ model }: TimelineCoverageProps) {
  return (
    <section className="space-y-4" aria-labelledby="timeline-coverage-heading">
      <div>
        <h4
          id="timeline-coverage-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          Evidence Coverage Timeline
        </h4>
        <p className="mt-1 text-sm text-zinc-500">
          Year slots showing evidence connection status — not events or narratives.
        </p>
      </div>

      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-5 lg:grid-cols-10">
        {model.yearEntries.map((entry) => (
          <li
            key={entry.year}
            className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-center"
          >
            <p className="font-mono text-sm font-semibold text-zinc-200">{entry.year}</p>
            <span
              className={`mt-2 inline-block rounded-md border px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider ${timelineYearStatusClass(entry.status)}`}
            >
              {entry.status}
            </span>
            <p className="mt-2 text-[10px] leading-snug text-zinc-600">{entry.label}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
