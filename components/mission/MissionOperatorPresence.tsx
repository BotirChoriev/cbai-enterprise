"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import AssistantCommandCenter from "@/components/assistant/AssistantCommandCenter";
import OperatorOrb, { type OperatorOrbState } from "@/components/shared/OperatorOrb";
import { useAssistantProfile } from "@/components/platform/context/AssistantProfileProvider";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { resolveOperatorName } from "@/lib/assistant/assistant-profile";
import { loadProjects } from "@/lib/project/project-store";
import { resolveProjectGuideStep } from "@/lib/project/project-guide";
import { translateProjectTypeLabel, translateProjectStatus } from "@/lib/i18n/project-translation";
import { deriveOperatorPresenceMode } from "@/lib/intelligence-os/ambient-intelligence";
import type { Mission } from "@/lib/intelligence-os/mission.types";
import { cbaiBtnPrimary, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type MissionOperatorPresenceProps = {
  mission: Mission | null;
};

/** Operator — almost invisible unless uncertainty requires intervention. */
export default function MissionOperatorPresence({ mission }: MissionOperatorPresenceProps) {
  const { profile, isActive } = useAssistantProfile();
  const { t } = useTranslation();
  const hydrated = useHydrated();
  const [liveOrbState, setLiveOrbState] = useState<OperatorOrbState>("present");

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
  const orbState: OperatorOrbState = presence.mode === "intervention" ? liveOrbState : "present";

  if (!hydrated) return null;

  if (presence.mode === "silent" || presence.mode === "compact") {
    return (
      <section aria-label={t("zeroLearningCurve.universalCommandEyebrow")} className="space-y-2">
        <AssistantCommandCenter size="prominent" hideOrb onOrbStateChange={setLiveOrbState} />
      </section>
    );
  }

  return (
    <section className="space-y-4" aria-labelledby="mission-operator-heading">
      <h2 id="mission-operator-heading" className="sr-only">
        {t("missionCenter.operatorPresence")}
      </h2>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <div className="flex shrink-0 flex-col items-center gap-2 lg:items-start">
          <OperatorOrb state={orbState} size={56} />
          <p className={cbaiSectionEyebrow}>{t("missionCenter.operatorPresence")}</p>
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          {presence.insight ? (
            <p className="text-sm text-amber-200/90" role="status" aria-live="polite">
              {t(`experienceEngineering.${presence.insight.messageKey}`)}
            </p>
          ) : null}
          {mission ? (
            <>
              {linkedProject ? (
                <p className="text-xs text-zinc-500">
                  {translateProjectTypeLabel(t, linkedProject.type)} · {translateProjectStatus(t, linkedProject.status)}
                </p>
              ) : null}
              {guideStep ? <p className="text-sm text-zinc-400">{guideStep.detail}</p> : null}
            </>
          ) : (
            <p className="text-sm text-zinc-400">
              {isActive
                ? t("assistant.greetingReturning", { name: profile.name })
                : t("assistant.greetingSignedOut")}
            </p>
          )}

          <AssistantCommandCenter size="prominent" hideOrb onOrbStateChange={setLiveOrbState} />

          {mission && linkedProject && guideStep ? (
            <Link href={`/my-work?project=${linkedProject.id}`} className={`${cbaiBtnPrimary} inline-flex gap-2`}>
              {t("missionCenter.nextAction")}
              <span aria-hidden="true">→</span>
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
