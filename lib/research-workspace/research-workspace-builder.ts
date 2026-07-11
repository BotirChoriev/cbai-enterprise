import { buildWorkspaceView } from "@/lib/workspace/workspace-builder";
import { findCollaborationCandidates } from "@/lib/network/network-collaboration";
import {
  findResearchDomainEntitiesByMission,
  findResearchDomainEntityById,
} from "@/lib/research-domain/research-domain-query";
import type { ResearchDomainEntity } from "@/lib/research-domain/research-relationships";
import type { HypothesisEntity, ResearchQuestionEntity } from "@/lib/research-domain/research-entities-intent";
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
import type { ResearchWorkspaceContract } from "@/lib/research-workspace/research-workspace-contract";
import {
  researchWorkspaceProviders,
  type ResearchWorkspaceProviders,
} from "@/lib/research-workspace/research-workspace-providers";

/** Narrow a ResearchDomainEntity collection to exactly the concrete type for one entityKind. */
function ofKind<K extends ResearchDomainEntity["entityKind"]>(
  entities: readonly ResearchDomainEntity[],
  kind: K,
): readonly Extract<ResearchDomainEntity, { entityKind: K }>[] {
  return entities.filter(
    (entity): entity is Extract<ResearchDomainEntity, { entityKind: K }> => entity.entityKind === kind,
  );
}

export interface BuildResearchWorkspaceContractInput {
  subjectId: string;
  providers?: ResearchWorkspaceProviders;
}

/**
 * Compose the full ResearchWorkspaceContract for one subject. This is the entire Workspace
 * Contract's "logic" — assembly over already-computed Platform/Domain output, nothing derived.
 * Returns undefined, honestly, when the Orchestration Layer cannot resolve Foundation for the
 * given subject (no fabricated partial contract is ever returned).
 */
export function buildResearchWorkspaceContract(
  input: BuildResearchWorkspaceContractInput,
): ResearchWorkspaceContract | undefined {
  const providers = input.providers ?? researchWorkspaceProviders;

  const intelligenceResult = providers.resolveIntelligenceResult(input.subjectId);
  if (!intelligenceResult) {
    return undefined;
  }

  const network = providers.resolveIntelligenceNetwork();
  const workspaceView = buildWorkspaceView(intelligenceResult, network);
  const domainEntities = providers.resolveResearchDomainEntities();

  const topicEntity = findResearchDomainEntityById(domainEntities, `research-topic:${input.subjectId}`);
  const missionLinkedEntities = findResearchDomainEntitiesByMission(domainEntities, input.subjectId);

  const researchQuestions = missionLinkedEntities.filter(
    (entity): entity is ResearchQuestionEntity => entity.entityKind === "research_question",
  );
  const researchFindings = missionLinkedEntities.filter(
    (entity): entity is FindingEntity => entity.entityKind === "finding",
  );

  // topicEntity is itself included in missionLinkedEntities (it carries its own mission link),
  // so its timeline is excluded from the flatMap below to avoid double-counting the same real
  // events — found during the first live vertical-slice trace; currently latent (topic timelines
  // are always empty today, see docs/current-progress.md) but a real, worth-fixing duplication.
  const researchTimelineEvents = [
    ...(topicEntity?.timeline ?? []),
    ...missionLinkedEntities
      .filter((entity) => entity.entityId !== topicEntity?.entityId)
      .flatMap((entity) => entity.timeline),
  ];

  const openHypotheses: readonly HypothesisEntity[] = ofKind(domainEntities, "hypothesis");
  const relatedPublications: readonly PublicationEntity[] = ofKind(domainEntities, "publication");
  const relatedPatents: readonly PatentEntity[] = ofKind(domainEntities, "patent");
  const relatedDatasets: readonly DatasetEntity[] = ofKind(domainEntities, "dataset");
  const relatedTechnologies: readonly TechnologyEntity[] = ofKind(domainEntities, "technology");

  const relatedOrganizations: readonly ResearchDomainEntity[] = [
    ...ofKind(domainEntities, "laboratory"),
    ...ofKind(domainEntities, "research_center"),
    ...ofKind(domainEntities, "university"),
  ];

  const researchTeam: readonly ResearchDomainEntity[] = [
    ...ofKind(domainEntities, "researcher"),
    ...ofKind(domainEntities, "engineer"),
    ...ofKind(domainEntities, "scientist"),
    ...ofKind(domainEntities, "academic"),
    ...ofKind(domainEntities, "student_researcher"),
  ];

  const fundingOpportunities: readonly FundingOpportunityEntity[] = ofKind(domainEntities, "funding_opportunity");
  const grants: readonly GrantEntity[] = ofKind(domainEntities, "grant");
  const sponsors: readonly SponsorEntity[] = ofKind(domainEntities, "sponsor");

  return {
    subjectId: input.subjectId,
    missionSummary: {
      missionCenter: workspaceView.missionCenter,
      intelligenceBrief: workspaceView.intelligenceBrief,
    },
    missionProgress: {
      monitoring: workspaceView.monitoring,
      recommendedNextStep: providers.resolveRecommendedNextStep?.(input.subjectId),
    },
    evidenceSummary: workspaceView.evidenceCenter,
    researchTimeline: { events: researchTimelineEvents },
    researchQuestions: { questions: researchQuestions },
    openHypotheses: { hypotheses: openHypotheses },
    researchFindings: { findings: researchFindings },
    relatedPublications: { publications: relatedPublications },
    relatedPatents: { patents: relatedPatents },
    relatedDatasets: { datasets: relatedDatasets },
    relatedTechnologies: { technologies: relatedTechnologies },
    relatedOrganizations: { organizations: relatedOrganizations },
    researchTeam: { team: researchTeam },
    potentialCollaborators: { candidates: findCollaborationCandidates(network) },
    fundingOpportunities: { opportunities: fundingOpportunities, grants, sponsors },
    openRisks: { risks: intelligenceResult.reasoning?.risks ?? [] },
    recommendations: workspaceView.recommendations ?? { possibleOptions: [], tradeOffs: [] },
    activityTimeline: {
      pipelineTrace: workspaceView.activity.pipelineTrace,
      transitions: workspaceView.timeline.transitions,
    },
    knowledgeNetwork: workspaceView.knowledgeNetwork,
  };
}
