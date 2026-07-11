// Universal Research Workspace Contract. Consumes only existing Platform capabilities
// (lib/workspace/, lib/foundation/, lib/network/, lib/reasoning/ — all unmodified, all Platform
// RC-1) and the Research Domain (lib/research-domain/, Phase 1/2 — unmodified). No new
// intelligence logic lives here: every section below is either a direct reuse of a Platform
// Core Workspace section, or a thin `{ items: ... }` wrapper composing real Research Domain
// entities. lib/research-workspace/research-workspace-builder.ts is the only place that
// constructs one.
//
// Two sections — Recommendations and Knowledge Network — reuse
// lib/foundation/workspace-types.ts's `RecommendationsSection`/`KnowledgeNetworkSection`
// directly rather than redeclaring them under a new name: their content (ReasoningResult's
// possible options/trade-offs; the subject's relationships + Global Intelligence Network) is
// already domain-agnostic and complete — nothing about "Research" needs to enrich them further.

import type {
  EvidenceCenterSection,
  IntelligenceBriefSection,
  KnowledgeNetworkSection,
  MissionCenterSection,
  MonitoringSection,
  RecommendationsSection,
} from "@/lib/foundation/workspace-types";
import type { IntelligencePipelineStageTrace } from "@/lib/foundation/orchestration-types";
import type { ReasoningRisk } from "@/lib/foundation/reasoning-types";
import type { CollaborationCandidate } from "@/lib/foundation/network-types";
import type { TimelineEvent } from "@/lib/foundation/foundation-model";
import type { WorkflowTransition } from "@/lib/foundation/workflow-types";
import type {
  HypothesisEntity,
  ResearchQuestionEntity,
} from "@/lib/research-domain/research-entities-intent";
import type {
  DatasetEntity,
  PatentEntity,
  PublicationEntity,
  TechnologyEntity,
} from "@/lib/research-domain/research-entities-artifacts";
import type { FindingEntity } from "@/lib/research-domain/research-entities-outcomes";
import type {
  FundingOpportunityEntity,
  GrantEntity,
  SponsorEntity,
} from "@/lib/research-domain/research-entities-funding";
import type { ResearchDomainEntity } from "@/lib/research-domain/research-relationships";

/**
 * `intelligenceBrief` reuses Platform's own `IntelligenceBriefSection` (observed facts, known
 * unknowns, reasoning path — EPIC-09) unmodified. Added to close a second disconnected handoff
 * found while activating the first live vertical slice: the Contract never surfaced this
 * Platform Core section at all, even though "known evidence gaps" and "a reasoning summary" are
 * both real, already-computed data available since EPIC-09 — this field exposes it rather than
 * requiring a consumer to bypass the Contract and call the Reasoning Framework directly.
 */
export interface MissionSummarySection {
  missionCenter: MissionCenterSection;
  intelligenceBrief?: IntelligenceBriefSection;
}

/**
 * A real, actionable next step — never a fabricated call to action. Present only when a real
 * route/anchor exists for it (`href`); a genuine "nothing to do right now" state is honestly
 * represented by omitting this field entirely, not by a placeholder step with no real target.
 *
 * Added to close a disconnected handoff found while activating the first live vertical slice:
 * `RecommendationsSection` (ReasoningResult's possible options) and `MonitoringSection`
 * (the new Workflow's not-yet-transitioned state) are both real, but neither carries the
 * existing, already-real, already-working single-next-action signal
 * `lib/research/workflow/workflow-engine.ts`'s `deriveResearchWorkflow` has produced since
 * BUILD-004x — this field surfaces that existing engine's real output through the Contract, so a
 * consumer never needs to call it directly.
 */
export interface RecommendedNextStep {
  label: string;
  reason: string;
  href?: string;
}

export interface MissionProgressSection {
  monitoring: MonitoringSection;
  recommendedNextStep?: RecommendedNextStep;
}

/**
 * Real research activity events (from Research Domain entities' own `.timeline` field) —
 * deliberately distinct from "Activity Timeline" below, which is the system/process-level audit
 * trail (pipeline stages, workflow transitions), not real-world research events.
 */
export interface ResearchTimelineSection {
  events: readonly TimelineEvent[];
}

export interface ResearchQuestionsSection {
  questions: readonly ResearchQuestionEntity[];
}

export interface OpenHypothesesSection {
  hypotheses: readonly HypothesisEntity[];
}

export interface ResearchFindingsSection {
  findings: readonly FindingEntity[];
}

export interface RelatedPublicationsSection {
  publications: readonly PublicationEntity[];
}

export interface RelatedPatentsSection {
  patents: readonly PatentEntity[];
}

export interface RelatedDatasetsSection {
  datasets: readonly DatasetEntity[];
}

export interface RelatedTechnologiesSection {
  technologies: readonly TechnologyEntity[];
}

/** Laboratory / Research Center / University kind entities linked to this workspace. */
export interface RelatedOrganizationsSection {
  organizations: readonly ResearchDomainEntity[];
}

/** Researcher / Engineer / Scientist / Academic / Student Researcher kind entities. */
export interface ResearchTeamSection {
  team: readonly ResearchDomainEntity[];
}

/**
 * Reuses the Global Intelligence Network's own collaboration discovery
 * (lib/network/network-collaboration.ts, EPIC-08) unmodified — every candidate here is grounded
 * in a real shared Evidence or relationship-target id, never a connection count.
 */
export interface PotentialCollaboratorsSection {
  candidates: readonly CollaborationCandidate[];
}

export interface FundingOpportunitiesSection {
  opportunities: readonly FundingOpportunityEntity[];
  grants: readonly GrantEntity[];
  sponsors: readonly SponsorEntity[];
}

/** Reuses the Reasoning Framework's own Risk type (lib/foundation/reasoning-types.ts, EPIC-05) unmodified. */
export interface OpenRisksSection {
  risks: readonly ReasoningRisk[];
}

/** The system/process-level audit trail — pipeline stages plus workflow transitions, both reused unmodified. */
export interface ActivityTimelineSection {
  pipelineTrace: readonly IntelligencePipelineStageTrace[];
  transitions: readonly WorkflowTransition[];
}

/**
 * The full Universal Research Workspace Contract — the nineteen sections the mission named.
 * Every future Research Workspace UI renders this same shape; nothing here is UI, React, or a
 * component.
 */
export interface ResearchWorkspaceContract {
  subjectId: string;
  missionSummary: MissionSummarySection;
  missionProgress: MissionProgressSection;
  evidenceSummary: EvidenceCenterSection;
  researchTimeline: ResearchTimelineSection;
  researchQuestions: ResearchQuestionsSection;
  openHypotheses: OpenHypothesesSection;
  researchFindings: ResearchFindingsSection;
  relatedPublications: RelatedPublicationsSection;
  relatedPatents: RelatedPatentsSection;
  relatedDatasets: RelatedDatasetsSection;
  relatedTechnologies: RelatedTechnologiesSection;
  relatedOrganizations: RelatedOrganizationsSection;
  researchTeam: ResearchTeamSection;
  potentialCollaborators: PotentialCollaboratorsSection;
  fundingOpportunities: FundingOpportunitiesSection;
  openRisks: OpenRisksSection;
  recommendations: RecommendationsSection;
  activityTimeline: ActivityTimelineSection;
  knowledgeNetwork: KnowledgeNetworkSection;
}
