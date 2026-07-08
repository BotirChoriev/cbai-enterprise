import type {
  ContributionStatus,
  ContributionType,
  ContributionWorkflowStage,
} from "@/lib/research/contribution/contribution-types";

export interface ResearchContribution {
  id: string;
  topicId: string;
  contributionType: ContributionType;
  workflowStage: ContributionWorkflowStage;
  status: ContributionStatus;
  title: string;
  summary: string;
  evidenceRequired: boolean;
  humanReviewRequired: boolean;
  networkReady: boolean;
}
