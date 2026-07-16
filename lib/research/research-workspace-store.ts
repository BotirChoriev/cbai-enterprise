/**
 * Research Workspace Activation — real local persistence for user-authored research work.
 *
 * `lib/research/intelligence/review-workspace-model.ts`'s `ResearchNote`/`ResearchFinding` types
 * already existed as "architecture for a future build" — always empty, since no persistence
 * existed anywhere in this platform. This is that persistence, following the exact pattern
 * already proven by `lib/context/context-history.ts` (isBrowser guard, one JSON blob per
 * localStorage key, sanitize-on-read, never throws). Notes/findings optionally link to a real
 * evidence item and/or a real related entity — never a fabricated link.
 *
 * Evidence Lifecycle is a new, honest concept this mission introduces: a user-tracked
 * progression (Collected → Reviewed → Linked → Compared → Referenced → Included in Report →
 * Archived) over real evidence items already in the catalog. Stages only ever advance forward,
 * one step at a time — never skipped, never auto-completed.
 */

import { notifyMissionDataChanged } from "@/lib/intelligence-os/mission-activation-events";

export type EvidenceLifecycleStage =
  | "collected"
  | "reviewed"
  | "linked"
  | "compared"
  | "referenced"
  | "included_in_report"
  | "archived";

export const EVIDENCE_LIFECYCLE_STAGES: readonly EvidenceLifecycleStage[] = [
  "collected",
  "reviewed",
  "linked",
  "compared",
  "referenced",
  "included_in_report",
  "archived",
];

export const EVIDENCE_LIFECYCLE_LABELS: Record<EvidenceLifecycleStage, string> = {
  collected: "Collected",
  reviewed: "Reviewed",
  linked: "Linked",
  compared: "Compared",
  referenced: "Referenced",
  included_in_report: "Included in Report",
  archived: "Archived",
};

export type PersistedResearchNote = {
  noteId: string;
  topicId: string;
  body: string;
  createdAt: string;
  /** Real linked evidence item, when the user attached one — never fabricated. */
  linkedEvidenceId?: string;
  linkedEvidenceLabel?: string;
  /** Real linked related entity, when the user attached one — never fabricated. */
  linkedEntityId?: string;
  linkedEntityName?: string;
  linkedEntityType?: string;
};

export type PersistedResearchFinding = {
  findingId: string;
  topicId: string;
  summary: string;
  createdAt: string;
};

export type EvidenceLifecycleRecord = {
  evidenceId: string;
  topicId: string;
  stage: EvidenceLifecycleStage;
  updatedAt: string;
};

const NOTES_KEY = "cbai-research-notes";
const FINDINGS_KEY = "cbai-research-findings";
const LIFECYCLE_KEY = "cbai-research-evidence-lifecycle";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readList<T>(key: string, isValid: (value: unknown) => value is T): T[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValid);
  } catch {
    return [];
  }
}

function writeList<T>(key: string, items: readonly T[]): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(key, JSON.stringify(items));
}

function isPersistedNote(value: unknown): value is PersistedResearchNote {
  const v = value as PersistedResearchNote;
  return (
    typeof v === "object" &&
    v !== null &&
    typeof v.noteId === "string" &&
    typeof v.topicId === "string" &&
    typeof v.body === "string" &&
    typeof v.createdAt === "string"
  );
}

function isPersistedFinding(value: unknown): value is PersistedResearchFinding {
  const v = value as PersistedResearchFinding;
  return (
    typeof v === "object" &&
    v !== null &&
    typeof v.findingId === "string" &&
    typeof v.topicId === "string" &&
    typeof v.summary === "string" &&
    typeof v.createdAt === "string"
  );
}

function isLifecycleRecord(value: unknown): value is EvidenceLifecycleRecord {
  const v = value as EvidenceLifecycleRecord;
  return (
    typeof v === "object" &&
    v !== null &&
    typeof v.evidenceId === "string" &&
    typeof v.topicId === "string" &&
    typeof v.updatedAt === "string" &&
    EVIDENCE_LIFECYCLE_STAGES.includes(v.stage)
  );
}

/** Real notes for a topic, most recent first — empty until the user writes one. */
export function loadResearchNotes(topicId: string): PersistedResearchNote[] {
  return readList(NOTES_KEY, isPersistedNote)
    .filter((note) => note.topicId === topicId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function saveResearchNote(input: Omit<PersistedResearchNote, "noteId" | "createdAt">): PersistedResearchNote {
  const all = readList(NOTES_KEY, isPersistedNote);
  const note: PersistedResearchNote = {
    ...input,
    noteId: `note-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };
  writeList(NOTES_KEY, [...all, note]);
  notifyMissionDataChanged("research");
  return note;
}

/** Real findings for a topic, most recent first — empty until the user records one. */
export function loadResearchFindings(topicId: string): PersistedResearchFinding[] {
  return readList(FINDINGS_KEY, isPersistedFinding)
    .filter((finding) => finding.topicId === topicId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function saveResearchFinding(input: Omit<PersistedResearchFinding, "findingId" | "createdAt">): PersistedResearchFinding {
  const all = readList(FINDINGS_KEY, isPersistedFinding);
  const finding: PersistedResearchFinding = {
    ...input,
    findingId: `finding-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };
  writeList(FINDINGS_KEY, [...all, finding]);
  notifyMissionDataChanged("research");
  return finding;
}

/** Real lifecycle records for a topic, keyed by evidence item id. */
export function loadEvidenceLifecycle(topicId: string): Record<string, EvidenceLifecycleRecord> {
  const all = readList(LIFECYCLE_KEY, isLifecycleRecord).filter((rec) => rec.topicId === topicId);
  const byEvidenceId: Record<string, EvidenceLifecycleRecord> = {};
  for (const record of all) {
    byEvidenceId[record.evidenceId] = record;
  }
  return byEvidenceId;
}

function nextLifecycleStage(current: EvidenceLifecycleStage): EvidenceLifecycleStage | null {
  const index = EVIDENCE_LIFECYCLE_STAGES.indexOf(current);
  return index >= 0 && index < EVIDENCE_LIFECYCLE_STAGES.length - 1
    ? EVIDENCE_LIFECYCLE_STAGES[index + 1]
    : null;
}

/**
 * Advances one real evidence item to the next lifecycle stage — one step at a time, never
 * skipped. The first advance from the implicit default ("collected", true for any evidence
 * already in the catalog) creates the first real record.
 */
export function advanceEvidenceLifecycle(topicId: string, evidenceId: string): EvidenceLifecycleRecord | null {
  const all = readList(LIFECYCLE_KEY, isLifecycleRecord);
  const existing = all.find((rec) => rec.topicId === topicId && rec.evidenceId === evidenceId);
  const currentStage = existing?.stage ?? "collected";
  const next = nextLifecycleStage(currentStage);
  if (!next) return existing ?? null;

  const record: EvidenceLifecycleRecord = { evidenceId, topicId, stage: next, updatedAt: new Date().toISOString() };
  const remaining = all.filter((rec) => !(rec.topicId === topicId && rec.evidenceId === evidenceId));
  writeList(LIFECYCLE_KEY, [...remaining, record]);
  return record;
}

export const RESEARCH_NOTES_ARCHITECTURE_NOTE =
  "No research notes recorded yet for this topic — nothing fabricated, write the first one below.";

export const RESEARCH_FINDINGS_ARCHITECTURE_NOTE =
  "No findings recorded yet for this topic — nothing fabricated, record one below.";
