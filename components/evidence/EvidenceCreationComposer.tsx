"use client";

import { useId, useState } from "react";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useOperationalObjectsOptional } from "@/components/operational-objects/OperationalObjectProvider";
import {
  confirmLocalEvidence,
  emptyEvidenceDraft,
  evidenceRecordToOperationalDraft,
  type LocalEvidenceDraft,
  type LocalEvidenceReviewStatus,
  type LocalEvidenceSourceType,
} from "@/lib/evidence/local-evidence-store";
import { cbaiBtnPrimary, cbaiBtnSecondary, cbaiFocusRing, cbaiMineralPanel } from "@/components/brand/brand-classes";
import { emitPlatformActionResult } from "@/lib/platform-actions/action-result-events";

type EvidenceCreationComposerProps = {
  readonly relatedEntityKind?: string;
  readonly relatedEntityId?: string;
  readonly relatedEntityName?: string;
  readonly defaultOpen?: boolean;
};

const SOURCE_TYPES: readonly LocalEvidenceSourceType[] = [
  "official",
  "literature",
  "dataset",
  "observation",
  "user_upload",
  "other",
];

const REVIEW_STATUSES: readonly LocalEvidenceReviewStatus[] = [
  "needs_review",
  "known",
  "unknown",
  "conflicting",
  "accepted",
  "rejected",
  "pending_source",
  "source_unavailable",
];

export default function EvidenceCreationComposer(props: EvidenceCreationComposerProps) {
  const { t, language } = useTranslation();
  const pathname = usePathname();
  const operationalObjects = useOperationalObjectsOptional();
  const formId = useId();
  const [open, setOpen] = useState(Boolean(props.defaultOpen));
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [draft, setDraft] = useState<LocalEvidenceDraft>(() =>
    emptyEvidenceDraft({
      locale: language,
      routePath: pathname || "/evidence",
      relatedEntityKind: props.relatedEntityKind,
      relatedEntityId: props.relatedEntityId,
      relatedEntityName: props.relatedEntityName,
    }),
  );

  function patch(partial: Partial<LocalEvidenceDraft>) {
    setDraft((current) => ({ ...current, ...partial }));
    setStatus(null);
  }

  function onConfirm() {
    if (submitting) return;
    setSubmitting(true);
    try {
      const confirmed = confirmLocalEvidence(draft);
      if (!confirmed) {
        setStatus(t("operationalObject.confirmBlockedMissing"));
        emitPlatformActionResult({
          kind: "action_failed",
          actionId: "evidence_request.compose",
          message: "missing_required_fields",
        });
        return;
      }
      emitPlatformActionResult({
        kind: "object_created",
        actionId: "evidence_request.compose",
        message: `evidence:${confirmed.id}`,
        href: "/evidence",
      });
      setStatus(t("operationalObject.evidenceRecordConfirmed"));
      if (operationalObjects) {
        const bridged = evidenceRecordToOperationalDraft(confirmed);
        operationalObjects.openComposer(bridged.draft, bridged.inferredFields, "manual");
      }
      setDraft(
        emptyEvidenceDraft({
          locale: language,
          routePath: pathname || "/evidence",
          relatedEntityKind: props.relatedEntityKind,
          relatedEntityId: props.relatedEntityId,
          relatedEntityName: props.relatedEntityName,
        }),
      );
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        className={`${cbaiBtnPrimary} ${cbaiFocusRing}`}
        data-cbai-evidence-create-open=""
        onClick={() => {
          setOpen(true);
          emitPlatformActionResult({
            kind: "evidence_workflow_started",
            actionId: "evidence_request.compose",
            message: "composer_opened",
          });
        }}
      >
        {t("operationalObject.evidenceCreateStart")}
      </button>
    );
  }

  return (
    <section className={`${cbaiMineralPanel} space-y-3`} data-cbai-evidence-composer="">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-[var(--cbai-text-primary)]">
          {t("operationalObject.evidenceCreateTitle")}
        </h2>
        <button type="button" className={`${cbaiBtnSecondary} ${cbaiFocusRing}`} onClick={() => setOpen(false)}>
          {t("operationalObject.cancel")}
        </button>
      </div>
      <p className="text-xs text-[var(--cbai-text-muted)]">{t("operationalObject.evidenceCreateHonesty")}</p>
      {props.relatedEntityName ? (
        <p className="text-xs text-[var(--cbai-text-secondary)]">
          {t("operationalObject.linkedFromCountry")}: {props.relatedEntityName}
        </p>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-xs" htmlFor={`${formId}-title`}>
          {t("operationalObject.fieldTitle")}
          <input
            id={`${formId}-title`}
            className={`rounded-md border border-[var(--cbai-border-default)] bg-[var(--cbai-glass-surface)] px-2 py-2 text-sm ${cbaiFocusRing}`}
            value={draft.title}
            onChange={(e) => patch({ title: e.target.value })}
          />
        </label>
        <label className="grid gap-1 text-xs" htmlFor={`${formId}-source`}>
          {t("operationalObject.evidenceSourceLabel")}
          <input
            id={`${formId}-source`}
            className={`rounded-md border border-[var(--cbai-border-default)] bg-[var(--cbai-glass-surface)] px-2 py-2 text-sm ${cbaiFocusRing}`}
            value={draft.sourceLabel}
            onChange={(e) => patch({ sourceLabel: e.target.value })}
          />
        </label>
        <label className="grid gap-1 text-xs" htmlFor={`${formId}-stype`}>
          {t("operationalObject.evidenceSourceType")}
          <select
            id={`${formId}-stype`}
            className={`rounded-md border border-[var(--cbai-border-default)] bg-[var(--cbai-glass-surface)] px-2 py-2 text-sm ${cbaiFocusRing}`}
            value={draft.sourceType}
            onChange={(e) => patch({ sourceType: e.target.value as LocalEvidenceSourceType })}
          >
            {SOURCE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-xs" htmlFor={`${formId}-status`}>
          {t("operationalObject.evidenceReviewStatus")}
          <select
            id={`${formId}-status`}
            className={`rounded-md border border-[var(--cbai-border-default)] bg-[var(--cbai-glass-surface)] px-2 py-2 text-sm ${cbaiFocusRing}`}
            value={draft.reviewStatus}
            onChange={(e) => patch({ reviewStatus: e.target.value as LocalEvidenceReviewStatus })}
          >
            {REVIEW_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="grid gap-1 text-xs" htmlFor={`${formId}-claim`}>
        {t("operationalObject.evidenceClaim")}
        <textarea
          id={`${formId}-claim`}
          rows={2}
          className={`rounded-md border border-[var(--cbai-border-default)] bg-[var(--cbai-glass-surface)] px-2 py-2 text-sm ${cbaiFocusRing}`}
          value={draft.claim}
          onChange={(e) => patch({ claim: e.target.value })}
        />
      </label>
      <label className="grid gap-1 text-xs" htmlFor={`${formId}-prov`}>
        {t("operationalObject.evidenceProvenance")}
        <textarea
          id={`${formId}-prov`}
          rows={2}
          className={`rounded-md border border-[var(--cbai-border-default)] bg-[var(--cbai-glass-surface)] px-2 py-2 text-sm ${cbaiFocusRing}`}
          value={draft.provenance}
          onChange={(e) => patch({ provenance: e.target.value })}
        />
      </label>
      <label className="grid gap-1 text-xs" htmlFor={`${formId}-rel`}>
        {t("operationalObject.evidenceReliabilityNote")}
        <input
          id={`${formId}-rel`}
          className={`rounded-md border border-[var(--cbai-border-default)] bg-[var(--cbai-glass-surface)] px-2 py-2 text-sm ${cbaiFocusRing}`}
          value={draft.reliabilityNote}
          onChange={(e) => patch({ reliabilityNote: e.target.value })}
          placeholder={t("operationalObject.evidenceReliabilityPlaceholder")}
        />
      </label>
      {status ? (
        <p role="status" className="text-xs text-[var(--cbai-text-secondary)]">
          {status}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={`${cbaiBtnPrimary} ${cbaiFocusRing}`}
          disabled={submitting}
          data-cbai-evidence-confirm=""
          onClick={onConfirm}
        >
          {t("operationalObject.evidenceConfirmSave")}
        </button>
      </div>
    </section>
  );
}
