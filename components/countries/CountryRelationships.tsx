import type { CountryIntelligenceProfile } from "@/lib/countries.intelligence";
import { buildEntityRelationships } from "@/lib/entity/entity-relationships";
import EntityRelatedPanel from "@/components/shared/EntityRelatedPanel";
import { cbaiGlassCard } from "@/components/brand/brand-classes";

type CountryRelationshipsProps = {
  profile: CountryIntelligenceProfile;
};

/**
 * Migrated onto the Universal Entity Engine (Platform Core Completion mission) — was two
 * overlapping views of the same data (a Knowledge Graph edge list, plus a redundant linked-
 * companies/universities summary below it, both ultimately derived from the same
 * getCountryRelationships() call the graph itself is built from). EntityRelatedPanel now shows
 * the graph's richer per-edge label and evidence status once, grouped by type, with nothing lost.
 */
export default function CountryRelationships({ profile }: CountryRelationshipsProps) {
  const relationships = buildEntityRelationships("country", profile.countryId);

  return (
    <section className="space-y-4" aria-labelledby="country-relationships-heading">
      <div>
        <h3
          id="country-relationships-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          Relationships
        </h3>
        <p className="mt-1 text-sm text-zinc-500">
          Verified local catalog relationships from the Knowledge Graph index — no inferred
          partnerships or geopolitical claims.
        </p>
      </div>

      <div className={`${cbaiGlassCard} p-6`}>
        <EntityRelatedPanel
          showHeading={false}
          relationships={relationships}
          emptyLabel="No verified relationships yet — connections appear once a company, university, or research topic in the catalog references this country. Explore Companies or Universities to see what's already connected."
        />
      </div>
    </section>
  );
}
