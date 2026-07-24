"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import type {
  EvidenceResultsPayload,
  VoiceBrokerIssue,
  VoiceDockState,
  VoicePermissionIssue,
} from "@/lib/voice-operator/types";
import type { PlatformGuidance, PlatformActionId } from "@/lib/platform-actions/types";
import {
  buildRealtimeToolOutputMessages,
  createRealtimeToolHandlerState,
  platformToolCallToResult,
} from "@/lib/platform-actions/realtime-tool-handler";
import { validatePlatformToolArguments } from "@/lib/platform-actions/realtime-tool-schemas";
import { resolvePlatformActionFromIntent } from "@/lib/platform-actions/resolve-platform-action";
import { applyPlatformActionResult } from "@/lib/platform-actions/apply-platform-action";
import { isAllowedNavigationHref } from "@/lib/platform-actions/registry";
import {
  appendConversationTurn,
  clearVoiceSessionMemory,
  createVoiceSessionMemory,
  readVoiceSessionMemory,
} from "@/lib/voice-operator/session-memory";
import {
  clearVoiceCommandDedupe,
  executeVoiceCommand,
  markVoiceIntroduced,
  readVoiceSessionContext,
  resetVoiceSessionContext,
  type VoiceCommandClarifyOption,
  type VoiceOperatorActionStatus,
} from "@/lib/voice-operator/commands";
import {
  markVoiceFirstRunIntroComplete,
  needsVoiceFirstRunIntro,
} from "@/lib/voice-operator/identity";
import { getVoiceOperatorFirstRunIntro, getVoiceOperatorIntroPhrase } from "@/lib/voice-operator/instructions";
import {
  clearConversationPendingState,
  processConversationInput,
  resolveOperatorMode,
} from "@/lib/voice-operator/conversation-engine";
import {
  mapSpeechRecognitionError,
  requestMicrophoneAccess,
} from "@/lib/voice-operator/microphone-access";
import { requestRealtimeSessionCredential } from "@/lib/voice-operator/session-broker/client";
import {
  mapBrokerCodeToIssue,
  mapRealtimeStateToDockState,
} from "@/lib/voice-operator/realtime/realtime-events";
import {
  RealtimeMicrophoneError,
  type RealtimeVoiceProvider,
  resolveRealtimeProvider,
} from "@/lib/voice-operator/realtime/realtime-provider";
import { createLiveCaptureGate, isLiveMicDockState } from "@/lib/voice-operator/voice-session-lifecycle";
import { revokeExternalSearchConsent } from "@/lib/voice-operator/tools/voice-tools";
import { SpeechRecognitionSession } from "@/lib/voice/speech-recognition-session";
import { resolveActiveSpeechLanguage } from "@/lib/voice/speech-language-preference";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useAssistantProfile } from "@/components/platform/context/AssistantProfileProvider";
import { useAuth } from "@/components/platform/context/AuthProvider";
import { canonicalOsActionForPlatformId } from "@/lib/platform-actions/action-registry";
import {
  createPendingAuthIntent,
  guestGateMessageKey,
  guestMayExecute,
  savePendingAuthIntent,
} from "@/lib/voice-operator/auth-action-policy";
import { useOperationalObjects } from "@/components/operational-objects/OperationalObjectProvider";

type VoiceOperatorContextValue = {
  readonly dockOpen: boolean;
  readonly dockState: VoiceDockState;
  readonly micLive: boolean;
  readonly permissionIssue: VoicePermissionIssue | null;
  readonly brokerIssue: VoiceBrokerIssue | null;
  readonly transcriptVisible: boolean;
  readonly transcriptRevision: number;
  readonly textInput: string;
  readonly evidenceResults: EvidenceResultsPayload | null;
  readonly evidenceOpen: boolean;
  readonly backendRequired: boolean;
  readonly modeNotice: string;
  readonly sessionActive: boolean;
  readonly muted: boolean;
  openDock: () => void;
  closeDock: () => void;
  toggleTranscript: () => void;
  setTextInput: (value: string) => void;
  sendTextMessage: () => Promise<void>;
  startListening: () => Promise<void>;
  stopListening: () => void;
  endSession: () => void;
  dismissPermission: () => void;
  retryPermission: () => void;
  closeEvidence: () => void;
  revokeExternalSearch: () => void;
  confirmConsent: () => Promise<void>;
  cancelConsent: () => void;
  awaitingConsent: boolean;
  readonly operatorGuidance: PlatformGuidance | null;
  dismissGuidance: () => void;
  readonly actionStatus: VoiceOperatorActionStatus;
  readonly actionStatusDetail: string | null;
  readonly clarifyOptions: readonly VoiceCommandClarifyOption[] | null;
  readonly clarifyQuestion: string | null;
  dismissClarify: () => void;
  chooseClarifyOption: (option: VoiceCommandClarifyOption) => void;
};

const VoiceOperatorContext = createContext<VoiceOperatorContextValue | null>(null);

export function useVoiceOperator(): VoiceOperatorContextValue {
  const ctx = useContext(VoiceOperatorContext);
  if (!ctx) throw new Error("useVoiceOperator must be used within VoiceOperatorProvider");
  return ctx;
}

function startBrowserSpeechSession(
  language: string,
  profileSpeechLanguage: string | undefined,
  applyResponse: (text: string) => Promise<void>,
  sessionRef: React.MutableRefObject<SpeechRecognitionSession | null>,
  onIssue: (issue: VoicePermissionIssue) => void,
  onDockState: (state: VoiceDockState) => void,
  onCaptureEnded: () => void,
): boolean {
  const speechLang = resolveActiveSpeechLanguage(language, profileSpeechLanguage);
  const session = new SpeechRecognitionSession({
    onPhaseChange: (phase) => {
      if (phase === "listening") onDockState("listening");
      if (phase === "transcript_review") {
        const result = session.consumeResult();
        onDockState("thinking");
        if (result?.transcript) {
          void applyResponse(result.transcript);
        } else {
          onDockState("ready");
          onCaptureEnded();
        }
      }
      if (phase === "error") {
        onDockState("error");
        onCaptureEnded();
      }
      if (phase === "idle") {
        onCaptureEnded();
      }
    },
    onError: (code) => {
      if (code === "aborted") {
        onCaptureEnded();
        return;
      }
      const issue = mapSpeechRecognitionError(code);
      if (issue) {
        onIssue(issue);
        onDockState(issue === "network_disconnected" ? "error" : "permission_required");
      } else {
        onDockState("error");
      }
      onCaptureEnded();
    },
  });
  sessionRef.current = session;
  if (!session.start(speechLang)) {
    sessionRef.current = null;
    onIssue("unsupported");
    onDockState("permission_required");
    return false;
  }
  return true;
}

export default function VoiceOperatorProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { language, t } = useTranslation();
  const { profile } = useAssistantProfile();
  const { isSignedIn } = useAuth();
  const operationalObjects = useOperationalObjects();
  const [dockOpen, setDockOpen] = useState(false);
  const [dockState, setDockState] = useState<VoiceDockState>("closed");
  const [permissionIssue, setPermissionIssue] = useState<VoicePermissionIssue | null>(null);
  const [brokerIssue, setBrokerIssue] = useState<VoiceBrokerIssue | null>(null);
  const [transcriptVisible, setTranscriptVisible] = useState(false);
  const [transcriptRevision, setTranscriptRevision] = useState(0);
  const [textInput, setTextInput] = useState("");
  const [evidenceResults, setEvidenceResults] = useState<EvidenceResultsPayload | null>(null);
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [captureActive, setCaptureActive] = useState(false);
  const [muted] = useState(false);
  const [awaitingConsent, setAwaitingConsent] = useState(false);
  const [operatorGuidance, setOperatorGuidance] = useState<PlatformGuidance | null>(null);
  const [actionStatus, setActionStatus] = useState<VoiceOperatorActionStatus>("idle");
  const [actionStatusDetail, setActionStatusDetail] = useState<string | null>(null);
  const [clarifyOptions, setClarifyOptions] = useState<readonly VoiceCommandClarifyOption[] | null>(null);
  const [clarifyQuestion, setClarifyQuestion] = useState<string | null>(null);
  const sessionRef = useRef<SpeechRecognitionSession | null>(null);
  const realtimeProviderRef = useRef<RealtimeVoiceProvider | null>(null);
  const realtimeStartingRef = useRef(false);
  const realtimeUnsubsRef = useRef<Array<() => void>>([]);
  const liveCaptureGenerationRef = useRef(0);
  /** Aborts in-flight broker credential fetches on teardown (route change, Stop, Close, End, unload). */
  const brokerAbortRef = useRef<AbortController | null>(null);
  const toolHandlerStateRef = useRef(createRealtimeToolHandlerState(0));
  /** Suppress duplicate transcript orchestration when Realtime tool already handled the same utterance. */
  const recentToolStatementRef = useRef<{ text: string; at: number } | null>(null);
  /** Announce navigation success only after pathname matches the allowlisted target. */
  const pendingNavAnnounceRef = useRef<{
    href: string;
    message: string;
    generation: number;
    timeoutId: number | null;
  } | null>(null);
  const navAnnounceGenerationRef = useRef(0);
  /** Skip first pathname effect run so mount does not tear down a not-yet-started session. */
  const pathnameForTeardownRef = useRef(pathname);

  const operatorMode = useMemo(() => resolveOperatorMode(language), [language]);
  const brokerConfigured = operatorMode.realtimeConfigured;
  /**
   * Invariant: `captureActive` is the React-visible mirror of owned capture resources.
   * Set true only after SpeechRecognition start succeeds, or after Realtime connect when
   * `provider.hasLiveCaptureResources()` is true (MediaStreamTrack.readyState === "live",
   * or mock connect flag). Cleared only via `releaseLiveAudioResources`, which aborts broker
   * work, stops SpeechRecognition, disconnects WebRTC (tracks/DC/PC/audio element), and
   * bumps the generation gate so late async results cannot reactivate capture.
   * `micLive` also treats live dock phases as live so Stop remains available during orchestration.
   */
  const micLive = captureActive || isLiveMicDockState(dockState);
  const beginBrokerRequest = useCallback((): AbortSignal => {
    brokerAbortRef.current?.abort();
    const controller = new AbortController();
    brokerAbortRef.current = controller;
    return controller.signal;
  }, []);

  const toolContext = useMemo(
    () => ({
      sessionId: readVoiceSessionMemory()?.sessionId ?? "pending",
      language,
      smartIdeaId: null,
    }),
    [language, transcriptRevision],
  );

  const clearRealtimeBindings = useCallback(() => {
    realtimeUnsubsRef.current.forEach((unsub) => unsub());
    realtimeUnsubsRef.current = [];
  }, []);

  const clearPendingNavAnnounce = useCallback(() => {
    const pending = pendingNavAnnounceRef.current;
    if (pending?.timeoutId != null) {
      window.clearTimeout(pending.timeoutId);
    }
    pendingNavAnnounceRef.current = null;
  }, []);

  const releaseLiveAudioResources = useCallback(() => {
    // Invalidate every in-flight broker/WebRTC/SpeechRecognition continuation first.
    liveCaptureGenerationRef.current += 1;
    realtimeStartingRef.current = false;
    brokerAbortRef.current?.abort();
    brokerAbortRef.current = null;
    sessionRef.current?.stop();
    sessionRef.current = null;
    clearRealtimeBindings();
    clearPendingNavAnnounce();
    // disconnect → cleanupWebRtcSessionResources: abort connect, close DC/PC, stop tracks, dispose audio.
    realtimeProviderRef.current?.disconnect();
    setCaptureActive(false);
  }, [clearPendingNavAnnounce, clearRealtimeBindings]);

  const stopLiveAudioCapture = useCallback(() => {
    releaseLiveAudioResources();
    setDockState((state) => (isLiveMicDockState(state) ? "ready" : state));
  }, [releaseLiveAudioResources]);

  useEffect(() => {
    realtimeProviderRef.current = resolveRealtimeProvider(brokerConfigured);
    return () => {
      releaseLiveAudioResources();
      realtimeProviderRef.current = null;
    };
  }, [brokerConfigured, releaseLiveAudioResources]);

  useEffect(() => {
    return () => {
      releaseLiveAudioResources();
      setDockState((state) => (isLiveMicDockState(state) ? "ready" : state));
    };
  }, [releaseLiveAudioResources]);

  // Privacy P0: SPA route changes must release the mic immediately (Safari indicator).
  // Transcript / session memory are preserved — only live capture resources are torn down.
  useEffect(() => {
    if (pathnameForTeardownRef.current === pathname) return;
    pathnameForTeardownRef.current = pathname;
    releaseLiveAudioResources();
    setDockState((state) => {
      if (state === "closed") return state;
      return "ready";
    });
  }, [pathname, releaseLiveAudioResources]);

  useEffect(() => {
    const onPageHide = () => {
      releaseLiveAudioResources();
    };
    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("beforeunload", onPageHide);
    return () => {
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("beforeunload", onPageHide);
    };
  }, [releaseLiveAudioResources]);

  const bumpTranscript = useCallback(() => {
    setTranscriptRevision((value) => value + 1);
  }, []);

  const hrefMatchesPathname = useCallback((href: string, path: string) => {
    const targetPath = href.split("?")[0] || "/";
    if (targetPath === "/") return path === "/";
    return path === targetPath || path.startsWith(`${targetPath}/`);
  }, []);

  const scheduleNavSuccessAnnounce = useCallback(
    (href: string, message: string) => {
      clearPendingNavAnnounce();
      navAnnounceGenerationRef.current += 1;
      const generation = navAnnounceGenerationRef.current;

      if (hrefMatchesPathname(href, pathname)) {
        appendConversationTurn({ role: "assistant", text: message });
        bumpTranscript();
        return;
      }

      const timeoutId = window.setTimeout(() => {
        const pending = pendingNavAnnounceRef.current;
        if (!pending || pending.generation !== generation) return;
        pendingNavAnnounceRef.current = null;
        appendConversationTurn({
          role: "assistant",
          text: t("platformAction.failureNavigate"),
        });
        bumpTranscript();
      }, 4500);

      pendingNavAnnounceRef.current = { href, message, generation, timeoutId };
    },
    [bumpTranscript, clearPendingNavAnnounce, hrefMatchesPathname, pathname, t],
  );

  useEffect(() => {
    const pending = pendingNavAnnounceRef.current;
    if (!pending) return;
    if (!hrefMatchesPathname(pending.href, pathname)) return;
    if (pending.timeoutId != null) window.clearTimeout(pending.timeoutId);
    pendingNavAnnounceRef.current = null;
    appendConversationTurn({ role: "assistant", text: pending.message });
    bumpTranscript();
  }, [bumpTranscript, hrefMatchesPathname, pathname]);

  const applyResponse = useCallback(
    async (userText: string, eventId?: string) => {
      const platformContext = {
        locale: language,
        pathname,
        missionId: null,
        projectId: null,
        originalText: userText,
      };

      setDockState("executing_action");
      setClarifyOptions(null);
      setClarifyQuestion(null);

      const orchestrated = executeVoiceCommand(
        { text: userText, locale: language, pathname, final: true, eventId },
        platformContext,
        {
          router,
          openComposer: (draft, inferredFields, source) => {
            operationalObjects.openComposer(
              { ...draft, provenance: { ...draft.provenance, source } },
              inferredFields,
              source,
            );
          },
          onLocalControl: (control) => {
            if (control === "voice.stop") stopLiveAudioCapture();
            if (control === "voice.close") {
              releaseLiveAudioResources();
              setAwaitingConsent(false);
              setPermissionIssue(null);
              setDockOpen(false);
              setDockState("closed");
            }
            if (control === "transcript.show") setTranscriptVisible(true);
            if (control === "transcript.hide") setTranscriptVisible(false);
            if (control === "navigate.back") router.back();
          },
          setGuidance: setOperatorGuidance,
          setTranscriptVisible,
          t: (path, vars) => t(path, vars),
          isSignedIn,
          onRequireSignIn: (message, href) => {
            appendConversationTurn({ role: "assistant", text: message });
            bumpTranscript();
            router.push(href);
          },
          onStatus: (status, detail) => {
            setActionStatus(status);
            setActionStatusDetail(detail ?? null);
            if (status === "completed" || status === "selected") {
              window.setTimeout(() => {
                setActionStatus("idle");
                setActionStatusDetail(null);
              }, 3500);
            }
          },
          onClarify: (options, question) => {
            setClarifyOptions(options);
            setClarifyQuestion(question);
          },
        },
      );

      if (orchestrated.duplicate) {
        setDockState(sessionActive ? "ready" : "closed");
        return;
      }

      if (orchestrated.message) {
        if (orchestrated.href && orchestrated.executed && !orchestrated.awaitingConfirmation) {
          scheduleNavSuccessAnnounce(orchestrated.href, orchestrated.message);
        } else {
          appendConversationTurn({ role: "assistant", text: orchestrated.message });
          bumpTranscript();
        }
      }

      if (orchestrated.executed || orchestrated.status === "clarifying") {
        setAwaitingConsent(orchestrated.awaitingConfirmation);
        setDockState(
          orchestrated.awaitingConfirmation
            ? "awaiting_confirmation"
            : sessionActive
              ? "ready"
              : "closed",
        );
        return;
      }

      const voiceExecuteDeps = {
        router,
        focusedEntity: null,
        pinEntityToWorkspace: () => {},
        updateProfile: () => {},
        t,
      };

      const handled = operationalObjects.submitCommand(
        userText,
        { relationshipFocus: null, operatorName: profile.name, focusedEntityName: undefined },
        voiceExecuteDeps,
        "voice_command",
        "full",
      );
      if (handled) {
        setDockState(sessionActive ? "ready" : "closed");
        return;
      }

      setDockState("thinking");
      const response = await processConversationInput(userText, toolContext);
      setDockState(response.awaitingConsent ? "action_confirmation" : "responding");
      setAwaitingConsent(Boolean(response.awaitingConsent));
      if (response.evidenceResults) {
        setEvidenceResults(response.evidenceResults);
      }
      if (response.openEvidencePanel) {
        setEvidenceOpen(true);
      }
      setTimeout(() => setDockState(sessionActive ? "ready" : "closed"), 800);
    },
    [
      toolContext,
      sessionActive,
      operationalObjects,
      router,
      profile.name,
      t,
      language,
      pathname,
      bumpTranscript,
      stopLiveAudioCapture,
      releaseLiveAudioResources,
      isSignedIn,
      scheduleNavSuccessAnnounce,
    ],
  );

  const syncBrokerIssue = useCallback(() => {
    setBrokerIssue(null);
  }, []);

  const startBrowserFallbackListening = useCallback(
    async (gate: ReturnType<typeof createLiveCaptureGate>) => {
      setPermissionIssue(null);
      setDockState("connecting");

      const micAccess = await requestMicrophoneAccess();
      if (!gate.isCurrent()) return;
      if (!micAccess.ok) {
        setPermissionIssue(micAccess.issue);
        setDockState("permission_required");
        return;
      }

      const started = startBrowserSpeechSession(
        language,
        profile.speechLanguage,
        applyResponse,
        sessionRef,
        setPermissionIssue,
        setDockState,
        () => setCaptureActive(false),
      );
      if (!started) {
        setCaptureActive(false);
        return;
      }
      setDockState("listening");
      setCaptureActive(true);
    },
    [language, profile.speechLanguage, applyResponse],
  );

  const startRealtimeListening = useCallback(
    async (gate: ReturnType<typeof createLiveCaptureGate>) => {
      if (realtimeStartingRef.current) return;
      realtimeStartingRef.current = true;

      setPermissionIssue(null);
      setBrokerIssue(null);
      setDockState("connecting");

      const provider = realtimeProviderRef.current ?? resolveRealtimeProvider(true);
      realtimeProviderRef.current = provider;

      try {
        const sessionMemory =
          readVoiceSessionMemory() ?? createVoiceSessionMemory(language, "realtime");

        const brokerRes = await requestRealtimeSessionCredential(
          {
            language,
            origin: typeof window !== "undefined" ? window.location.origin : "",
            sessionHint: sessionMemory.sessionId,
          },
          { signal: beginBrokerRequest() },
        );

        if (!gate.isCurrent()) return;

        if (!brokerRes.ok) {
          if (!gate.isCurrent()) return;
          const issue = mapBrokerCodeToIssue(brokerRes.code);
          if (brokerRes.code === "BACKEND_REQUIRED") {
            setBrokerIssue(issue);
            setDockState("backend_required");
            realtimeStartingRef.current = false;
            return;
          }
          if (brokerRes.code === "ORIGIN_BLOCKED") {
            setBrokerIssue(issue);
            setDockState("error");
            realtimeStartingRef.current = false;
            return;
          }
          if (
            brokerRes.code === "INVALID_API_KEY" ||
            brokerRes.code === "QUOTA_OR_ACCOUNT_BLOCKED" ||
            brokerRes.code === "AUTHENTICATION_FAILED" ||
            brokerRes.code === "RATE_LIMITED"
          ) {
            setBrokerIssue(issue);
            setDockState("error");
            realtimeStartingRef.current = false;
            return;
          }
          if (brokerRes.code === "ERROR") {
            // Aborted/cancelled broker work must not start SpeechRecognition fallback.
            if (/abort/i.test(brokerRes.message) || !gate.isCurrent()) {
              realtimeStartingRef.current = false;
              return;
            }
            setBrokerIssue(issue);
            realtimeStartingRef.current = false;
            await startBrowserFallbackListening(gate);
            return;
          }
          setBrokerIssue(issue);
          setDockState("error");
          return;
        }

        clearRealtimeBindings();
        toolHandlerStateRef.current = createRealtimeToolHandlerState(liveCaptureGenerationRef.current);
        realtimeUnsubsRef.current.push(
          provider.onStateChange((state) => {
            if (!gate.isCurrent()) return;
            setDockState(mapRealtimeStateToDockState(state));
          }),
          provider.onTranscript((event) => {
            if (!gate.isCurrent()) return;
            if (!event.final || !event.text.trim()) return;
            const trimmed = event.text.trim();
            appendConversationTurn({ role: event.role, text: trimmed });
            bumpTranscript();
            // Authoritative local command path — only final user transcripts execute.
            // Skip if a Realtime tool just applied the same statement (avoids double navigation).
            if (event.role === "user") {
              const recent = recentToolStatementRef.current;
              if (recent && recent.text === trimmed && Date.now() - recent.at < 3500) {
                return;
              }
              void applyResponse(trimmed, `transcript:${trimmed}`);
            }
          }),
          provider.onToolCall((toolCall) => {
            if (!gate.isCurrent()) return;
            // Realtime tool calls share the same allowlisted validator + apply path as typed/voice.
            const parsedArgs = (() => {
              try {
                return validatePlatformToolArguments(JSON.parse(toolCall.argumentsJson || "{}"));
              } catch {
                return null;
              }
            })();
            const statement = parsedArgs?.user_statement?.trim();
            const originalText = statement || toolCall.argumentsJson;

            setDockState("executing_action");
            const toolResult = platformToolCallToResult(
              {
                callId: toolCall.callId,
                name: toolCall.name,
                argumentsJson: toolCall.argumentsJson,
              },
              {
                locale: language,
                pathname,
                missionId: null,
                projectId: null,
                originalText,
              },
              toolHandlerStateRef.current,
              liveCaptureGenerationRef.current,
            );
            provider.sendToolResults(buildRealtimeToolOutputMessages(toolResult));

            if (statement) {
              appendConversationTurn({ role: "user", text: statement });
              bumpTranscript();
              recentToolStatementRef.current = { text: statement, at: Date.now() };
            }

            if (parsedArgs) {
              const actionId = parsedArgs.action_id as PlatformActionId;
              if (!isSignedIn && !guestMayExecute(actionId)) {
                const os = canonicalOsActionForPlatformId(actionId);
                const message = t(guestGateMessageKey(os));
                savePendingAuthIntent(
                  createPendingAuthIntent({
                    osAction: os,
                    platformActionId: actionId,
                    href: null,
                    titleHint: parsedArgs.title ?? parsedArgs.entity_name ?? null,
                    originalText,
                    locale: language,
                    metadata: {},
                  }),
                );
                appendConversationTurn({ role: "assistant", text: message });
                bumpTranscript();
                router.push("/account?resume=pending");
                setDockState("awaiting_confirmation");
                return;
              }
              const action = resolvePlatformActionFromIntent(
                {
                  actionId,
                  confidence: "high",
                  params: {
                    entityId: parsedArgs.entity_id,
                    entityName: parsedArgs.entity_name,
                    topicId: parsedArgs.topic_id,
                    query: parsedArgs.query,
                    title: parsedArgs.title,
                    userStatement: parsedArgs.user_statement,
                  },
                  originalText,
                },
                {
                  locale: language,
                  pathname,
                  missionId: null,
                  projectId: null,
                  originalText,
                },
              );
              const outcome = applyPlatformActionResult(action, {
                router,
                pathname,
                locale: language as import("@/lib/ontology/types").OntologyLocale,
                openComposer: (draft, inferredFields, source) => {
                  operationalObjects.openComposer(
                    { ...draft, provenance: { ...draft.provenance, source } },
                    inferredFields,
                    source,
                  );
                },
                onLocalControl: (control) => {
                  if (control === "voice.stop") stopLiveAudioCapture();
                  if (control === "voice.close") {
                    releaseLiveAudioResources();
                    setDockOpen(false);
                    setDockState("closed");
                  }
                  if (control === "transcript.show") setTranscriptVisible(true);
                  if (control === "transcript.hide") setTranscriptVisible(false);
                  if (control === "navigate.back") router.back();
                },
                setGuidance: setOperatorGuidance,
                setTranscriptVisible,
                t: (path, vars) => t(path, vars),
              });
              if (outcome.message) {
                if (outcome.navigatedHref && outcome.handled && !outcome.awaitingConfirmation) {
                  scheduleNavSuccessAnnounce(outcome.navigatedHref, outcome.message);
                } else {
                  appendConversationTurn({ role: "assistant", text: outcome.message });
                  bumpTranscript();
                }
              }
              setDockState(
                outcome.awaitingConfirmation
                  ? "awaiting_confirmation"
                  : outcome.handled
                    ? "listening"
                    : "ready",
              );
              return;
            }

            const output = toolResult.output;
            if (output.ok === true && typeof output.href === "string" && output.href.startsWith("/")) {
              if (isAllowedNavigationHref(output.href)) {
                router.push(output.href);
                setOperatorGuidance(null);
              }
            }
            setDockState("listening");
          }),
        );

        await provider.connect(brokerRes.credential, language);
        if (!gate.isCurrent()) {
          provider.disconnect();
          return;
        }

        const state = provider.getState();
        if (state === "authentication_failed") {
          setBrokerIssue("authentication_failed");
          setDockState("error");
          stopLiveAudioCapture();
          return;
        }
        if (state === "connection_failed" || state === "error" || state === "backend_required") {
          setBrokerIssue(state === "connection_failed" ? "connection_failed" : "unreachable");
          setDockState("error");
          stopLiveAudioCapture();
          return;
        }

        setDockState(mapRealtimeStateToDockState(state));
        // Source of truth: MediaStreamTrack liveness (mock provider mirrors connect/disconnect).
        setCaptureActive(provider.hasLiveCaptureResources());
        // First-run intro only after intentional activation — never unsolicited autoplay on page load.
        if (needsVoiceFirstRunIntro()) {
          const intro = getVoiceOperatorFirstRunIntro(language);
          appendConversationTurn({ role: "assistant", text: intro });
          bumpTranscript();
          markVoiceFirstRunIntroComplete();
          markVoiceIntroduced();
        } else if (!readVoiceSessionContext().introduced) {
          const intro = `${getVoiceOperatorIntroPhrase(language)} ${t("voiceCommand.askHowToHelp")}`;
          appendConversationTurn({ role: "assistant", text: intro });
          bumpTranscript();
          markVoiceIntroduced();
        }
      } catch (error) {
        if (!gate.isCurrent()) return;
        if (error instanceof RealtimeMicrophoneError) {
          setPermissionIssue(error.issue);
          setDockState("permission_required");
        } else {
          setBrokerIssue("unreachable");
          setDockState("error");
        }
        stopLiveAudioCapture();
      } finally {
        realtimeStartingRef.current = false;
      }
    },
    [language, bumpTranscript, clearRealtimeBindings, stopLiveAudioCapture, startBrowserFallbackListening, pathname, router, operationalObjects, applyResponse, t, isSignedIn, scheduleNavSuccessAnnounce, releaseLiveAudioResources, beginBrokerRequest],
  );

  const openDock = useCallback(() => {
    setDockOpen(true);
    setBrokerIssue(null);
    if (!sessionActive) {
      createVoiceSessionMemory(language, operatorMode.mode);
      setDockState("ready");
    } else {
      setDockState(micLive ? "listening" : "ready");
    }

    if (operatorMode.mode === "realtime") {
      const signal = beginBrokerRequest();
      const generation = liveCaptureGenerationRef.current;
      void requestRealtimeSessionCredential(
        {
          language,
          origin: typeof window !== "undefined" ? window.location.origin : "",
          sessionHint: readVoiceSessionMemory()?.sessionId,
        },
        { signal },
      ).then((res) => {
        if (generation !== liveCaptureGenerationRef.current || signal.aborted) return;
        if (!res.ok && res.code === "BACKEND_REQUIRED") {
          setBrokerIssue("required");
          setDockState("backend_required");
        }
      });
    }
  }, [language, operatorMode.mode, sessionActive, micLive, beginBrokerRequest]);

  const closeDock = useCallback(() => {
    releaseLiveAudioResources();
    setAwaitingConsent(false);
    setPermissionIssue(null);
    setDockOpen(false);
    setDockState("closed");
  }, [releaseLiveAudioResources]);

  const endSession = useCallback(() => {
    stopLiveAudioCapture();
    clearVoiceSessionMemory();
    clearConversationPendingState();
    resetVoiceSessionContext();
    clearVoiceCommandDedupe();
    setSessionActive(false);
    setEvidenceOpen(false);
    setEvidenceResults(null);
    setAwaitingConsent(false);
    setPermissionIssue(null);
    setActionStatus("idle");
    setActionStatusDetail(null);
    setClarifyOptions(null);
    setClarifyQuestion(null);
    setDockState("closed");
    setDockOpen(false);
    syncBrokerIssue();
  }, [stopLiveAudioCapture, syncBrokerIssue]);

  const dismissClarify = useCallback(() => {
    setClarifyOptions(null);
    setClarifyQuestion(null);
    setActionStatus("idle");
  }, []);

  const chooseClarifyOption = useCallback(
    (option: VoiceCommandClarifyOption) => {
      setClarifyOptions(null);
      setClarifyQuestion(null);
      const statement =
        option.id === "chemistry_research"
          ? language === "uz"
            ? "Kimyo tadqiqot mavzusini och"
            : "Open chemistry research"
          : option.id === "chemistry_evidence"
            ? language === "uz"
              ? "Dalillarni ko'rsat"
              : "Show evidence"
            : language === "uz"
              ? "Kimyo bo'yicha yangi ish reja tuz"
              : "Create chemistry work plan";
      appendConversationTurn({ role: "user", text: statement });
      bumpTranscript();
      void applyResponse(statement, `clarify:${option.id}`);
    },
    [applyResponse, bumpTranscript, language],
  );

  const sendTextMessage = useCallback(async () => {
    const text = textInput.trim();
    if (!text) return;
    setTextInput("");
    setSessionActive(true);
    setTranscriptVisible(true);
    appendConversationTurn({ role: "user", text });
    bumpTranscript();
    await applyResponse(text);
  }, [textInput, applyResponse, bumpTranscript]);

  const startListening = useCallback(async () => {
    if (muted || micLive || realtimeStartingRef.current) return;

    const gate = createLiveCaptureGate(() => liveCaptureGenerationRef.current);
    setSessionActive(true);
    setTranscriptVisible(true);

    if (operatorMode.mode === "realtime") {
      await startRealtimeListening(gate);
      return;
    }

    await startBrowserFallbackListening(gate);
  }, [muted, micLive, operatorMode.mode, startRealtimeListening, startBrowserFallbackListening]);

  const stopListening = useCallback(() => {
    stopLiveAudioCapture();
    setDockState(dockOpen ? "ready" : "closed");
  }, [dockOpen, stopLiveAudioCapture]);

  const dismissPermission = useCallback(() => {
    setPermissionIssue(null);
    setDockState(dockOpen ? "ready" : "closed");
  }, [dockOpen]);

  const retryPermission = useCallback(() => {
    setPermissionIssue(null);
    void startListening();
  }, [startListening]);

  const confirmConsent = useCallback(async () => {
    await applyResponse(language === "uz" ? "ha" : "yes");
    setAwaitingConsent(false);
  }, [applyResponse, language]);

  const cancelConsent = useCallback(() => {
    clearConversationPendingState();
    setAwaitingConsent(false);
    setDockState("ready");
  }, []);

  const dismissGuidance = useCallback(() => {
    setOperatorGuidance(null);
  }, []);

  const value: VoiceOperatorContextValue = {
    dockOpen,
    dockState,
    micLive,
    permissionIssue,
    brokerIssue,
    transcriptVisible,
    transcriptRevision,
    textInput,
    evidenceResults,
    evidenceOpen,
    backendRequired: operatorMode.backendRequired,
    modeNotice: operatorMode.notice,
    sessionActive,
    muted,
    operatorGuidance,
    openDock,
    closeDock,
    toggleTranscript: () => setTranscriptVisible((v) => !v),
    setTextInput,
    sendTextMessage,
    startListening,
    stopListening,
    endSession,
    dismissPermission,
    retryPermission,
    closeEvidence: () => setEvidenceOpen(false),
    revokeExternalSearch: () => revokeExternalSearchConsent(),
    confirmConsent,
    cancelConsent,
    awaitingConsent,
    dismissGuidance,
    actionStatus,
    actionStatusDetail,
    clarifyOptions,
    clarifyQuestion,
    dismissClarify,
    chooseClarifyOption,
  };

  return <VoiceOperatorContext.Provider value={value}>{children}</VoiceOperatorContext.Provider>;
}
