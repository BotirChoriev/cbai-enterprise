import type { RelationshipType } from "@/lib/foundation/relationship-types";
import type { ResearchOutcomeEntity } from "@/lib/research-domain/research-entities-outcomes";
import type { ResearchTopicEntity } from "@/lib/research-domain/research-entities-intent";
import { findResearchDomainEntityById } from "@/lib/research-domain/research-domain-query";
import type { ResearchMission } from "@/lib/research-mission/research-mission-engine";
import {
  researchMissionProviders,
  type MissionProviders,
} from "@/lib/research-mission/research-mission-providers";

export interface CreateResearchMissionInput {
  missionId: string;
  goal: string;
  scope: string;
}

/**
 * Create a new ResearchMission in its honest initial state — "draft", empty history, every
 * collection an honest empty array. Entering the initial state is not itself a recorded
 * transition — there is no real prior state to transition from — mirroring
 * lib/workflow/workflow-builder.ts's createWorkflow exactly.
 */
export function createResearchMission(input: CreateResearchMissionInput): ResearchMission {
  return {
    missionId: input.missionId,
    goal: input.goal,
    scope: input.scope,
    currentState: "draft",
    history: [],
    researchQuestions: [],
    hypotheses: [],
    expectedOutcomes: [],
    evidence: [],
    timeline: [],
    dependencies: [],
    participants: [],
    organizations: [],
    risks: [],
    milestones: [],
    deliverables: [],
    relatedPublications: [],
    relatedPatents: [],
    relatedDatasets: [],
  };
}

const DEPENDENCY_RELATIONSHIP_TYPE: RelationshipType = "depends_on";

export interface BuildResearchMissionInput {
  missionId: string;
  /** Optional — defaults to the real ResearchMissionEntity's own statement when omitted, never a placeholder. */
  goal?: string;
  /** Optional — defaults to the real ResearchTopicEntity's own description when omitted, never a placeholder. */
  scope?: string;
  providers?: MissionProviders;
}

/**
 * Compose a real ResearchMission for one subject. This is the entire Mission Engine's "logic"
 * beyond the state machine itself — assembly over already-computed Research Domain / Workspace
 * Contract output, nothing derived. Every "Support:" concern the mission named is a direct
 * reference into data Phase 2/Phase 3 already built; "dependencies" is the one field this
 * function filters itself, and only by a real, existing field (`relationshipType`) on an
 * already-real Relationship collection — never a new relationship or evidence derivation.
 *
 * `goal`/`scope` default to real Research Domain text (the mission entity's own statement; the
 * topic entity's own description) rather than requiring every caller to supply them, so a UI
 * consumer can build a full ResearchMission from nothing but a subject id — never a fabricated
 * default, always the real record already resolved via `providers`.
 */
export function buildResearchMission(input: BuildResearchMissionInput): ResearchMission {
  const providers = input.providers ?? researchMissionProviders;

  const workspaceContract = providers.resolveWorkspaceContract(input.missionId);
  const domainEntities = providers.resolveResearchDomainEntities();
  const researchMissionEntity = providers.resolveResearchMissionEntity(input.missionId);
  const resolvedTopicEntity = findResearchDomainEntityById(
    domainEntities,
    `research-topic:${input.missionId}`,
  );
  const researchTopicEntity: ResearchTopicEntity | undefined =
    resolvedTopicEntity?.entityKind === "research_topic" ? resolvedTopicEntity : undefined;

  const base = createResearchMission({
    missionId: input.missionId,
    goal: input.goal ?? researchMissionEntity?.statement ?? "",
    scope: input.scope ?? researchTopicEntity?.description ?? "",
  });

  const expectedOutcomes = domainEntities.filter(
    (entity): entity is ResearchOutcomeEntity => entity.entityKind === "research_outcome",
  );

  const dependencies = (workspaceContract?.knowledgeNetwork.relationships ?? []).filter(
    (relationship) => relationship.relationshipType === DEPENDENCY_RELATIONSHIP_TYPE,
  );

  return {
    ...base,
    researchQuestions: workspaceContract?.researchQuestions.questions ?? [],
    hypotheses: workspaceContract?.openHypotheses.hypotheses ?? [],
    expectedOutcomes,
    evidence: workspaceContract?.evidenceSummary.evidence ?? [],
    timeline: workspaceContract?.researchTimeline.events ?? [],
    dependencies,
    participants: workspaceContract?.researchTeam.team ?? [],
    organizations: workspaceContract?.relatedOrganizations.organizations ?? [],
    risks: workspaceContract?.openRisks.risks ?? [],
    relatedPublications: workspaceContract?.relatedPublications.publications ?? [],
    relatedPatents: workspaceContract?.relatedPatents.patents ?? [],
    relatedDatasets: workspaceContract?.relatedDatasets.datasets ?? [],
    researchMissionEntity,
    workspaceContract,
  };
}
