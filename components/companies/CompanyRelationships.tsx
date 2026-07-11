import Link from "next/link";
import type { CompanyIntelligenceProfile } from "@/lib/companies.intelligence";
import { coverageStatusClass } from "@/lib/companies.coverage";
import { countryHrefByName, hrefForEntity } from "@/components/shared/resolve-entity-link";
import LinkedNamesList from "@/components/shared/LinkedNamesList";

type CompanyRelationshipsProps = {
  profile: CompanyIntelligenceProfile;
};

export default function CompanyRelationships({ profile }: CompanyRelationshipsProps) {
  const { graphRelationships, graphRelationshipCount } = profile.coverage;

  return (
    <section className="space-y-4" aria-labelledby="company-relationships-heading">
      <div>
        <h3
          id="company-relationships-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          Knowledge Graph
        </h3>
        <p className="mt-1 text-sm text-zinc-500">
          Verified local catalog relationships from the Knowledge Graph index — no inferred
          partners, competitors, or market claims.
        </p>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-950">
        <div className="border-b border-zinc-800 px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-zinc-50">Verified connections</p>
            <span className="font-mono text-xs text-zinc-500">
              {graphRelationshipCount} verified edge
              {graphRelationshipCount === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        {graphRelationships.length === 0 ? (
          <div className="px-6 py-8">
            <p className="text-sm text-zinc-500">
              No verified catalog relationships indexed for this company in the Knowledge
              Graph.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-zinc-800">
            {graphRelationships.map((rel) => {
              const href = hrefForEntity(rel.entityType, rel.entityName);
              return (
                <li
                  key={`${rel.entityType}-${rel.entityName}-${rel.relationshipLabel}`}
                  className="flex flex-col gap-2 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    {href ? (
                      <Link href={href} className="text-sm font-medium text-cyan-400 hover:text-cyan-300">
                        {rel.entityName}
                      </Link>
                    ) : (
                      <p className="text-sm font-medium text-zinc-200">{rel.entityName}</p>
                    )}
                    <p className="text-xs capitalize text-zinc-500">{rel.entityType}</p>
                    <p className="mt-1 text-xs text-zinc-600">{rel.relationshipLabel}</p>
                  </div>
                  <span
                    className={`self-start rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${coverageStatusClass(rel.evidenceLabel === "Verified local catalog" ? "Connected" : "Not connected")}`}
                  >
                    {rel.evidenceLabel}
                  </span>
                </li>
              );
            })}
          </ul>
        )}

        <div className="border-t border-zinc-800 px-6 py-4">
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wider text-zinc-600">
                Headquarters country (local catalog)
              </dt>
              <dd className="mt-1 text-zinc-300">
                {profile.linkedEntities.relatedCountry ? (
                  (() => {
                    const href = countryHrefByName(profile.linkedEntities.relatedCountry);
                    return href ? (
                      <Link href={href} className="text-cyan-400 hover:text-cyan-300">
                        {profile.linkedEntities.relatedCountry}
                      </Link>
                    ) : (
                      profile.linkedEntities.relatedCountry
                    );
                  })()
                ) : (
                  "Not linked"
                )}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-zinc-600">
                Universities in same country (local catalog)
              </dt>
              <dd className="mt-1 text-zinc-300">
                <LinkedNamesList names={profile.linkedEntities.universities} entityType="university" />
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs uppercase tracking-wider text-zinc-600">
                Partner / competitor claims
              </dt>
              <dd className="mt-1 text-zinc-500">
                Not shown — evidence source not connected. CBAI does not infer commercial
                relationships without verified sources.
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
