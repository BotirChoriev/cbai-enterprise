import type { IntelligenceResult } from "@/lib/foundation/orchestration-types";
import type { IntelligenceNetwork } from "@/lib/foundation/network-types";
import type { ResearchDomainEntity } from "@/lib/research-domain/research-relationships";
import { runResearchIntelligencePipeline } from "@/lib/foundation/adapters/research-foundation-adapter";
import { buildResearchIntelligenceNetwork } from "@/lib/foundation/adapters/research-entity-network-adapter";
import { buildAllResearchDomainEntities } from "@/lib/research-domain/research-domain-adapter";
import { deriveResearchWorkflow } from "@/lib/research/workflow/workflow-engine";
import type { RecommendedNextStep } from "@/lib/research-workspace/research-workspace-contract";

/**
 * The plugin contract the Workspace Builder consumes to source its four raw inputs. A future
 * ecosystem (Government, University, ...) implements this same shape with its own real data;
 * this file's `researchWorkspaceProviders` is Research Intelligence's own implementation, and
 * every function in it is a direct call to an already-real, already-shipped Platform/Domain
 * function — nothing here re-derives evidence, relationships, reasoning, or a network.
 */
export interface ResearchWorkspaceProviders {
  resolveIntelligenceResult: (subjectId: string) => IntelligenceResult | undefined;
  resolveIntelligenceNetwork: () => IntelligenceNetwork;
  resolveResearchDomainEntities: () => readonly ResearchDomainEntity[];
  /** Optional — no fabricated fallback exists when a domain has no equivalent engine yet. */
  resolveRecommendedNextStep?: (subjectId: string) => RecommendedNextStep | undefined;
}

/**
 * Reuses `lib/research/workflow/workflow-engine.ts`'s `deriveResearchWorkflow` — the existing,
 * already-real Research Workflow Engine — rather than re-deriving a recommendation from
 * Reasoning's possibleOptions (a different concept: those are relationship-derived alternative
 * paths, not a single prioritized next action). No new decision logic is introduced here; this
 * is pure translation of an existing engine's already-computed output.
 */
function resolveRecommendedNextStep(subjectId: string): RecommendedNextStep | undefined {
  const workflow = deriveResearchWorkflow(subjectId);
  if (!workflow) {
    return undefined;
  }

  return {
    label: workflow.nextAction,
    reason: workflow.reason,
    href: workflow.actionLink?.href,
  };
}

export const researchWorkspaceProviders: ResearchWorkspaceProviders = {
  resolveIntelligenceResult: (subjectId) => runResearchIntelligencePipeline(subjectId),
  resolveIntelligenceNetwork: () => buildResearchIntelligenceNetwork(),
  resolveResearchDomainEntities: () => buildAllResearchDomainEntities(),
  resolveRecommendedNextStep,
};
