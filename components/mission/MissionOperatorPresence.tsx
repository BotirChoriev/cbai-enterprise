"use client";

import { useEffect, useState } from "react";
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
import type { Mission } from "@/lib/intelligence-os/mission.types";
import { cbaiBtnPrimary, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type MissionOperatorPresenceProps = {
  mission: Mission | null;
};

export default function MissionOperatorPresence({ mission }: MissionOperatorPresenceProps) {
  const { profile, isActive } = useAssistantProfile();
  const { t } = useTranslation();
  const hydrated = useHydrated();
  const [liveOrbState, setLiveOrbState] = useState<OperatorOrbState>("present");
  const [isGreeting, setIsGreeting] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsGreeting(false), 800);
    return () => window.clearTimeout(timer);
  }, []);

  const orbState: OperatorOrbState = isGreeting ? "greeting" : liveOrbState;
  const linkedProject =
    hydrated && mission?.projectId ? loadProjects().find((p) => p.id === mission.projectId) : null;
  const guideStep = linkedProject ? resolveProjectGuideStep(linkedProject, t) : null;

  return (
    <section className="space-y-6" aria-labelledby="mission-operator-heading">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="flex shrink-0 flex-col items-center gap-3 lg:items-start">
          <OperatorOrb state={orbState} size={72} />
          <p className={cbaiSectionEyebrow}>{t("missionCenter.operatorPresence")}</p>
          <p className="text-xs text-zinc-500">{t("missionCenter.voiceAvailable")}</p>
        </div>

        <div className="min-w-0 flex-1 space-y-4">
          {mission ? (
            <>
              <p className={cbaiSectionEyebrow}>{t("missionCenter.missionActive")}</p>
              <h1 id="mission-operator-heading" className="cbai-display text-2xl leading-tight text-zinc-50 sm:text-3xl">
                {mission.problem}
              </h1>
              {linkedProject ? (
                <p className="text-xs text-zinc-500">
                  {translateProjectTypeLabel(t, linkedProject.type)} · {translateProjectStatus(t, linkedProject.status)}
                </p>
              ) : null}
              {guideStep ? <p className="text-sm text-zinc-400">{guideStep.detail}</p> : null}
            </>
          ) : (
            <>
              <h1 id="mission-operator-heading" className="cbai-display text-2xl text-zinc-50 sm:text-3xl">
                {isActive
                  ? t("assistant.greetingReturning", { name: profile.name })
                  : t("assistant.greetingSignedOut")}
              </h1>
              <p className="text-sm text-zinc-400">
                {t("missionCenter.notHomepage")} {resolveOperatorName(profile)} {t("missionCenter.operatorPresence")}.
              </p>
            </>
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
