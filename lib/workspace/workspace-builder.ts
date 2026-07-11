import type { IntelligenceResult } from "@/lib/foundation/orchestration-types";
import type { IntelligenceNetwork } from "@/lib/foundation/network-types";
import type { WorkspaceView } from "@/lib/foundation/workspace-types";
import { isWorkflowStateTerminal, latestWorkflowTransition } from "@/lib/workflow/workflow-query";
import { findCollaborationCandidates } from "@/lib/network/network-collaboration";

/**
 * Compose a WorkspaceView from the Orchestration Layer's own output. This is the entire
 * Workspace Platform's "logic" — assembly and honest defaulting, nothing derived. Reasoning,
 * Workflow, and Network data are consumed exactly as their own engines produced them
 * (lib/reasoning/, lib/workflow/, lib/network/); no evidence, relationship, reasoning, workflow,
 * or collaboration signal is re-computed here.
 */
export function buildWorkspaceView(
  result: IntelligenceResult,
  network?: IntelligenceNetwork,
): WorkspaceView {
  const { reasoning, workflow } = result;

  return {
    subjectId: result.subject.subjectId,
    missionCenter: {
      subject: result.subject,
      mission: result.mission,
      question: result.question,
    },
    intelligenceBrief: reasoning
      ? {
          observedFacts: reasoning.observedFacts,
          knownUnknowns: reasoning.knownUnknowns,
          reasoningPath: reasoning.reasoningPath,
        }
      : undefined,
    evidenceCenter: {
      evidence: result.evidence,
      supportingEvidence: reasoning?.supportingEvidence ?? [],
      conflictingEvidence: reasoning?.conflictingEvidence ?? [],
    },
    knowledgeNetwork: {
      relationships: result.relationships,
      network,
      collaborationCandidates: network ? findCollaborationCandidates(network) : [],
    },
    recommendations: reasoning
      ? { possibleOptions: reasoning.possibleOptions, tradeOffs: reasoning.tradeOffs }
      : undefined,
    monitoring: {
      currentState: workflow?.currentState,
      isTerminal: workflow ? isWorkflowStateTerminal(workflow.currentState) : false,
      latestTransition: workflow ? latestWorkflowTransition(workflow) : undefined,
    },
    timeline: {
      transitions: workflow?.history ?? [],
    },
    openQuestions: {
      questions: reasoning?.openQuestions ?? [],
    },
    activity: {
      pipelineTrace: result.pipelineTrace,
    },
    extensions: result.extensions,
  };
}
