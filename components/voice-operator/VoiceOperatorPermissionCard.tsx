"use client";

import type { VoicePermissionIssue } from "@/lib/voice-operator/types";
import { useTranslation } from "@/lib/i18n/use-translation";

type Props = {
  readonly issue: VoicePermissionIssue;
  readonly onDismiss: () => void;
  readonly onRetry: () => void;
};

export default function VoiceOperatorPermissionCard({ issue, onDismiss, onRetry }: Props) {
  const { t } = useTranslation();

  return (
    <div className="mb-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3" role="alert">
      <p className="text-xs text-amber-300">{t("voiceOperator.permissionDeniedTitle")}</p>
      {issue === "denied" || issue === "dismissed" ? (
        <p className="mt-1 text-[11px] text-zinc-500">
          Safari: Sozlamalar → Veb-saytlar → Mikrofon. Brauzer ruxsatini kod orqali o‘zgartirib bo‘lmaydi.
        </p>
      ) : null}
      <div className="mt-2 flex flex-wrap gap-2">
        <button type="button" onClick={onRetry} className="rounded-md border border-amber-500/30 px-2.5 py-1 text-[11px] text-amber-200">
          {t("voiceOperator.permissionRetry")}
        </button>
        <button type="button" onClick={onDismiss} className="rounded-md border border-zinc-700 px-2.5 py-1 text-[11px] text-zinc-400">
          {t("voiceOperator.permissionContinueText")}
        </button>
        <button type="button" onClick={onDismiss} className="rounded-md border border-zinc-700 px-2.5 py-1 text-[11px] text-zinc-400">
          {t("voiceOperator.permissionClose")}
        </button>
      </div>
    </div>
  );
}
