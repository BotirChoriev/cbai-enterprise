"use client";

import { useMemo } from "react";
import Link from "next/link";
import AssistantCommandCenter from "@/components/assistant/AssistantCommandCenter";
import { useAssistantProfile } from "@/components/platform/context/AssistantProfileProvider";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { resolveOperatorName } from "@/lib/assistant/assistant-profile";
import { loadProjects } from "@/lib/project/project-store";
import { resolveProjectGuideStep } from "@/lib/project/project-guide";
import { translateProjectTypeLabel, translateProjectStatus } from "@/lib/i18n/project-translation";
import { deriveOperatorPresenceMode } from "@/lib/intelligence-os/ambient-intelligence";
import type { Mission } from "@/lib/intelligence-os/mission.types";
import { cbaiBtnPrimary } from "@/components/brand/brand-classes";

type MissionOperatorPresenceProps = {
  mission: Mission | null;
};

/** Research partner — visible only when uncertainty requires guidance. */
export default function MissionOperatorPresence({ mission }: MissionOperatorPresenceProps) {
  const { profile } = useAssistantProfile();
  const { t } = useTranslation();
  const hydrated = useHydrated();

  const operatorName = resolveOperatorName(profile);
  const presence = useMemo(
    () =>
      hydrated
        ? deriveOperatorPresenceMode(mission, operatorName, profile.workspaceRole ?? null)
        : { mode: "silent" as const, insight: null },
    [hydrated, mission, operatorName, profile.workspaceRole],
  );

  const linkedProject =
    hydrated && mission?.projectId ? loadProjects().find((p) => p.id === mission.projectId) : null;
  const guideStep = linkedProject ? resolveProjectGuideStep(linkedProject, t) : null;

  if (!hydrated) return null;

  if (presence.mode === "silent" || presence.mode === "compact") {
    return (
      <section aria-label={t("zeroLearningCurve.commandEyebrow")} className="space-y-2">
        <AssistantCommandCenter size="prominent" hideOrb />
      </section>
    );
  }

  return (
    <section className="space-y-3" aria-label={t("missionCenter.operatorPresence")}>
      {presence.insight ? (
        <p className="text-sm text-amber-200/90" role="status" aria-live="polite">
          {t(`experienceEngineering.${presence.insight.messageKey}`)}
        </p>
      ) : null}
      {mission && linkedProject && guideStep ? (
        <p className="text-sm text-zinc-400">{guideStep.detail}</p>
      ) : null}
      {mission && linkedProject ? (
        <p className="text-xs text-zinc-500">
          {translateProjectTypeLabel(t, linkedProject.type)} · {translateProjectStatus(t, linkedProject.status)}
        </p>
      ) : null}

      <AssistantCommandCenter size="prominent" hideOrb />

      {mission && linkedProject && guideStep ? (
        <Link href={`/my-work?project=${linkedProject.id}`} className={`${cbaiBtnPrimary} inline-flex gap-2`}>
          {guideStep.suggestion}
          <span aria-hidden="true">→</span>
        </Link>
      ) : null}
    </section>
  );
}
