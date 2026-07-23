"use client";

import Link from "next/link";
import { useMemo } from "react";
import OperatorOrb, { type OperatorOrbState } from "@/components/shared/OperatorOrb";
import { useVoiceOperator } from "@/components/voice-operator/VoiceOperatorProvider";
import { useAssistantProfile } from "@/components/platform/context/AssistantProfileProvider";
import { usePlatformContext } from "@/components/platform/context/PlatformContextProvider";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { resolveOperatorName } from "@/lib/assistant/assistant-profile";
import { getCurrentMission } from "@/lib/intelligence-os/mission-engine";
import { myWorkHrefForMission } from "@/lib/intelligence-os/mission-operating-context";
import { readVoiceSessionMemory } from "@/lib/voice-operator/session-memory";
import { peekOsContext } from "@/lib/voice-operator/os";
import { cbaiBtnPrimary, cbaiBtnSecondary } from "@/components/brand/brand-classes";
import type { VoiceDockState } from "@/lib/voice-operator/types";

function orbStateFromDock(dockState: VoiceDockState, brokerIssue: string | null): OperatorOrbState {
  if (brokerIssue || dockState === "error" || dockState === "backend_required") return "warning";
  if (dockState === "listening" || dockState === "connecting" || dockState === "thinking") return "listening";
  if (dockState === "responding" || dockState === "searching_sources") return "speaking";
  return "present";
}

function statusLabel(
  dockState: VoiceDockState,
  brokerIssue: string | null,
  t: (path: string) => string,
): string {
  if (brokerIssue === "required") return t("voiceOperator.backendRequiredNotice");
  if (brokerIssue === "unreachable") return t("voiceOperator.brokerUnavailableNotice");
  if (brokerIssue === "authentication_failed") return t("voiceOperator.brokerAuthenticationFailedNotice");
  switch (dockState) {
    case "listening":
      return t("voiceOperator.stateListening");
    case "connecting":
      return t("voiceOperator.stateConnecting");
    case "thinking":
      return t("voiceOperator.stateThinking");
    case "searching_sources":
      return t("voiceOperator.stateSearchingSources");
    case "responding":
      return t("voiceOperator.stateResponding");
    case "error":
      return t("voiceOperator.stateError");
    case "ready":
      return t("voiceOperator.stateReady");
    default:
      return t("assistant.operatorReadySignedOut");
  }
}

/**
 * Live CBAI Digital Assistant — platform OS surface on Voice Operator (same Realtime session).
 */
export default function DigitalAssistantPanel() {
  const hydrated = useHydrated();
  const { t } = useTranslation();
  const pathname = usePathname();
  const { context } = usePlatformContext();
  const { profile } = useAssistantProfile();
  const vo = useVoiceOperator();
  const operatorName = resolveOperatorName(profile);

  const mission = useMemo(() => (hydrated ? getCurrentMission() : null), [hydrated, vo.transcriptRevision]);
  const recentTurns = useMemo(() => {
    if (!hydrated) return [];
    void vo.transcriptRevision;
    return (readVoiceSessionMemory()?.turns ?? []).slice(-4);
  }, [hydrated, vo.transcriptRevision]);

  const { context: osContext, suggestions } = useMemo(
    () => peekOsContext(hydrated ? context : null, pathname),
    [hydrated, context, pathname, vo.transcriptRevision],
  );

  if (!hydrated) return null;

  const orbState = orbStateFromDock(vo.dockState, vo.brokerIssue);
  const status = statusLabel(vo.dockState, vo.brokerIssue, t);

  return (
    <section
      className="space-y-3 rounded-xl border border-teal-500/20 bg-zinc-950/40 p-4"
      aria-label="CBAI Digital Assistant"
    >
      <div className="flex items-start gap-3">
        <OperatorOrb state={orbState} size={56} />
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-teal-200/80">
            Platform OS
          </p>
          <h2 className="text-sm font-semibold text-zinc-50">{operatorName}</h2>
          <p className="mt-1 text-xs leading-relaxed text-zinc-400" role="status">
            {status}
          </p>
          <p className="mt-1 text-[11px] text-zinc-500">
            Navigate · Compare · Evidence · Reports · Missions · Trust
          </p>
        </div>
      </div>

      <p className="rounded-lg border border-zinc-800/80 bg-zinc-950/50 px-3 py-2 text-[11px] text-zinc-400">
        <span className="font-medium text-zinc-300">Context · </span>
        {osContext.summary}
      </p>

      {suggestions.length > 0 ? (
        <ul className="space-y-2">
          {suggestions.map((suggestion) => (
            <li
              key={suggestion.id}
              className="rounded-lg border border-teal-500/15 bg-teal-500/5 px-3 py-2"
            >
              <p className="text-[11px] leading-relaxed text-zinc-400">{suggestion.prompt}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Link href={suggestion.href} className="text-[11px] font-medium text-teal-300 hover:text-teal-200">
                  {suggestion.actionLabel} →
                </Link>
                {suggestion.command ? (
                  <button
                    type="button"
                    className="text-[11px] text-zinc-500 hover:text-zinc-300"
                    onClick={() => {
                      vo.setTextInput(suggestion.command ?? "");
                    }}
                  >
                    Use command
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {recentTurns.length > 0 ? (
        <ul className="max-h-28 space-y-1.5 overflow-y-auto rounded-lg border border-zinc-800/80 bg-zinc-950/60 px-2.5 py-2 text-[11px]">
          {recentTurns.map((turn, index) => (
            <li key={`${turn.at}-${index}`} className="text-zinc-300">
              <span className="font-medium text-teal-200/90">
                {turn.role === "user" ? t("voiceOperator.youLabel") : t("voiceOperator.cbaiLabel")}:
              </span>{" "}
              <span className="text-zinc-400">{turn.text.slice(0, 160)}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-zinc-500">
          Try: Open Countries · Compare USA and Japan · Show official sources · Continue my last mission
        </p>
      )}

      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          void vo.sendTextMessage();
        }}
      >
        <label className="sr-only" htmlFor="digital-assistant-input">
          {t("voiceOperator.textFallback")}
        </label>
        <input
          id="digital-assistant-input"
          value={vo.textInput}
          onChange={(event) => vo.setTextInput(event.target.value)}
          placeholder="Command the platform…"
          className="min-w-0 flex-1 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500"
        />
        <button type="submit" className={cbaiBtnPrimary}>
          {t("voiceOperator.sendMessage")}
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={cbaiBtnPrimary}
          onClick={() => {
            vo.openDock();
            void vo.startListening();
          }}
        >
          {t("voiceOperator.startConversation")}
        </button>
        <button type="button" className={cbaiBtnSecondary} onClick={() => vo.openDock()}>
          {t("voiceOperator.openDock")}
        </button>
        {mission ? (
          <Link href={myWorkHrefForMission(mission)} className={cbaiBtnSecondary}>
            Continue mission
          </Link>
        ) : (
          <Link href="/?create=1" className={cbaiBtnSecondary}>
            Start a mission
          </Link>
        )}
      </div>
    </section>
  );
}
