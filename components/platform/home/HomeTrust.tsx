import { HomeTrustIcon } from "@/components/platform/home/HomeModuleIcon";
import { TRUST_PILLARS } from "@/lib/platform-home";
import { cbaiGlassCard } from "@/components/brand/brand-classes";

// Real, verified fix: this section previously used a raw bg-gradient-to-b from-zinc-900/to-zinc-950
// utility, which the site-wide light/dark theme override never covers (it targets plain bg-zinc-*
// utilities, not gradient from-*/to-* stops) — the one section on Home that silently stayed dark
// while every surrounding section correctly switched to the light palette. cbaiGlassCard already
// resolves correctly in both themes; no ad-hoc gradient is needed here.
export default function HomeTrust() {
  return (
    <section aria-labelledby="home-trust-heading" className={`${cbaiGlassCard} p-8 sm:p-10`}>
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-sky-400">
          <HomeTrustIcon className="h-6 w-6" />
        </div>
        <div>
          <h2 id="home-trust-heading" className="text-xl font-semibold text-zinc-50 sm:text-2xl">
            How CBAI earns trust
          </h2>
          <p className="text-sm text-zinc-500">
            Product mechanics, not a slogan — this is how evidence becomes a recommendation.
          </p>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {TRUST_PILLARS.map((pillar) => (
          <article
            key={pillar.id}
            className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-5"
          >
            <h3 className="text-sm font-semibold text-zinc-100">{pillar.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-500">
              {pillar.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
