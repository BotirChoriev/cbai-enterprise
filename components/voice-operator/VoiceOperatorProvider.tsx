"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { EvidenceResultsPayload, VoiceDockState, VoicePermissionIssue } from "@/lib/voice-operator/types";
import {
  clearVoiceSessionMemory,
  createVoiceSessionMemory,
  readVoiceSessionMemory,
} from "@/lib/voice-operator/session-memory";
import {
  clearConversationPendingState,
  processConversationInput,
  resolveOperatorMode,
} from "@/lib/voice-operator/conversation-engine";
import { revokeExternalSearchConsent } from "@/lib/voice-operator/tools/voice-tools";
import { SpeechRecognitionSession } from "@/lib/voice/speech-recognition-session";
import { resolveActiveSpeechLanguage } from "@/lib/voice/speech-language-preference";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useAssistantProfile } from "@/components/platform/context/AssistantProfileProvider";

type VoiceOperatorContextValue = {
  readonly dockOpen: boolean;
  readonly dockState: VoiceDockState;
  readonly permissionIssue: VoicePermissionIssue | null;
  readonly transcriptVisible: boolean;
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
  startListening: () => void;
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

export default function VoiceOperatorProvider({ children }: { children: ReactNode }) {
  const { language } = useTranslation();
  const { profile } = useAssistantProfile();
  const [dockOpen, setDockOpen] = useState(false);
  const [dockState, setDockState] = useState<VoiceDockState>("closed");
  const [permissionIssue, setPermissionIssue] = useState<VoicePermissionIssue | null>(null);
  const [transcriptVisible, setTranscriptVisible] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [evidenceResults, setEvidenceResults] = useState<EvidenceResultsPayload | null>(null);
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [muted] = useState(false);
  const [awaitingConsent, setAwaitingConsent] = useState(false);
  const sessionRef = useRef<SpeechRecognitionSession | null>(null);

  const operatorMode = useMemo(() => resolveOperatorMode(language), [language]);

  const toolContext = useMemo(
    () => ({
      sessionId: readVoiceSessionMemory()?.sessionId ?? "pending",
      language,
      smartIdeaId: null,
    }),
    [language],
  );

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

  const openDock = useCallback(() => {
    setDockOpen(true);
    if (!sessionActive) {
      createVoiceSessionMemory(language, operatorMode.mode);
      setDockState(operatorMode.backendRequired ? "backend_required" : "ready");
    } else {
      setDockState("ready");
    }
  }, [language, operatorMode, sessionActive]);

  const closeDock = useCallback(() => {
    setDockOpen(false);
    setDockState("closed");
    setPermissionIssue(null);
    setAwaitingConsent(false);
  }, []);

  const endSession = useCallback(() => {
    sessionRef.current?.stop();
    clearVoiceSessionMemory();
    clearConversationPendingState();
    setSessionActive(false);
    setEvidenceOpen(false);
    setEvidenceResults(null);
    setAwaitingConsent(false);
    setDockState("closed");
    setDockOpen(false);
  }, []);

  const sendTextMessage = useCallback(async () => {
    const text = textInput.trim();
    if (!text) return;
    setTextInput("");
    setSessionActive(true);
    setTranscriptVisible(true);
    await applyResponse(text);
  }, [textInput, applyResponse]);

  const startListening = useCallback(() => {
    if (muted || permissionIssue) return;
    setSessionActive(true);
    setTranscriptVisible(true);
    setDockState("listening");
    const speechLang = resolveActiveSpeechLanguage(language, profile.speechLanguage);
    const session = new SpeechRecognitionSession({
      onPhaseChange: (phase) => {
        if (phase === "listening") setDockState("listening");
        if (phase === "transcript_review") {
          const result = session.consumeResult();
          setDockState("thinking");
          if (result?.transcript) {
            void applyResponse(result.transcript);
          } else {
            setDockState("ready");
          }
        }
        if (phase === "error") setDockState("error");
      },
      onError: (code) => {
        if (code === "not-allowed" || code === "permission-denied" || code === "service-not-allowed") {
          setPermissionIssue("denied");
          setDockState("permission_required");
        } else if (code === "network") {
          setPermissionIssue("network_disconnected");
          setDockState("error");
        }
      },
    });
    sessionRef.current = session;
    if (!session.start(speechLang)) {
      setPermissionIssue("unsupported");
      setDockState("permission_required");
    }
  }, [muted, permissionIssue, language, profile.speechLanguage, applyResponse]);

  const stopListening = useCallback(() => {
    sessionRef.current?.stop();
    setDockState("ready");
  }, []);

  const dismissPermission = useCallback(() => {
    setPermissionIssue(null);
    setDockState(dockOpen ? "ready" : "closed");
  }, [dockOpen]);

  const retryPermission = useCallback(() => {
    setPermissionIssue(null);
    startListening();
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

  const value: VoiceOperatorContextValue = {
    dockOpen,
    dockState,
    permissionIssue,
    transcriptVisible,
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
