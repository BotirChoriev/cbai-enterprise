/**
 * EPIC-06 — Evidence Runtime.
 * Derives provenance, freshness, conflicts, reliability, and consensus from real project data.
 */

import { compareEvidence, traceEvidence } from "@/lib/evidence/evidence-query";
import { validateEvidenceRecord } from "@/lib/evidence/evidence-validation";
import type { Mission } from "@/lib/intelligence-os/mission.types";
import { loadProjectEvidence, loadProjects } from "@/lib/project/project-store";
import { projectRefToEvidence } from "@/lib/evidence-runtime/project-evidence-adapter";
import type {
  EvidenceFreshnessCategory,
  EvidenceHeatmapCell,
  EvidenceRuntimeRecord,
  EvidenceRuntimeSnapshot,
} from "@/lib/evidence-runtime/types";
import type { EvidenceReliability } from "@/lib/foundation/evidence-types";

const OUTDATED_MS = 365 * 24 * 60 * 60 * 1000;
const AGING_MS = 90 * 24 * 60 * 60 * 1000;

function resolveProjectId(mission: Mission | null, projectId?: string): string | null {
  if (projectId) return projectId;
  if (!mission?.projectId) return null;
  return mission.projectId;
}

function categorizeFreshness(createdAt: string): EvidenceFreshnessCategory {
  const age = Date.now() - new Date(createdAt).getTime();
  if (Number.isNaN(age)) return "unknown";
  if (age > OUTDATED_MS) return "outdated";
  if (age > AGING_MS) return "aging";
  return "fresh";
}

function normalizeTitle(title: string): string {
  return title.trim().toLowerCase();
}

function detectConflicts(records: readonly EvidenceRuntimeRecord[]) {
  const conflicts: ReturnType<typeof compareEvidence>[] = [];
  const byTitle = new Map<string, EvidenceRuntimeRecord[]>();

  for (const record of records) {
    const key = normalizeTitle(record.evidence.label);
    if (!key) continue;
    const list = byTitle.get(key) ?? [];
    list.push(record);
    byTitle.set(key, list);
  }

  for (const group of byTitle.values()) {
    if (group.length < 2) continue;
    const urls = new Set(
      group
        .map((r) => r.evidence.originalSource?.trim())
        .filter((u): u is string => Boolean(u)),
    );
    if (urls.size > 1) {
      for (let i = 0; i < group.length; i++) {
        for (let j = i + 1; j < group.length; j++) {
          conflicts.push({
            left: group[i].evidence.evidenceId,
            right: group[j].evidence.evidenceId,
            relation: "conflicts",
          });
        }
      }
    }
  }

  for (let i = 0; i < records.length; i++) {
    for (let j = i + 1; j < records.length; j++) {
      const cmp = compareEvidence(records[i].evidence, records[j].evidence);
      if (cmp.relation === "conflicts") conflicts.push(cmp);
    }
  }

  const seen = new Set<string>();
  return conflicts.filter((c) => {
    const key = [c.left, c.right].sort().join(":");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function emptyReliabilityCounts(): Record<EvidenceReliability, number> {
  return { unknown: 0, low: 0, moderate: 0, high: 0 };
}

function emptyFreshnessCounts(): Record<EvidenceFreshnessCategory, number> {
  return { fresh: 0, aging: 0, outdated: 0, unknown: 0 };
}

export function deriveEvidenceRuntime(
  mission: Mission | null,
  projectId?: string,
): EvidenceRuntimeSnapshot {
  const resolvedProjectId = resolveProjectId(mission, projectId);
  if (!resolvedProjectId) {
    return {
      projectId: null,
      records: [],
      conflicts: [],
      missingKnowledge: mission?.evidenceMissing?.trim() ? [mission.evidenceMissing] : [],
      freshnessCounts: emptyFreshnessCounts(),
      reliabilityCounts: emptyReliabilityCounts(),
      humanValidationPending: 0,
      humanValidationPartial: 0,
      machineValidationConnected: false,
      consensus: "none",
      limitation: "No project linked — evidence runtime inactive.",
    };
  }

  const refs = loadProjectEvidence(resolvedProjectId);
  const records: EvidenceRuntimeRecord[] = refs.map((ref) => {
    const evidence = projectRefToEvidence(ref, { missionId: mission?.id });
    validateEvidenceRecord(evidence);
    return {
      evidence,
      trace: traceEvidence(evidence),
      freshness: categorizeFreshness(ref.createdAt),
      projectRefId: ref.evidenceRefId,
      projectId: ref.projectId,
    };
  });

  const conflicts = detectConflicts(records);
  const missingKnowledge: string[] = [];
  if (mission?.evidenceMissing?.trim()) missingKnowledge.push(mission.evidenceMissing);
  for (const r of records) {
    if (!r.evidence.originalSource?.trim()) {
      missingKnowledge.push(`Source URL missing for "${r.evidence.label}".`);
    }
  }

  const freshnessCounts = emptyFreshnessCounts();
  const reliabilityCounts = emptyReliabilityCounts();
  let humanValidationPending = 0;
  let humanValidationPartial = 0;

  for (const r of records) {
    freshnessCounts[r.freshness] += 1;
    const rel = r.evidence.reliability ?? "unknown";
    reliabilityCounts[rel] += 1;
    if (!r.evidence.originalSource?.trim()) humanValidationPending += 1;
    else if (r.evidence.verificationStatus === "verification_pending") humanValidationPartial += 1;
  }

  let consensus: EvidenceRuntimeSnapshot["consensus"] = "none";
  if (records.length === 0) consensus = "none";
  else if (conflicts.length > 0) consensus = "conflicted";
  else if (humanValidationPending > 0) consensus = "partial";
  else if (humanValidationPartial === records.length) consensus = "partial";
  else consensus = "aligned";

  return {
    projectId: resolvedProjectId,
    records,
    conflicts,
    missingKnowledge,
    freshnessCounts,
    reliabilityCounts,
    humanValidationPending,
    humanValidationPartial,
    machineValidationConnected: false,
    consensus,
    limitation: "Device-local references — live machine verification not connected.",
  };
}

export function deriveEvidenceHeatmap(snapshot: EvidenceRuntimeSnapshot): readonly EvidenceHeatmapCell[] {
  return [
    {
      category: "linked",
      count: snapshot.records.length,
      meaning: "Evidence references stored for this project.",
    },
    {
      category: "verified_pending",
      count: snapshot.humanValidationPartial,
      meaning: "References with source URLs awaiting human review.",
    },
    {
      category: "unverified",
      count: snapshot.humanValidationPending,
      meaning: "References without source URLs.",
    },
    {
      category: "conflicts",
      count: snapshot.conflicts.length,
      meaning: "Declared or detected conflicting pairs.",
    },
    {
      category: "outdated",
      count: snapshot.freshnessCounts.outdated,
      meaning: "References older than one year — review recommended.",
    },
  ];
}

export function deriveEvidenceRuntimeForProject(projectId: string): EvidenceRuntimeSnapshot {
  const project = loadProjects().find((p) => p.id === projectId);
  return deriveEvidenceRuntime(null, projectId ?? project?.id);
}
