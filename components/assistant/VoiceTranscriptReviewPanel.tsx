"use client";

import { SPEECH_LANGUAGE_OPTIONS } from "@/lib/voice/speech-language-preference";
import { useTranslation } from "@/lib/i18n/use-translation";

type VoiceTranscriptReviewPanelProps = {
  readonly recognitionLang: string;
  readonly transcript: string;
  readonly confidence: number | null;
  readonly lowConfidence: boolean;
  readonly showUzbekWarning: boolean;
  readonly onTranscriptChange: (value: string) => void;
  readonly onClear: () => void;
  readonly onTryAgain: () => void;
  readonly onUseText: () => void;
  readonly onCancel: () => void;
};

export default function VoiceTranscriptReviewPanel({
  recognitionLang,
  transcript,
  confidence,
  lowConfidence,
  showUzbekWarning,
  onTranscriptChange,
  onClear,
  onTryAgain,
  onUseText,
  onCancel,
}: VoiceTranscriptReviewPanelProps) {
  const { t } = useTranslation();
  const langLabel =
    SPEECH_LANGUAGE_OPTIONS.find((option) => option.code === recognitionLang)?.labelKey ?? recognitionLang;

  return (
    <div
      role="dialog"
      aria-labelledby="voice-transcript-review-title"
      className="mt-2 space-y-3 rounded-lg border border-zinc-800 bg-slate-950/95 p-3"
    >
      <p id="voice-transcript-review-title" className="text-xs font-medium text-zinc-200">
        {t("voiceControl.transcriptReviewTitle")}
      </p>
      <dl className="grid gap-1 text-[11px] text-zinc-500">
        <div className="flex gap-2">
          <dt className="shrink-0">{t("voiceControl.selectedRecognitionLanguage")}:</dt>
          <dd className="text-zinc-300">{t(langLabel)}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="shrink-0">{t("voiceControl.confidenceLabel")}:</dt>
          <dd className="text-zinc-300">
            {confidence === null ? t("voiceControl.confidenceUnavailable") : `${Math.round(confidence * 100)}%`}
          </dd>
        </div>
      </dl>
      {lowConfidence ? (
        <p role="alert" className="text-[11px] text-amber-400">
          {t("voiceControl.lowConfidenceWarning")}
        </p>
      ) : null}
      {showUzbekWarning ? (
        <p role="alert" className="text-[11px] text-amber-400">
          {t("voiceControl.uzbekRecognitionWarning")}
        </p>
      ) : null}
      <label className="block text-[11px] text-zinc-500" htmlFor="voice-transcript-edit">
        {t("voiceControl.editTranscript")}
      </label>
      <textarea
        id="voice-transcript-edit"
        value={transcript}
        onChange={(event) => onTranscriptChange(event.target.value)}
        rows={3}
        className="w-full rounded-md border border-zinc-800 bg-slate-900/80 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-teal-500/30"
      />
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={onClear} className="rounded-md border border-zinc-800 px-2.5 py-1 text-[11px] text-zinc-400 hover:text-zinc-100">
          {t("voiceControl.clearTranscript")}
        </button>
        <button type="button" onClick={onTryAgain} className="rounded-md border border-zinc-800 px-2.5 py-1 text-[11px] text-zinc-400 hover:text-zinc-100">
          {t("voiceControl.tryAgain")}
        </button>
        <button
          type="button"
          onClick={onUseText}
          disabled={!transcript.trim()}
          className="rounded-md border border-teal-500/30 bg-teal-500/10 px-2.5 py-1 text-[11px] text-teal-300 hover:border-teal-500/50 disabled:opacity-40"
        >
          {t("voiceControl.useThisText")}
        </button>
        <button type="button" onClick={onCancel} className="rounded-md border border-zinc-800 px-2.5 py-1 text-[11px] text-zinc-400 hover:text-zinc-100">
          {t("voiceControl.cancel")}
        </button>
      </div>
    </div>
  );
}
