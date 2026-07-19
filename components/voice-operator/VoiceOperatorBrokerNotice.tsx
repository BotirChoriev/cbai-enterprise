"use client";

import type { VoiceBrokerIssue } from "@/lib/voice-operator/types";
import { useTranslation } from "@/lib/i18n/use-translation";

type Props = {
  readonly issue: VoiceBrokerIssue;
};

export default function VoiceOperatorBrokerNotice({ issue }: Props) {
  const { t } = useTranslation();
  const message =
    issue === "authentication_failed"
      ? t("voiceOperator.brokerAuthenticationFailedNotice")
      : issue === "unreachable"
        ? t("voiceOperator.brokerUnavailableNotice")
        : t("voiceOperator.backendRequiredNotice");

  return (
    <p
      className="mb-2 rounded-md border border-red-900/30 bg-red-50 px-2.5 py-2 text-[11px] font-medium text-red-950 dark:border-red-800 dark:bg-red-950/40 dark:text-red-100"
      role="status"
    >
      {message}
    </p>
  );
}
