/**
 * Genesis opportunities and funding readiness (device-local, user-created only).
 */

import {
  genesisId,
  notifyGenesisChanged,
  readGenesisList,
  writeGenesisList,
} from "@/lib/genesis/genesis-storage";
import { recordGenesisAudit } from "@/lib/genesis/genesis-audit-store";
import type { FundingReadinessStatus, OpportunityType } from "@/lib/genesis/genesis-types";

const OPPORTUNITIES_KEY = "cbai-genesis-opportunities";
const FUNDING_KEY = "cbai-genesis-funding-needs";

const memoryOpportunities: GenesisOpportunity[] = [];
const memoryFunding: GenesisFundingNeed[] = [];

export type GenesisOpportunity = {
  readonly id: string;
  readonly type: OpportunityType;
  readonly title: string;
  readonly problem: string;
  readonly organizationId?: string | null;
  readonly missionId?: string | null;
  readonly projectId?: string | null;
  readonly desiredOutcome: string;
  readonly requiredEvidence: string;
  readonly requiredCapability: string;
  readonly eligibility: string;
  readonly scope: string;
  readonly deadline?: string | null;
  readonly fundingRange?: string | null;
  readonly humanDecisionOwner: string;
  readonly visibility: "private" | "organization" | "network";
  readonly status: "Draft" | "Open" | "Closed" | "Archived";
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type GenesisFundingNeed = {
  readonly id: string;
  readonly missionId?: string | null;
  readonly projectId?: string | null;
  readonly livingResearchObjectId?: string | null;
  readonly problem: string;
  readonly evidenceStatus: string;
  readonly stage: string;
  readonly teamSummary: string;
  readonly requestedSupport: string;
  readonly intendedUse: string;
  readonly milestones: string;
  readonly risks: string;
  readonly limitations: string;
  readonly humanityImpact: string;
  readonly natureImpact: string;
  readonly conflictDisclosure: string;
  readonly readinessStatus: FundingReadinessStatus;
  readonly readinessGaps: readonly string[];
  readonly createdAt: string;
  readonly updatedAt: string;
};

function isOpportunity(v: unknown): v is GenesisOpportunity {
  const o = v as GenesisOpportunity;
  return typeof o?.id === "string" && typeof o?.title === "string";
}

function isFunding(v: unknown): v is GenesisFundingNeed {
  const f = v as GenesisFundingNeed;
  return typeof f?.id === "string" && typeof f?.problem === "string";
}

export function loadOpportunities(filters?: { missionId?: string }): GenesisOpportunity[] {
  let all = readGenesisList(OPPORTUNITIES_KEY, isOpportunity, memoryOpportunities);
  if (filters?.missionId) all = all.filter((o) => o.missionId === filters.missionId);
  return all;
}

export function createOpportunity(
  input: Omit<GenesisOpportunity, "id" | "createdAt" | "updatedAt">,
): GenesisOpportunity {
  const now = new Date().toISOString();
  const opp: GenesisOpportunity = { ...input, id: genesisId("opp"), createdAt: now, updatedAt: now };
  writeGenesisList(OPPORTUNITIES_KEY, [...readGenesisList(OPPORTUNITIES_KEY, isOpportunity, memoryOpportunities), opp], memoryOpportunities);
  recordGenesisAudit({ domain: "opportunity", action: "opportunity_published", recordType: "opportunity", recordId: opp.id, actorId: input.humanDecisionOwner, organizationId: input.organizationId, missionId: input.missionId, projectId: input.projectId, newState: input.status });
  notifyGenesisChanged();
  return opp;
}

export function loadFundingNeeds(filters?: { missionId?: string; projectId?: string }): GenesisFundingNeed[] {
  let all = readGenesisList(FUNDING_KEY, isFunding, memoryFunding);
  if (filters?.missionId) all = all.filter((f) => f.missionId === filters.missionId);
  if (filters?.projectId) all = all.filter((f) => f.projectId === filters.projectId);
  return all;
}

export function createFundingNeed(
  input: Omit<GenesisFundingNeed, "id" | "createdAt" | "updatedAt">,
): GenesisFundingNeed {
  const now = new Date().toISOString();
  const need: GenesisFundingNeed = { ...input, id: genesisId("fund"), createdAt: now, updatedAt: now };
  writeGenesisList(FUNDING_KEY, [...readGenesisList(FUNDING_KEY, isFunding, memoryFunding), need], memoryFunding);
  recordGenesisAudit({ domain: "funding", action: "funding_need_created", recordType: "funding_need", recordId: need.id, actorId: "operator", missionId: input.missionId, projectId: input.projectId, newState: input.readinessStatus });
  notifyGenesisChanged();
  return need;
}

export function deriveFundingReadinessGaps(need: Omit<GenesisFundingNeed, "id" | "createdAt" | "updatedAt" | "readinessGaps">): string[] {
  const gaps: string[] = [];
  if (!need.evidenceStatus.trim()) gaps.push("Evidence status not documented.");
  if (!need.teamSummary.trim()) gaps.push("Team summary missing.");
  if (!need.milestones.trim()) gaps.push("Milestones not defined.");
  if (!need.requestedSupport.trim()) gaps.push("Requested support not specified.");
  if (need.readinessStatus === "Evidence Incomplete" || gaps.length > 0) {
    return gaps.length > 0 ? gaps : ["Evidence incomplete for human review."];
  }
  return [];
}

export function explainOpportunityMatch(
  opportunity: GenesisOpportunity,
  context: { missionProblem?: string; capabilitySummary?: string },
): { relevant: boolean; reasons: string[]; uncertainties: string[] } {
  const reasons: string[] = [];
  const uncertainties: string[] = [];
  if (context.missionProblem && opportunity.problem) {
    const overlap = context.missionProblem.toLowerCase().split(/\s+/).filter((w) => w.length > 4 && opportunity.problem.toLowerCase().includes(w));
    if (overlap.length > 0) reasons.push(`Problem keywords overlap: ${overlap.slice(0, 3).join(", ")}`);
  }
  if (context.capabilitySummary && opportunity.requiredCapability) {
    reasons.push("Required capability field present — human confirmation needed.");
    uncertainties.push("Capability match is not verified automatically.");
  }
  if (reasons.length === 0) uncertainties.push("No automatic field match — review manually.");
  return { relevant: reasons.length > 0, reasons, uncertainties };
}
