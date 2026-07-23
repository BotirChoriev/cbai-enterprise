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
import {
  appendConversationTurn,
  clearVoiceSessionMemory,
  createVoiceSessionMemory,
  readVoiceSessionMemory,
} from "@/lib/voice-operator/session-memory";
import {
  clearConversationPendingState,
  resolveOperatorMode,
} from "@/lib/voice-operator/conversation-engine";
import { runDigitalAssistant } from "@/lib/voice-operator/digital-assistant";
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
import { usePlatformContext } from "@/components/platform/context/PlatformContextProvider";
import { resolveOperatorName } from "@/lib/assistant/assistant-profile";
import { getPrimaryEntity } from "@/lib/context";
import { getResearchTopicById } from "@/lib/research/research-topics";
import type { RelationshipFocus } from "@/lib/assistant/assistant-relationship-commands";

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
        }
      }
      if (phase === "error") onDockState("error");
    },
    onError: (code) => {
      const issue = mapSpeechRecognitionError(code);
      if (issue) {
        onIssue(issue);
        onDockState(issue === "network_disconnected" ? "error" : "permission_required");
      } else {
        onDockState("error");
      }
    },
  });
  sessionRef.current = session;
  if (!session.start(speechLang)) {
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
  const { profile, updateProfile } = useAssistantProfile();
  const { context, pinEntityToWorkspace } = usePlatformContext();
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
  const [muted] = useState(false);
  const [awaitingConsent, setAwaitingConsent] = useState(false);
  const sessionRef = useRef<SpeechRecognitionSession | null>(null);
  const realtimeProviderRef = useRef<RealtimeVoiceProvider | null>(null);
  const realtimeStartingRef = useRef(false);
  const realtimeUnsubsRef = useRef<Array<() => void>>([]);
  const liveCaptureGenerationRef = useRef(0);

  const operatorMode = useMemo(() => resolveOperatorMode(language), [language]);
  const brokerConfigured = !operatorMode.backendRequired;
  const micLive = isLiveMicDockState(dockState);

  const focusedEntity = getPrimaryEntity(context);
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

  const releaseLiveAudioResources = useCallback(() => {
    liveCaptureGenerationRef.current += 1;
    realtimeStartingRef.current = false;
    sessionRef.current?.stop();
    sessionRef.current = null;
    clearRealtimeBindings();
    realtimeProviderRef.current?.disconnect();
  }, [clearRealtimeBindings]);

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
  }, [pathname, releaseLiveAudioResources]);

  const bumpTranscript = useCallback(() => {
    setTranscriptRevision((value) => value + 1);
  }, []);

  const applyResponse = useCallback(
    async (userText: string, options?: { userTurnAlreadyRecorded?: boolean; sideEffectsOnly?: boolean }) => {
      setDockState("thinking");
      const response = await runDigitalAssistant(userText, {
        language,
        router,
        voiceResolverContext,
        executeDeps,
        toolContext,
        platformContext: context,
        pathname,
        userTurnAlreadyRecorded: options?.userTurnAlreadyRecorded,
        sideEffectsOnly: options?.sideEffectsOnly,
      });
      setDockState(response.awaitingConsent ? "action_confirmation" : "responding");
      setAwaitingConsent(Boolean(response.awaitingConsent));
      if (response.evidenceResults) {
        setEvidenceResults(response.evidenceResults);
      }
      if (response.openEvidencePanel) {
        setEvidenceOpen(true);
      }
      bumpTranscript();
      setTimeout(() => setDockState(sessionActive ? "ready" : "closed"), 800);
    },
    [language, router, voiceResolverContext, executeDeps, toolContext, context, pathname, sessionActive, bumpTranscript],
  );

  const syncBrokerIssue = useCallback(() => {
    setBrokerIssue(operatorMode.backendRequired ? "required" : null);
  }, [operatorMode.backendRequired]);

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

      setDockState("listening");
      startBrowserSpeechSession(
        language,
        profile.speechLanguage,
        applyResponse,
        sessionRef,
        setPermissionIssue,
        setDockState,
      );
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

        const brokerRes = await requestRealtimeSessionCredential({
          language,
          origin: typeof window !== "undefined" ? window.location.origin : "",
          sessionHint: sessionMemory.sessionId,
        });

        if (!gate.isCurrent()) return;

        if (!brokerRes.ok) {
          setBrokerIssue(mapBrokerCodeToIssue(brokerRes.code));
          setDockState("error");
          return;
        }

        clearRealtimeBindings();
        realtimeUnsubsRef.current.push(
          provider.onStateChange((state) => {
            if (!gate.isCurrent()) return;
            setDockState(mapRealtimeStateToDockState(state));
          }),
          provider.onTranscript((event) => {
            if (!gate.isCurrent()) return;
            if (!event.final || !event.text.trim()) return;
            appendConversationTurn({ role: event.role, text: event.text.trim() });
            bumpTranscript();
            // Digital Assistant side-effects (navigate / mission) for user speech;
            // Realtime model still speaks — avoid duplicate assistant transcript lines.
            if (event.role === "user") {
              void applyResponse(event.text.trim(), {
                userTurnAlreadyRecorded: true,
                sideEffectsOnly: true,
              });
            }
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
          setBrokerIssue("unreachable");
          setDockState("error");
          stopLiveAudioCapture();
          return;
        }

        setDockState(mapRealtimeStateToDockState(state));
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
    [language, bumpTranscript, clearRealtimeBindings, stopLiveAudioCapture, applyResponse],
  );

  const openDock = useCallback(() => {
    setDockOpen(true);
    syncBrokerIssue();
    if (!sessionActive) {
      createVoiceSessionMemory(language, operatorMode.mode);
      setDockState(operatorMode.backendRequired ? "backend_required" : "ready");
    } else {
      setDockState(micLive ? "listening" : "ready");
    }
  }, [language, operatorMode, sessionActive, syncBrokerIssue, micLive]);

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
    setSessionActive(false);
    setEvidenceOpen(false);
    setEvidenceResults(null);
    setAwaitingConsent(false);
    setPermissionIssue(null);
    setDockState("closed");
    setDockOpen(false);
    syncBrokerIssue();
  }, [stopLiveAudioCapture, syncBrokerIssue]);

  const sendTextMessage = useCallback(async () => {
    const text = textInput.trim();
    if (!text) return;
    setTextInput("");
    setSessionActive(true);
    setTranscriptVisible(true);
    setDockOpen(true);
    // User turn is recorded inside runDigitalAssistant.
    await applyResponse(text);
  }, [textInput, applyResponse]);

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
    setDockState(dockOpen ? (brokerIssue ? "backend_required" : "ready") : "closed");
  }, [dockOpen, brokerIssue]);

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
    setDockState(brokerIssue ? "backend_required" : "ready");
  }, [brokerIssue]);

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
  };

  return <VoiceOperatorContext.Provider value={value}>{children}</VoiceOperatorContext.Provider>;
}
