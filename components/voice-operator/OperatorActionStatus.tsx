"use client";

import { useVoiceOperator } from "@/components/voice-operator/VoiceOperatorProvider";
import { useTranslation } from "@/lib/i18n/use-translation";
import type { VoiceOperatorActionStatus } from "@/lib/voice-operator/commands";

const STATUS_KEY: Partial<Record<VoiceOperatorActionStatus, string>> = {
  understanding: "voiceCommand.understanding",
  opening: "voiceCommand.openingResearch",
  selected: "voiceCommand.chemistrySelected",
  waiting_confirmation: "voiceCommand.waitingConfirmation",
  completed: "voiceCommand.completed",
  could_not_understand: "voiceCommand.couldNotUnderstand",
  clarifying: "voiceCommand.clarifying",
};

export default function OperatorActionStatus() {
  const { t } = useTranslation();
  const { actionStatus, actionStatusDetail } = useVoiceOperator();
  if (actionStatus === "idle") return null;

  const labelKey = STATUS_KEY[actionStatus];
  const label = labelKey ? t(labelKey) : actionStatusDetail;
  const detail =
    actionStatusDetail && actionStatus === "completed"
      ? t("voiceCommand.completedAction", { detail: actionStatusDetail })
      : actionStatusDetail && actionStatus !== "clarifying"
        ? actionStatusDetail
        : null;

  return (
    <div
      className="rounded-lg border border-teal-500/25 bg-[#0a1528]/95 px-3 py-2 text-xs text-slate-200"
      role="status"
      aria-live="polite"
    >
      <p className="font-medium text-teal-100/95">{label}</p>
      {detail && detail !== label ? <p className="mt-0.5 text-[11px] text-slate-400">{detail}</p> : null}
    </div>
  );
}
