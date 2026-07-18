"use client";

import type { VoiceActionProposal } from "@/lib/voice/voice-control-types";
import { useTranslation } from "@/lib/i18n/use-translation";

type VoiceActionReviewPanelProps = {
  readonly proposal: VoiceActionProposal;
  readonly onConfirm: () => void;
  readonly onEdit: () => void;
  readonly onCancel: () => void;
};

export default function VoiceActionReviewPanel({ proposal, onConfirm, onEdit, onCancel }: VoiceActionReviewPanelProps) {
  const { t } = useTranslation();

  const actionLabel = t(proposal.actionLabel, proposal.actionVars);
  const actionDescription = t(proposal.actionDescription, proposal.actionVars);

  return (
    <div
      role="dialog"
      aria-labelledby="voice-action-review-title"
      className="mt-2 space-y-3 rounded-lg border border-zinc-800 bg-slate-950/95 p-3"
    >
      <p id="voice-action-review-title" className="text-xs font-medium text-zinc-200">
        {t("voiceControl.actionReviewTitle")}
      </p>
      <dl className="space-y-2 text-[11px]">
        <div>
          <dt className="text-zinc-500">{t("voiceControl.understoodText")}</dt>
          <dd className="text-zinc-200">{proposal.understoodText}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">{t("voiceControl.proposedAction")}</dt>
          <dd className="text-zinc-200">
            {actionLabel}
            {actionDescription !== actionLabel ? ` — ${actionDescription}` : ""}
          </dd>
        </div>
        {proposal.href ? (
          <div>
            <dt className="text-zinc-500">{t("voiceControl.destination")}</dt>
            <dd className="font-mono text-zinc-300">{proposal.href}</dd>
          </div>
        ) : null}
        {proposal.kind === "navigate" ? (
          <p className="text-zinc-500">{t("voiceControl.contextPreserved")}</p>
        ) : null}
        {proposal.requiresExternalConsent ? (
          <p className="text-amber-400/90">{t("voiceControl.externalDataNotice")}</p>
        ) : null}
      </dl>
      <div className="flex flex-wrap gap-2">
        {proposal.status === "known" ? (
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-md border border-teal-500/30 bg-teal-500/10 px-2.5 py-1 text-[11px] text-teal-300 hover:border-teal-500/50"
          >
            {t("voiceControl.confirmAction")}
          </button>
        ) : null}
        <button type="button" onClick={onEdit} className="rounded-md border border-zinc-800 px-2.5 py-1 text-[11px] text-zinc-400 hover:text-zinc-100">
          {t("voiceControl.editAction")}
        </button>
        <button type="button" onClick={onCancel} className="rounded-md border border-zinc-800 px-2.5 py-1 text-[11px] text-zinc-400 hover:text-zinc-100">
          {t("voiceControl.cancel")}
        </button>
      </div>
    </div>
  );
}
