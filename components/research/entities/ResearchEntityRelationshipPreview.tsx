import type { ResearchTopic } from "@/lib/research/research-topics";
import {
  findResearchEntitiesByTopic,
  resolveResearchEntityRelations,
  RESEARCH_ENTITY_EVIDENCE_STATUS_LABELS,
  RESEARCH_ENTITY_SOURCE_STATUS_LABELS,
  RESEARCH_ENTITY_WORKSPACE_STATUS_LABELS,
  RESEARCH_ENTITY_TYPE_DEFINITIONS,
} from "@/lib/research/entities";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type ResearchEntityRelationshipPreviewProps = {
  topic: ResearchTopic;
};

export default function ResearchEntityRelationshipPreview({
  topic,
}: ResearchEntityRelationshipPreviewProps) {
  const relatedEntities = findResearchEntitiesByTopic(topic.topicId);

  if (relatedEntities.length === 0) {
    return (
      <div className={`${cbaiGlassCard} p-4`}>
        <p className="text-sm text-zinc-400">
          No seed research objects linked to this topic yet. The entity model supports this topic
          type — related research objects will appear when catalog references are added.
        </p>
        <p className="mt-2 text-xs text-zinc-600">
          Model preview only — not connected yet. Human review required.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <p className={cbaiSectionEyebrow}>Related research objects</p>
        <h3 className="text-base font-semibold text-zinc-100">Relationship preview</h3>
        <p className="mt-1 text-sm text-zinc-500">
          Static catalog references for this topic — not a live graph.
        </p>
      </div>

      <ul className="space-y-3">
        {relatedEntities.map((entity) => {
          const relations = resolveResearchEntityRelations(entity.entityId);
          const typeLabel = RESEARCH_ENTITY_TYPE_DEFINITIONS[entity.entityType].displayName;

          return (
            <li key={entity.entityId}>
              <article className={`${cbaiGlassCard} space-y-3 p-4`}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-cyan-400/80">
                      {typeLabel}
                    </p>
                    <h4 className="mt-1 text-sm font-semibold text-zinc-100">
                      {entity.displayName}
                    </h4>
                  </div>
                  {entity.humanReviewRequired ? (
                    <span className="rounded-md border border-zinc-700/80 bg-zinc-900/60 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                      Human review
                    </span>
                  ) : null}
                </div>

                <p className="text-xs leading-relaxed text-zinc-500">{entity.description}</p>

                <dl className="grid gap-2 text-xs sm:grid-cols-3">
                  <div>
                    <dt className="text-zinc-600">Evidence</dt>
                    <dd className="mt-0.5 text-zinc-400">
                      {RESEARCH_ENTITY_EVIDENCE_STATUS_LABELS[entity.evidenceStatus]}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-600">Source</dt>
                    <dd className="mt-0.5 text-zinc-400">
                      {RESEARCH_ENTITY_SOURCE_STATUS_LABELS[entity.sourceStatus]}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-600">Workspace</dt>
                    <dd className="mt-0.5 text-zinc-400">
                      {RESEARCH_ENTITY_WORKSPACE_STATUS_LABELS[entity.workspaceStatus]}
                    </dd>
                  </div>
                </dl>

                {relations && relations.relatedEntities.length > 0 ? (
                  <div className="border-t border-zinc-800/80 pt-3">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
                      Related research objects
                    </p>
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {relations.relatedEntities.map((related) => (
                        <li
                          key={related.entityId}
                          className="rounded-md border border-cyan-500/15 bg-cyan-500/5 px-2 py-1 text-xs text-zinc-400"
                        >
                          {RESEARCH_ENTITY_TYPE_DEFINITIONS[related.entityType].displayName}:{" "}
                          {related.displayName}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </article>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
