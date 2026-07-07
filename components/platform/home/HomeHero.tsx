import Link from "next/link";
import HomeHeroIllustration from "@/components/platform/home/HomeHeroIllustration";
import HomeHeroSearch from "@/components/platform/home/HomeHeroSearch";
import { HERO_TOPIC_CARDS, HOME_HERO } from "@/lib/platform-home";

const ctaPrimary =
  "inline-flex min-h-11 items-center justify-center rounded-lg bg-zinc-100 px-6 py-2.5 text-sm font-semibold text-zinc-900 transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400";

const topicLink =
  "flex min-h-[4.5rem] flex-col justify-center rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-left transition-colors hover:border-zinc-600 hover:bg-zinc-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400";

export default function HomeHero() {
  return (
    <header className="home-surface overflow-hidden rounded-2xl border border-zinc-800">
      <div className="grid gap-12 p-8 sm:p-10 lg:grid-cols-5 lg:gap-10 lg:p-12">
        <div className="flex flex-col justify-center lg:col-span-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-400/90">
            {HOME_HERO.eyebrow}
          </p>
          <h1 className="mt-4 text-3xl font-semibold leading-[1.12] tracking-tight text-zinc-50 sm:text-4xl lg:text-[2.65rem]">
            Search countries, companies, and universities
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-400">
            Open a profile to review evidence, missing evidence, decision package, and reports — one
            flow, no dead ends.
          </p>
        </div>

        <div className="hidden items-center justify-center lg:col-span-2 lg:flex">
          <HomeHeroIllustration />
        </div>
      </div>

      <div className="border-t border-zinc-800 px-8 py-10 sm:px-10 lg:px-12 lg:py-12">
        <p className="mx-auto max-w-3xl text-sm font-medium text-zinc-300">
          Start with a name
        </p>
        <div className="mx-auto mt-3 max-w-3xl">
          <HomeHeroSearch />
        </div>

        <div className="mt-6 flex justify-center">
          <Link href="/search" className={ctaPrimary}>
            Open Search
          </Link>
        </div>
      </div>

      <div className="border-t border-zinc-800 px-8 pb-10 pt-8 sm:px-10 lg:px-12">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
          Or browse directly
        </h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {HERO_TOPIC_CARDS.filter((topic) => topic.connected && topic.href).map((topic) => (
            <Link key={topic.id} href={topic.href!} className={topicLink}>
              <span className="text-sm font-semibold text-zinc-100">{topic.label}</span>
              <span className="mt-1 text-xs text-sky-400/90">Open →</span>
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
