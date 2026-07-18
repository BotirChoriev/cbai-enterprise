"use client";

import { useVoiceOperator } from "@/components/voice-operator/VoiceOperatorProvider";
import EvidenceResultsDrawer from "@/components/voice-operator/EvidenceResultsDrawer";
import VoiceOperatorPermissionCard from "@/components/voice-operator/VoiceOperatorPermissionCard";
import { useTranslation } from "@/lib/i18n/use-translation";
import { dockStateLabel } from "@/lib/i18n/platform-copy-voice-operator";
import { readVoiceSessionMemory } from "@/lib/voice-operator/session-memory";

export default function VoiceOperatorDock() {
  const { t } = useTranslation();
  const vo = useVoiceOperator();
  const copy = {
    dockTitle: t("voiceOperator.dockTitle"),
    stateClosed: t("voiceOperator.stateClosed"),
    stateReady: t("voiceOperator.stateReady"),
    statePermissionRequired: t("voiceOperator.statePermissionRequired"),
    stateConnecting: t("voiceOperator.stateConnecting"),
    stateListening: t("voiceOperator.stateListening"),
    stateUserSpeaking: t("voiceOperator.stateUserSpeaking"),
    stateThinking: t("voiceOperator.stateThinking"),
    stateSearchingSources: t("voiceOperator.stateSearchingSources"),
    stateResponding: t("voiceOperator.stateResponding"),
    stateActionConfirmation: t("voiceOperator.stateActionConfirmation"),
    stateDisconnected: t("voiceOperator.stateDisconnected"),
    stateBackendRequired: t("voiceOperator.stateBackendRequired"),
    stateError: t("voiceOperator.stateError"),
    modeRealtime: t("voiceOperator.modeRealtime"),
    modeBrowserFallback: t("voiceOperator.modeBrowserFallback"),
    openDock: t("voiceOperator.openDock"),
    closeDock: t("voiceOperator.closeDock"),
    startConversation: t("voiceOperator.startConversation"),
    stopConversation: t("voiceOperator.stopConversation"),
    muteMic: t("voiceOperator.muteMic"),
    unmuteMic: t("voiceOperator.unmuteMic"),
    interrupt: t("voiceOperator.interrupt"),
    showTranscript: t("voiceOperator.showTranscript"),
    hideTranscript: t("voiceOperator.hideTranscript"),
    textFallback: t("voiceOperator.textFallback"),
    sendMessage: t("voiceOperator.sendMessage"),
    clearSession: t("voiceOperator.clearSession"),
    permissionDeniedTitle: t("voiceOperator.permissionDeniedTitle"),
    permissionSafariHelp: t("voiceOperator.permissionSafariHelp"),
    permissionRetry: t("voiceOperator.permissionRetry"),
    permissionContinueText: t("voiceOperator.permissionContinueText"),
    permissionClose: t("voiceOperator.permissionClose"),
    backendRequiredNotice: t("voiceOperator.backendRequiredNotice"),
    browserFallbackNotice: t("voiceOperator.browserFallbackNotice"),
    externalSearchActive: t("voiceOperator.externalSearchActive"),
    revokeExternalSearch: t("voiceOperator.revokeExternalSearch"),
    evidencePanelTitle: t("voiceOperator.evidencePanelTitle"),
    evidenceQuery: t("voiceOperator.evidenceQuery"),
    evidenceProvider: t("voiceOperator.evidenceProvider"),
    evidenceNoResults: t("voiceOperator.evidenceNoResults"),
    evidenceProviderFailed: t("voiceOperator.evidenceProviderFailed"),
    evidenceLimitations: t("voiceOperator.evidenceLimitations"),
    evidenceAddToMission: t("voiceOperator.evidenceAddToMission"),
    evidenceCompare: t("voiceOperator.evidenceCompare"),
    evidenceMetadataOnly: t("voiceOperator.evidenceMetadataOnly"),
    transcriptTitle: t("voiceOperator.transcriptTitle"),
    youLabel: t("voiceOperator.youLabel"),
    cbaiLabel: t("voiceOperator.cbaiLabel"),
    consentPrompt: t("voiceOperator.consentPrompt"),
    consentYes: t("voiceOperator.consentYes"),
    consentNo: t("voiceOperator.consentNo"),
  };

  const session = readVoiceSessionMemory();
  const stateLabel = dockStateLabel(copy, vo.dockState);

  if (!vo.dockOpen && vo.dockState === "closed") {
    return (
      <>
        <div
          className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center pb-[max(1rem,env(safe-area-inset-bottom))] md:pl-64"
          aria-hidden={false}
        >
          <button
            type="button"
            onClick={vo.openDock}
            className="pointer-events-auto flex items-center gap-2 rounded-full border border-teal-500/30 bg-slate-950/95 px-4 py-2.5 text-sm text-teal-200 shadow-lg backdrop-blur-md transition hover:border-teal-400/50"
            aria-label={copy.openDock}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
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
        className="fixed inset-x-0 bottom-0 z-50 flex justify-center pb-[max(0.75rem,env(safe-area-inset-bottom))] md:pl-64"
        role="region"
        aria-label={copy.dockTitle}
      >
        <div className="mx-3 flex w-full max-w-2xl flex-col gap-2">
          {vo.transcriptVisible && session ? (
            <div className="max-h-40 overflow-y-auto rounded-xl border border-zinc-800 bg-slate-950/95 p-3 text-xs shadow-xl backdrop-blur-md">
              <p className="mb-2 font-medium text-zinc-300">{copy.transcriptTitle}</p>
              <ul className="space-y-1.5">
                {session.turns.slice(-8).map((turn) => (
                  <li key={turn.id} className={turn.role === "user" ? "text-zinc-300" : "text-teal-300/90"}>
                    <span className="text-zinc-500">{turn.role === "user" ? copy.youLabel : copy.cbaiLabel}: </span>
                    {turn.text}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="rounded-2xl border border-zinc-800 bg-slate-950/95 p-3 shadow-2xl backdrop-blur-md">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-zinc-100">{copy.dockTitle}</p>
                <p className="text-[11px] text-zinc-500">{stateLabel}</p>
              </div>
              <button type="button" onClick={vo.closeDock} className="text-xs text-zinc-400 hover:text-zinc-100">
                {copy.closeDock}
              </button>
            </div>

            {vo.backendRequired ? (
              <p className="mb-2 text-[11px] text-amber-400/90">{copy.backendRequiredNotice}</p>
            ) : (
              <p className="mb-2 text-[11px] text-zinc-500">{copy.browserFallbackNotice}</p>
            )}

            {vo.permissionIssue ? (
              <VoiceOperatorPermissionCard issue={vo.permissionIssue} onDismiss={vo.dismissPermission} onRetry={vo.retryPermission} />
            ) : null}

            {vo.awaitingConsent ? (
              <div className="mb-2 flex flex-wrap gap-2">
                <button type="button" onClick={() => void vo.confirmConsent()} className="rounded-md bg-teal-600/20 px-2.5 py-1 text-xs text-teal-300">
                  {copy.consentYes}
                </button>
                <button type="button" onClick={vo.cancelConsent} className="rounded-md border border-zinc-700 px-2.5 py-1 text-xs text-zinc-400">
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
                className="min-w-0 flex-1 rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-teal-500/30"
              />
              <button type="button" onClick={() => void vo.sendTextMessage()} className="rounded-lg bg-teal-600/20 px-3 py-2 text-xs text-teal-300">
                {copy.sendMessage}
              </button>
              <button
                type="button"
                onClick={vo.dockState === "listening" ? vo.stopListening : vo.startListening}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-300"
                aria-label={vo.dockState === "listening" ? copy.interrupt : copy.startConversation}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                </svg>
              </button>
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
              <button type="button" onClick={vo.toggleTranscript} className="text-[11px] text-zinc-500 hover:text-zinc-300">
                {vo.transcriptVisible ? copy.hideTranscript : copy.showTranscript}
              </button>
              <button type="button" onClick={vo.endSession} className="text-[11px] text-zinc-500 hover:text-zinc-300">
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
