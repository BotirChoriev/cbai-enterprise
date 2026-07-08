import Link from "next/link";
import CBAILogo from "@/components/brand/CBAILogo";
import HomeEcosystems from "@/components/platform/home/HomeEcosystems";
import HomeHeroVisual from "@/components/platform/home/HomeHeroVisual";
import { HOME_SEARCH } from "@/lib/platform-home";
import {
  cbaiBtnPrimary,
  cbaiHeroGlow,
  cbaiSearchInput,
  cbaiSearchShell,
  cbaiSectionEyebrow,
} from "@/components/brand/brand-classes";

const HOME_EXAMPLES = [
  { label: "Country", query: "Japan" },
  { label: "Company", query: "Apple" },
  { label: "University", query: "Harvard University" },
] as const;

export default function HomeHero() {
  return (
    <main className={`home-surface mx-auto max-w-6xl space-y-20 px-4 py-12 sm:px-8 sm:py-16 ${cbaiHeroGlow}`}>
      {/* Hero split */}
      <section className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="space-y-8">
          <CBAILogo size="lg" className="justify-center lg:justify-start" />

          <div className="space-y-4 text-center lg:text-left">
            <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight text-zinc-50 sm:text-5xl lg:text-[3.25rem]">
              Global evidence.
              <br />
              <span className="bg-gradient-to-r from-cyan-300 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Trusted intelligence.
              </span>
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-zinc-400 sm:text-lg">
              Search official information about countries, companies, universities, economies,
              research, and governance.
            </p>
          </div>

          <div className="space-y-3">
            <p className={`${cbaiSectionEyebrow} text-center lg:text-left`}>Primary action</p>
            <form
              action={HOME_SEARCH.action}
              method="get"
              role="search"
              aria-label="Search country, company, or university"
              className={`${cbaiSearchShell} flex flex-col gap-3 sm:relative sm:block`}
            >
              <label htmlFor="home-global-search" className="sr-only">
                Search country, company, or university
              </label>
              <input
                id="home-global-search"
                name={HOME_SEARCH.param}
                type="search"
                placeholder="Japan, Apple, Harvard University"
                autoComplete="off"
                className={cbaiSearchInput}
              />
              <button
                type="submit"
                className={`${cbaiBtnPrimary} min-h-12 w-full bg-gradient-to-r from-cyan-300 to-blue-400 text-slate-950 hover:from-cyan-200 hover:to-blue-300 sm:absolute sm:right-3 sm:top-1/2 sm:w-auto sm:-translate-y-1/2`}
              >
                Search
              </button>
            </form>
          </div>

          <div className="space-y-3">
            <p className={`${cbaiSectionEyebrow} text-center lg:text-left`}>Try an example</p>
            <ul className="flex flex-wrap justify-center gap-2 lg:justify-start">
              {HOME_EXAMPLES.map((example) => (
                <li key={example.query}>
                  <Link
                    href={`/search?q=${encodeURIComponent(example.query)}`}
                    className="inline-flex min-h-10 flex-col justify-center rounded-lg border border-cyan-500/15 bg-slate-950/50 px-4 py-2 text-left transition-colors hover:border-cyan-400/30 hover:bg-slate-900/80"
                  >
                    <span className="text-sm font-medium text-zinc-100">{example.query}</span>
                    <span className="text-[11px] text-zinc-500">{example.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="hidden lg:block">
          <HomeHeroVisual />
        </div>
      </section>

      <HomeEcosystems />
    </main>
  );
}
