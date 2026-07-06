import Link from "next/link";
import { HOME_HERO } from "@/lib/platform-home";

export default function HomeHero() {
  return (
    <header className="rounded-2xl border border-zinc-800 bg-zinc-900/40 px-6 py-10 sm:px-10 sm:py-12">
      <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
        CBAI · Evidence Intelligence Platform
      </p>
      <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
        {HOME_HERO.headline}
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-300">
        {HOME_HERO.explanation}
      </p>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-500">
        {HOME_HERO.difference}
      </p>
      <div className="mt-8">
        <Link
          href={HOME_HERO.cta.href}
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-zinc-100 px-5 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
        >
          {HOME_HERO.cta.label}
        </Link>
      </div>
    </header>
  );
}
