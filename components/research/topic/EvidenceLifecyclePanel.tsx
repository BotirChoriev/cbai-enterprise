"use client";

import { useState, useSyncExternalStore } from "react";
import type { TopicEvidenceCatalogItem } from "@/lib/research/evidence/evidence-topic-builder";
import {
  loadEvidenceLifecycle,
  advanceEvidenceLifecycle,
  EVIDENCE_LIFECYCLE_STAGES,
  type EvidenceLifecycleStage,
  type EvidenceLifecycleRecord,
} from "@/lib/research/research-workspace-store";
import { toEvidenceEntityRef } from "@/lib/research/evidence/evidence-bookmark";
import SaveToWorkspaceButton from "@/components/shared/SaveToWorkspaceButton";
import EmptyState from "@/components/shared/EmptyState";
import ActivationStatusLine from "@/components/shared/ActivationStatusLine";
import { useTranslation } from "@/lib/i18n/use-translation";
import { translateEvidenceLifecycleStage } from "@/lib/i18n/evidence-lifecycle-translation";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type EvidenceLifecyclePanelProps = {
  topicId: string;
  evidenceItems: readonly TopicEvidenceCatalogItem[];
};

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

function StageTrack({
  stage,
  stageLabel,
}: {
  stage: EvidenceLifecycleStage;
  stageLabel: (s: EvidenceLifecycleStage) => string;
}) {
  const currentIndex = EVIDENCE_LIFECYCLE_STAGES.indexOf(stage);
  return (
    <div className="flex flex-wrap items-center gap-1">
      {EVIDENCE_LIFECYCLE_STAGES.map((s, index) => (
        <span
          key={s}
          title={stageLabel(s)}
          className={`rounded-full border px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider ${
            index < currentIndex
              ? "border-teal-500/20 bg-teal-500/10 text-teal-400"
              : index === currentIndex
                ? "border-teal-500/40 bg-teal-500/15 text-teal-300"
                : "border-zinc-800 bg-zinc-900/40 text-zinc-600"
          }`}
        >
          {stageLabel(s)}
        </span>
      ))}
    </div>
  );
}

/**
 * Real, user-tracked Evidence Lifecycle over catalog evidence items.
 * Stages only ever advance forward one step at a time — never skipped, never auto-completed.
 */
export default function EvidenceLifecyclePanel({ topicId, evidenceItems }: EvidenceLifecyclePanelProps) {
  const { t } = useTranslation();
  const records = useSyncExternalStore(subscribe, () => getSnapshot(topicId), getServerSnapshot);
  const [advanceStatus, setAdvanceStatus] = useState<string | null>(null);

  const stageLabel = (s: EvidenceLifecycleStage) => translateEvidenceLifecycleStage(s, t);

  function handleAdvance(evidenceId: string) {
    const updated = advanceEvidenceLifecycle(topicId, evidenceId);
    if (updated) {
      commitAdvance(topicId, evidenceId, updated);
      setAdvanceStatus(
        t("evidenceLifecycle.activityMarked", {
          stage: translateEvidenceLifecycleStage(updated.stage, t),
        }),
      );
    }
  }

  if (evidenceItems.length === 0) {
    return (
      <section aria-labelledby="evidence-lifecycle-heading" className="space-y-2">
        <p className={cbaiSectionEyebrow} id="evidence-lifecycle-heading">
          {t("evidenceLifecycle.eyebrow")}
        </p>
        <EmptyState variant="dashed" message={t("evidenceLifecycle.empty")} />
      </section>
    );
  }

  return (
    <section aria-labelledby="evidence-lifecycle-heading" className="space-y-3">
      <div>
        <p className={cbaiSectionEyebrow} id="evidence-lifecycle-heading">
          {t("evidenceLifecycle.eyebrow")}
        </p>
        <p className="mt-1 text-xs text-zinc-600">{t("evidenceLifecycle.description")}</p>
      </div>
      {advanceStatus ? <ActivationStatusLine message={advanceStatus} compact /> : null}
      <ul className="space-y-2">
        {evidenceItems.map((item) => {
          const stage = records[item.evidenceItemId]?.stage ?? "collected";
          const isFinal = stage === "archived";
          const nextStage = EVIDENCE_LIFECYCLE_STAGES[EVIDENCE_LIFECYCLE_STAGES.indexOf(stage) + 1];
          return (
            <li key={item.evidenceItemId} className={`${cbaiGlassCard} space-y-2 p-3`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm text-zinc-200">{item.label}</p>
                <div className="flex shrink-0 items-center gap-2">
                  <SaveToWorkspaceButton entity={toEvidenceEntityRef(item)} className="!px-2.5 !py-1 !text-[11px]" />
                  {!isFinal && nextStage ? (
                    <button
                      type="button"
                      onClick={() => handleAdvance(item.evidenceItemId)}
                      className="shrink-0 rounded-md border border-zinc-700 bg-zinc-900 px-2.5 py-1 text-[11px] font-medium text-teal-400 hover:border-zinc-600"
                    >
                      {t("evidenceLifecycle.markAs", { stage: stageLabel(nextStage) })}
                    </button>
                  ) : null}
                </div>
              </div>
              <StageTrack stage={stage} stageLabel={stageLabel} />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
