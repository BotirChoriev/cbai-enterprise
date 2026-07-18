"use client";

import { useState } from "react";
import type { ExtractedItem } from "@/lib/research-canvas/research-canvas-types";
import {
  canConfirmInterpretationItem,
  canCorrectInterpretationItem,
  displayInterpretationValue,
  hasDocumentedModelConfidence,
  migrateExtractedItem,
} from "@/lib/research-canvas/interpretation-integrity";
import { cbaiBtnPrimary, cbaiFocusRing } from "@/components/brand/brand-classes";

type InterpretationReviewCardProps = {
  item: ExtractedItem;
  rc: (key: string) => string;
  onConfirm: (itemId: string) => void;
  onCorrect: (itemId: string, value: string) => void;
  onReject: (itemId: string, reason: string) => void;
};

function statusLabelKey(status: ExtractedItem["confirmationStatus"]): string {
  const map: Record<string, string> = {
    "Awaiting Human Confirmation": "interpretStatusNeedsHumanReview",
    "Needs Human Review": "interpretStatusNeedsHumanReview",
    "Needs Correction": "interpretStatusNeedsCorrection",
    "Human-Corrected": "interpretStatusHumanCorrected",
    Confirmed: "interpretStatusConfirmed",
    Rejected: "interpretStatusRejected",
    "Insufficient Quality": "interpretStatusInsufficientInformation",
    "Machine-Extracted": "interpretStatusNeedsHumanReview",
    "Not Analyzed": "interpretStatusUnknown",
  };
  return map[status] ?? "interpretStatusUnknown";
}

function provenanceLabelKey(provenance?: string | null): string {
  if (provenance === "USER-PROVIDED") return "interpretProvenanceUserProvided";
  if (provenance === "EXTRACTED_FROM_USER_INPUT") return "interpretProvenanceExtractedFromUserInput";
  if (provenance === "MACHINE-EXTRACTED") return "interpretProvenanceMachineExtracted";
  return "interpretProvenanceUnknown";
}

function methodLabelKey(method?: string | null): string {
  if (method === "manual_description") return "interpretMethodManualDescription";
  if (method === "deterministic_field_mapping") return "interpretMethodDeterministicMapping";
  if (method === "svg_geometry_parser") return "interpretMethodSvgParser";
  if (method === "file_metadata") return "interpretMethodFileMetadata";
  return "interpretMethodUnknown";
}

export default function InterpretationReviewCard({
  item,
  rc,
  onConfirm,
  onCorrect,
  onReject,
}: InterpretationReviewCardProps) {
  const migrated = migrateExtractedItem(item);
  const [editing, setEditing] = useState(false);
  const [correctionDraft, setCorrectionDraft] = useState(displayInterpretationValue(migrated));
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const currentValue = displayInterpretationValue(migrated);
  const limitationKey = migrated.limitationKey ?? "interpretHumanConfirmationRequired";

  return (
    <div className="rounded-lg border border-zinc-800 p-3 text-xs">
      <div className="grid gap-1 sm:grid-cols-2">
        <p><span className="text-zinc-500">{rc("interpretTypeLabel")}:</span> {migrated.field}</p>
        <p><span className="text-zinc-500">{rc("interpretStatusLabel")}:</span> {rc(statusLabelKey(migrated.confirmationStatus))}</p>
        <p><span className="text-zinc-500">{rc("interpretProvenanceLabel")}:</span> {rc(provenanceLabelKey(migrated.provenance))}</p>
        <p><span className="text-zinc-500">{rc("interpretMethodLabel")}:</span> {rc(methodLabelKey(migrated.method))}</p>
      </div>

      <p className="mt-2 text-zinc-300">
        <span className="text-zinc-500">{rc("interpretCurrentValueLabel")}:</span> {currentValue}
      </p>
      {migrated.originalText && migrated.originalText !== currentValue ? (
        <p className="text-zinc-500">
          <span>{rc("interpretOriginalValueLabel")}:</span> {migrated.originalText}
        </p>
      ) : null}
      {migrated.userCorrection ? (
        <p className="text-zinc-500">
          <span>{rc("interpretCorrectedValueLabel")}:</span> {migrated.userCorrection}
        </p>
      ) : null}
      {migrated.sourceLocation ? (
        <p className="text-zinc-600">{rc("interpretSourceReferenceLabel")}: {migrated.sourceLocation}</p>
      ) : null}
      <p className="mt-1 text-amber-400/80">{rc(limitationKey)}</p>
      {hasDocumentedModelConfidence(migrated) ? (
        <p className="text-zinc-600">
          {rc("interpretAiConfidenceLabel")}: {migrated.aiConfidence} — {rc("notUncertainty")}
        </p>
      ) : (
        <p className="text-zinc-600">{rc("interpretNoAiConfidence")}</p>
      )}
      {migrated.rejectionReason ? (
        <p className="text-amber-400/90">{rc("interpretRejectionReasonLabel")}: {migrated.rejectionReason}</p>
      ) : null}

      {editing ? (
        <div className="mt-3 space-y-2">
          <label className="text-zinc-400" htmlFor={`correct-${migrated.id}`}>{rc("interpretCorrectAction")}</label>
          <textarea
            id={`correct-${migrated.id}`}
            value={correctionDraft}
            onChange={(e) => setCorrectionDraft(e.target.value)}
            className={`${cbaiFocusRing} min-h-20 w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm`}
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={cbaiBtnPrimary}
              onClick={() => {
                onCorrect(migrated.id, correctionDraft);
                setEditing(false);
              }}
            >
              {rc("interpretSaveCorrection")}
            </button>
            <button type="button" className={`${cbaiFocusRing} text-zinc-400`} onClick={() => setEditing(false)}>
              {rc("interpretCancelAction")}
            </button>
          </div>
        </div>
      ) : rejecting ? (
        <div className="mt-3 space-y-2">
          <label className="text-zinc-400" htmlFor={`reject-${migrated.id}`}>{rc("interpretRejectionReasonLabel")}</label>
          <input
            id={`reject-${migrated.id}`}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder={rc("interpretRejectionReasonPlaceholder")}
            className={`${cbaiFocusRing} w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm`}
          />
          <div className="flex flex-wrap gap-2">
            <button type="button" className={cbaiBtnPrimary} onClick={() => { onReject(migrated.id, rejectReason); setRejecting(false); }}>
              {rc("interpretRejectAction")}
            </button>
            <button type="button" className={`${cbaiFocusRing} text-zinc-400`} onClick={() => setRejecting(false)}>
              {rc("interpretCancelAction")}
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          {canConfirmInterpretationItem(migrated) ? (
            <button type="button" className={`${cbaiFocusRing} text-teal-400`} onClick={() => onConfirm(migrated.id)}>
              {rc("interpretConfirmAction")}
            </button>
          ) : null}
          {canCorrectInterpretationItem(migrated) ? (
            <button type="button" className={`${cbaiFocusRing} text-zinc-300`} onClick={() => { setCorrectionDraft(currentValue); setEditing(true); }}>
              {rc("interpretCorrectAction")}
            </button>
          ) : null}
          {canCorrectInterpretationItem(migrated) ? (
            <button type="button" className={`${cbaiFocusRing} text-amber-400`} onClick={() => setRejecting(true)}>
              {rc("interpretRejectAction")}
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}
