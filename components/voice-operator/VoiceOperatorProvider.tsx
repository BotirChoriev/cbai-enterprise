"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
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
import { getProblem, listProblems } from "@/lib/problems/problem-repository";
import { buildProblemVoiceSummary } from "@/lib/problems/problem-voice-summary";

type VoiceOperatorContextValue = {
  readonly dockOpen: boolean;
  readonly dockState: VoiceDockState;
  readonly micLive: boolean;
  readonly captureActive: boolean;
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

function subscribePageOrigin(): () => void {
  return () => undefined;
}

function readPageOrigin(): string {
  return window.location.origin;
}

function readServerPageOrigin(): null {
  return null;
}

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
  const readCurrentProblemSummary = useCallback(
    (requestedProblemId?: string): string | null => {
      const urlProblemId =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("problemId")
          : null;
      const problemId = requestedProblemId || urlProblemId || listProblems()[0]?.id;
      if (!problemId) return null;
      const problem = getProblem(problemId);
      return problem ? buildProblemVoiceSummary(problem, language) : null;
    },
    [language],
  );
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
  /**
   * When true, the next SPA pathname change was initiated by the Voice Operator.
   * Continuous conversation keeps the live session for *any* SPA navigation while capture is live;
   * this flag is retained for diagnostics and for restoring the listening dock state promptly.
   */
  const operatorNavRef = useRef(false);
  /** Ref mirrors read inside the route effect without widening its dependency array. */
  const sessionActiveRef = useRef(false);
  const captureActiveRef = useRef(false);

  const pageOrigin = useSyncExternalStore(
    subscribePageOrigin,
    readPageOrigin,
    readServerPageOrigin,
  );
  const operatorMode = useMemo(
    () => resolveOperatorMode(language, pageOrigin),
    [language, pageOrigin],
  );
  const brokerConfigured = operatorMode.realtimeConfigured;

  /** Drive layout reservation (desktop right inset) from a single document data attribute. */
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.cbaiVoiceDock = dockOpen ? "open" : "closed";
    return () => {
      root.dataset.cbaiVoiceDock = "closed";
    };
  }, [dockOpen]);

  /**
   * Router wrapper that flags operator-initiated navigation. Continuous conversation keeps the
   * Realtime session across SPA routes (see route effect); the flag helps restore listening UI.
   */
  const operatorRouter = useMemo(() => {
    const flag =
      <T extends (...args: never[]) => unknown>(fn: T): T =>
      ((...args: Parameters<T>) => {
        operatorNavRef.current = true;
        return fn(...args);
      }) as T;
    return {
      ...router,
      push: flag(router.push.bind(router)),
      replace: flag(router.replace.bind(router)),
      back: flag(router.back.bind(router)),
      forward: flag(router.forward.bind(router)),
    };
  }, [router]);
  /**
   * Invariant: `captureActive` is the React-visible mirror of owned capture resources.
   * Set true only after SpeechRecognition start succeeds, or after Realtime connect when
   * `provider.hasLiveCaptureResources()` is true (MediaStreamTrack.readyState === "live",
   * or mock connect flag). Cleared only via `releaseLiveAudioResources`, which aborts broker
   * work, stops SpeechRecognition, disconnects WebRTC (tracks/DC/PC/audio element), and
   * bumps the generation gate so late async results cannot reactivate capture.
   * `micLive` also treats live dock phases as live so Stop remains available during orchestration,
   * but never while a broker failure is active (Listening + unavailable must not coexist).
   */
  const micLive =
    brokerIssue == null && (captureActive || isLiveMicDockState(dockState));
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
    // Reuse the module-scoped Realtime provider so remounts do not open a second mic stream.
    realtimeProviderRef.current = resolveRealtimeProvider(brokerConfigured);
    return () => {
      releaseLiveAudioResources();
      // Do not null the shared provider instance — only clear this React tree's ref.
      realtimeProviderRef.current = null;
    };
  }, [brokerConfigured, releaseLiveAudioResources]);

  useEffect(() => {
    return () => {
      releaseLiveAudioResources();
      setDockState((state) => (isLiveMicDockState(state) ? "ready" : state));
    };
  }, [releaseLiveAudioResources]);

  useEffect(() => {
    sessionActiveRef.current = sessionActive;
    captureActiveRef.current = captureActive;
  }, [sessionActive, captureActive]);

  /**
   * Continuous conversation: SPA route changes must NOT tear down a live intentional session.
   * Transcript / session memory are always preserved.
   * Privacy release still happens on Stop / Close / End / pagehide / beforeunload / unmount
   * (Safari mic indicator clears when the user leaves or explicitly stops).
   */
  useEffect(() => {
    if (pathnameForTeardownRef.current === pathname) return;
    pathnameForTeardownRef.current = pathname;

    // Transcript memory is preserved, but the visible transcript auto-collapses on every
    // route change so an old conversation never visually dominates the new page (spec 2C).
    setTranscriptVisible(false);

    const operatorInitiated = operatorNavRef.current;
    operatorNavRef.current = false;

    const providerLive = realtimeProviderRef.current?.hasLiveCaptureResources() ?? false;
    const keepRealtimeSessionAlive =
      sessionActiveRef.current && (providerLive || captureActiveRef.current);

    if (keepRealtimeSessionAlive) {
      // After operator navigation (or any SPA nav while live), resume listening UI automatically.
      setDockState((state) => {
        if (state === "closed") return state;
        if (state === "awaiting_confirmation" || state === "action_confirmation" || state === "permission_required") {
          return state;
        }
        if (operatorInitiated || state === "ready" || state === "executing_action" || state === "responding") {
          return "listening";
        }
        return state;
      });
      if (providerLive && !captureActiveRef.current) {
        setCaptureActive(true);
      }
      return;
    }

    // Privacy P0: SPA route changes must release the mic immediately (Safari indicator)
    // when there is no intentional live session to preserve.
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
          text: t("voiceCommand.navigationDidNotComplete"),
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

  /** Prefer continuous listening when capture is still live; otherwise ready/closed. */
  const dockStateAfterTurn = useCallback(
    (opts?: { awaitingConfirmation?: boolean }): VoiceDockState => {
      if (opts?.awaitingConfirmation) return "awaiting_confirmation";
      const providerLive = realtimeProviderRef.current?.hasLiveCaptureResources() ?? false;
      if (providerLive || captureActiveRef.current) return "listening";
      return sessionActiveRef.current || sessionActive ? "ready" : "closed";
    },
    [sessionActive],
  );

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
          router: operatorRouter,
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
            if (control === "navigate.back") operatorRouter.back();
          },
          setGuidance: setOperatorGuidance,
          setTranscriptVisible,
          readProblemSummary: readCurrentProblemSummary,
          t: (path, vars) => t(path, vars),
          isSignedIn,
          onRequireSignIn: (message, href) => {
            appendConversationTurn({ role: "assistant", text: message });
            bumpTranscript();
            operatorRouter.push(href);
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
        setDockState(dockStateAfterTurn());
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

      if (orchestrated.executed || orchestrated.status === "clarifying" || orchestrated.status === "could_not_understand" || orchestrated.status === "waiting_confirmation") {
        setAwaitingConsent(orchestrated.awaitingConfirmation);
        setDockState(dockStateAfterTurn({ awaitingConfirmation: orchestrated.awaitingConfirmation }));
        return;
      }

      const voiceExecuteDeps = {
        router: operatorRouter,
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
        setDockState(dockStateAfterTurn());
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
      setTimeout(() => setDockState(dockStateAfterTurn({ awaitingConfirmation: response.awaitingConsent })), 800);
    },
    [
      toolContext,
      sessionActive,
      operationalObjects,
      operatorRouter,
      profile.name,
      t,
      language,
      pathname,
      bumpTranscript,
      stopLiveAudioCapture,
      releaseLiveAudioResources,
      isSignedIn,
      scheduleNavSuccessAnnounce,
      dockStateAfterTurn,
      readCurrentProblemSummary,
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

      const provider = realtimeProviderRef.current ?? resolveRealtimeProvider(true);
      realtimeProviderRef.current = provider;

      // Reuse the existing live Realtime session — never open a second mic / peer connection.
      if (provider.hasLiveCaptureResources()) {
        setCaptureActive(true);
        setDockState(mapRealtimeStateToDockState(provider.getState()) || "listening");
        realtimeStartingRef.current = false;
        return;
      }

      setDockState("connecting");

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
          // Aborted/cancelled broker work must not paint an error or restart capture.
          if (brokerRes.code === "ERROR" && (/abort/i.test(brokerRes.message) || !gate.isCurrent())) {
            realtimeStartingRef.current = false;
            return;
          }
          const issue = mapBrokerCodeToIssue(brokerRes.code);
          // P0: Realtime mode must never leave Listening + broker failure together.
          // Do not start browser SpeechRecognition after a broker failure — tear down
          // immediately and keep text chat usable.
          releaseLiveAudioResources();
          setCaptureActive(false);
          setBrokerIssue(issue);
          setDockState(brokerRes.code === "BACKEND_REQUIRED" ? "backend_required" : "error");
          realtimeStartingRef.current = false;
          return;
        }

        clearRealtimeBindings();
        toolHandlerStateRef.current = createRealtimeToolHandlerState(liveCaptureGenerationRef.current);
        realtimeUnsubsRef.current.push(
          provider.onStateChange((state) => {
            if (!gate.isCurrent()) return;
            // After the assistant finishes speaking, Realtime returns to listening — keep UI in sync.
            setDockState(mapRealtimeStateToDockState(state));
            if (
              (state === "listening" || state === "connected") &&
              provider.hasLiveCaptureResources()
            ) {
              setCaptureActive(true);
            }
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
                operatorRouter.push("/account?resume=pending");
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
                router: operatorRouter,
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
                  if (control === "navigate.back") operatorRouter.back();
                },
                setGuidance: setOperatorGuidance,
                setTranscriptVisible,
                readProblemSummary: readCurrentProblemSummary,
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
                operatorRouter.push(output.href);
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
          releaseLiveAudioResources();
          setCaptureActive(false);
          setBrokerIssue("authentication_failed");
          setDockState("error");
          return;
        }
        if (state === "connection_failed" || state === "error" || state === "backend_required") {
          releaseLiveAudioResources();
          setCaptureActive(false);
          setBrokerIssue(
            state === "connection_failed"
              ? "connection_failed"
              : state === "backend_required"
                ? "required"
                : "unreachable",
          );
          setDockState(state === "backend_required" ? "backend_required" : "error");
          return;
        }

        setBrokerIssue(null);
        setDockState(mapRealtimeStateToDockState(state));
        // Source of truth: MediaStreamTrack liveness (mock provider mirrors connect/disconnect).
        // Listening UI is gated on captureActive + listening family + no brokerIssue.
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
        releaseLiveAudioResources();
        setCaptureActive(false);
        if (error instanceof RealtimeMicrophoneError) {
          setPermissionIssue(error.issue);
          setDockState("permission_required");
        } else {
          setBrokerIssue("unreachable");
          setDockState("error");
        }
      } finally {
        realtimeStartingRef.current = false;
      }
    },
    [language, bumpTranscript, clearRealtimeBindings, pathname, operatorRouter, operationalObjects, applyResponse, t, isSignedIn, scheduleNavSuccessAnnounce, releaseLiveAudioResources, beginBrokerRequest, readCurrentProblemSummary, stopLiveAudioCapture],
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
    if (muted || realtimeStartingRef.current) return;

    // Reuse an already-live Realtime session — never open a duplicate mic stream.
    const provider = realtimeProviderRef.current;
    if (provider?.hasLiveCaptureResources()) {
      setSessionActive(true);
      setTranscriptVisible(true);
      setCaptureActive(true);
      setBrokerIssue(null);
      setDockState(mapRealtimeStateToDockState(provider.getState()) || "listening");
      return;
    }

    if (micLive) return;

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
    captureActive,
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
