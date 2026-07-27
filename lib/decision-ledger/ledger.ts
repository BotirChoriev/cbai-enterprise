/**
 * Human Decision Ledger — records explicit human decisions without rewriting history.
 */

export type HumanDecisionRecord = {
  readonly id: string;
  readonly subjectLabel: string;
  readonly decisionSummary: string;
  readonly optionsConsidered: readonly string[];
  readonly chosenOption: string | null;
  readonly declinedAutomation: true;
  readonly provenanceGraphId: string | null;
  readonly passportIds: readonly string[];
  readonly contentLocale: string;
  readonly decidedAt: string;
  readonly outcomeObservedAt: string | null;
  readonly outcomeSummary: string | null;
  /** Historical predictions must never be rewritten after outcomes arrive. */
  readonly forecastSnapshotImmutable: true;
};

const memory: HumanDecisionRecord[] = [];

export function recordHumanDecision(input: {
  readonly subjectLabel: string;
  readonly decisionSummary: string;
  readonly optionsConsidered: readonly string[];
  readonly chosenOption?: string | null;
  readonly provenanceGraphId?: string | null;
  readonly passportIds?: readonly string[];
  readonly contentLocale?: string;
  readonly confirmRecord: true;
}): HumanDecisionRecord {
  if (input.confirmRecord !== true) {
    throw new Error("human_decision_requires_confirmation");
  }
  const record: HumanDecisionRecord = {
    id: `hdl-${Date.now().toString(36)}`,
    subjectLabel: input.subjectLabel.trim(),
    decisionSummary: input.decisionSummary.trim(),
    optionsConsidered: [...input.optionsConsidered],
    chosenOption: input.chosenOption ?? null,
    declinedAutomation: true,
    provenanceGraphId: input.provenanceGraphId ?? null,
    passportIds: [...(input.passportIds ?? [])],
    contentLocale: input.contentLocale ?? "en",
    decidedAt: new Date().toISOString(),
    outcomeObservedAt: null,
    outcomeSummary: null,
    forecastSnapshotImmutable: true,
  };
  memory.unshift(record);
  return record;
}

export function attachOutcomeWithoutRewritingForecast(
  decisionId: string,
  outcomeSummary: string,
): HumanDecisionRecord | null {
  const idx = memory.findIndex((r) => r.id === decisionId);
  if (idx < 0) return null;
  const current = memory[idx];
  const next: HumanDecisionRecord = {
    ...current,
    outcomeObservedAt: new Date().toISOString(),
    outcomeSummary: outcomeSummary.trim(),
    forecastSnapshotImmutable: true,
  };
  memory[idx] = next;
  return next;
}

export function listHumanDecisions(): readonly HumanDecisionRecord[] {
  return [...memory];
}

export function resetHumanDecisionLedgerForTests(): void {
  memory.length = 0;
}
