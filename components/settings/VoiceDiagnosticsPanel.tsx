"use client";

import { useCallback, useState } from "react";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useVoiceOperator } from "@/components/voice-operator/VoiceOperatorProvider";
import {
  probeVoiceBrokerReachable,
  runVoicePreflight,
  type VoicePreflightResult,
} from "@/lib/voice-operator/preflight";
import { cbaiMineralSurface, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

function statusLabel(
  t: (path: string) => string,
  kind: "mic" | "broker" | "reachable" | "credential" | "audio" | "webrtc",
  value: boolean | null,
): string {
  if (kind === "webrtc") {
    return value ? t("settingsPage.voiceWebrtcSupported") : t("settingsPage.voiceWebrtcUnsupported");
  }
  if (value === true) {
    if (kind === "mic") return t("settingsPage.voiceMicAvailable");
    if (kind === "broker") return t("settingsPage.voiceBrokerConfigured");
    if (kind === "reachable") return t("settingsPage.voiceBrokerReachable");
    if (kind === "credential") return t("settingsPage.voiceCredentialReceived");
    return t("settingsPage.voiceAudioReady");
  }
  if (value === false) {
    if (kind === "mic") return t("settingsPage.voiceMicUnavailable");
    if (kind === "broker") return t("settingsPage.voiceBrokerNotConfigured");
    if (kind === "reachable") return t("settingsPage.voiceBrokerUnreachable");
    if (kind === "credential") return t("settingsPage.voiceCredentialPending");
    return t("settingsPage.voiceAudioPending");
  }
  if (kind === "mic") return t("settingsPage.voiceMicUnknown");
  if (kind === "reachable") return t("settingsPage.voiceBrokerUnknown");
  if (kind === "credential") return t("settingsPage.voiceCredentialUnknown");
  return t("settingsPage.voiceAudioUnknown");
}

function initialPreflight(
  dockState: string,
  sessionActive: boolean,
  backendRequired: boolean,
  micLive: boolean,
): VoicePreflightResult {
  const brokerOk = !backendRequired;
  return runVoicePreflight({
    connectionState: dockState,
    credentialReceived: sessionActive ? true : brokerOk ? false : undefined,
    audioPlaybackAvailable: sessionActive && micLive ? true : undefined,
  });
}

export default function VoiceDiagnosticsPanel() {
  const { t } = useTranslation();
  const voice = useVoiceOperator();
  const [result, setResult] = useState<VoicePreflightResult>(() =>
    initialPreflight(voice.dockState, voice.sessionActive, voice.backendRequired, voice.micLive),
  );
  const [running, setRunning] = useState(false);

  const runDiagnostics = useCallback(async () => {
    setRunning(true);
    let micAvailable: boolean | null = null;
    try {
      if (typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micAvailable = true;
        stream.getTracks().forEach((track) => track.stop());
      }
    } catch {
      micAvailable = false;
    }

    const brokerOk = !voice.backendRequired;
    const base = runVoicePreflight({
      connectionState: voice.dockState,
      credentialReceived: voice.sessionActive ? true : brokerOk ? false : undefined,
      audioPlaybackAvailable: voice.sessionActive && voice.micLive ? true : undefined,
    });

    let brokerReachable = base.brokerReachable;
    if (base.brokerUrl) {
      brokerReachable = await probeVoiceBrokerReachable(base.brokerUrl);
    }

    setResult({
      ...base,
      micAvailable,
      brokerReachable,
    });
    setRunning(false);
  }, [voice.backendRequired, voice.dockState, voice.micLive, voice.sessionActive]);

  const rows: Array<{ label: string; ok: boolean | null }> = [
    { label: statusLabel(t, "webrtc", result.webrtcSupported), ok: result.webrtcSupported },
    { label: statusLabel(t, "broker", result.brokerConfigured), ok: result.brokerConfigured },
    { label: statusLabel(t, "reachable", result.brokerReachable), ok: result.brokerReachable },
    { label: statusLabel(t, "mic", result.micAvailable), ok: result.micAvailable },
    {
      label: statusLabel(t, "credential", result.credentialReceived),
      ok: result.credentialReceived,
    },
    {
      label: statusLabel(t, "audio", result.audioPlaybackAvailable),
      ok: result.audioPlaybackAvailable,
    },
  ];

  return (
    <section className={`${cbaiMineralSurface} space-y-3 p-4`} aria-labelledby="voice-diagnostics-heading">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p id="voice-diagnostics-heading" className={cbaiSectionEyebrow}>
            {t("settingsPage.voiceDiagnosticsHeading")}
          </p>
          <p className="mt-1 text-xs text-[var(--cbai-text-muted)]">{t("settingsPage.voiceDiagnosticsNote")}</p>
        </div>
        <button
          type="button"
          onClick={() => void runDiagnostics()}
          disabled={running}
          className="rounded-lg border border-[var(--cbai-border-subtle)] px-3 py-1.5 text-xs font-medium text-[var(--cbai-text-secondary)] hover:bg-[var(--cbai-surface-hover)] disabled:opacity-60"
        >
          {t("settingsPage.voiceRunPreflight")}
        </button>
      </div>
      <ul className="space-y-1.5">
        {rows.map((row) => (
          <li key={row.label} className="flex items-center gap-2 text-xs">
            <span
              aria-hidden="true"
              className={`h-2 w-2 shrink-0 rounded-full ${
                row.ok === true
                  ? "bg-emerald-400/80"
                  : row.ok === false
                    ? "bg-amber-400/80"
                    : "bg-zinc-500/60"
              }`}
            />
            <span className="text-[var(--cbai-text-secondary)]">{row.label}</span>
          </li>
        ))}
        <li className="flex items-center gap-2 pt-1 text-xs">
          <span className="text-[var(--cbai-text-muted)]">{t("settingsPage.voiceConnectionState")}:</span>
          <span className="font-mono text-[var(--cbai-text-secondary)]">{result.connectionState}</span>
        </li>
      </ul>
    </section>
  );
}
