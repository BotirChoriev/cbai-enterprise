"use client";

import { useVoiceOperator } from "@/components/voice-operator/VoiceOperatorProvider";
import { useTranslation } from "@/lib/i18n/use-translation";

export default function OperatorCommandClarifyCard() {
  const { t } = useTranslation();
  const { clarifyOptions, clarifyQuestion, chooseClarifyOption, dismissClarify } = useVoiceOperator();
  if (!clarifyOptions?.length) return null;

  return (
    <div
      className="rounded-lg border border-teal-500/30 bg-[#07101f] px-3 py-2.5 text-xs text-slate-200"
      role="group"
      aria-label={t("voiceCommand.clarifying")}
    >
      <p className="font-medium text-teal-100">{clarifyQuestion ?? t("voiceCommand.clarifying")}</p>
      <ul className="mt-2 space-y-1.5">
        {clarifyOptions.map((option) => (
          <li key={option.id}>
            <button
              type="button"
              className="flex min-h-9 w-full items-center rounded-md border border-teal-500/20 bg-teal-950/40 px-2.5 text-left text-xs text-slate-100 transition hover:border-teal-400/40 hover:bg-teal-900/40"
              onClick={() => chooseClarifyOption(option)}
            >
              {t(option.labelKey)}
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="mt-2 text-[11px] text-slate-500 underline-offset-2 hover:text-slate-300 hover:underline"
        onClick={dismissClarify}
      >
        {t("voiceOperator.closeDock")}
      </button>
    </div>
  );
}
