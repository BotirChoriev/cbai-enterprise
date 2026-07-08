import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";
import { RESEARCH_PRINCIPLES } from "@/lib/research";

export default function ResearchPrinciples() {
  return (
    <section aria-labelledby="research-principles-heading" className="space-y-5">
      <div className="space-y-2">
        <p className={cbaiSectionEyebrow}>Principles</p>
        <h2 id="research-principles-heading" className="text-xl font-semibold text-zinc-100">
          How Research Intelligence will work
        </h2>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2">
        {RESEARCH_PRINCIPLES.map((principle) => (
          <li key={principle.id}>
            <article className={`${cbaiGlassCard} h-full p-5`}>
              <h3 className="text-sm font-semibold text-cyan-300">{principle.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                {principle.description}
              </p>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
