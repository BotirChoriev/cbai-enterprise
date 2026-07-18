"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAssistantProfile } from "@/components/platform/context/AssistantProfileProvider";
import { usePlatformContext } from "@/components/platform/context/PlatformContextProvider";
import { ASSISTANT_COMMANDS, displayCommandPhrase } from "@/lib/assistant/assistant-commands";
import { recordWorkflowEvent } from "@/lib/telemetry/workflow-telemetry";
import { resolveAssistantContext } from "@/lib/assistant/assistant-context";
import { resolveOperatorName } from "@/lib/assistant/assistant-profile";
import type { RelationshipFocus } from "@/lib/assistant/assistant-relationship-commands";
import { getResearchTopicById } from "@/lib/research/research-topics";
import { getPrimaryEntity } from "@/lib/context";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { getLanguageDefinition } from "@/lib/i18n/languages";
import OperatorOrb, { type OperatorOrbState } from "@/components/shared/OperatorOrb";
import VoiceTranscriptReviewPanel from "@/components/assistant/VoiceTranscriptReviewPanel";
import VoiceActionReviewPanel from "@/components/assistant/VoiceActionReviewPanel";
import {
  resolveVoiceAction,
  voiceActionRequiresConfirmation,
  clearPendingVoiceActionStorage,
} from "@/lib/voice/voice-action-resolver";
import { executeVoiceAction } from "@/lib/voice/execute-voice-action";
import {
  SPEECH_LANGUAGE_OPTIONS,
  resolveActiveSpeechLanguage,
  writeSpeechLanguageOverride,
} from "@/lib/voice/speech-language-preference";
import {
  getSpeechRecognitionConstructor,
  SpeechRecognitionSession,
} from "@/lib/voice/speech-recognition-session";
import { looksLikeLowConfidenceTranscript } from "@/lib/voice/voice-blocklist";
import {
  appendVoiceTranscriptRecord,
  createVoiceTranscriptRecord,
  markVoiceTranscriptConfirmed,
} from "@/lib/voice/voice-transcript-provenance";
import type { VoiceActionProposal, VoiceControlPhase } from "@/lib/voice/voice-control-types";

const SUGGESTED_COMMAND_IDS = ["open-my-work", "continue-research", "open-evidence", "open-trust"];
const SUGGESTED_COMMANDS = ASSISTANT_COMMANDS.filter((command) =>
  SUGGESTED_COMMAND_IDS.includes(command.id),
);

type VoiceStatus = "idle" | "requesting" | "listening" | "processing" | "permission-denied" | "network-error";

type AssistantCommandCenterProps = {
  size?: "compact" | "prominent";
  hideOrb?: boolean;
  onOrbStateChange?: (state: OperatorOrbState) => void;
};

export default function AssistantCommandCenter({
  size = "compact",
  hideOrb = false,
  onOrbStateChange,
}: AssistantCommandCenterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { profile, isActive, updateProfile } = useAssistantProfile();
  const { context, pinEntityToWorkspace } = usePlatformContext();
  const { t, language } = useTranslation();
  const inputId = useId();
  const speechLangId = useId();
  const [input, setInput] = useState("");
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>("idle");
  const [voicePhase, setVoicePhase] = useState<VoiceControlPhase>("idle");
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);
  const [unrecognized, setUnrecognized] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const [transcriptReview, setTranscriptReview] = useState<{
    text: string;
    confidence: number | null;
    lang: string;
    capturedAt: string;
  } | null>(null);
  const [actionProposal, setActionProposal] = useState<VoiceActionProposal | null>(null);
  const defaultSpeechLanguage = useMemo(
    () => resolveActiveSpeechLanguage(language, profile.speechLanguage),
    [language, profile.speechLanguage],
  );
  const [speechLanguageOverride, setSpeechLanguageOverride] = useState<string | null>(null);
  const speechLanguage = speechLanguageOverride ?? defaultSpeechLanguage;
  const sessionRef = useRef<SpeechRecognitionSession | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const focusedEntity = getPrimaryEntity(context);

  const assistantContext = useMemo(
    () => resolveAssistantContext(pathname, focusedEntity),
    [pathname, focusedEntity],
  );

  const relationshipFocus = useMemo<RelationshipFocus | null>(() => {
    const topicMatch = /^\/research\/([^/]+)$/.exec(pathname);
    if (topicMatch && getResearchTopicById(topicMatch[1])) {
      return { kind: "research_topic", id: topicMatch[1] };
    }
    return focusedEntity ? { kind: focusedEntity.kind, id: focusedEntity.id } : null;
  }, [pathname, focusedEntity]);

  const voiceResolverContext = useMemo(
    () => ({
      relationshipFocus,
      operatorName: resolveOperatorName(profile),
      focusedEntityName: focusedEntity?.name,
    }),
    [relationshipFocus, profile, focusedEntity?.name],
  );

  const executeDeps = useMemo(
    () => ({
      router,
      focusedEntity,
      pinEntityToWorkspace,
      updateProfile,
      t,
    }),
    [router, focusedEntity, pinEntityToWorkspace, updateProfile, t],
  );

  useEffect(() => {
    clearPendingVoiceActionStorage();
  }, []);

  const parseInput = useCallback(
    (rawInput: string) => resolveVoiceAction(rawInput, voiceResolverContext),
    [voiceResolverContext],
  );

  const resetVoiceFlow = useCallback(() => {
    setTranscriptReview(null);
    setActionProposal(null);
    setVoicePhase("idle");
    setVoiceStatus("idle");
    sessionRef.current?.stop();
  }, []);

  const presentProposal = useCallback(
    (proposal: VoiceActionProposal, fromVoice: boolean) => {
      setUnrecognized(null);
      setConfirmation(null);

      if (proposal.status === "blocked") {
        resetVoiceFlow();
        setUnrecognized(proposal.understoodText);
        setConfirmation(t("voiceControl.blockedTranscript"));
        return;
      }

      if (proposal.status === "unknown") {
        resetVoiceFlow();
        setUnrecognized(proposal.understoodText);
        recordWorkflowEvent("intent_unresolved", { outcome: "failure" });
        return;
      }

      if (voiceActionRequiresConfirmation(proposal) || fromVoice) {
        setActionProposal(proposal);
        setVoicePhase("action_review");
        return;
      }

      const message = executeVoiceAction(proposal, executeDeps);
      resetVoiceFlow();
      setInput("");
      if (message) setConfirmation(message);
    },
    [executeDeps, resetVoiceFlow, t],
  );

  const handleConfirmedAction = useCallback(() => {
    if (!actionProposal || actionProposal.status !== "known") return;
    setVoicePhase("executing");
    const message = executeVoiceAction(actionProposal, executeDeps);
    if (transcriptReview) {
      markVoiceTranscriptConfirmed(transcriptReview.text, transcriptReview.capturedAt);
    }
    resetVoiceFlow();
    setInput("");
    if (message) setConfirmation(message);
  }, [actionProposal, executeDeps, resetVoiceFlow, transcriptReview]);

  const route = useCallback(
    (rawInput: string, fromVoice = false) => {
      const trimmed = rawInput.trim();
      if (!trimmed) return;
      presentProposal(parseInput(trimmed), fromVoice);
    },
    [parseInput, presentProposal],
  );

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (voicePhase === "transcript_review" || voicePhase === "action_review") return;
    route(input, false);
  }

  function handleVoiceClick() {
    const Recognition = getSpeechRecognitionConstructor();
    if (!Recognition) return;

    if (voiceStatus === "listening" || voiceStatus === "requesting") {
      sessionRef.current?.stop();
      resetVoiceFlow();
      return;
    }

    resetVoiceFlow();
    setVoiceStatus("requesting");
    setVoicePhase("listening");

    const session = new SpeechRecognitionSession({
      onPhaseChange: (phase) => {
        if (phase === "listening") {
          setVoiceStatus("listening");
          setVoicePhase("listening");
        }
        if (phase === "transcript_review") {
          setVoiceStatus("processing");
          const result = session.consumeResult();
          if (!result) {
            setVoiceStatus("idle");
            setVoicePhase("idle");
            return;
          }
          const capturedAt = new Date().toISOString();
          appendVoiceTranscriptRecord(
            createVoiceTranscriptRecord({
              transcript: result.transcript,
              requestedLang: result.lang,
              confidence: result.confidence,
              humanConfirmed: false,
            }),
          );
          setTranscriptReview({
            text: result.transcript,
            confidence: result.confidence,
            lang: result.lang,
            capturedAt,
          });
          setInput(result.transcript);
          setVoicePhase("transcript_review");
          setVoiceStatus("idle");
        }
        if (phase === "error") setVoiceStatus("permission-denied");
        if (phase === "idle") setVoiceStatus("idle");
      },
      onError: (code) => {
        if (code === "not-allowed" || code === "permission-denied" || code === "service-not-allowed") {
          setVoiceStatus("permission-denied");
        } else if (code === "network") {
          setVoiceStatus("network-error");
        } else {
          setVoiceStatus("idle");
        }
        setVoicePhase("error");
      },
    });

    sessionRef.current = session;
    const started = session.start(speechLanguage);
    if (!started) {
      setVoiceStatus("idle");
      setVoicePhase("idle");
    }
  }

  function handleTranscriptConfirm() {
    if (!transcriptReview?.text.trim()) return;
    markVoiceTranscriptConfirmed(transcriptReview.text, transcriptReview.capturedAt);
    route(transcriptReview.text, true);
  }

  function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files && event.target.files.length > 0) {
      setUploadNotice(t("assistantVoice.uploadNotAvailable"));
    }
    event.target.value = "";
  }

  const hydrated = useHydrated();
  const speechSupported = hydrated && getSpeechRecognitionConstructor() !== null;
  const isProminent = size === "prominent";
  const voiceSupport = getLanguageDefinition(language).voiceSupport;
  const lowConfidence = transcriptReview
    ? looksLikeLowConfidenceTranscript(transcriptReview.text, transcriptReview.confidence)
    : false;
  const showUzbekWarning =
    Boolean(transcriptReview) &&
    speechLanguage.startsWith("uz") &&
    (lowConfidence || transcriptReview!.confidence === null);

  const voiceStatusLabel: Record<VoiceStatus, string> = {
    idle: t("assistant.micReady"),
    requesting: t("assistant.micRequesting"),
    listening: t("activation.voiceListening"),
    processing: t("activation.voiceUnderstanding"),
    "permission-denied": t("assistant.micPermissionDenied"),
    "network-error": t("assistant.micNetworkError"),
  };

  const operatorOrbState: OperatorOrbState = confirmation
    ? "success"
    : voicePhase === "transcript_review" || voicePhase === "action_review"
      ? "interpreting"
      : !speechSupported && hydrated
        ? "unsupported"
        : voiceStatus === "permission-denied"
          ? "permission-denied"
          : voiceStatus === "network-error"
            ? "warning"
            : voiceStatus === "listening" || voiceStatus === "requesting"
              ? voiceStatus === "requesting"
                ? "transcribing"
                : "listening"
              : voiceStatus === "processing"
                ? "interpreting"
                : "present";

  useEffect(() => {
    onOrbStateChange?.(operatorOrbState);
  }, [operatorOrbState, onOrbStateChange]);

  return (
    <div className={`w-full min-w-0 ${isProminent ? "max-w-2xl" : "max-w-md"}`}>
      {assistantContext ? (
        <Link
          href={assistantContext.href}
          className="mb-1.5 inline-flex items-center gap-1.5 text-[11px] text-zinc-500 hover:text-teal-300"
          title={t("assistantVoice.operatorContextTitle", { name: assistantContext.name })}
        >
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-teal-400" />
          {t("assistantVoice.contextPrefix")} {assistantContext.name}
        </Link>
      ) : null}
      <form
        role="search"
        aria-label={t("assistantVoice.commandCenterAria")}
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
          <div className={`flex shrink-0 items-center gap-1 ${isProminent ? "order-1" : ""}`}>
            <label htmlFor={speechLangId} className="sr-only">
              {t("voiceControl.speechLanguageLabel")}
            </label>
            <select
              id={speechLangId}
              value={speechLanguage}
              onChange={(event) => {
                setSpeechLanguageOverride(event.target.value);
                writeSpeechLanguageOverride(event.target.value);
              }}
              className={`rounded-lg border border-zinc-800 bg-slate-900/80 text-zinc-400 outline-none focus:border-teal-500/30 ${
                isProminent ? "h-14 px-2 text-xs" : "h-9 px-1.5 text-[10px]"
              }`}
              aria-label={t("voiceControl.speechLanguageLabel")}
            >
              {SPEECH_LANGUAGE_OPTIONS.map((option) => (
                <option key={option.code} value={option.code}>
                  {t(option.labelKey)}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleVoiceClick}
              disabled={!speechSupported}
              aria-disabled={!speechSupported}
              aria-label={speechSupported ? voiceStatusLabel[voiceStatus] : t("assistant.micUnsupportedBrowser")}
              title={speechSupported ? voiceStatusLabel[voiceStatus] : t("assistant.micUnsupportedBrowser")}
              className={`flex shrink-0 items-center justify-center border text-zinc-400 transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
                isProminent ? "h-14 w-14 rounded-full" : "h-9 w-9 rounded-lg"
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
          </div>
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
            title={t("assistantVoice.uploadNotAvailable")}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-slate-900/80 text-zinc-400 transition-colors hover:text-zinc-100"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13"
              />
            </svg>
            <span className="sr-only">{t("commandFeedback.uploadLabel")}</span>
          </button>
        ) : null}
      </form>

      {profile.voiceInputEnabled && speechSupported ? (
        <p className="mt-1.5 text-[11px] text-zinc-600">
          {voiceSupport === "partial" || voiceSupport === "unverified"
            ? t("voiceControl.capabilityBrowserDependent")
            : t("voiceControl.capabilityAvailable")}
        </p>
      ) : null}
      {profile.voiceInputEnabled && !speechSupported ? (
        <p className="mt-1.5 text-[11px] text-zinc-600">{t("activation.voiceUnsupportedRecovery")}</p>
      ) : null}
      {voicePhase === "transcript_review" || voicePhase === "action_review" ? (
        <p className="mt-1.5 text-[11px] text-zinc-500">{t("voiceControl.noNavigationUntilConfirmed")}</p>
      ) : null}
      {voiceStatus === "permission-denied" ? (
        <p role="alert" className="mt-1.5 text-[11px] text-amber-400">
          {t("assistant.micPermissionDenied")} {t("activation.voicePermissionRecovery")}
        </p>
      ) : null}
      {voiceStatus === "network-error" ? (
        <p role="alert" className="mt-1.5 text-[11px] text-amber-400">
          {t("assistant.micNetworkError")}
        </p>
      ) : null}

      {transcriptReview && voicePhase === "transcript_review" ? (
        <VoiceTranscriptReviewPanel
          recognitionLang={transcriptReview.lang}
          transcript={transcriptReview.text}
          confidence={transcriptReview.confidence}
          lowConfidence={lowConfidence}
          showUzbekWarning={showUzbekWarning}
          onTranscriptChange={(value) => {
            setTranscriptReview((current) => (current ? { ...current, text: value } : current));
            setInput(value);
          }}
          onClear={() => {
            setTranscriptReview((current) => (current ? { ...current, text: "" } : current));
            setInput("");
          }}
          onTryAgain={() => {
            resetVoiceFlow();
            handleVoiceClick();
          }}
          onUseText={handleTranscriptConfirm}
          onCancel={resetVoiceFlow}
        />
      ) : null}

      {actionProposal && voicePhase === "action_review" ? (
        <VoiceActionReviewPanel
          proposal={actionProposal}
          onConfirm={handleConfirmedAction}
          onEdit={() => {
            setVoicePhase("transcript_review");
            setActionProposal(null);
          }}
          onCancel={resetVoiceFlow}
        />
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
            {t("commandFeedback.unrecognized", { input: unrecognized })}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {assistantContext ? (
              <button
                type="button"
                onClick={() => {
                  setUnrecognized(null);
                  const proposal = parseInput(`open ${assistantContext.name}`);
                  if (proposal.status === "known" && proposal.href) {
                    setActionProposal(proposal);
                    setVoicePhase("action_review");
                  }
                }}
                className="rounded-full border border-teal-500/30 bg-teal-500/10 px-2.5 py-1 text-[11px] text-teal-300 transition-colors hover:border-teal-500/50"
              >
                {t("commandFeedback.openEntity", { name: assistantContext.name })}
              </button>
            ) : null}
            {SUGGESTED_COMMANDS.map((command) => (
              <button
                key={command.id}
                type="button"
                onClick={() => route(displayCommandPhrase(command, language), false)}
                className="rounded-full border border-zinc-800 bg-zinc-900/60 px-2.5 py-1 text-[11px] text-zinc-400 transition-colors hover:text-zinc-100"
              >
                {displayCommandPhrase(command, language)}
              </button>
            ))}
          </div>
          <Link
            href={`/search?q=${encodeURIComponent(unrecognized)}`}
            className="inline-flex text-xs font-medium text-teal-400 hover:text-teal-300"
          >
            {t("commandFeedback.searchUnrecognized", { input: unrecognized })}
          </Link>
        </div>
      ) : null}
    </div>
  );
}
