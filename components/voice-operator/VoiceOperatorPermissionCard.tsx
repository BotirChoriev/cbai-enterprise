"use client";

import type { VoicePermissionIssue } from "@/lib/voice-operator/types";
import { useTranslation } from "@/lib/i18n/use-translation";
import { permissionIssueTitle } from "@/lib/i18n/platform-copy-voice-operator";
import { getDictionary } from "@/lib/i18n/translate";

type Props = {
  readonly issue: VoicePermissionIssue;
  readonly onDismiss: () => void;
  readonly onRetry: () => void;
};

export default function VoiceOperatorPermissionCard({ issue, onDismiss, onRetry }: Props) {
  const { language } = useTranslation();
  const copy = getDictionary(language).voiceOperator;
  const title = permissionIssueTitle(copy, issue);

  return (
    <div
      className="mb-2 rounded-lg border border-amber-900/40 bg-amber-50 p-3 text-amber-950 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-100"
      role="alert"
    >
      <p className="text-xs font-medium">{title}</p>
      {issue === "denied" ? (
        <p className="mt-1 text-[11px] text-amber-950/90 dark:text-amber-100/90">{copy.permissionDeniedHelp}</p>
      ) : null}
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onRetry}
          className="rounded-md border border-amber-900/50 bg-white px-2.5 py-1 text-[11px] font-medium text-amber-950 hover:bg-amber-100 dark:border-amber-600 dark:bg-amber-950 dark:text-amber-100 dark:hover:bg-amber-900"
        >
          {copy.permissionRetry}
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-md border border-amber-900/30 px-2.5 py-1 text-[11px] text-amber-950/90 dark:border-amber-700 dark:text-amber-200"
        >
          {copy.permissionContinueText}
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-md border border-amber-900/30 px-2.5 py-1 text-[11px] text-amber-950/90 dark:border-amber-700 dark:text-amber-200"
        >
          {copy.permissionClose}
        </button>
      </div>
    </div>
  );
}
