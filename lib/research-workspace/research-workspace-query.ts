import type { ResearchWorkspaceContract } from "@/lib/research-workspace/research-workspace-contract";

/**
 * Deterministic boolean/derived readers over a ResearchWorkspaceContract — so a future React
 * component asks these questions instead of inspecting array lengths or field presence itself,
 * the same discipline lib/workspace/workspace-query.ts (EPIC-09) already established. Every
 * function here is a trivial, honest read of data the Builder already composed; nothing is
 * inferred, scored, or fabricated.
 */

export function hasOpenHypotheses(contract: ResearchWorkspaceContract): boolean {
  return contract.openHypotheses.hypotheses.length > 0;
}

export function hasResearchFindings(contract: ResearchWorkspaceContract): boolean {
  return contract.researchFindings.findings.length > 0;
}

export function hasFundingOpportunities(contract: ResearchWorkspaceContract): boolean {
  return (
    contract.fundingOpportunities.opportunities.length > 0 ||
    contract.fundingOpportunities.grants.length > 0
  );
}

export function hasPotentialCollaborators(contract: ResearchWorkspaceContract): boolean {
  return contract.potentialCollaborators.candidates.length > 0;
}

export function hasOpenRisks(contract: ResearchWorkspaceContract): boolean {
  return contract.openRisks.risks.length > 0;
}

export function hasResearchTeam(contract: ResearchWorkspaceContract): boolean {
  return contract.researchTeam.team.length > 0;
}

/** A real, countable total across every "Related X" artifact section — never a derived score. */
export function countRelatedArtifacts(contract: ResearchWorkspaceContract): number {
  return (
    contract.relatedPublications.publications.length +
    contract.relatedPatents.patents.length +
    contract.relatedDatasets.datasets.length +
    contract.relatedTechnologies.technologies.length
  );
}
