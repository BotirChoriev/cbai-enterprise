import Link from "next/link";
import CBAILogo from "@/components/brand/CBAILogo";
import HomeHeroSearch from "@/components/platform/home/HomeHeroSearch";
import HomeEcosystems from "@/components/platform/home/HomeEcosystems";
import {
  cbaiBtnSecondary,
  cbaiGlassCard,
  cbaiSectionEyebrow,
} from "@/components/brand/brand-classes";

const HOME_EXAMPLES = [
  { label: "Country", query: "Japan" },
  { label: "Company", query: "Apple" },
  { label: "University", query: "Harvard University" },
] as const;

const WHAT_WORKS_TODAY = [
  "Search countries, companies, and universities.",
  "Review available and missing official information on each profile.",
  "Open reports from the Reports Center.",
] as const;

export default function HomeHero() {
  return (
    <main className="home-surface mx-auto max-w-4xl space-y-14 px-4 py-10 sm:px-6 sm:py-14">
      <header className="space-y-6 text-center sm:text-left">
        <CBAILogo className="justify-center sm:justify-start" />
        <h1 className="text-3xl font-semibold leading-tight tracking-tight text-zinc-50 sm:text-4xl">
          CBAI helps people understand countries, companies, universities, economies, research,
          and governance using official evidence.
        </h1>
      </header>

      <section aria-labelledby="home-search-heading" className="space-y-4">
        <h2 id="home-search-heading" className="sr-only">
          Search
        </h2>
        <p className={`${cbaiSectionEyebrow} text-center sm:text-left`}>Primary action</p>
        <p className="text-center text-sm font-medium text-zinc-300 sm:text-left">
          Search country, company, or university.
        </p>
        <HomeHeroSearch />
      </section>

      <section aria-labelledby="home-examples-heading" className="space-y-3">
        <h2
          id="home-examples-heading"
          className={`${cbaiSectionEyebrow} text-center sm:text-left`}
        >
          Try an example
        </h2>
        <ul className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {HOME_EXAMPLES.map((example) => (
            <li key={example.query} className="flex-1 sm:min-w-[9rem]">
              <Link
                href={`/search?q=${encodeURIComponent(example.query)}`}
                className={`${cbaiGlassCard} flex min-h-11 flex-col justify-center px-4 py-3 text-center transition-colors hover:border-cyan-500/25 sm:text-left`}
              >
                <span className="text-sm font-semibold text-zinc-100">{example.query}</span>
                <span className="mt-0.5 text-xs text-zinc-500">{example.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <HomeEcosystems />

      <section aria-labelledby="home-works-today-heading" className="space-y-3">
        <h2 id="home-works-today-heading" className="text-base font-semibold text-zinc-200">
          What works today
        </h2>
        <ul className="space-y-2 text-sm text-zinc-400">
          {WHAT_WORKS_TODAY.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="text-cyan-400/90" aria-hidden="true">
                ✓
              </span>
              {item}
            </li>
          ))}
        </ul>
        <Link href="/search" className={cbaiBtnSecondary}>
          Start with Search
        </Link>
      </section>
    </main>
  );
}
