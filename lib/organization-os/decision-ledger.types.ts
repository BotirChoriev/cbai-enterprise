/**
 * EPIC-05 — Decision Ledger: preserve reasoning, never lose important decisions.
 */

export type DecisionLedgerEntry = {
  readonly id: string;
  readonly missionId: string;
  readonly decision: string;
  readonly evidenceRefs: readonly string[];
  readonly alternatives: readonly string[];
  readonly reason: string;
  readonly participantRefs: readonly string[];
  readonly humanReviewer: string | null;
  readonly impactSummary: string | null;
  readonly reviewDate: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type DecisionLedgerSnapshot = {
  readonly entries: readonly DecisionLedgerEntry[];
  readonly backlogCount: number;
  readonly limitation: string;
  readonly cloudPersisted: false;
};

export function emptyDecisionLedger(): DecisionLedgerSnapshot {
  return {
    entries: [],
    backlogCount: 0,
    limitation: "Decision ledger store is architecture-only — no team decisions persisted yet.",
    cloudPersisted: false,
  };
}
