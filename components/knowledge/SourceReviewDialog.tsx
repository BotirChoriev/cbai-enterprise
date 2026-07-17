"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type {
  EvidenceRelationKind,
  ReviewDecision,
} from "@/lib/knowledge-ingestion/source-ingestion.types";
import { completeSavedSourceReview } from "@/lib/knowledge-ingestion/source-review-store";
import { recordWorkflowEvent } from "@/lib/telemetry/workflow-telemetry";
import { cbaiBtnPrimary, cbaiFocusRing, cbaiMineralSurface } from "@/components/brand/brand-classes";
import { useTranslation } from "@/lib/i18n/use-translation";

type SourceReviewDialogProps = {
  readonly open: boolean;
  readonly sourceId: string;
  readonly missionId: string;
  readonly reviewerDisplayName: string;
  readonly onClose: () => void;
  readonly onCompleted: () => void;
};

export default function SourceReviewDialog({
  open,
  sourceId,
  missionId,
  reviewerDisplayName,
  onClose,
  onCompleted,
}: SourceReviewDialogProps) {
  const { t } = useTranslation();
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [decision, setDecision] = useState<ReviewDecision>("accepted_as_evidence");
  const [relation, setRelation] = useState<EvidenceRelationKind>("supports");
  const [rationale, setRationale] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    recordWorkflowEvent("source_review_started", { objectType: "saved_source", objectId: sourceId });
    dialogRef.current?.focus();
  }, [open, sourceId]);

  const submit = useCallback(() => {
    setSubmitting(true);
    setError(null);
    const result = completeSavedSourceReview({
      sourceId,
      missionId,
      reviewerDisplayName,
      decision,
      relation,
      rationale: rationale.trim() || null,
    });
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onCompleted();
    onClose();
  }, [sourceId, missionId, reviewerDisplayName, decision, relation, rationale, onClose, onCompleted]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center">
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`${cbaiMineralSurface} w-full max-w-lg space-y-4 p-5 outline-none`}
      >
        <div>
          <h2 id={titleId} className="text-sm font-semibold text-zinc-100">
            {t("sourceIngestion.reviewTitle")}
          </h2>
          <p className="mt-1 text-xs text-zinc-500">{t("sourceIngestion.reviewDetail")}</p>
          <p className="mt-2 text-xs text-amber-400/90">{t("sourceIngestion.selfReviewLabel")}</p>
        </div>

        <div className="space-y-3">
          <div>
            <label htmlFor="review-decision" className="text-xs text-zinc-400">
              {t("sourceIngestion.reviewDecision")}
            </label>
            <select
              id="review-decision"
              value={decision}
              onChange={(e) => setDecision(e.target.value as ReviewDecision)}
              className={`mt-1 min-h-10 w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 text-sm text-zinc-200 ${cbaiFocusRing}`}
            >
              <option value="accepted_as_evidence">{t("sourceIngestion.decisionAccepted")}</option>
              <option value="context_only">{t("sourceIngestion.decisionContext")}</option>
              <option value="insufficient">{t("sourceIngestion.decisionInsufficient")}</option>
              <option value="rejected">{t("sourceIngestion.decisionRejected")}</option>
            </select>
          </div>

          <div>
            <label htmlFor="review-relation" className="text-xs text-zinc-400">
              {t("sourceIngestion.reviewRelation")}
            </label>
            <select
              id="review-relation"
              value={relation}
              onChange={(e) => setRelation(e.target.value as EvidenceRelationKind)}
              className={`mt-1 min-h-10 w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 text-sm text-zinc-200 ${cbaiFocusRing}`}
            >
              <option value="supports">{t("sourceIngestion.relationSupports")}</option>
              <option value="contradicts">{t("sourceIngestion.relationContradicts")}</option>
              <option value="contextual">{t("sourceIngestion.relationContextual")}</option>
              <option value="insufficient">{t("sourceIngestion.relationInsufficient")}</option>
            </select>
          </div>

          <div>
            <label htmlFor="review-rationale" className="text-xs text-zinc-400">
              {t("sourceIngestion.reviewRationale")}
            </label>
            <textarea
              id="review-rationale"
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              rows={3}
              className={`mt-1 w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm text-zinc-200 ${cbaiFocusRing}`}
            />
          </div>
        </div>

        {error ? (
          <p className="text-xs text-amber-400/90" role="alert">
            {error}
          </p>
        ) : null}

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className={`min-h-10 rounded-md border border-zinc-700 px-4 text-sm text-zinc-300 ${cbaiFocusRing}`}
          >
            {t("common.cancel")}
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={submit}
            className={`${cbaiBtnPrimary} min-h-10`}
          >
            {submitting ? t("common.loading") : t("sourceIngestion.submitReview")}
          </button>
        </div>
      </div>
    </div>
  );
}
