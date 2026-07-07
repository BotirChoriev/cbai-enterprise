import Link from "next/link";
import HomeHeroSearch from "@/components/platform/home/HomeHeroSearch";

const HOME_EXAMPLES = [
  { label: "Country", query: "Japan" },
  { label: "Company", query: "Apple" },
  { label: "University", query: "Harvard University" },
] as const;

const AFTER_SEARCH_STEPS = [
  "Open a profile from your results.",
  "See what evidence is available.",
  "See what evidence is missing.",
  "Read the decision summary.",
  "Open reports for this topic.",
] as const;

const AVAILABLE_TODAY = [
  "Search by name",
  "View evidence",
  "Compare evidence",
  "Review decision package",
  "Open reports",
] as const;

const exploreLink =
  "inline-flex min-h-11 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/60 px-5 text-sm font-medium text-zinc-200 transition-colors hover:border-zinc-600 hover:bg-zinc-900";

export default function HomeHero() {
  return (
    <main className="home-surface mx-auto max-w-2xl space-y-12 px-4 py-10 sm:px-6 sm:py-14">
      <header className="space-y-4 text-center sm:text-left">
        <p className="text-sm font-semibold uppercase tracking-widest text-sky-400/90">CBAI</p>
        <h1 className="text-3xl font-semibold leading-tight tracking-tight text-zinc-50 sm:text-4xl">
          What is CBAI?
        </h1>
        <p className="text-lg text-zinc-300">
          Search a country, company, or university.
        </p>
        <p className="max-w-md text-base leading-relaxed text-zinc-400">
          See official evidence. Know what is available. Review before you decide.
        </p>
      </header>

      <section aria-labelledby="home-search-heading" className="space-y-4">
        <h2 id="home-search-heading" className="sr-only">
          Search
        </h2>
        <p className="text-center text-sm font-medium text-zinc-300 sm:text-left">
          Where do I start? Search below.
        </p>
        <HomeHeroSearch />
      </section>

      <section aria-labelledby="home-examples-heading" className="space-y-3">
        <h2
          id="home-examples-heading"
          className="text-center text-xs font-semibold uppercase tracking-wider text-zinc-500 sm:text-left"
        >
          Try an example
        </h2>
        <ul className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {HOME_EXAMPLES.map((example) => (
            <li key={example.query} className="flex-1 sm:min-w-[9rem]">
              <Link
                href={`/search?q=${encodeURIComponent(example.query)}`}
                className="flex min-h-11 flex-col justify-center rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-center transition-colors hover:border-zinc-600 hover:bg-zinc-900 sm:text-left"
              >
                <span className="text-sm font-semibold text-zinc-100">{example.query}</span>
                <span className="mt-0.5 text-xs text-zinc-500">{example.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="home-after-search-heading" className="space-y-3">
        <h2
          id="home-after-search-heading"
          className="text-sm font-semibold text-zinc-300"
        >
          What happens after search
        </h2>
        <ol className="space-y-2 text-sm text-zinc-400">
          {AFTER_SEARCH_STEPS.map((step, index) => (
            <li key={step} className="flex gap-3">
              <span className="font-mono text-xs text-zinc-600">{index + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="home-available-heading" className="space-y-3">
        <h2
          id="home-available-heading"
          className="text-sm font-semibold text-zinc-300"
        >
          Available today
        </h2>
        <ul className="space-y-2 text-sm text-zinc-400">
          {AVAILABLE_TODAY.map((item) => (
            <li key={item} className="flex items-center gap-2">
              <span className="text-emerald-500/90" aria-hidden="true">
                ✓
              </span>
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="home-explore-heading" className="space-y-4 pb-4">
        <h2
          id="home-explore-heading"
          className="text-sm font-semibold text-zinc-300"
        >
          Start exploring
        </h2>
        <div className="flex flex-wrap gap-2">
          <Link href="/search" className={exploreLink}>
            Search
          </Link>
          <Link href="/countries" className={exploreLink}>
            Countries
          </Link>
          <Link href="/companies" className={exploreLink}>
            Companies
          </Link>
          <Link href="/universities" className={exploreLink}>
            Universities
          </Link>
          <Link href="/analytics" className={exploreLink}>
            Reports
          </Link>
        </div>
      </section>
    </main>
  );
}
