import { getDomainById } from "@/lib/indicator-framework/domains/catalog";
import type { IndicatorDomainId } from "@/lib/indicator-framework/types";
import { cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type EntityFutureSourcesProps = {
  domainIds: readonly IndicatorDomainId[];
};

/**
 * "Expected Future Sources" — real, already-written expansion notes from the Indicator Domain
 * Catalog (`INDICATOR_DOMAIN_CATALOG[].futureExpansion`), never invented for this view. Every
 * domain definition has carried this field since the catalog was built, but nothing has ever
 * rendered it — this is the same real data every Indicator/Source Coverage section already reads
 * `domainId`s from, just surfacing the one field that was missing.
 */
export default function EntityFutureSources({ domainIds }: EntityFutureSourcesProps) {
  const uniqueDomainIds = [...new Set(domainIds)];
  const domains = uniqueDomainIds
    .map((id) => getDomainById(id))
    .filter((domain): domain is NonNullable<typeof domain> => Boolean(domain));

  if (domains.length === 0) return null;

  return (
    <section className="space-y-4" aria-labelledby="entity-future-sources-heading">
      <div>
        <p className={cbaiSectionEyebrow} id="entity-future-sources-heading">
          Expected Future Sources
        </p>
        <p className="mt-1 text-sm text-zinc-500">
          What each covered domain expects to add next, from the platform&apos;s own indicator
          catalog — not a roadmap commitment or a date.
        </p>
      </div>

      <dl className="grid gap-3 sm:grid-cols-2">
        {domains.map((domain) => (
          <div key={domain.id} className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-3">
            <dt className="text-xs font-semibold text-zinc-200">{domain.title}</dt>
            <dd className="mt-1 text-xs leading-relaxed text-zinc-500">{domain.futureExpansion}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
