/** Shared Genesis workflow vocabulary — no universal human scores. */

export const EXECUTION_STATUSES = [
  "Draft",
  "Awaiting Review",
  "Approved",
  "Active",
  "At Risk",
  "Blocked",
  "Completed",
  "Cancelled",
  "Archived",
] as const;

export type ExecutionStatus = (typeof EXECUTION_STATUSES)[number];

export const RESEARCH_RESULT_STATUSES = [
  "Supported Result",
  "Partial Result",
  "Contradictory Result",
  "Negative Result",
  "Inconclusive",
  "Replication Needed",
  "Unverified Claim",
  "Withdrawn",
  "Archived",
] as const;

export type ResearchResultStatus = (typeof RESEARCH_RESULT_STATUSES)[number];

export const OPPORTUNITY_TYPES = [
  "Research Collaboration",
  "Open Challenge",
  "Funding Opportunity",
  "Grant",
  "Investor Interest",
  "Mentorship",
  "Laboratory Access",
  "Dataset Access",
  "Technical Partnership",
  "Public-Sector Challenge",
  "Company Problem",
  "University Collaboration",
  "Community Mission",
] as const;

export type OpportunityType = (typeof OPPORTUNITY_TYPES)[number];

export const FUNDING_READINESS_STATUSES = [
  "Draft",
  "Evidence Incomplete",
  "Ready for Human Review",
  "Open for Interest",
  "Under Discussion",
  "Supported",
  "Declined",
  "Closed",
] as const;

export type FundingReadinessStatus = (typeof FUNDING_READINESS_STATUSES)[number];

export const CONTRIBUTION_STATES = [
  "Claimed",
  "Evidence Submitted",
  "Under Review",
  "Partially Supported",
  "Supported",
  "Disputed",
  "Insufficient Evidence",
] as const;

export type ContributionState = (typeof CONTRIBUTION_STATES)[number];

export const RECOGNITION_STATUSES = [
  "Draft",
  "Evidence Incomplete",
  "Under Independent Review",
  "Supported",
  "Disputed",
  "Withdrawn",
  "Archived",
] as const;

export type RecognitionStatus = (typeof RECOGNITION_STATUSES)[number];

export const BLOCKER_TYPES = [
  "Missing Information",
  "Missing Evidence",
  "Dependency Delay",
  "Capacity Issue",
  "Technical Issue",
  "Policy or Procedure",
  "External Dependency",
  "Human Decision Required",
  "Other",
] as const;

export type BlockerType = (typeof BLOCKER_TYPES)[number];

export const BLOCKER_STATUSES = [
  "Open",
  "Under Review",
  "Action Required",
  "Resolved",
  "Closed",
] as const;

export type BlockerStatus = (typeof BLOCKER_STATUSES)[number];

export const OUTCOME_VERIFICATION_STATUSES = [
  "Draft",
  "Evidence Missing",
  "Submitted for Review",
  "Partially Supported",
  "Supported",
  "Disputed",
  "Rejected",
  "Archived",
] as const;

export type OutcomeVerificationStatus = (typeof OUTCOME_VERIFICATION_STATUSES)[number];

export const PROGRESS_HUMAN_REVIEW_STATUSES = ["none", "pending", "reviewed"] as const;

export type ProgressHumanReviewStatus = (typeof PROGRESS_HUMAN_REVIEW_STATUSES)[number];

export type GenesisEvidenceRef = {
  readonly label: string;
  readonly sourceUrl?: string | null;
  readonly projectEvidenceId?: string | null;
  readonly noteId?: string | null;
};

export const CAPABILITY_RECORD_TYPES = [
  "declared_goal",
  "interest",
  "skill_or_method",
  "completed_project",
  "completed_mission",
  "research_contribution",
  "evidence_review",
  "prototype",
  "technical_work",
  "team_contribution",
  "verified_outcome",
  "independent_review",
  "learning_milestone",
  "unresolved_limitation",
] as const;

export type CapabilityRecordType = (typeof CAPABILITY_RECORD_TYPES)[number];

export const CAPABILITY_VERIFICATION_STATUSES = [
  "Self-Declared",
  "Evidence Submitted",
  "Under Review",
  "Partially Verified",
  "Verified",
  "Disputed",
  "Expired",
  "Archived",
] as const;

export type CapabilityVerificationStatus = (typeof CAPABILITY_VERIFICATION_STATUSES)[number];

export type GenesisAuditRecord = {
  readonly id: string;
  readonly domain: string;
  readonly action: string;
  readonly recordType: string;
  readonly recordId: string;
  readonly actorId: string;
  readonly organizationId?: string | null;
  readonly missionId?: string | null;
  readonly projectId?: string | null;
  readonly previousState?: string | null;
  readonly newState?: string | null;
  readonly timestamp: string;
};
