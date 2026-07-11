import type { ResearchWorkspaceContract } from "@/lib/research-workspace/research-workspace-contract";
import { buildResearchWorkspaceContract } from "@/lib/research-workspace/research-workspace-builder";
import type { ResearchDomainEntity } from "@/lib/research-domain/research-relationships";
import type { ResearchMissionEntity } from "@/lib/research-domain/research-entities-intent";
import { buildAllResearchDomainEntities } from "@/lib/research-domain/research-domain-adapter";
import { findResearchDomainEntityById } from "@/lib/research-domain/research-domain-query";

/**
 * Mission Providers — the plugin contract the Mission Builder consumes to source its three raw
 * inputs, mirroring the injection-contract role `ResearchWorkspaceProviders` (Phase 3) and
 * `IntelligencePipelineProviders` (EPIC-07) already play at their own layers.
 * `researchMissionProviders`, the real implementation, calls two already-real functions
 * unmodified — `buildResearchWorkspaceContract` (Phase 3) and `buildAllResearchDomainEntities`
 * (Phase 2) — zero new evidence, relationship, reasoning, or catalog logic.
 */
export interface MissionProviders {
  resolveWorkspaceContract: (missionId: string) => ResearchWorkspaceContract | undefined;
  resolveResearchDomainEntities: () => readonly ResearchDomainEntity[];
  resolveResearchMissionEntity: (missionId: string) => ResearchMissionEntity | undefined;
}

export const researchMissionProviders: MissionProviders = {
  resolveWorkspaceContract: (missionId) => buildResearchWorkspaceContract({ subjectId: missionId }),
  resolveResearchDomainEntities: () => buildAllResearchDomainEntities(),
  resolveResearchMissionEntity: (missionId) => {
    const entity = findResearchDomainEntityById(
      buildAllResearchDomainEntities(),
      `research-mission:${missionId}`,
    );
    return entity?.entityKind === "research_mission" ? entity : undefined;
  },
};
