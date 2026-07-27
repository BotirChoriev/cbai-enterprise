import type { ReplicationRecord, ReplicationRelation } from "@/lib/scientific-deliberation/types";

export type ReplicationPassportView = {
  readonly originalStudy: string;
  readonly replicationTeamInstitution: string;
  readonly location: string;
  readonly method: string;
  readonly deviations: string;
  readonly sample: string;
  readonly resultRelation: ReplicationRelation;
  readonly independentVerification: string;
  readonly limitations: string;
  readonly sourceAndVerifiedDate: string;
  readonly negativeOrInconclusive: boolean;
  readonly respectfulLanguage: true;
};

export function toReplicationPassport(record: ReplicationRecord): ReplicationPassportView {
  return {
    originalStudy: record.originalResultRef || "Unknown",
    replicationTeamInstitution: record.replicatingInstitution ?? "Unknown",
    location: record.location ?? "Unknown",
    method: record.method ?? "Unknown",
    deviations: record.deviations ?? "Unknown",
    sample: record.sample ?? "Unknown",
    resultRelation: record.relation,
    independentVerification:
      record.independentStatus === true ? "independent" : record.independentStatus === false ? "not_independent" : "Unknown",
    limitations: record.limitations ?? "Unknown",
    sourceAndVerifiedDate: `${record.sources.join("; ") || "Unknown"} · verified: ${record.verifiedDate ?? "Unknown"}`,
    negativeOrInconclusive: record.isNegativeOrInconclusive || record.relation === "inconclusive" || record.relation === "did_not_match",
    respectfulLanguage: true,
  };
}

/** Forbidden demeaning labels for negative/null results. */
export function isRespectfulNegativeResultLanguage(text: string): boolean {
  return !/failed\s+scientist|bad\s+researcher|incompetent\s+lab/i.test(text);
}
