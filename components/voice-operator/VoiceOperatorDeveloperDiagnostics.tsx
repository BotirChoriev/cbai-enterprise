"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/i18n/use-translation";
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

export default function VoiceOperatorDeveloperDiagnostics({ brokerIssue, connectionState }: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const broker = evaluateVoiceBrokerStatus();
  const brokerUrl = broker.kind === "available" ? broker.brokerUrl : null;
  const origin = typeof window !== "undefined" ? window.location.origin : "—";

  return (
    <details
      className="rounded-lg border border-[var(--cbai-border-subtle)] bg-[var(--cbai-surface-muted)]/40"
      open={open}
      onToggle={(event) => setOpen((event.target as HTMLDetailsElement).open)}
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
          <dt className="font-medium text-[var(--cbai-text-secondary)]">{t("voiceOperator.diagnosticsClassification")}:</dt>
          <dd>{classifyLabel(t, brokerIssue)}</dd>
        </div>
        <div className="flex flex-wrap gap-x-2 gap-y-0.5">
          <dt className="font-medium text-[var(--cbai-text-secondary)]">{t("voiceOperator.diagnosticsConnectionState")}:</dt>
          <dd className="font-mono">{connectionState}</dd>
        </div>
        <div>
          <dt className="font-medium text-[var(--cbai-text-secondary)]">{t("voiceOperator.diagnosticsDoctorCommand")}</dt>
          <dd className="mt-0.5 font-mono text-[var(--cbai-text-muted)]">npm run test:doctor-voice</dd>
        </div>
        <p className="pt-1 leading-relaxed">{t("voiceOperator.localVoiceSetupHint")}</p>
      </dl>
    </details>
  );
}
