import Link from "next/link";
import {
  cbaiBtnPrimary,
  cbaiSearchInput,
  cbaiSearchShell,
  cbaiSectionEyebrow,
} from "@/components/brand/brand-classes";
import { RESEARCH_HOME } from "@/lib/research";
import { RESEARCH_DOMAINS, RESEARCH_TOPICS } from "@/lib/research/research-topics";
import ResearchEvidenceLattice from "@/components/research/ResearchEvidenceLattice";

type ResearchHeroProps = {
  query?: string;
};

// The Research room: same kernel (Operator, nav, evidence model) as every other ecosystem, its
// own atmosphere. Home's hero is radial — one evidence core, the whole world around it. Research
// is a lattice — real domains laid out like a catalog, not a globe — so arriving here reads as a
// different room, never a re-skin of the homepage.
export default function ResearchHero({ query = "" }: ResearchHeroProps) {
  return (
    <header className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-8">
      <div className="space-y-6">
        <div className="space-y-3">
          <p className={cbaiSectionEyebrow}>CBAI Ecosystem · In development</p>
          <h1 className="cbai-display text-3xl text-zinc-50 sm:text-4xl">
            {RESEARCH_HOME.title}
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">
            {RESEARCH_HOME.subheadline}
          </p>
        </div>

        <p className="max-w-2xl text-sm leading-relaxed text-zinc-500">{RESEARCH_HOME.coreMessage}</p>

        <div className="space-y-3">
          <p className={cbaiSectionEyebrow}>Topic exploration entry</p>
          <form
            action="/research"
            method="get"
            role="search"
            aria-label="Search research topics"
            className={`${cbaiSearchShell} flex flex-col gap-3 sm:relative sm:block`}
          >
            <label htmlFor="research-search" className="sr-only">
              Search research topics
            </label>
            <input
              id="research-search"
              name="q"
              type="search"
              key={query}
              defaultValue={query}
              placeholder={RESEARCH_HOME.searchPlaceholder}
              autoComplete="off"
              className={`${cbaiSearchInput} text-base sm:text-lg`}
            />
            <button
              type="submit"
              className={`${cbaiBtnPrimary} min-h-11 w-full sm:absolute sm:right-3 sm:top-1/2 sm:w-auto sm:-translate-y-1/2`}
            >
              Explore topic
            </button>
          </form>
          <p className="text-xs text-zinc-600">
            Search filters the topics catalog below — no live databases or publication results are
            connected yet.
          </p>
        </div>

        <p className="text-sm text-zinc-500">
          University profiles available today in{" "}
          <Link href="/universities" className="font-medium text-teal-400 hover:text-teal-300">
            Public Intelligence → Universities
          </Link>
          .
        </p>
      </div>

      <div className="flex flex-col items-center gap-3 lg:items-start">
        <ResearchEvidenceLattice />
        <p className="text-xs text-zinc-500 lg:pl-2">
          {RESEARCH_TOPICS.length} catalog topics across {RESEARCH_DOMAINS.length} real domains — node
          size reflects real topic count, never an invented score.
        </p>
      </div>
    </header>
  );
}
