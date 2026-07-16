"use client";

import { useSyncExternalStore } from "react";
import type { TopicEvidenceCatalogItem } from "@/lib/research/evidence/evidence-topic-builder";
import {
  loadEvidenceLifecycle,
  advanceEvidenceLifecycle,
  EVIDENCE_LIFECYCLE_STAGES,
  EVIDENCE_LIFECYCLE_LABELS,
  type EvidenceLifecycleStage,
  type EvidenceLifecycleRecord,
} from "@/lib/research/research-workspace-store";
import { toEvidenceEntityRef } from "@/lib/research/evidence/evidence-bookmark";
import SaveToWorkspaceButton from "@/components/shared/SaveToWorkspaceButton";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type EvidenceLifecyclePanelProps = {
  topicId: string;
  evidenceItems: readonly TopicEvidenceCatalogItem[];
};

// Real hydration-mismatch fix (found via actual browser testing): mirrors the same
// useSyncExternalStore + cached-snapshot pattern already proven elsewhere in this app
// (AssistantProfileProvider, EntryExperience) — loadEvidenceLifecycle() is honestly empty on the
// server, so the plain useState(() => loadEvidenceLifecycle(topicId)) this used to be produced a
// real structural mismatch (the "Mark as X" button present/absent) for any topic where the user
// had actually advanced a stage. A per-topicId cache keeps getSnapshot's return value referentially
// stable between calls (required by useSyncExternalStore itself) until a real advance invalidates it.
const EMPTY_RECORDS: Record<string, EvidenceLifecycleRecord> = {};
const snapshotCache = new Map<string, Record<string, EvidenceLifecycleRecord>>();
const listeners = new Set<() => void>();

function getSnapshot(topicId: string): Record<string, EvidenceLifecycleRecord> {
  if (!snapshotCache.has(topicId)) {
    snapshotCache.set(topicId, loadEvidenceLifecycle(topicId));
  }
  return snapshotCache.get(topicId)!;
}

function getServerSnapshot(): Record<string, EvidenceLifecycleRecord> {
  return EMPTY_RECORDS;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function commitAdvance(topicId: string, evidenceId: string, updated: EvidenceLifecycleRecord): void {
  const current = getSnapshot(topicId);
  snapshotCache.set(topicId, { ...current, [evidenceId]: updated });
  listeners.forEach((listener) => listener());
}

function StageTrack({ stage }: { stage: EvidenceLifecycleStage }) {
  const currentIndex = EVIDENCE_LIFECYCLE_STAGES.indexOf(stage);
  return (
    <div className="flex flex-wrap items-center gap-1">
      {EVIDENCE_LIFECYCLE_STAGES.map((s, index) => (
        <span
          key={s}
          title={EVIDENCE_LIFECYCLE_LABELS[s]}
          className={`rounded-full border px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider ${
            index < currentIndex
              ? "border-teal-500/20 bg-teal-500/10 text-teal-400"
              : index === currentIndex
                ? "border-teal-500/40 bg-teal-500/15 text-teal-300"
                : "border-zinc-800 bg-zinc-900/40 text-zinc-600"
          }`}
        >
          {EVIDENCE_LIFECYCLE_LABELS[s]}
        </span>
      ))}
    </div>
  );
}

/**
 * Real, user-tracked Evidence Lifecycle (Collected → Reviewed → Linked → Compared → Referenced →
 * Included in Report → Archived) over real evidence items already in the catalog. Every item
 * starts honestly at "Collected" (true of anything in the catalog) with no persisted record;
 * stages only ever advance forward one step at a time — never skipped, never auto-completed.
 */
export default function EvidenceLifecyclePanel({ topicId, evidenceItems }: EvidenceLifecyclePanelProps) {
  const records = useSyncExternalStore(subscribe, () => getSnapshot(topicId), getServerSnapshot);

  function handleAdvance(evidenceId: string) {
    const updated = advanceEvidenceLifecycle(topicId, evidenceId);
    if (updated) {
      commitAdvance(topicId, evidenceId, updated);
    }
  }

  if (evidenceItems.length === 0) {
    return (
      <section aria-labelledby="evidence-lifecycle-heading" className="space-y-2">
        <p className={cbaiSectionEyebrow} id="evidence-lifecycle-heading">
          Evidence Lifecycle
        </p>
        <p className="text-sm text-zinc-500">No evidence catalogued for this topic yet.</p>
      </section>
    );
  }

  return (
    <section aria-labelledby="evidence-lifecycle-heading" className="space-y-3">
      <div>
        <p className={cbaiSectionEyebrow} id="evidence-lifecycle-heading">
          Evidence Lifecycle
        </p>
        <p className="mt-1 text-xs text-zinc-600">
          Collected → Reviewed → Linked → Compared → Referenced → Included in Report → Archived.
          Advances one stage at a time — never marked complete automatically.
        </p>
      </div>
      <ul className="space-y-2">
        {evidenceItems.map((item) => {
          const stage = records[item.evidenceItemId]?.stage ?? "collected";
          const isFinal = stage === "archived";
          return (
            <li key={item.evidenceItemId} className={`${cbaiGlassCard} space-y-2 p-3`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm text-zinc-200">{item.label}</p>
                <div className="flex shrink-0 items-center gap-2">
                  <SaveToWorkspaceButton entity={toEvidenceEntityRef(item)} className="!px-2.5 !py-1 !text-[11px]" />
                  {!isFinal ? (
                    <button
                      type="button"
                      onClick={() => handleAdvance(item.evidenceItemId)}
                      className="shrink-0 rounded-md border border-zinc-700 bg-zinc-900 px-2.5 py-1 text-[11px] font-medium text-teal-400 hover:border-zinc-600"
                    >
                      Mark as {EVIDENCE_LIFECYCLE_LABELS[EVIDENCE_LIFECYCLE_STAGES[EVIDENCE_LIFECYCLE_STAGES.indexOf(stage) + 1]]}
                    </button>
                  ) : null}
                </div>
              </div>
              <StageTrack stage={stage} />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
