"use client";

import type { VoiceBrokerIssue } from "@/lib/voice-operator/types";
import { useTranslation } from "@/lib/i18n/use-translation";

type Props = {
  readonly issue: VoiceBrokerIssue;
};

function noticeKey(issue: VoiceBrokerIssue): string {
  switch (issue) {
    case "invalid_api_key":
      return "voiceOperator.brokerInvalidApiKeyNotice";
    case "quota_or_account_blocked":
      return "voiceOperator.brokerQuotaBlockedNotice";
    case "authentication_failed":
      return "voiceOperator.brokerAuthenticationFailedNotice";
    case "unreachable":
      return "voiceOperator.brokerUnavailableNotice";
    case "origin_blocked":
      return "voiceOperator.brokerOriginBlockedNotice";
    case "rate_limited":
      return "voiceOperator.brokerRateLimitedNotice";
    case "connection_failed":
      return "voiceOperator.brokerConnectionFailedNotice";
    case "required":
    default:
      return "voiceOperator.backendRequiredNotice";
  }
}

export default function VoiceOperatorBrokerNotice({ issue }: Props) {
  const { t } = useTranslation();

  return (
    <p
      className="mb-2 rounded-md border border-amber-500/25 bg-amber-950/25 px-2.5 py-2 text-[11px] leading-relaxed text-amber-100"
      role="status"
    >
      {t(noticeKey(issue))}
    </p>
  );
}
