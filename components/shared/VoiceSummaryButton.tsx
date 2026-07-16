"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@/lib/i18n/use-translation";
import { resolveVoiceLocale } from "@/lib/i18n/languages";

type VoiceSummaryButtonProps = {
  /** Real, already-visible text to read aloud — never fabricated summary text. */
  text: string;
  label?: string;
  className?: string;
};

function isSpeechSynthesisSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export default function VoiceSummaryButton({ text, label, className = "" }: VoiceSummaryButtonProps) {
  const { t, language } = useTranslation();
  const [speaking, setSpeaking] = useState(false);
  const supported = isSpeechSynthesisSupported();
  const buttonLabel = label ?? t("search.voiceSummary");

  useEffect(() => {
    return () => {
      if (isSpeechSynthesisSupported()) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  function handleToggle() {
    if (!supported) return;
    const synth = window.speechSynthesis;

    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }

    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = resolveVoiceLocale(language);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    synth.speak(utterance);
    setSpeaking(true);
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={!supported}
      title={supported ? buttonLabel : t("activation.voiceUnsupportedRecovery")}
      className={`text-xs text-zinc-500 transition-colors hover:text-teal-300 disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
    >
      {speaking ? t("search.voiceSummaryStop") : buttonLabel}
    </button>
  );
}
