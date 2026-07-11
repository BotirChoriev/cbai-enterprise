import type { RelationshipType } from "@/lib/foundation/relationship-types";
import type { ResearchOutcomeEntity } from "@/lib/research-domain/research-entities-outcomes";
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
  goal: string;
  scope: string;
  providers?: MissionProviders;
}

/**
 * Compose a real ResearchMission for one subject. This is the entire Mission Engine's "logic"
 * beyond the state machine itself — assembly over already-computed Research Domain / Workspace
 * Contract output, nothing derived. Every "Support:" concern the mission named is a direct
 * reference into data Phase 2/Phase 3 already built; "dependencies" is the one field this
 * function filters itself, and only by a real, existing field (`relationshipType`) on an
 * already-real Relationship collection — never a new relationship or evidence derivation.
 */
export function buildResearchMission(input: BuildResearchMissionInput): ResearchMission {
  const providers = input.providers ?? researchMissionProviders;
  const base = createResearchMission(input);

  const workspaceContract = providers.resolveWorkspaceContract(input.missionId);
  const domainEntities = providers.resolveResearchDomainEntities();
  const researchMissionEntity = providers.resolveResearchMissionEntity(input.missionId);

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
