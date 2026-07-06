import type { CountryUserJourney } from "@/lib/country-user-journey";
import type { Country } from "@/lib/countries";

type CountryJourneyFlowProps = {
  country: Country;
  searchQuery?: string;
};

const FLOW_STEPS = [
  "Search",
  "Country",
  "Registry Profile",
  "Evidence Coverage",
  "Evidence Gaps",
  "Pipeline Readiness",
  "Indicator Explorer",
  "Decision Readiness",
  "Reports Available",
] as const;

export default function CountryJourneyFlow({ country, searchQuery }: CountryJourneyFlowProps) {
  return (
    <nav
      aria-label="Country intelligence journey"
      className="rounded-xl border border-zinc-800 bg-zinc-950/60 px-5 py-4"
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
        User journey
      </p>
      <p className="mt-1 text-sm text-zinc-400">
        {searchQuery ? (
          <>
            From search &quot;{searchQuery}&quot; to {country.name} intelligence review
          </>
        ) : (
          <>Integrated review for {country.name}</>
        )}
      </p>
      <ol className="mt-4 flex flex-wrap gap-2">
        {FLOW_STEPS.map((step, index) => (
          <li
            key={step}
            className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/50 px-3 py-1 text-[11px] text-zinc-500"
          >
            <span className="font-mono text-zinc-600">{index + 1}</span>
            {step}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export type { CountryUserJourney };
