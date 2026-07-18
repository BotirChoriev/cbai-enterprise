/**
 * Explainable research connections among records already in CBAI — never claim global completeness.
 */

import { loadLivingResearchObjects, loadResearchResults } from "@/lib/genesis/living-research-object-store";
import { loadCapabilityRecords } from "@/lib/genesis/capability-records-store";
import { loadOpportunities } from "@/lib/genesis/opportunity-store";
import { loadOutcomes } from "@/lib/genesis/outcome-store";
import type { LivingResearchObject } from "@/lib/genesis/living-research-object-store";

export type ResearchMatchKind =
  | "research_object"
  | "research_topic"
  | "evidence"
  | "method"
  | "opportunity"
  | "capability"
  | "outcome";

export type ExplainableResearchMatch = {
  readonly id: string;
  readonly kind: ResearchMatchKind;
  readonly recordId: string;
  readonly label: string;
  readonly whyRelevant: string;
  readonly matchedFields: readonly string[];
  readonly supportingEvidence: readonly string[];
  readonly uncertainties: readonly string[];
  readonly requiresHumanConfirmation: boolean;
  readonly scopeDisclaimer: string;
};

const SCOPE_DISCLAIMER = "Connected records available in CBAI.";

function tokenOverlap(a: string, b: string): string[] {
  const wordsA = a.toLowerCase().split(/\W+/).filter((w) => w.length > 4);
  const wordsB = new Set(b.toLowerCase().split(/\W+/).filter((w) => w.length > 4));
  return wordsA.filter((w) => wordsB.has(w)).slice(0, 5);
}

export function findResearchConnections(input: {
  researchObjectId?: string;
  missionId?: string;
  projectId?: string;
  query?: string;
}): ExplainableResearchMatch[] {
  const matches: ExplainableResearchMatch[] = [];
  const objects = loadLivingResearchObjects();
  const focus = input.researchObjectId
    ? objects.find((o) => o.id === input.researchObjectId)
    : objects.find((o) => o.missionId === input.missionId || o.projectId === input.projectId);

  const focusText = [
    input.query ?? "",
    focus?.researchQuestion ?? "",
    focus?.domain ?? "",
    focus?.methods ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  for (const other of objects) {
    if (focus && other.id === focus.id) continue;
    const overlap = tokenOverlap(focusText || other.researchQuestion, other.researchQuestion);
    if (overlap.length === 0 && focus?.domain !== other.domain) continue;
    matches.push({
      id: `ro-${other.id}`,
      kind: "research_object",
      recordId: other.id,
      label: other.title,
      whyRelevant: overlap.length > 0 ? `Shared question/domain tokens: ${overlap.join(", ")}` : `Same domain: ${other.domain}`,
      matchedFields: overlap.length > 0 ? ["researchQuestion", "domain"] : ["domain"],
      supportingEvidence: other.evidenceRefs.map((e) => e.label),
      uncertainties: ["External literature may not be connected."],
      requiresHumanConfirmation: true,
      scopeDisclaimer: SCOPE_DISCLAIMER,
    });
  }

  if (focus) {
    const results = loadResearchResults(focus.id);
    for (const r of results) {
      if (r.status === "Negative Result" || r.status === "Inconclusive") {
        matches.push({
          id: `result-${r.id}`,
          kind: "evidence",
          recordId: r.id,
          label: `${r.status}: ${r.summary.slice(0, 60)}`,
          whyRelevant: "Preserved negative or inconclusive result related to this object.",
          matchedFields: ["status", "summary"],
          supportingEvidence: r.source ? [r.source] : [],
          uncertainties: ["Replication status may be unknown."],
          requiresHumanConfirmation: true,
          scopeDisclaimer: SCOPE_DISCLAIMER,
        });
      }
    }
  }

  for (const cap of loadCapabilityRecords()) {
    const overlap = tokenOverlap(focusText, `${cap.label} ${cap.methodsUsed}`);
    if (overlap.length === 0) continue;
    matches.push({
      id: `cap-${cap.id}`,
      kind: "capability",
      recordId: cap.id,
      label: cap.label,
      whyRelevant: `Method/skill overlap: ${overlap.join(", ")}`,
      matchedFields: ["methodsUsed", "label"],
      supportingEvidence: cap.evidenceRefs.map((e) => e.label),
      uncertainties: ["Verification is not automatic."],
      requiresHumanConfirmation: true,
      scopeDisclaimer: SCOPE_DISCLAIMER,
    });
  }

  for (const opp of loadOpportunities({ missionId: input.missionId })) {
    const overlap = tokenOverlap(focusText || opp.problem, opp.problem);
    if (overlap.length === 0) continue;
    matches.push({
      id: `opp-${opp.id}`,
      kind: "opportunity",
      recordId: opp.id,
      label: opp.title,
      whyRelevant: `Problem overlap: ${overlap.join(", ")}`,
      matchedFields: ["problem", "requiredCapability"],
      supportingEvidence: [],
      uncertainties: ["Funding or selection is not guaranteed."],
      requiresHumanConfirmation: true,
      scopeDisclaimer: SCOPE_DISCLAIMER,
    });
  }

  for (const outcome of loadOutcomes({ missionId: input.missionId, projectId: input.projectId })) {
    const overlap = tokenOverlap(focusText, `${outcome.title} ${outcome.outcomeDescription}`);
    if (overlap.length === 0) continue;
    matches.push({
      id: `out-${outcome.id}`,
      kind: "outcome",
      recordId: outcome.id,
      label: outcome.title,
      whyRelevant: `Outcome text overlap: ${overlap.join(", ")}`,
      matchedFields: ["outcomeDescription", "outputDescription"],
      supportingEvidence: outcome.evidenceRefs.map((e) => e.label),
      uncertainties: ["Output does not automatically prove outcome."],
      requiresHumanConfirmation: true,
      scopeDisclaimer: SCOPE_DISCLAIMER,
    });
  }

  return matches.slice(0, 12);
}

export function explainContradictoryResults(objectId: string): ExplainableResearchMatch[] {
  const results = loadResearchResults(objectId);
  const contradictory = results.filter(
    (r) => r.status === "Contradictory Result" || r.status === "Negative Result",
  );
  return contradictory.map((r) => ({
    id: `contra-${r.id}`,
    kind: "evidence" as const,
    recordId: r.id,
    label: r.summary.slice(0, 80),
    whyRelevant: `${r.status} preserved — not hidden as failure.`,
    matchedFields: ["status", "method"],
    supportingEvidence: r.source ? [r.source] : [],
    uncertainties: [r.limitation || "Limitation not documented."],
    requiresHumanConfirmation: true,
    scopeDisclaimer: SCOPE_DISCLAIMER,
  }));
}

export function researchObjectSummary(object: LivingResearchObject): string {
  return `${object.title} — ${object.domain} — ${object.researchQuestion.slice(0, 120)}`;
}
