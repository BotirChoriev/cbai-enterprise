import type { StarterWorkCard } from "@/lib/activation/starter-work-card";
import { PROBLEM_SCHEMA_VERSION, type Problem, type ProblemBrief } from "@/lib/problems/problem.types";

function stableProblemId(card: StarterWorkCard): string {
  const seed = `${card.originalText}|${card.role}|${card.contentLocale}`;
  let hash = 5381;
  for (let index = 0; index < seed.length; index += 1) {
    hash = ((hash << 5) + hash + seed.charCodeAt(index)) | 0;
  }
  return `problem-${Math.abs(hash).toString(36)}`;
}

export function problemBriefFromConfirmedCard(
  card: StarterWorkCard,
  confirmedOperationalObjectId: string,
  now = new Date().toISOString(),
): Problem {
  const unknowns = card.unknowns.map((unknown) => String(unknown));
  const id = stableProblemId(card);
  const brief: ProblemBrief = {
    version: 1,
    title: card.workingTitle,
    originalStatement: card.originalText,
    problemStatement: card.problemInterpretation,
    desiredOutcome: card.desiredOutcome,
    constraints: card.constraints,
    roleContext: card.role,
    knownInformation: card.materials.map((material) => material.value),
    assumptions: [...card.assumptions],
    unknowns,
    materials: [...card.materials],
    contentLocale: card.contentLocale,
    createdAt: now,
    confirmedAt: now,
    confirmedBy: "human",
  };

  return {
    schemaVersion: PROBLEM_SCHEMA_VERSION,
    id,
    status: "open",
    currentBriefVersion: 1,
    briefs: [brief],
    claims: [],
    unknownRegister: unknowns.map((question, index) => ({
      id: `${id}-unknown-${index + 1}`,
      question,
      whyItMatters: "Must be reviewed before scenario design.",
      severity: "high",
      evidenceNeeded: "Verified evidence or explicit human risk acceptance.",
      owner: "human_owner",
      status: "open",
      resolutionEvidencePassportIds: [],
      createdAt: now,
      updatedAt: now,
    })),
    contradictions: [],
    readinessCheckpoint: {
      status: "not_reviewed",
      decidedBy: null,
      decidedAt: null,
      acceptedCriticalUnknownIds: [],
      acknowledgedContradictionIds: [],
      note: null,
    },
    decisionCriteria: [],
    scenarios: [],
    decisions: [],
    monitoringTriggers: [],
    operationalObjectIds: [confirmedOperationalObjectId],
    evidencePassportIds: [],
    unresolvedContradictionCount: 0,
    criticalUnknownCount: unknowns.length,
    finalDecisionOwner: "human",
    source: card.source,
    sourceRoute: card.sourceRoute,
    createdAt: now,
    updatedAt: now,
    activity: [
      {
        id: `${id}-opened`,
        kind: "problem_opened",
        actor: "human",
        summary: "Problem opened after explicit human confirmation.",
        at: now,
      },
      {
        id: `${id}-brief-v1`,
        kind: "brief_confirmed",
        actor: "human",
        summary: "Problem Brief version 1 confirmed.",
        at: now,
      },
    ],
  };
}
