import type { IntelligencePipelineProviders } from "@/lib/orchestration/pipeline-types";
import { buildAllResearchDomainEntities } from "@/lib/research-domain/research-domain-adapter";
import { findResearchDomainEntityById } from "@/lib/research-domain/research-domain-query";

/**
 * Research Domain Providers — plugs the Research Domain Foundation into the universal
 * Orchestration Layer (lib/orchestration/, EPIC-07) via the exact IntelligencePipelineProviders
 * contract that layer already defines. Distinct from
 * research-foundation-adapter.ts's `researchIntelligencePipelineProviders` (EPIC-07), which
 * wires the raw lib/research/* engines directly into the pipeline: this provider instead
 * resolves Evidence and Relationships from an already-built ResearchDomainEntity's own
 * `.evidence`/`.relationships` fields, proving the Research Domain Foundation itself — not just
 * the underlying engines — is orchestration-pipeline-compatible.
 *
 * Recomputes the full entity collection on every call, the same accepted-debt pattern already
 * used by buildResearchIntelligenceNetwork() (EPIC-08) and buildResearchWorkspaceView() (EPIC-09)
 * — no caching was introduced, to keep this file's only job "wire the contract," not add new
 * performance logic.
 */
export const researchDomainPipelineProviders: IntelligencePipelineProviders = {
  resolveFoundation: (input) => {
    const entity = findResearchDomainEntityById(buildAllResearchDomainEntities(), input.subjectId);
    if (!entity) {
      return undefined;
    }

    return {
      subject: { subjectId: entity.entityId, subjectLabel: entity.label, subjectKind: entity.entityKind },
      mission: entity.missions[0],
    };
  },
  discoverEvidence: (foundation) => {
    const entity = findResearchDomainEntityById(
      buildAllResearchDomainEntities(),
      foundation.subject.subjectId,
    );
    return entity?.evidence ?? [];
  },
  resolveRelationships: (foundation) => {
    const entity = findResearchDomainEntityById(
      buildAllResearchDomainEntities(),
      foundation.subject.subjectId,
    );
    return entity?.relationships ?? [];
  },
};
