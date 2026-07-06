import type { EntityEvidenceGapProfile } from "@/lib/evidence-gap";
import { coverageStatusClass } from "@/lib/countries.coverage";

type EvidenceGapSourcesProps = {
  profile: EntityEvidenceGapProfile;
};

function uniqueSources(profile: EntityEvidenceGapProfile) {
  const seen = new Set<string>();
  const entries: {
    name: string;
    sourceId: string | null;
    connector: string;
    blocker: string | null;
  }[] = [];

  for (const gap of profile.gaps) {
    const key = gap.expectedSource;
    if (seen.has(key)) continue;
    seen.add(key);
    entries.push({
      name: gap.expectedSource,
      sourceId: gap.expectedSourceId,
      connector: gap.expectedConnector,
      blocker: gap.verificationBlocker,
    });
  }

  return entries.sort((a, b) => a.name.localeCompare(b.name));
}

export default function EvidenceGapSources({ profile }: EvidenceGapSourcesProps) {
  const sources = uniqueSources(profile);

  return (
    <section className="space-y-4" aria-labelledby="evidence-gap-sources-heading">
      <div>
        <h4
          id="evidence-gap-sources-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          Official Source Coverage
        </h4>
        <p className="mt-1 text-sm text-zinc-500">
          Expected official sources and connectors referenced by applicable indicators.
        </p>
      </div>

      <ul className="grid gap-2 sm:grid-cols-2">
        {sources.map((source) => (
          <li
            key={source.name}
            className="rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3"
          >
            <p className="text-sm font-medium text-zinc-300">{source.name}</p>
            {source.sourceId && (
              <p className="mt-0.5 font-mono text-[10px] text-zinc-600">{source.sourceId}</p>
            )}
            <p className="mt-2 text-xs text-zinc-500">Connector: {source.connector}</p>
            {source.blocker && (
              <span
                className={`mt-2 inline-block rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${coverageStatusClass("Not connected")}`}
              >
                {source.blocker}
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
