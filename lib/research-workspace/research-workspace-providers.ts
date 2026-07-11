import type { IntelligenceResult } from "@/lib/foundation/orchestration-types";
import type { IntelligenceNetwork } from "@/lib/foundation/network-types";
import type { ResearchDomainEntity } from "@/lib/research-domain/research-relationships";
import { runResearchIntelligencePipeline } from "@/lib/foundation/adapters/research-foundation-adapter";
import { buildResearchIntelligenceNetwork } from "@/lib/foundation/adapters/research-entity-network-adapter";
import { buildAllResearchDomainEntities } from "@/lib/research-domain/research-domain-adapter";

/**
 * The plugin contract the Workspace Builder consumes to source its three raw inputs. A future
 * ecosystem (Government, University, ...) implements this same shape with its own real data;
 * this file's `researchWorkspaceProviders` is Research Intelligence's own implementation, and
 * every function in it is a direct call to an already-real, already-shipped Platform/Domain
 * function — nothing here re-derives evidence, relationships, reasoning, or a network.
 */
export interface ResearchWorkspaceProviders {
  resolveIntelligenceResult: (subjectId: string) => IntelligenceResult | undefined;
  resolveIntelligenceNetwork: () => IntelligenceNetwork;
  resolveResearchDomainEntities: () => readonly ResearchDomainEntity[];
}

export const researchWorkspaceProviders: ResearchWorkspaceProviders = {
  resolveIntelligenceResult: (subjectId) => runResearchIntelligencePipeline(subjectId),
  resolveIntelligenceNetwork: () => buildResearchIntelligenceNetwork(),
  resolveResearchDomainEntities: () => buildAllResearchDomainEntities(),
};
