"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAssistantProfile } from "@/components/platform/context/AssistantProfileProvider";
import { usePlatformContext } from "@/components/platform/context/PlatformContextProvider";
import { ASSISTANT_COMMANDS, resolveAssistantCommand } from "@/lib/assistant/assistant-commands";
import { resolveAssistantContext } from "@/lib/assistant/assistant-context";
import { resolveOperatorName } from "@/lib/assistant/assistant-profile";
import {
  resolveRelationshipCommand,
  type RelationshipFocus,
} from "@/lib/assistant/assistant-relationship-commands";
import { resolveProjectCommand } from "@/lib/project/project-commands";
import { resolveLanguageCommand } from "@/lib/i18n/language-command";
import { getResearchTopicById } from "@/lib/research/research-topics";
import { getPrimaryEntity } from "@/lib/context";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import OperatorOrb, { type OperatorOrbState } from "@/components/shared/OperatorOrb";

const SUGGESTED_COMMAND_IDS = ["open-my-work", "continue-research", "open-evidence", "open-trust"];
const SUGGESTED_COMMANDS = ASSISTANT_COMMANDS.filter((command) =>
  SUGGESTED_COMMAND_IDS.includes(command.id),
);

// Minimal ambient shape for the Web Speech API — not part of TypeScript's DOM lib. Only the
// members this component actually reads/calls are declared; everything routes through the same
// deterministic resolveAssistantCommand() as typed input, never a separate reasoning path.
type SpeechRecognitionResultLike = { transcript: string };
type SpeechRecognitionErrorLike = { error: string };
type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onresult: ((event: { results: ArrayLike<ArrayLike<SpeechRecognitionResultLike>> }) => void) | null;
  onerror: ((event: SpeechRecognitionErrorLike) => void) | null;
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

// Real voice states (Phase 8) — never fabricated, always reflects what the Web Speech API
// actually reported via onstart/onresult/onerror/onend.
type VoiceStatus = "idle" | "requesting" | "listening" | "processing" | "permission-denied" | "network-error";

type AssistantCommandCenterProps = {
  /** "compact" (default) — the persistent Topbar rendering. "prominent" — the first-screen
   * command bar (Phase 1/8), larger input and mic target. Both share the exact same resolution
   * logic; only sizing/copy differ. */
  size?: "compact" | "prominent";
  /** Hides this instance's own inline orb — for the one case (the homepage hero) where a much
   * larger orb already represents the Operator immediately above this input; a second, smaller
   * orb right next to it would read as two competing Operators, not one. */
  hideOrb?: boolean;
  /** Reports this instance's real, derived Operator state up to a parent that wants to drive a
   * larger orb from the same live voice/confirmation state, instead of duplicating the orb. */
  onOrbStateChange?: (state: OperatorOrbState) => void;
};

export default function AssistantCommandCenter({ size = "compact", hideOrb = false, onOrbStateChange }: AssistantCommandCenterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { profile, isActive, updateProfile } = useAssistantProfile();
  const { context, pinEntityToWorkspace } = usePlatformContext();
  const { t } = useTranslation();
  const inputId = useId();
  const [input, setInput] = useState("");
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>("idle");
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);
  const [unrecognized, setUnrecognized] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // The Assistant always knows where the user currently is — derived from the same real Entity
  // Context the platform already tracks (getPrimaryEntity, the one canonical accessor for
  // "whichever entity is focused"), never a separate tracking system and never a question asked
  // of the user.
  const focusedEntity = getPrimaryEntity(context);

  const assistantContext = useMemo(
    () => resolveAssistantContext(pathname, focusedEntity),
    [pathname, focusedEntity],
  );

  // The same focus resolveAssistantContext derives, reshaped for the relationship resolver
  // (which needs a real catalog id, not just a display href) — a research topic path takes
  // priority, exactly mirroring resolveAssistantContext's own precedence.
  const relationshipFocus = useMemo<RelationshipFocus | null>(() => {
    const topicMatch = /^\/research\/([^/]+)$/.exec(pathname);
    if (topicMatch && getResearchTopicById(topicMatch[1])) {
      return { kind: "research_topic", id: topicMatch[1] };
    }
    return focusedEntity ? { kind: focusedEntity.kind, id: focusedEntity.id } : null;
  }, [pathname, focusedEntity]);

  const route = useCallback(
    (rawInput: string) => {
      const trimmed = rawInput.trim();
      if (!trimmed) return;
      setConfirmation(null);

      // "Save workspace" is a real action (pin the current entity), not a navigation — handled
      // here rather than in the pure resolver, using the same focused platform entity the
      // Contextual Operator already shows. Never fabricates something to save.
      const normalized = trimmed.toLowerCase();
      if (["save workspace", "save to workspace", "bookmark", "save company"].some((phrase) => normalized.includes(phrase))) {
        if (focusedEntity) {
          pinEntityToWorkspace(focusedEntity);
          setConfirmation(t("assistantVoice.savedToWorkspace", { name: focusedEntity.name }));
        } else {
          setConfirmation(t("assistantVoice.nothingToSaveYet"));
        }
        setUnrecognized(null);
        setInput("");
        return;
      }

      // "Change interface/voice language" (Phase 9/10) — a real profile update, confirmed
      // visibly, never applied silently.
      const languageMatch = resolveLanguageCommand(trimmed);
      if (languageMatch) {
        setUnrecognized(null);
        setInput("");
        if (languageMatch.type === "set-interface-language") {
          updateProfile({ preferredLanguage: languageMatch.code });
        } else if (languageMatch.type === "set-voice-language") {
          updateProfile({ speechLanguage: languageMatch.voiceLocale });
        } else {
          router.push(languageMatch.href);
        }
        setConfirmation(languageMatch.message);
        return;
      }

      // Relationship-aware commands ("open related research/company/university/evidence", "open
      // country") resolve against whichever real entity is currently focused — real data only,
      // an honest message when nothing is connected. Checked before the pure fixed-phrase table
      // so it can supersede the generic, context-blind "open evidence" entry with a real anchor.
      const relationshipMatch = resolveRelationshipCommand(trimmed, relationshipFocus);
      if (relationshipMatch) {
        setUnrecognized(null);
        setInput("");
        if (relationshipMatch.type === "navigate") {
          router.push(relationshipMatch.href);
        }
        setConfirmation(relationshipMatch.message);
        return;
      }

      // "Continue project"/"add evidence"/"open notes" operate on the real most-recently-updated
      // project — the Command Center has no per-page project focus (see project-commands.ts).
      const projectMatch = resolveProjectCommand(trimmed);
      if (projectMatch) {
        setUnrecognized(null);
        setInput("");
        if (projectMatch.type === "navigate") {
          router.push(projectMatch.href);
        }
        setConfirmation(projectMatch.message);
        return;
      }

      const match = resolveAssistantCommand(trimmed);
      if (match) {
        setUnrecognized(null);
        router.push(match.href);
        setInput("");
      } else {
        // Honest fallback per the Command Center's no-fake-AI-response rule: an unmatched
        // command shows what's actually supported, never a guessed destination.
        setUnrecognized(trimmed);
      }
    },
    [router, focusedEntity, pinEntityToWorkspace, relationshipFocus, updateProfile, t],
  );

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    route(input);
  }

  function handleVoiceClick() {
    const Recognition = getSpeechRecognitionConstructor();
    if (!Recognition) return;

    if (voiceStatus === "listening" || voiceStatus === "requesting") {
      recognitionRef.current?.stop();
      setVoiceStatus("idle");
      return;
    }

    const recognition = new Recognition();
    recognition.lang = profile.speechLanguage || "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setVoiceStatus("listening");
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript;
      setVoiceStatus("processing");
      if (transcript) {
        // Real, editable transcript (Phase 10): the recognized text is placed in the visible,
        // editable input — never executed invisibly — before routing. Navigation commands still
        // route immediately per Phase 10 ("navigation commands may execute immediately with
        // visible confirmation"); the confirmation banner below is that visible confirmation.
        setInput(transcript);
        route(transcript);
      }
      setVoiceStatus("idle");
    };
    recognition.onerror = (event) => {
      if (event.error === "not-allowed" || event.error === "permission-denied" || event.error === "service-not-allowed") {
        setVoiceStatus("permission-denied");
      } else if (event.error === "network") {
        setVoiceStatus("network-error");
      } else {
        setVoiceStatus("idle");
      }
    };
    recognition.onend = () => {
      setVoiceStatus((current) => (current === "listening" || current === "requesting" ? "idle" : current));
    };

    recognitionRef.current = recognition;
    setVoiceStatus("requesting");
    recognition.start();
  }

  function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files && event.target.files.length > 0) {
      setUploadNotice(t("assistantVoice.uploadNotAvailable"));
    }
    event.target.value = "";
  }

  // getSpeechRecognitionConstructor() reads a real browser-only API — honestly absent during the
  // server's pre-render pass, which would otherwise disagree with the client's real capability on
  // the very first paint now that the mic button is visible by default. useHydrated() keeps the
  // server and the client's first render byte-identical (button starts as "checking", never a
  // false "unsupported"), then the real capability appears in the next commit, same pattern as
  // every other browser-only read in this codebase.
  const hydrated = useHydrated();
  const speechSupported = hydrated && getSpeechRecognitionConstructor() !== null;
  const isProminent = size === "prominent";

  const voiceStatusLabel: Record<VoiceStatus, string> = {
    idle: t("assistant.micReady"),
    requesting: t("assistant.micRequesting"),
    listening: t("assistant.micListening"),
    processing: t("assistant.micProcessing"),
    "permission-denied": t("assistant.micPermissionDenied"),
    "network-error": t("assistant.micNetworkError"),
  };

  // Real Operator visual state — driven only by the actual Web Speech API status and the actual
  // confirmation banner, never a decorative loop. permission-denied/network-error already had
  // real, honest text below the input; the orb previously stayed "idle" through them, which is
  // the one gap here — a real error now gets a real (non-alarming) visual cue too.
  const operatorOrbState: OperatorOrbState = confirmation
    ? "success"
    : voiceStatus === "permission-denied" || voiceStatus === "network-error"
      ? "error"
      : voiceStatus === "listening" || voiceStatus === "requesting"
        ? "listening"
        : voiceStatus === "processing"
          ? "thinking"
          : "idle";

  useEffect(() => {
    onOrbStateChange?.(operatorOrbState);
  }, [operatorOrbState, onOrbStateChange]);

  return (
    <div className={`w-full min-w-0 ${isProminent ? "max-w-2xl" : "max-w-md"}`}>
      {assistantContext ? (
        <Link
          href={assistantContext.href}
          className="mb-1.5 inline-flex items-center gap-1.5 text-[11px] text-zinc-500 hover:text-teal-300"
          title={`Operator context: ${assistantContext.name}`}
        >
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-teal-400" />
          Context: {assistantContext.name}
        </Link>
      ) : null}
      <form
        role="search"
        aria-label="CBAI Personal Operator command center"
        onSubmit={handleSubmit}
        className="relative flex items-center gap-1.5"
      >
        {!hideOrb ? <OperatorOrb state={operatorOrbState} size={isProminent ? 44 : 32} className="shrink-0" /> : null}
        <div className={`relative flex-1 ${isProminent ? "order-2" : ""}`}>
          <svg
            className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 ${isProminent ? "h-5 w-5" : "h-4 w-4"}`}
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
          <label htmlFor={inputId} className="sr-only">
            {isActive
              ? `Ask your ${resolveOperatorName(profile)}, or search countries, companies, and universities`
              : t("home.commandPlaceholder")}
          </label>
          <input
            id={inputId}
            name="q"
            type="search"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setUnrecognized(null);
              setConfirmation(null);
            }}
            placeholder={
              voiceStatus === "listening"
                ? t("home.commandListening")
                : voiceStatus === "processing"
                  ? t("home.commandProcessing")
                  : t("home.commandPlaceholder")
            }
            className={`w-full rounded-lg border border-zinc-800 bg-slate-900/80 text-zinc-300 placeholder:text-zinc-600 outline-none transition-colors focus:border-teal-500/30 focus:ring-1 focus:ring-teal-500/20 ${
              isProminent ? "py-3.5 pl-11 pr-4 text-base" : "py-2 pl-10 pr-4 text-sm"
            }`}
          />
        </div>

        {profile.voiceInputEnabled ? (
          <button
            type="button"
            onClick={handleVoiceClick}
            disabled={!speechSupported}
            aria-disabled={!speechSupported}
            aria-label={speechSupported ? voiceStatusLabel[voiceStatus] : t("assistant.micUnsupportedBrowser")}
            title={speechSupported ? voiceStatusLabel[voiceStatus] : t("assistant.micUnsupportedBrowser")}
            className={`flex shrink-0 items-center justify-center border text-zinc-400 transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
              isProminent ? "order-1 h-14 w-14 rounded-full" : "h-9 w-9 rounded-lg"
            } ${
              voiceStatus === "listening" || voiceStatus === "requesting"
                ? isProminent
                  ? "scale-105 border-teal-400/60 bg-teal-500/20 text-teal-200 shadow-[0_0_24px_-4px_rgba(45,212,191,0.5)]"
                  : "border-teal-500/40 bg-teal-500/10 text-teal-300"
                : voiceStatus === "permission-denied" || voiceStatus === "network-error"
                  ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
                  : isProminent
                    ? "border-transparent bg-[#005810] text-white shadow-[0_8px_24px_-8px_rgba(0,88,16,0.6)] hover:bg-[#00470d]"
                    : "border-zinc-800 bg-slate-900/80 hover:text-zinc-100"
            }`}
          >
            <svg className={isProminent ? "h-6 w-6" : "h-4 w-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
              />
            </svg>
            <span className="sr-only">{voiceStatusLabel[voiceStatus]}</span>
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
        {!isProminent ? (
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
        ) : null}
      </form>

      {profile.voiceInputEnabled && !speechSupported ? (
        <p className="mt-1.5 text-[11px] text-zinc-600">{t("assistant.micUnsupportedBrowser")}</p>
      ) : null}
      {voiceStatus === "permission-denied" ? (
        <p role="alert" className="mt-1.5 text-[11px] text-amber-400">{t("assistant.micPermissionDenied")}</p>
      ) : null}
      {voiceStatus === "network-error" ? (
        <p role="alert" className="mt-1.5 text-[11px] text-amber-400">{t("assistant.micNetworkError")}</p>
      ) : null}

      {uploadNotice ? (
        <p role="status" className="mt-1.5 text-[11px] text-zinc-500">
          {uploadNotice}
        </p>
      ) : null}

      {confirmation ? (
        <p role="status" className="mt-1.5 flex items-center gap-1.5 text-[11px] text-emerald-400">
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          {confirmation}
        </p>
      ) : null}

      {unrecognized ? (
        <div
          role="status"
          className="mt-2 space-y-2 rounded-lg border border-zinc-800 bg-slate-950/90 p-3"
        >
          <p className="text-xs text-zinc-400">
            {`"${unrecognized}" is not a recognized command yet — no reasoning is applied, so unmatched input is never guessed at.`}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {assistantContext ? (
              <button
                type="button"
                onClick={() => {
                  setUnrecognized(null);
                  router.push(assistantContext.href);
                }}
                className="rounded-full border border-teal-500/30 bg-teal-500/10 px-2.5 py-1 text-[11px] text-teal-300 transition-colors hover:border-teal-500/50"
              >
                {`Open ${assistantContext.name}`}
              </button>
            ) : null}
            {SUGGESTED_COMMANDS.map((command) => (
              <button
                key={command.id}
                type="button"
                onClick={() => route(command.phrase)}
                className="rounded-full border border-zinc-800 bg-zinc-900/60 px-2.5 py-1 text-[11px] text-zinc-400 transition-colors hover:text-zinc-100"
              >
                {command.phrase}
              </button>
            ))}
          </div>
          <Link
            href={`/search?q=${encodeURIComponent(unrecognized)}`}
            className="inline-flex text-xs font-medium text-teal-400 hover:text-teal-300"
          >
            Search Global Search for &quot;{unrecognized}&quot; →
          </Link>
        </div>
      ) : null}
    </div>
  );
}
