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

const DOCK_INSET = "pb-[max(0.75rem,env(safe-area-inset-bottom))] md:pl-[18rem]";

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
  const stateLabel = dockStateLabel(voiceCopy, vo.dockState);
  const localVoiceUnavailable = vo.backendRequired && !vo.brokerIssue;
  const showBrokerError = vo.brokerIssue != null && vo.brokerIssue !== "required";
  const micDisabled =
    localVoiceUnavailable || vo.brokerIssue === "required" || vo.dockState === "backend_required";

  if (!vo.dockOpen && vo.dockState === "closed") {
    if (isHome) {
      return <EvidenceResultsDrawer />;
    }
    return (
      <>
        <div
          className={`cbai-voice-dock-closed pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center sm:justify-end ${DOCK_INSET}`}
        >
          <button
            type="button"
            onClick={vo.openDock}
            className="cbai-spatial-voice-cta pointer-events-auto mb-2 mr-2 flex min-h-10 max-w-[calc(100vw-1.5rem)] items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold transition sm:mb-3 sm:mr-4 sm:max-w-none sm:rounded-lg sm:px-4 sm:py-2.5 sm:text-sm"
            aria-label={copy.openDock}
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
        className={`cbai-voice-dock-open fixed inset-x-0 bottom-0 z-50 flex justify-end ${DOCK_INSET}`}
        role="region"
        aria-label={copy.dockTitle}
      >
        <div className="mx-2 mr-3 flex w-full max-w-[min(18rem,calc(100vw-1.5rem))] flex-col gap-2 sm:mr-4">
          {vo.operatorGuidance ? (
            <OperatorGuidanceCard guidance={vo.operatorGuidance} onDismiss={vo.dismissGuidance} />
          ) : null}
          <OperatorCommandClarifyCard />
          <OperatorActionStatus />

          {vo.transcriptVisible && session && session.turns.length > 0 ? (
            <div className="max-h-36 overflow-y-auto rounded-xl border border-[var(--cbai-border-default)] bg-[var(--cbai-glass-surface)] p-3 text-xs shadow-[var(--cbai-shadow-soft)] backdrop-blur-md">
              <p className="mb-2 font-medium text-[var(--foreground)]">{copy.transcriptTitle}</p>
              <ul className="space-y-1.5">
                {session.turns.slice(-8).map((turn) => (
                  <li
                    key={turn.id}
                    className={turn.role === "user" ? "text-[var(--foreground)]" : "cbai-voice-dock-transcript-assistant"}
                  >
                    <span className="text-[var(--muted)]">{turn.role === "user" ? copy.youLabel : copy.cbaiLabel}: </span>
                    {turn.text}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="cbai-voice-dock-panel">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div>
                <p className="cbai-voice-dock-title">{copy.dockTitle}</p>
                <p className="cbai-voice-dock-state" aria-live="polite">
                  {stateLabel}
                </p>
              </div>
              <button type="button" onClick={vo.closeDock} className="min-h-11 text-xs text-[var(--muted)] hover:text-[var(--foreground)]">
                {copy.closeDock}
              </button>
            </div>

            {localVoiceUnavailable || vo.brokerIssue === "required" ? (
              <div className="cbai-voice-dock-notice space-y-2">
                <p>{copy.localCapabilityUserNotice}</p>
                <VoiceOperatorDeveloperDiagnostics brokerIssue={vo.brokerIssue} connectionState={vo.dockState} />
              </div>
            ) : null}

            {showBrokerError && vo.brokerIssue ? (
              <>
                <VoiceOperatorBrokerNotice issue={vo.brokerIssue} />
                <VoiceOperatorDeveloperDiagnostics brokerIssue={vo.brokerIssue} connectionState={vo.dockState} />
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

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={vo.textInput}
                onChange={(e) => vo.setTextInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void vo.sendTextMessage();
                }}
                placeholder={copy.textFallback}
                className="cbai-voice-dock-input outline-none focus:border-[var(--cbai-border-active)]"
              />
              <button type="button" onClick={() => void vo.sendTextMessage()} className="cbai-voice-dock-btn px-3 py-2">
                {copy.sendMessage}
              </button>
              <button
                type="button"
                disabled={micDisabled}
                onClick={() => void (vo.micLive ? vo.stopListening() : vo.startListening())}
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border disabled:cursor-not-allowed disabled:opacity-45 ${
                  vo.micLive ? "cbai-voice-dock-btn-live" : "border-[var(--cbai-border-default)] bg-[var(--cbai-glass-surface)] text-[var(--muted)]"
                }`}
                aria-label={micDisabled ? copy.localCapabilityUserNotice : vo.micLive ? copy.muteMic : copy.unmuteMic}
                aria-pressed={vo.micLive}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                  {vo.micLive || micDisabled ? (
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
              {vo.micLive ? (
                <button type="button" onClick={() => void vo.stopListening()} className="cbai-voice-dock-btn shrink-0 px-3 py-2">
                  {copy.stopLiveListening}
                </button>
              ) : null}
            </div>

            {vo.micLive ? (
              <div className="mt-2 rounded-lg border border-[var(--cbai-border-default)] bg-[var(--cbai-surface-hover)] px-3 py-2">
                <p className="text-xs font-medium text-[var(--cbai-text-primary)]">{copy.liveListeningActive}</p>
                <p className="mt-0.5 text-[11px] text-[var(--cbai-text-muted)]">{copy.liveListeningScope}</p>
              </div>
            ) : null}

            <div className="mt-2 flex flex-wrap gap-2">
              <button type="button" onClick={vo.toggleTranscript} className="text-[11px] text-[var(--cbai-text-muted)] hover:text-[var(--cbai-text-primary)]">
                {vo.transcriptVisible ? copy.hideTranscript : copy.showTranscript}
              </button>
              <button type="button" onClick={vo.endSession} className="text-[11px] text-[var(--cbai-text-muted)] hover:text-[var(--cbai-text-primary)]">
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
