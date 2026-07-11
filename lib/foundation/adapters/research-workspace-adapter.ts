import type { Question } from "@/lib/foundation/foundation-model";
import type { WorkspaceView } from "@/lib/foundation/workspace-types";
import { runResearchIntelligencePipeline } from "@/lib/foundation/adapters/research-foundation-adapter";
import { buildResearchIntelligenceNetwork } from "@/lib/foundation/adapters/research-entity-network-adapter";
import { buildWorkspaceView } from "@/lib/workspace/workspace-builder";

/**
 * Research Intelligence's Workspace — proves the universal Workspace Platform against real
 * data by composing two already-real pipelines: EPIC-07's orchestration pipeline
 * (runResearchIntelligencePipeline) and EPIC-08's Global Intelligence Network
 * (buildResearchIntelligenceNetwork). No new evidence, relationship, reasoning, or workflow
 * logic — this function only calls buildWorkspaceView with what those two already produced.
 */
export function buildResearchWorkspaceView(
  topicId: string,
  question?: Question,
): WorkspaceView | undefined {
  const result = runResearchIntelligencePipeline(topicId, question);
  if (!result) {
    return undefined;
  }

  return buildWorkspaceView(result, buildResearchIntelligenceNetwork());
}
