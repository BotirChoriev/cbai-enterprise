"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useMissionContext } from "@/components/mission/MissionContextProvider";
import { useAssistantProfile } from "@/components/platform/context/AssistantProfileProvider";
import { useUniversalWorkspace } from "@/components/platform/context/UniversalWorkspaceProvider";
import { resolveOperatorName } from "@/lib/assistant/assistant-profile";
import { deriveFloatingIntelligence } from "@/lib/intelligence-os/floating-intelligence";
import { useHydrated } from "@/lib/hooks/use-hydrated";

/** One primary Operator intervention — context-attached, never generic once a mission exists. */
export default function FloatingIntelligencePresence() {
  const { t } = useTranslation();
  const hydrated = useHydrated();
  const { profile } = useAssistantProfile();
  const { mission } = useMissionContext();
  const { focusedObject } = useUniversalWorkspace();

  const intervention = useMemo(
    () =>
      hydrated
        ? deriveFloatingIntelligence(
            mission,
            resolveOperatorName(profile),
            profile.workspaceRole,
            focusedObject,
          )
        : null,
    [hydrated, mission, profile, focusedObject],
  );

  if (!hydrated || !intervention) return null;

  const body = (
    <div className="space-y-0.5">
      <p>
        <span className="text-zinc-400">{t(`experienceEngineering.${intervention.observationKey}`)}</span>
        <span className="text-zinc-700"> · </span>
        <span className="text-zinc-500">
          {t("experienceEngineering.ambientReason")}: {t(`experienceEngineering.${intervention.reasonKey}`)}
        </span>
      </p>
      <p className="text-zinc-600">
        {t("universalWorkspace.evidenceBasis")}: {intervention.evidenceBasis}
      </p>
      <p className="text-zinc-600">
        {t("universalWorkspace.limitations")}: {intervention.limitation}
      </p>
      {intervention.requiresHumanJudgment ? (
        <p className="text-amber-500/80">{t("universalWorkspace.humanDecisionRequired")}</p>
      ) : null}
    </div>
  );

  return (
    <aside
      className="cbai-floating-intelligence shrink-0 border-b border-zinc-800/40 px-4 py-2 text-[11px] leading-relaxed sm:px-5"
      role="note"
      aria-label={t("universalWorkspace.floatingIntelligence")}
      data-cbai-operator-intervention="primary"
    >
      <p className="mb-1 text-[10px] uppercase tracking-wider text-zinc-600">
        {t("universalWorkspace.floatingIntelligence")}
      </p>
      {intervention.suggestedActionHref ? (
        <Link href={intervention.suggestedActionHref} className="block hover:text-teal-300">
          {body}
          <span className="mt-1 inline-block text-teal-400/90">{t("universalWorkspace.suggestedAction")} →</span>
        </Link>
      ) : (
        body
      )}
    </aside>
  );
}
