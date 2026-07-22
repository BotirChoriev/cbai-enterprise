"use client";

import type { VoiceBrokerIssue } from "@/lib/voice-operator/types";
import { useTranslation } from "@/lib/i18n/use-translation";

type Props = {
  readonly issue: VoiceBrokerIssue;
};

export default function VoiceOperatorBrokerNotice({ issue }: Props) {
  const { t } = useTranslation();
  const message =
    issue === "invalid_api_key"
      ? t("voiceOperator.brokerInvalidApiKeyNotice")
      : issue === "quota_or_account_blocked"
        ? t("voiceOperator.brokerQuotaBlockedNotice")
        : issue === "authentication_failed"
          ? t("voiceOperator.brokerAuthenticationFailedNotice")
          : issue === "unreachable"
            ? t("voiceOperator.brokerUnavailableNotice")
            : t("voiceOperator.backendRequiredNotice");

  return (
    <p
      className="mb-2 rounded-md border border-amber-500/25 bg-amber-950/25 px-2.5 py-2 text-[11px] leading-relaxed text-amber-100"
      role="status"
    >
      {message}
    </p>
  );
}
