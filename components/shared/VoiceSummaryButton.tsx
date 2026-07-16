"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@/lib/i18n/use-translation";
import { resolveVoiceLocale } from "@/lib/i18n/languages";

type VoiceSummaryButtonProps = {
  /** Real, already-visible text to read aloud (name/type/coverage/next step already shown on the
   * card) — never a generated or fabricated summary the user can't already see. */
  text: string;
  label?: string;
  className?: string;
};

/** Mirrors the SSR-safe feature-detection already used for SpeechRecognition support in
 * AssistantCommandCenter.tsx — `false` during server render, real result once hydrated. */
function isSpeechSynthesisSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/**
 * Real Voice Summary action (Platform Activation mission, Mission 5 — every search result must
 * support "Voice Summary"). Uses the browser's real `speechSynthesis` API to read the result's
 * already-real, already-visible text aloud in the current interface language's voice locale.
 * Disabled — never a fake "reading" state — when the browser has no `speechSynthesis` support.
 */
export default function VoiceSummaryButton({ text, label = "Voice Summary", className = "" }: VoiceSummaryButtonProps) {
  const { language } = useTranslation();
  const [speaking, setSpeaking] = useState(false);
  const supported = isSpeechSynthesisSupported();

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
    setSpeaking(true);
    synth.speak(utterance);
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={!supported}
      aria-label={!supported ? "Voice summary not supported in this browser" : speaking ? "Stop voice summary" : label}
      title={!supported ? "Voice summary not supported in this browser" : undefined}
      className={`inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-400 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-zinc-800 disabled:hover:text-zinc-400 ${className}`}
    >
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        {speaking ? (
          <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.25h13.5v13.5H5.25z" />
        ) : (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53L6.75 15.75H4.5a.75.75 0 01-.75-.75v-6a.75.75 0 01.75-.75h2.25z"
          />
        )}
      </svg>
      {speaking ? "Stop" : label}
    </button>
  );
}
