"use client";

import { useState } from "react";
import type { TopicEvidenceCatalogItem } from "@/lib/research/evidence/evidence-topic-builder";
import {
  loadEvidenceLifecycle,
  advanceEvidenceLifecycle,
  EVIDENCE_LIFECYCLE_STAGES,
  EVIDENCE_LIFECYCLE_LABELS,
  type EvidenceLifecycleStage,
} from "@/lib/research/research-workspace-store";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type EvidenceLifecyclePanelProps = {
  topicId: string;
  evidenceItems: readonly TopicEvidenceCatalogItem[];
};

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
              ? "border-cyan-500/20 bg-cyan-500/10 text-cyan-400"
              : index === currentIndex
                ? "border-cyan-500/40 bg-cyan-500/15 text-cyan-300"
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
  const [records, setRecords] = useState(() => loadEvidenceLifecycle(topicId));

  function handleAdvance(evidenceId: string) {
    const updated = advanceEvidenceLifecycle(topicId, evidenceId);
    if (updated) {
      setRecords((current) => ({ ...current, [evidenceId]: updated }));
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
                {!isFinal ? (
                  <button
                    type="button"
                    onClick={() => handleAdvance(item.evidenceItemId)}
                    className="shrink-0 rounded-md border border-zinc-700 bg-zinc-900 px-2.5 py-1 text-[11px] font-medium text-cyan-400 hover:border-zinc-600"
                  >
                    Mark as {EVIDENCE_LIFECYCLE_LABELS[EVIDENCE_LIFECYCLE_STAGES[EVIDENCE_LIFECYCLE_STAGES.indexOf(stage) + 1]]}
                  </button>
                ) : null}
              </div>
              <StageTrack stage={stage} />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
