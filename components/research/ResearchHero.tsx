import Link from "next/link";
import {
  cbaiBtnPrimary,
  cbaiSearchInput,
  cbaiSearchShell,
  cbaiSectionEyebrow,
} from "@/components/brand/brand-classes";
import { RESEARCH_HOME } from "@/lib/research";

type ResearchHeroProps = {
  query?: string;
};

export default function ResearchHero({ query = "" }: ResearchHeroProps) {
  return (
    <header className="space-y-6">
      <div className="space-y-3">
        <p className={cbaiSectionEyebrow}>CBAI Ecosystem · In development</p>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
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
        <Link href="/universities" className="font-medium text-cyan-400 hover:text-cyan-300">
          Public Intelligence → Universities
        </Link>
        .
      </p>
    </header>
  );
}
