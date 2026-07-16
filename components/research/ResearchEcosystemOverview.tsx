import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";
import { RESEARCH_WORKSPACE_AREAS } from "@/lib/research";

export default function ResearchEcosystemOverview() {
  return (
    <section aria-labelledby="research-ecosystem-heading" className="space-y-5">
      <div className="space-y-2">
        <p className={cbaiSectionEyebrow}>Structured evidence workspace</p>
        <h2 id="research-ecosystem-heading" className="text-xl font-semibold text-zinc-100">
          What Research Intelligence will connect
        </h2>
        <p className="max-w-2xl text-sm text-zinc-400">
          A future workspace for scientific evidence — organized by topic and source, not by
          popularity or social activity.
        </p>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {RESEARCH_WORKSPACE_AREAS.map((area) => (
          <li key={area.id}>
            <div
              className={`${cbaiGlassCard} flex items-center gap-3 px-4 py-3 opacity-90`}
            >
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full bg-teal-400/70 shadow-[0_0_6px_rgba(34,211,238,0.5)]"
                aria-hidden="true"
              />
              <span className="text-sm text-zinc-300">{area.label}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
