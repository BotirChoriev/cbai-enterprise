"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useMissionContext } from "@/components/mission/MissionContextProvider";
import { useProgressiveDisclosure } from "@/lib/hooks/use-progressive-disclosure";
import { deriveFirstMinuteAction, translateFirstMinuteAction } from "@/lib/intelligence-os/first-minute";
import { getDictionary } from "@/lib/i18n/translate";
import { translateEvidencePulseLimitation } from "@/lib/i18n/evidence-pulse-translation";
import { loadProjects, loadProjectQuestions } from "@/lib/project/project-store";
import IntelligenceGatewayEntry from "@/components/gateway/IntelligenceGatewayEntry";
import MissionCreationFlow from "@/components/mission/MissionCreationFlow";
import MissionOperatorPresence from "@/components/mission/MissionOperatorPresence";
import HumanImpactPanel from "@/components/mission/HumanImpactPanel";
import SystemAwakeningSequence from "@/components/platform/entry/SystemAwakeningSequence";
import CanvasOperatingObject from "@/components/canvas/CanvasOperatingObject";
import LivingContextRail from "@/components/operating/LivingContextRail";
import CanvasMissionTimeline from "@/components/canvas/CanvasMissionTimeline";
import CanvasKnowledgeStream, { MissionDnaStrip } from "@/components/canvas/CanvasKnowledgeStream";
import LegacyTrail from "@/components/intelligence-os/LegacyTrail";
import HumanDecisionBoundary from "@/components/intelligence-os/HumanDecisionBoundary";
import EvidencePulsePanel from "@/components/intelligence-os/EvidencePulsePanel";
import EvidenceTrustSurfacePanel from "@/components/evidence/EvidenceTrustSurfacePanel";
import EvidenceJourneyPanel from "@/components/evidence/EvidenceJourneyPanel";
import { cbaiBtnPrimary, cbaiOperatingShell } from "@/components/brand/brand-classes";

export default function IntelligenceCanvas() {
  const { t, language } = useTranslation();
  const hydrated = useHydrated();
  const { mission, evidencePulse, humanImpact, refreshMissionContext } = useMissionContext();
  const disclosure = useProgressiveDisclosure();
  const [creating, setCreating] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const pulse = evidencePulse;
  const impact = humanImpact;
  const pulseLimitation = pulse
    ? translateEvidencePulseLimitation(getDictionary(language), pulse.limitationKey)
    : undefined;
  const project =
    hydrated && mission?.projectId ? loadProjects().find((p) => p.id === mission.projectId) : null;
  const questionCount = hydrated && project ? loadProjectQuestions(project.id).length : 0;

  const urlWantsCreate =
    hydrated &&
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("create") === "1";
  const showCreation = creating || urlWantsCreate;

  const handleMissionCreated = useCallback(() => {
    setCreating(false);
    setRefreshKey((k) => k + 1);
    refreshMissionContext();
    window.history.replaceState(null, "", "/");
  }, [refreshMissionContext]);

  const projectQuery = mission?.projectId ? `?project=${mission.projectId}` : "";
  const firstAction = hydrated ? deriveFirstMinuteAction(mission) : null;

  if (showCreation) {
    return (
      <div className={`${cbaiOperatingShell} px-4 py-6 sm:px-6`}>
        <MissionCreationFlow
          onComplete={handleMissionCreated}
          onCancel={() => {
            setCreating(false);
            window.history.replaceState(null, "", "/");
          }}
        />
      </div>
    );
  }

  return (
    <div className={`cbai-intelligence-canvas cbai-living-canvas ${cbaiOperatingShell} flex min-h-full flex-col`} key={refreshKey}>
      {disclosure.showAwakeningSequence ? <SystemAwakeningSequence hasMission={Boolean(mission)} /> : null}

      {mission && firstAction && disclosure.primaryActionOnly ? (
        <div className="flex shrink-0 items-center border-b border-zinc-800/80 px-4 py-2 sm:px-5">
          <Link href={firstAction.href} className={`${cbaiBtnPrimary} text-xs`}>
            {translateFirstMinuteAction(t, firstAction)} →
          </Link>
        </div>
      ) : null}

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-px bg-zinc-800/30 lg:grid-cols-[minmax(0,1fr)_15rem] xl:grid-cols-[minmax(0,1fr)_17rem]">
        <div className="flex min-h-0 flex-col overflow-y-auto">
      {!mission ? (
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-8 sm:px-6">
          <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center space-y-6 text-center">
            <p className="text-base text-zinc-200 sm:text-lg">{t("intelligenceCanvas.noMissionPrompt")}</p>
            <div className="w-full text-left">
              <MissionOperatorPresence mission={null} />
            </div>
            <button
              type="button"
              onClick={() => setCreating(true)}
              className={`${cbaiBtnPrimary} gap-2`}
            >
              {t("zeroLearningCurve.startMission")}
              <span aria-hidden="true">→</span>
            </button>
            {disclosure.showGatewayGoalChips ? (
              <div className="w-full pt-2 text-left">
                <IntelligenceGatewayEntry compact variant="home" />
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        <>
          <div className="grid flex-1 grid-cols-1 gap-px bg-zinc-800/40 sm:grid-cols-2 lg:grid-cols-2">
            <CanvasOperatingObject
              kind="mission"
              label={t("intelligenceCanvas.centerMission")}
              value={mission.problem}
              detail={mission.whoBenefits}
              href="/"
              status="partial"
              className="sm:col-span-2"
            />

            <CanvasOperatingObject
              kind="question"
              label={t("intelligenceCanvas.centerQuestion")}
              value={project?.researchQuestion ?? mission.whyExists ?? t("missionCenter.noMissionTitle")}
              detail={questionCount > 0 ? t("zeroLearningCurve.openQuestionsCount", { count: String(questionCount) }) : undefined}
              href={mission.projectId ? `/my-work${projectQuery}#project-questions` : "/my-work"}
              status={questionCount > 0 || mission.whyExists ? "partial" : "missing"}
            />

            <CanvasOperatingObject
              kind="evidence"
              label={t("intelligenceCanvas.centerEvidence")}
              value={pulse?.label ?? t("evidencePulse.missing")}
              detail={pulseLimitation ? `${t("evidencePulse.limitation")}: ${pulseLimitation}` : undefined}
              href={mission.projectId ? `/my-work${projectQuery}#project-evidence` : "/knowledge"}
              status={
                !pulse || pulse.state === "missing"
                  ? "missing"
                  : pulse.state === "available"
                    ? "complete"
                    : pulse.state === "partial" || pulse.state === "unverified"
                      ? "partial"
                      : pulse.state === "conflicting"
                        ? "attention"
                        : "missing"
              }
            />

            <CanvasOperatingObject
              kind="knowledge"
              label={t("intelligenceCanvas.centerKnowledge")}
              value={
                mission.evidenceMissing
                  ? t("missionCenter.missingKnowledge")
                  : t("missionCenter.noMissionTitle")
              }
              detail={mission.evidenceMissing ?? undefined}
              status={mission.evidenceMissing ? "attention" : "missing"}
            >
              <CanvasKnowledgeStream />
            </CanvasOperatingObject>

            <CanvasOperatingObject
              kind="impact"
              label={t("intelligenceCanvas.centerImpact")}
              value={impact?.isComplete ? t("missionCenter.impactComplete") : t("missionCenter.impactIncomplete")}
              href={mission.projectId ? `/my-work${projectQuery}#human-impact` : undefined}
              status={impact?.isComplete ? "complete" : impact ? "partial" : "missing"}
            />

            <div className="cbai-operating-object border-l-2 border-l-teal-300/40 bg-[var(--surface)]/40 sm:col-span-2">
              <div className="px-2 pb-3 pt-2">
                <MissionOperatorPresence mission={mission} />
              </div>
            </div>
          </div>

          <MissionDnaStrip mission={mission} />

          {disclosure.showCanvasExpertPanels ? (
            <div className="space-y-px border-t border-zinc-800/80 bg-zinc-800/20">
              <div className="p-4">
                <EvidencePulsePanel mission={mission} />
              </div>
              <div className="p-4 lg:hidden">
                <HumanDecisionBoundary variant="compact" />
              </div>
              <div className="p-4">
                <EvidenceJourneyPanel mission={mission} />
              </div>
              <div className="p-4">
                <EvidenceTrustSurfacePanel mission={mission} variant="full" />
              </div>
              <div className="p-4">
                <LegacyTrail mission={mission} />
              </div>
            </div>
          ) : null}

          <div className="border-t border-zinc-800/80 p-4 lg:hidden">
            <HumanImpactPanel
              missionId={mission.id}
              projectId={mission.projectId}
              onSaved={() => {
                refreshMissionContext();
                setRefreshKey((k) => k + 1);
              }}
            />
          </div>
        </>
      )}
        </div>

        <div className="hidden lg:block">
          {mission ? <LivingContextRail /> : null}
        </div>
      </div>

      {mission ? <CanvasMissionTimeline mission={mission} /> : null}
    </div>
  );
}
