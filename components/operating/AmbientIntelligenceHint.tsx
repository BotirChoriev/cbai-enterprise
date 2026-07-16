"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useMissionContext } from "@/components/mission/MissionContextProvider";
import { useAssistantProfile } from "@/components/platform/context/AssistantProfileProvider";
import { resolveOperatorName } from "@/lib/assistant/assistant-profile";
import { deriveAmbientInsight } from "@/lib/intelligence-os/ambient-intelligence";
import { useHydrated } from "@/lib/hooks/use-hydrated";

/** Single ambient insight — gentle, explained, never interruptive. */
export default function AmbientIntelligenceHint() {
  const { t } = useTranslation();
  const hydrated = useHydrated();
  const { profile } = useAssistantProfile();
  const { mission } = useMissionContext();

  const insight = useMemo(
    () => (hydrated ? deriveAmbientInsight(mission, resolveOperatorName(profile), profile.workspaceRole) : null),
    [hydrated, mission, profile],
  );

  if (!hydrated || !insight) return null;

  const body = (
    <>
      <span className="text-zinc-500">{t(`experienceEngineering.${insight.messageKey}`)}</span>
      <span className="text-zinc-700"> · </span>
      <span className="text-zinc-600">
        {t("experienceEngineering.ambientReason")}: {t(`experienceEngineering.${insight.reasonKey}`)}
      </span>
    </>
  );

  return (
    <aside
      className="cbai-ambient-intelligence shrink-0 border-b border-zinc-800/40 px-4 py-1.5 text-[11px] leading-relaxed sm:px-5"
      role="note"
      aria-label={t("experienceEngineering.ambientEyebrow")}
    >
      {insight.href ? (
        <Link href={insight.href} className="hover:text-teal-300">
          {body}
        </Link>
      ) : (
        body
      )}
    </aside>
  );
}
