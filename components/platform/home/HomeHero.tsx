import Link from "next/link";
import CBAILogo from "@/components/brand/CBAILogo";
import HomeEcosystems from "@/components/platform/home/HomeEcosystems";
import HomeHeroVisual from "@/components/platform/home/HomeHeroVisual";
import HomeCapabilityFlow from "@/components/platform/home/HomeCapabilityFlow";
import HomeAudience from "@/components/platform/home/HomeAudience";
import HomeTrust from "@/components/platform/home/HomeTrust";
import {
  cbaiBtnPrimary,
  cbaiBtnSecondary,
  cbaiHeroGlow,
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
            <p className={`${cbaiSectionEyebrow} text-center lg:text-left`}>
              Universal Intelligence Operating System
            </p>
            <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight text-zinc-50 sm:text-5xl lg:text-[3.25rem]">
              Evidence, connected.
              <br />
              <span className="bg-gradient-to-r from-cyan-300 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Decisions, still human.
              </span>
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-zinc-400 sm:text-lg">
              CBAI observes, measures, and connects evidence — then explains options and
              consequences across research, governance, and economics. The final decision
              always belongs to you.
            </p>
          </div>

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <Link
              href="/research"
              className={`${cbaiBtnPrimary} bg-gradient-to-r from-cyan-300 to-blue-400 text-slate-950 hover:from-cyan-200 hover:to-blue-300`}
            >
              Explore Research Intelligence
            </Link>
            <Link href="/search" className={cbaiBtnSecondary}>
              Search Evidence
            </Link>
          </div>

          <div className="space-y-3">
            <p className={`${cbaiSectionEyebrow} text-center lg:text-left`}>
              Or try a search example
            </p>
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

      <HomeCapabilityFlow />

      <HomeAudience />

      <HomeTrust />
    </main>
  );
}
