import { HomeTrustIcon } from "@/components/platform/home/HomeModuleIcon";
import { TRUST_PILLARS } from "@/lib/platform-home";

export default function HomeTrust() {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900/40 to-zinc-950/80 p-8 sm:p-10">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-sky-400">
          <HomeTrustIcon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xl font-semibold text-zinc-50 sm:text-2xl">
            Trust Center
          </p>
          <p className="text-sm text-zinc-500">
            Why trust CBAI — methodology and honesty, not confidence theater.
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
    </div>
  );
}
