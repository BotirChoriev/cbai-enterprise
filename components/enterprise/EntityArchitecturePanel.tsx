import type { ArchitectureField } from "@/lib/enterprise/entity-architecture";
import { architectureStatusClass } from "@/lib/enterprise/entity-architecture";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type EntityArchitecturePanelProps = {
  title: string;
  description: string;
  fields: readonly ArchitectureField[];
};

/** Profile architecture placeholders — values never invented. */
export default function EntityArchitecturePanel({
  title,
  description,
  fields,
}: EntityArchitecturePanelProps) {
  return (
    <section className="space-y-4" aria-labelledby="entity-architecture-heading">
      <div>
        <p className={cbaiSectionEyebrow}>Profile architecture</p>
        <h3 id="entity-architecture-heading" className="mt-1 text-base font-semibold text-zinc-100">
          {title}
        </h3>
        <p className="mt-1 text-sm text-zinc-500">{description}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {fields.map((field) => (
          <article key={field.id} className={`${cbaiGlassCard} p-4`}>
            <div className="flex items-start justify-between gap-2">
              <h4 className="text-sm font-semibold text-zinc-100">{field.label}</h4>
              <span
                className={`shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${architectureStatusClass(field.status)}`}
              >
                {field.status}
              </span>
            </div>
            <dl className="mt-3 space-y-2 text-sm">
              <div>
                <dt className="text-[10px] uppercase tracking-wider text-zinc-600">Expected source</dt>
                <dd className="mt-0.5 text-zinc-400">{field.expectedSource}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-wider text-zinc-600">Integration</dt>
                <dd className="mt-0.5 text-zinc-400">{field.integrationStatus}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-wider text-zinc-600">Why unavailable</dt>
                <dd className="mt-0.5 text-zinc-500">{field.whyMissing}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}
