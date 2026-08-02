"use client";

import { usePathname } from "next/navigation";
import { useVoiceOperator } from "@/components/voice-operator/VoiceOperatorProvider";
import EvidenceResultsDrawer from "@/components/voice-operator/EvidenceResultsDrawer";
import OperatorGuidanceCard from "@/components/voice-operator/OperatorGuidanceCard";
import OperatorActionStatus from "@/components/voice-operator/OperatorActionStatus";
import OperatorCommandClarifyCard from "@/components/voice-operator/OperatorCommandClarifyCard";
import VoiceOperatorPermissionCard from "@/components/voice-operator/VoiceOperatorPermissionCard";
import VoiceOperatorBrokerNotice from "@/components/voice-operator/VoiceOperatorBrokerNotice";
import VoiceOperatorDeveloperDiagnostics from "@/components/voice-operator/VoiceOperatorDeveloperDiagnostics";
import { useTranslation } from "@/lib/i18n/use-translation";
import { dockStateLabel } from "@/lib/i18n/platform-copy-voice-operator";
import { getDictionary } from "@/lib/i18n/translate";
import { readVoiceSessionMemory } from "@/lib/voice-operator/session-memory";
import { resolveCanonicalVoiceState, shouldShowLiveListeningBanner } from "@/lib/voice-operator/state-machine";

export default function VoiceOperatorDock() {
  const pathname = usePathname();
  const { t, language } = useTranslation();
  const vo = useVoiceOperator();
  const voiceCopy = getDictionary(language).voiceOperator;
  const isHome = pathname === "/";
  const copy = {
    dockTitle: t("voiceOperator.dockTitle"),
    openDock: t("voiceOperator.openDock"),
    closeDock: t("voiceOperator.closeDock"),
    stopConversation: t("voiceOperator.stopConversation"),
    muteMic: t("voiceOperator.muteMic"),
    unmuteMic: t("voiceOperator.unmuteMic"),
    liveListeningActive: t("voiceOperator.liveListeningActive"),
    liveListeningScope: t("voiceOperator.liveListeningScope"),
    stopLiveListening: t("voiceOperator.stopLiveListening"),
    showTranscript: t("voiceOperator.showTranscript"),
    hideTranscript: t("voiceOperator.hideTranscript"),
    textFallback: t("voiceOperator.textFallback"),
    sendMessage: t("voiceOperator.sendMessage"),
    localCapabilityNotice: t("voiceOperator.localCapabilityNotice"),
    localCapabilityUserNotice: t("voiceOperator.localCapabilityUserNotice"),
    localVoiceSetupHint: t("voiceOperator.localVoiceSetupHint"),
    browserFallbackNotice: t("voiceOperator.browserFallbackNotice"),
    transcriptTitle: t("voiceOperator.transcriptTitle"),
    youLabel: t("voiceOperator.youLabel"),
    cbaiLabel: t("voiceOperator.cbaiLabel"),
    consentYes: t("voiceOperator.consentYes"),
    consentNo: t("voiceOperator.consentNo"),
  };

  const session = readVoiceSessionMemory();
  void vo.transcriptRevision;
  const localVoiceUnavailable = vo.backendRequired && !vo.brokerIssue;
  const showBrokerError = vo.brokerIssue != null && vo.brokerIssue !== "required";
  // A missing Realtime broker must not disable the browser SpeechRecognition fallback.
  // startListening() performs the authoritative environment and permission checks.
  // Missing Realtime configuration is not a reason to disable the control: the
  // provider can still request microphone permission and start the browser's
  // SpeechRecognition fallback. Only a concrete broker failure disables retry
  // through this button; that notice exposes its own recovery action.
  const micDisabled = showBrokerError;
  const showDeveloperDiagnostics =
    process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_VOICE_DIAGNOSTICS === "1";
  /**
   * Single classification source for the dock. Text chat is answered by the
   * deterministic local orchestrator, so it stays usable when live voice is not.
   */
  const canonicalState = resolveCanonicalVoiceState({
    dockState: vo.dockState,
    brokerIssue: vo.brokerIssue,
    permissionIssue: vo.permissionIssue,
    textUsable: true,
    micLive: vo.micLive,
  });
  const stateLabel = dockStateLabel(voiceCopy, canonicalState);
  const showLiveListening = shouldShowLiveListeningBanner({
    dockState: vo.dockState,
    brokerIssue: vo.brokerIssue,
    captureActive: vo.captureActive,
    micLive: vo.micLive,
  });
  // Stop remains available while connecting or listening, but never alongside a broker failure.
  const showStopControl = vo.micLive && vo.brokerIssue == null;

  if (!vo.dockOpen && vo.dockState === "closed") {
    if (isHome) {
      return <EvidenceResultsDrawer />;
    }
    return (
      <>
        <div
          className="cbai-voice-dock-closed"
          data-voice-state={canonicalState}
          data-voice-launcher="global"
        >
          <button
            type="button"
            onClick={vo.openDock}
            className="cbai-spatial-voice-cta flex min-h-11 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition"
            aria-label={copy.openDock}
            data-voice-entry="launcher"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
            </svg>
            {copy.openDock}
          </button>
        </div>
        <EvidenceResultsDrawer />
      </>
    );
  }

  return (
    <>
      <div
        className="cbai-voice-dock-open"
        role="dialog"
        aria-modal="false"
        aria-label={copy.dockTitle}
        data-voice-state={canonicalState}
        data-mic-live={vo.micLive ? "true" : "false"}
        data-voice-dock="open"
      >
        <div className="cbai-voice-dock-shell flex flex-col gap-2">
          {vo.operatorGuidance ? (
            <OperatorGuidanceCard guidance={vo.operatorGuidance} onDismiss={vo.dismissGuidance} />
          ) : null}
          <OperatorCommandClarifyCard />
          <OperatorActionStatus />

          {vo.liveAssistantNarration ? (
            <section className="rounded-xl border border-teal-500/30 bg-teal-950/20 p-3" data-cbai-live-process="">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-teal-300">Live work forming on screen</p>
                <span className="h-2 w-2 rounded-full bg-teal-300" aria-label="Live" />
              </div>
              <ol className="mt-2 space-y-1.5">
                {vo.liveProcessItems.map((item, index) => (
                  <li key={item.id} className="flex gap-2 text-xs text-[var(--cbai-text-primary)]">
                    <span className={item.kind === "question" ? "text-sky-300" : item.kind === "caution" ? "text-amber-300" : "text-teal-300"}>{index + 1}.</span>
                    <span>{item.text}</span>
                  </li>
                ))}
              </ol>
              <p className="mt-2 line-clamp-3 text-[11px] text-[var(--cbai-text-muted)]">{vo.liveAssistantNarration}</p>
              <p className="mt-1 text-[10px] text-[var(--cbai-text-muted)]">Live narration is a draft until evidence and human review confirm it.</p>
            </section>
          ) : null}

          <div className="cbai-voice-dock-panel">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div>
                <p className="cbai-voice-dock-title">{copy.dockTitle}</p>
                <p className="cbai-voice-dock-state" aria-live="polite">
                  {stateLabel}
                </p>
              </div>
              <button
                type="button"
                onClick={vo.closeDock}
                className="min-h-11 min-w-11 px-2 text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
                data-voice-action="close"
              >
                {copy.closeDock}
              </button>
            </div>

            {vo.transcriptVisible && session && session.turns.length > 0 ? (
              <div className="mb-2 max-h-36 overflow-y-auto rounded-lg border border-[var(--cbai-border-default)] bg-[var(--cbai-surface-hover)] p-2.5 text-xs">
                <p className="mb-1.5 font-medium text-[var(--cbai-text-primary)]">{copy.transcriptTitle}</p>
                <ul className="space-y-1.5">
                  {session.turns.slice(-8).map((turn) => (
                    <li
                      key={turn.id}
                      className={turn.role === "user" ? "text-[var(--cbai-text-primary)]" : "cbai-voice-dock-transcript-assistant"}
                    >
                      <span className="text-[var(--cbai-text-muted)]">{turn.role === "user" ? copy.youLabel : copy.cbaiLabel}: </span>
                      {turn.text}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {localVoiceUnavailable || vo.brokerIssue === "required" ? (
              <div className="cbai-voice-dock-notice space-y-2">
                <p>{copy.localCapabilityUserNotice}</p>
                {showDeveloperDiagnostics ? (
                  <VoiceOperatorDeveloperDiagnostics brokerIssue={vo.brokerIssue} connectionState={vo.dockState} />
                ) : null}
              </div>
            ) : null}

            {showBrokerError && vo.brokerIssue ? (
              <>
                <VoiceOperatorBrokerNotice issue={vo.brokerIssue} />
                {showDeveloperDiagnostics ? (
                  <VoiceOperatorDeveloperDiagnostics brokerIssue={vo.brokerIssue} connectionState={vo.dockState} />
                ) : null}
              </>
            ) : null}

            {vo.permissionIssue ? (
              <VoiceOperatorPermissionCard issue={vo.permissionIssue} onDismiss={vo.dismissPermission} onRetry={vo.retryPermission} />
            ) : null}

            {vo.awaitingConsent ? (
              <div className="mb-2 flex flex-wrap gap-2">
                <button type="button" onClick={() => void vo.confirmConsent()} className="cbai-voice-dock-btn px-2.5 py-1">
                  {copy.consentYes}
                </button>
                <button type="button" onClick={vo.cancelConsent} className="cbai-voice-dock-btn px-2.5 py-1">
                  {copy.consentNo}
                </button>
              </div>
            ) : null}

            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={vo.textInput}
                onChange={(e) => vo.setTextInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void vo.sendTextMessage();
                }}
                placeholder={copy.textFallback}
                className="cbai-voice-dock-input outline-none focus:border-[var(--cbai-border-active)]"
                data-voice-action="text-input"
              />
              <button
                type="button"
                onClick={() => void vo.sendTextMessage()}
                className="cbai-voice-dock-btn min-h-11 px-3 py-2"
                data-voice-action="send"
              >
                {copy.sendMessage}
              </button>
              <button
                type="button"
                disabled={micDisabled}
                onClick={() => void (showStopControl ? vo.stopListening() : vo.startListening())}
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border disabled:cursor-not-allowed disabled:opacity-45 ${
                  showStopControl ? "cbai-voice-dock-btn-live" : "border-[var(--cbai-border-default)] bg-[var(--cbai-glass-surface)] text-[var(--muted)]"
                }`}
                aria-label={
                  micDisabled
                    ? copy.localCapabilityUserNotice
                    : showStopControl
                      ? copy.muteMic
                      : copy.unmuteMic
                }
                aria-pressed={showStopControl}
                data-voice-action="mic"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                  {showStopControl ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
                    />
                  ) : (
                    <>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
                      />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 4.5l15 15" />
                    </>
                  )}
                </svg>
              </button>
              {showStopControl ? (
                <button
                  type="button"
                  onClick={() => void vo.stopListening()}
                  className="cbai-voice-dock-btn min-h-11 shrink-0 px-3 py-2"
                  data-voice-action="stop"
                >
                  {copy.stopLiveListening}
                </button>
              ) : null}
            </div>

            {showLiveListening ? (
              <div className="mt-2 rounded-lg border border-[var(--cbai-border-default)] bg-[var(--cbai-surface-hover)] px-3 py-2">
                <p className="text-xs font-medium text-[var(--cbai-text-primary)]">{copy.liveListeningActive}</p>
                <p className="mt-0.5 text-[11px] text-[var(--cbai-text-muted)]">{copy.liveListeningScope}</p>
              </div>
            ) : null}

            <div className="mt-2 flex flex-wrap gap-2">
              <button type="button" onClick={vo.toggleTranscript} className="min-h-11 text-[11px] text-[var(--cbai-text-muted)] hover:text-[var(--cbai-text-primary)]">
                {vo.transcriptVisible
                  ? copy.hideTranscript
                  : session && session.turns.length > 0
                    ? `${copy.showTranscript} (${session.turns.length})`
                    : copy.showTranscript}
              </button>
              <button
                type="button"
                onClick={vo.endSession}
                className="min-h-11 text-[11px] text-[var(--cbai-text-muted)] hover:text-[var(--cbai-text-primary)]"
                data-voice-action="end-session"
              >
                {copy.stopConversation}
              </button>
            </div>
          </div>
        </div>
      </div>
      <EvidenceResultsDrawer />
    </>
  );
}
