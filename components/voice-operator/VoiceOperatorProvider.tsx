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
import { usePathname } from "next/navigation";
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
  const { language } = useTranslation();
  const { profile } = useAssistantProfile();
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
    async (userText: string) => {
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
    [toolContext, sessionActive],
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
    [language, bumpTranscript, clearRealtimeBindings, stopLiveAudioCapture],
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
