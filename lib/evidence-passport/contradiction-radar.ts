/**
 * Contradiction Radar — surfaces known/disputed/unknown from passport collections.
 * Never invents contradictions; only reports structured passport fields.
 */

import type { EvidencePassport, KnowledgeState } from "@/lib/evidence-passport/types";

export type ContradictionRadarFinding = {
  readonly passportId: string;
  readonly claimText: string;
  readonly knowledgeState: KnowledgeState;
  readonly counterEvidenceCount: number;
  readonly replicationStatus: EvidencePassport["replicationStatus"];
  readonly humanVerificationStatus: EvidencePassport["humanVerificationStatus"];
  readonly severity: "info" | "attention" | "blocked_until_human";
  readonly detail: string;
};

export type ContradictionRadarResult = {
  readonly findings: readonly ContradictionRadarFinding[];
  readonly knownCount: number;
  readonly disputedCount: number;
  readonly unknownCount: number;
  readonly negativeResultCount: number;
  readonly honestyNotice: string;
};

export function buildContradictionRadar(
  passports: readonly EvidencePassport[],
): ContradictionRadarResult {
  const findings: ContradictionRadarFinding[] = [];
  let knownCount = 0;
  let disputedCount = 0;
  let unknownCount = 0;
  let negativeResultCount = 0;

  for (const p of passports) {
    if (p.knowledgeState === "known") knownCount += 1;
    else if (p.knowledgeState === "disputed") disputedCount += 1;
    else unknownCount += 1;
    if (p.evidenceType === "negative_result") negativeResultCount += 1;

    const hasCounters = p.counterEvidenceIds.length > 0;
    const failedReplication = p.replicationStatus === "failed_replication";
    const disputed = p.knowledgeState === "disputed" || p.stance === "challenges";

    if (!hasCounters && !failedReplication && !disputed && p.knowledgeState !== "unknown") {
      continue;
    }

    let severity: ContradictionRadarFinding["severity"] = "info";
    let detail = "Review knowledge state before operational use.";
    if (failedReplication || (hasCounters && disputed)) {
      severity = "blocked_until_human";
      detail = "Counter-evidence or failed replication requires human review before operational use.";
    } else if (disputed || p.knowledgeState === "unknown") {
      severity = "attention";
      detail = "Claim is disputed or unknown — do not treat as settled evidence.";
    }

    findings.push({
      passportId: p.passportId,
      claimText: p.claimText,
      knowledgeState: p.knowledgeState,
      counterEvidenceCount: p.counterEvidenceIds.length,
      replicationStatus: p.replicationStatus,
      humanVerificationStatus: p.humanVerificationStatus,
      severity,
      detail,
    });
  }

  return {
    findings,
    knownCount,
    disputedCount,
    unknownCount,
    negativeResultCount,
    honestyNotice:
      "Contradiction Radar only reflects Evidence Passport fields. Empty findings mean no passport conflicts are recorded — not that the world agrees.",
  };
}

/** Negative Results Library projection — filters passport type without fabricating entries. */
export function listNegativeResults(
  passports: readonly EvidencePassport[],
): readonly EvidencePassport[] {
  return passports.filter((p) => p.evidenceType === "negative_result");
}

/** Replication Passport projection. */
export function listReplicationPassports(
  passports: readonly EvidencePassport[],
): readonly EvidencePassport[] {
  return passports.filter(
    (p) =>
      p.evidenceType === "replication" ||
      p.replicationStatus === "replicated" ||
      p.replicationStatus === "failed_replication",
  );
}
