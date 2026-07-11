"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAssistantProfile } from "@/components/platform/context/AssistantProfileProvider";
import { resolveAssistantCommand } from "@/lib/assistant/assistant-commands";

// Minimal ambient shape for the Web Speech API — not part of TypeScript's DOM lib. Only the
// members this component actually reads/calls are declared; everything routes through the same
// deterministic resolveAssistantCommand() as typed input, never a separate reasoning path.
type SpeechRecognitionResultLike = { transcript: string };
type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: { results: ArrayLike<ArrayLike<SpeechRecognitionResultLike>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};
type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

function getSpeechRecognitionConstructor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export default function AssistantCommandCenter() {
  const router = useRouter();
  const { profile } = useAssistantProfile();
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const route = useCallback(
    (rawInput: string) => {
      const trimmed = rawInput.trim();
      if (!trimmed) return;
      const match = resolveAssistantCommand(trimmed);
      if (match) {
        router.push(match.command.href);
      } else {
        router.push(`/search?q=${encodeURIComponent(trimmed)}`);
      }
      setInput("");
    },
    [router],
  );

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    route(input);
  }

  function handleVoiceClick() {
    const Recognition = getSpeechRecognitionConstructor();
    if (!Recognition) return;

    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const recognition = new Recognition();
    recognition.lang = profile.speechLanguage || "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript;
      if (transcript) route(transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    setIsListening(true);
    recognition.start();
  }

  function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files && event.target.files.length > 0) {
      setUploadNotice("File upload requires a connected ingestion pipeline — not available yet.");
    }
    event.target.value = "";
  }

  const speechSupported = getSpeechRecognitionConstructor() !== null;

  return (
    <div className="w-full min-w-0 max-w-md">
      <form
        role="search"
        aria-label="Assistant command center"
        onSubmit={handleSubmit}
        className="relative flex items-center gap-1.5"
      >
        <div className="relative flex-1">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <label htmlFor="assistant-command-input" className="sr-only">
            Ask the Assistant, or search countries, companies, and universities
          </label>
          <input
            id="assistant-command-input"
            name="q"
            type="search"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isListening ? "Listening…" : "Open my work, continue research…"}
            className="w-full rounded-lg border border-zinc-800 bg-slate-900/80 py-2 pl-10 pr-4 text-sm text-zinc-300 placeholder:text-zinc-600 outline-none transition-colors focus:border-cyan-500/30 focus:ring-1 focus:ring-cyan-500/20"
          />
        </div>

        {profile.voiceInputEnabled ? (
          <button
            type="button"
            onClick={handleVoiceClick}
            disabled={!speechSupported}
            aria-disabled={!speechSupported}
            title={
              speechSupported
                ? isListening
                  ? "Stop voice input"
                  : "Start voice input"
                : "Voice input is not supported in this browser"
            }
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-zinc-400 transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
              isListening
                ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-300"
                : "border-zinc-800 bg-slate-900/80 hover:text-zinc-100"
            }`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
              />
            </svg>
            <span className="sr-only">Voice input</span>
          </button>
        ) : null}

        <input
          ref={fileInputRef}
          type="file"
          className="sr-only"
          onChange={handleFileSelected}
          aria-hidden="true"
          tabIndex={-1}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          title="Upload — not yet connected"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-slate-900/80 text-zinc-400 transition-colors hover:text-zinc-100"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13"
            />
          </svg>
          <span className="sr-only">Upload</span>
        </button>
      </form>

      {uploadNotice ? (
        <p role="status" className="mt-1.5 text-[11px] text-zinc-500">
          {uploadNotice}
        </p>
      ) : null}
    </div>
  );
}
