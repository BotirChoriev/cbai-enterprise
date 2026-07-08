import { createContributionWorkflow } from "@/lib/research/contribution/contribution-builder";
import type { ResearchContribution } from "@/lib/research/contribution/contribution-model";
import type {
  ContributionType,
  ContributionWorkflowStage,
} from "@/lib/research/contribution/contribution-types";

export type ContributionWorkflowStageEntry = {
  stageId: ContributionWorkflowStage;
  stageNumber: number;
  title: string;
  description: string;
};

/** List catalog-defined contribution types. */
export function listContributionTypes(): readonly ContributionType[] {
  return createContributionWorkflow().contributionTypes;
}

/** List catalog-defined workflow stages in order. */
export function listWorkflowStages(): readonly ContributionWorkflowStageEntry[] {
  return createContributionWorkflow().stages;
}

/** Check whether a contribution meets catalog readiness for network integration. */
export function isContributionReady(contribution: ResearchContribution): boolean {
  if (!contribution.networkReady || contribution.status !== "integration_ready") {
    return false;
  }

  if (contribution.workflowStage !== "knowledge_network_integration") {
    return false;
  }

  return (
    contribution.topicId.length > 0 &&
    contribution.title.length > 0 &&
    contribution.summary.length > 0
  );
}
