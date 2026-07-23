import type { ResearchTopic } from "@/lib/research/research-topics";
import {
  buildResearchWorkspaceFacets,
  workspaceFacetStatusClass,
} from "@/lib/enterprise/research-workspace-facets";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type ResearchWorkspaceFacetsProps = {
  topic: ResearchTopic;
  compact?: boolean;
};

/** Complete research workspace facets for a topic — Evidence through Open Science. */
export default function ResearchWorkspaceFacets({
  topic,
  compact = false,
}: ResearchWorkspaceFacetsProps) {
  const facets = buildResearchWorkspaceFacets(topic);

  if (compact) {
    return (
      <ul className="mt-4 flex flex-wrap gap-1.5">
        {facets.map((facet) => (
          <li
            key={facet.id}
            className={`rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${workspaceFacetStatusClass(facet.status)}`}
            title={facet.description}
          >
            {facet.label}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <section className="space-y-4" aria-labelledby="research-workspace-facets-heading">
      <div>
        <p className={cbaiSectionEyebrow}>Topic workspace</p>
        <h2
          id="research-workspace-facets-heading"
          className="mt-1 text-lg font-semibold text-zinc-50"
        >
          Complete workspace
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Each topic supports Evidence, Sources, Timeline, Methods, Outputs, Reports, Mission Workspace,
          and Open Science — shown with honest availability.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {facets.map((facet) => (
          <article key={facet.id} className={`${cbaiGlassCard} p-4`}>
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-semibold text-zinc-100">{facet.label}</h3>
              <span
                className={`shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${workspaceFacetStatusClass(facet.status)}`}
              >
                {facet.status}
              </span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-zinc-500">{facet.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
