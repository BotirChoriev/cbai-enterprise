import type { CompanyIntelligenceProfile } from "@/lib/companies.intelligence";
import { buildEntityRelationships } from "@/lib/entity/entity-relationships";
import EntityRelatedPanel from "@/components/shared/EntityRelatedPanel";

type CompanyRelationshipsProps = {
  profile: CompanyIntelligenceProfile;
};

/**
 * Migrated onto the Universal Entity Engine (Platform Core Completion mission) — was two
 * overlapping views of the same data (a Knowledge Graph edge list, plus a redundant headquarters-
 * country/universities summary below it, both derived from getCompanyRelationships()).
 * EntityRelatedPanel now shows the graph's richer per-edge label and evidence status once,
 * grouped by type — including the real Company<->Research edges the old component never showed.
 */
export default function CompanyRelationships({ profile }: CompanyRelationshipsProps) {
  const relationships = buildEntityRelationships("company", profile.companyId);

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

      <div className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-950 p-6">
        <EntityRelatedPanel
          showHeading={false}
          relationships={relationships}
          emptyLabel="No verified catalog relationships indexed for this company in the Knowledge Graph."
        />

        <div className="border-t border-zinc-800 pt-4">
          <p className="text-xs uppercase tracking-wider text-zinc-600">Partner / competitor claims</p>
          <p className="mt-1 text-sm text-zinc-500">
            Not shown — evidence source not connected. CBAI does not infer commercial
            relationships without verified sources.
          </p>
        </div>
      </div>
    </section>
  );
}
