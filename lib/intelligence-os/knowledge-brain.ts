/**
 * Knowledge Brain — resolves Universal Object contracts into explainability buckets.
 * Categorical trust only — no fabricated confidence scores.
 */

import { deriveEvidenceRuntime } from "@/lib/evidence-runtime/evidence-runtime";
import { derivePrimaryEvidenceStates } from "@/lib/intelligence-os/evidence-primary-states";
import { deriveEvidenceValidationIssues } from "@/lib/intelligence-os/evidence-object-helpers";
import { deriveFirstMinuteAction } from "@/lib/intelligence-os/first-minute";
import type { Mission } from "@/lib/intelligence-os/mission.types";
import {
  resolveUniversalObject,
  type UniversalObjectRef,
} from "@/lib/intelligence-os/universal-object";
import type { KnowledgeExplanation, KnowledgePrimaryBucket } from "@/lib/intelligence-os/knowledge-brain.types";

function emptyPrimary(): Record<KnowledgePrimaryBucket, string[]> {
  return { known: [], unknown: [], conflict: [], needs_review: [] };
}

export function resolveKnowledgeExplanation(
  ref: UniversalObjectRef | null,
  mission: Mission | null,
): KnowledgeExplanation {
  if (!ref) {
    return resolveMissionKnowledgeExplanation(mission);
  }

  const contract = resolveUniversalObject(ref, mission);
  if (!contract) {
    return resolveMissionKnowledgeExplanation(mission);
  }

  const primary = emptyPrimary();
  if (contract.evidenceSummary) {
    primary.known.push(contract.evidenceSummary);
  }
  primary.unknown.push(...contract.unknowns);
  if (contract.trustState?.toLowerCase().includes("conflict")) {
    primary.conflict.push(contract.trustState);
  }
  if (contract.requiresHumanJudgment) {
    primary.needs_review.push(contract.limitations ?? "Human review required");
  }

  const suggested = contract.actions[0]
    ? {
        label: contract.actions[0].label,
        labelKey: contract.actions[0].labelKey,
        href: contract.actions[0].href,
      }
    : null;

  return {
    ref,
    whatIsThis: contract.identity,
    whyItMatters: contract.purpose,
    missionRelevance: contract.missionRelation,
    primary,
    howWeKnow: contract.layers.evidence ?? contract.evidenceSummary,
    provenance: contract.layers.summary ?? null,
    freshness: contract.layers.history ?? null,
    supportingEvidence: contract.evidenceSummary ? [contract.evidenceSummary] : [],
    contradictingEvidence: contract.unknowns.filter((u) => u.toLowerCase().includes("conflict")),
    missingEvidence: contract.unknowns,
    relatedQuestions: contract.unknowns,
    limitations: contract.limitations,
    humanReviewRequired: contract.requiresHumanJudgment,
    suggestedAction: suggested,
    sources: [],
  };
}

/** Mission-scoped knowledge view for /knowledge and home when no object is focused. */
export function resolveMissionKnowledgeExplanation(mission: Mission | null): KnowledgeExplanation {
  const primary = emptyPrimary();
  const runtime = deriveEvidenceRuntime(mission);
  const stateRows = derivePrimaryEvidenceStates(mission);

  for (const row of stateRows) {
    if (row.count === 0) continue;
    const line = `${row.count}`;
    primary[row.state].push(line);
  }

  for (const record of runtime.records) {
    const issues = deriveEvidenceValidationIssues(record);
    if (issues.length > 0) {
      primary.needs_review.push(...issues);
    } else {
      primary.known.push(record.evidence.label);
    }
  }

  primary.unknown.push(...runtime.missingKnowledge);
  for (const conflict of runtime.conflicts) {
    primary.conflict.push(`${conflict.left} ↔ ${conflict.right}`);
  }

  const next = deriveFirstMinuteAction(mission);

  return {
    ref: mission ? { type: "mission", id: mission.id } : null,
    whatIsThis: mission?.problem ?? null,
    whyItMatters: mission?.whyExists ?? null,
    missionRelevance: mission ? "active-mission" : null,
    primary,
    howWeKnow: runtime.records.length > 0 ? `${runtime.records.length} linked reference(s)` : null,
    provenance: null,
    freshness: runtime.limitation,
    supportingEvidence: runtime.records.map((r) => r.evidence.label),
    contradictingEvidence: runtime.conflicts.map((c) => `${c.left} vs ${c.right}`),
    missingEvidence: [...runtime.missingKnowledge],
    relatedQuestions: mission?.evidenceMissing ? [mission.evidenceMissing] : [],
    limitations: runtime.limitation,
    humanReviewRequired: runtime.humanValidationPending > 0 || runtime.conflicts.length > 0,
    suggestedAction: mission ? { label: next.label, href: next.href } : null,
    sources: [],
  };
}
