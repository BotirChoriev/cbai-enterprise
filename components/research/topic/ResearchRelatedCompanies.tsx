import type { ResearchTopic } from "@/lib/research/research-topics";
import { buildEntityRelationships } from "@/lib/entity/entity-relationships";
import EntityRelatedPanel from "@/components/shared/EntityRelatedPanel";
import { cbaiGlassCard } from "@/components/brand/brand-classes";

type ResearchRelatedCompaniesProps = {
  topic: ResearchTopic;
};

/**
 * Real companies related by subject matter (industry keyword match) — closes the Company →
 * Research → Company loop. Migrated onto the Universal Entity Engine's relationship builder and
 * EntityRelatedPanel (Platform Core mission); same visual output, now sourced from the shared
 * relationship vocabulary instead of a bespoke render.
 */
export default function ResearchRelatedCompanies({ topic }: ResearchRelatedCompaniesProps) {
  const relationships = buildEntityRelationships("research_topic", topic.topicId);

  if (relationships.length === 0) return null;

  return (
    <div className={`${cbaiGlassCard} p-4`}>
      <EntityRelatedPanel
        title="Related Companies"
        relationships={relationships}
        emptyLabel="No companies related to this topic yet."
        note="Companies related by subject matter to this topic's domain — not a sponsorship or funding claim."
      />
    </div>
  );
}
