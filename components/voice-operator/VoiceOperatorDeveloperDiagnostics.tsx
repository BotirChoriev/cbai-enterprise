"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useAssistantProfile } from "@/components/platform/context/AssistantProfileProvider";
import { canonicalizeUiLocale } from "@/lib/i18n/canonicalize-locale";
import { evaluateVoiceBrokerStatus } from "@/lib/voice-operator/session-broker/client";
import type { VoiceBrokerIssue } from "@/lib/voice-operator/types";

type Props = {
  readonly brokerIssue: VoiceBrokerIssue | null;
  readonly connectionState: string;
};

function classifyLabel(
  t: (path: string) => string,
  issue: VoiceBrokerIssue | null,
): string {
  if (!issue) return t("voiceOperator.diagnosticsClassificationUnknown");
  if (issue === "invalid_api_key") return t("voiceOperator.diagnosticsClassificationInvalidKey");
  if (issue === "quota_or_account_blocked") return t("voiceOperator.diagnosticsClassificationQuota");
  if (issue === "authentication_failed") return t("voiceOperator.diagnosticsClassificationAuth");
  if (issue === "unreachable") return t("voiceOperator.diagnosticsClassificationUnreachable");
  if (issue === "required") return t("voiceOperator.diagnosticsClassificationNotConfigured");
  return t("voiceOperator.diagnosticsClassificationUnknown");
}

function isLoopbackOrigin(origin: string): boolean {
  try {
    const host = new URL(origin).hostname;
    return host === "localhost" || host === "127.0.0.1" || host === "[::1]" || host === "::1";
  } catch {
    return false;
  }
}

/** Safe build/schema fingerprint — never secrets. */
function buildFingerprint(): string {
  const fromEnv =
    (typeof process !== "undefined" &&
      (process.env.NEXT_PUBLIC_BUILD_ID ||
        process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ||
        process.env.NEXT_PUBLIC_CF_PAGES_COMMIT_SHA)) ||
    "";
  if (fromEnv && typeof fromEnv === "string" && fromEnv.trim()) {
    return fromEnv.trim().slice(0, 12);
  }
  return "local-dev";
}

export default function VoiceOperatorDeveloperDiagnostics({ brokerIssue, connectionState }: Props) {
  const { t } = useTranslation();
  const { profile } = useAssistantProfile();
  const [open, setOpen] = useState(false);
  const origin = typeof window !== "undefined" ? window.location.origin : "—";
  const broker = evaluateVoiceBrokerStatus(origin === "—" ? null : origin);
  const brokerUrl = broker.kind === "available" ? broker.brokerUrl : null;
  const locale = canonicalizeUiLocale(profile.preferredLanguage);
  const showLocalSetupHint = origin !== "—" && isLoopbackOrigin(origin);

  return (
    <details
      className="rounded-lg border border-[var(--cbai-border-subtle)] bg-[var(--cbai-surface-muted)]/40"
      open={open}
      onToggle={(event) => setOpen((event.target as HTMLDetailsElement).open)}
      data-voice-diagnostics=""
    >
      <summary className="cursor-pointer px-2.5 py-2 text-[11px] font-medium text-[var(--cbai-text-secondary)] hover:text-[var(--cbai-text-primary)]">
        {t("voiceOperator.developerDiagnosticsHeading")}
      </summary>
      <dl className="space-y-1.5 border-t border-[var(--cbai-border-subtle)] px-2.5 py-2 text-[10px] text-[var(--cbai-text-muted)]">
        <div className="flex flex-wrap gap-x-2 gap-y-0.5">
          <dt className="font-medium text-[var(--cbai-text-secondary)]">{t("voiceOperator.diagnosticsBrokerUrl")}:</dt>
          <dd className="font-mono break-all">{brokerUrl ?? t("voiceOperator.diagnosticsNotConfigured")}</dd>
        </div>
        <div className="flex flex-wrap gap-x-2 gap-y-0.5">
          <dt className="font-medium text-[var(--cbai-text-secondary)]">{t("voiceOperator.diagnosticsAllowedOrigin")}:</dt>
          <dd className="font-mono break-all">{origin}</dd>
        </div>
        <div className="flex flex-wrap gap-x-2 gap-y-0.5">
          <dt className="font-medium text-[var(--cbai-text-secondary)]">Locale:</dt>
          <dd className="font-mono">
            {locale} (profile.preferredLanguage → canonicalize)
          </dd>
        </div>
        <div className="flex flex-wrap gap-x-2 gap-y-0.5">
          <dt className="font-medium text-[var(--cbai-text-secondary)]">Build:</dt>
          <dd className="font-mono">{buildFingerprint()}</dd>
        </div>
        <div className="flex flex-wrap gap-x-2 gap-y-0.5">
          <dt className="font-medium text-[var(--cbai-text-secondary)]">{t("voiceOperator.diagnosticsClassification")}:</dt>
          <dd>{classifyLabel(t, brokerIssue)}</dd>
        </div>
        <div className="flex flex-wrap gap-x-2 gap-y-0.5">
          <dt className="font-medium text-[var(--cbai-text-secondary)]">{t("voiceOperator.diagnosticsConnectionState")}:</dt>
          <dd className="font-mono">{connectionState}</dd>
        </div>
        {showLocalSetupHint ? (
          <>
            <div>
              <dt className="font-medium text-[var(--cbai-text-secondary)]">{t("voiceOperator.diagnosticsDoctorCommand")}</dt>
              <dd className="mt-0.5 font-mono text-[var(--cbai-text-muted)]">npm run doctor:voice</dd>
            </div>
            <p className="pt-1 leading-relaxed">{t("voiceOperator.localVoiceSetupHint")}</p>
          </>
        ) : (
          <p className="pt-1 leading-relaxed">{t("voiceOperator.localCapabilityUserNotice")}</p>
        )}
      </dl>
    </details>
  );
}
