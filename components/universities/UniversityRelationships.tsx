import type { UniversityIntelligenceProfile } from "@/lib/universities.intelligence";
import { buildEntityRelationships } from "@/lib/entity/entity-relationships";
import EntityRelatedPanel from "@/components/shared/EntityRelatedPanel";

type UniversityRelationshipsProps = {
  profile: UniversityIntelligenceProfile;
};

/**
 * Migrated onto the Universal Entity Engine (Platform Core Completion mission) — was two
 * overlapping views of the same data (a Knowledge Graph edge list, plus a redundant country/
 * companies summary below it, both derived from getUniversityRelationships()). EntityRelatedPanel
 * now shows the graph's richer per-edge label and evidence status once, grouped by type.
 */
export default function UniversityRelationships({ profile }: UniversityRelationshipsProps) {
  const relationships = buildEntityRelationships("university", profile.universityId);

  return (
    <section className="space-y-4" aria-labelledby="university-relationships-heading">
      <div>
        <h3
          id="university-relationships-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          Knowledge Graph
        </h3>
        <p className="mt-1 text-sm text-zinc-500">
          Verified local catalog relationships from the Knowledge Graph index — no inferred
          partnerships, scholarships, or research center claims.
        </p>
      </div>

      <div className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-950 p-6">
        <EntityRelatedPanel
          showHeading={false}
          relationships={relationships}
          emptyLabel="No verified catalog relationships indexed for this university in the Knowledge Graph."
        />

        <div className="border-t border-zinc-800 pt-4">
          <p className="text-xs uppercase tracking-wider text-zinc-600">
            Research centers / partnerships / scholarships
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            Not shown — evidence source not connected. CBAI does not infer institutional
            partnerships or employment outcomes without verified sources.
          </p>
        </div>
      </div>
    </section>
  );
}
