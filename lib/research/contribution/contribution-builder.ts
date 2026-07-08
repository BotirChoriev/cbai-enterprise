import type { ResearchContribution } from "@/lib/research/contribution/contribution-model";
import type {
  ContributionType,
  ContributionWorkflowStage,
} from "@/lib/research/contribution/contribution-types";

const CONTRIBUTION_CATALOG_ID = "contribution-catalog-placeholder";
const CONTRIBUTION_WORKFLOW_ID = "research-contribution-workflow";

const CONTRIBUTION_TYPES: readonly ContributionType[] = [
  "publication",
  "experiment",
  "dataset",
  "method",
  "negative_result",
  "open_question",
  "patent",
  "technology",
];

type ContributionWorkflowStageDefinition = {
  stageId: ContributionWorkflowStage;
  stageNumber: number;
  title: string;
  description: string;
};

export type ContributionWorkflowCatalog = {
  workflowId: string;
  stages: readonly ContributionWorkflowStageDefinition[];
  contributionTypes: readonly ContributionType[];
  status: "catalog_defined";
  evidenceRequired: boolean;
  humanReviewRequired: boolean;
};

const WORKFLOW_STAGE_DEFINITIONS: readonly ContributionWorkflowStageDefinition[] = [
  {
    stageId: "choose_topic",
    stageNumber: 1,
    title: "Choose Research Topic",
    description: "Select a catalog research topic before describing a knowledge contribution.",
  },
  {
    stageId: "choose_contribution_type",
    stageNumber: 2,
    title: "Choose Contribution Type",
    description: "Identify the kind of knowledge contribution being prepared for review.",
  },
  {
    stageId: "describe_contribution",
    stageNumber: 3,
    title: "Describe Contribution",
    description: "Outline the contribution title and summary for catalog review.",
  },
  {
    stageId: "evidence_requirements",
    stageNumber: 4,
    title: "Evidence Requirements",
    description: "Review evidence and metadata requirements before scientific review.",
  },
  {
    stageId: "human_scientific_review",
    stageNumber: 5,
    title: "Human Scientific Review",
    description: "Evidence review and scientific review are required before integration.",
  },
  {
    stageId: "knowledge_network_integration",
    stageNumber: 6,
    title: "Knowledge Network Integration",
    description:
      "After verification, the knowledge object may connect to the research network, workspace, and related topics.",
  },
];

/** Return an empty catalog contribution scaffold. */
export function createContribution(): ResearchContribution {
  return {
    id: CONTRIBUTION_CATALOG_ID,
    topicId: "",
    contributionType: "publication",
    workflowStage: "choose_topic",
    status: "catalog_defined",
    title: "",
    summary: "",
    evidenceRequired: true,
    humanReviewRequired: true,
    networkReady: false,
  };
}

/** Return the catalog-defined contribution workflow. */
export function createContributionWorkflow(): ContributionWorkflowCatalog {
  return {
    workflowId: CONTRIBUTION_WORKFLOW_ID,
    stages: WORKFLOW_STAGE_DEFINITIONS,
    contributionTypes: CONTRIBUTION_TYPES,
    status: "catalog_defined",
    evidenceRequired: true,
    humanReviewRequired: true,
  };
}
