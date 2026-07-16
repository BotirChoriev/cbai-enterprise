"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { useTranslation } from "@/lib/i18n/use-translation";
import { getCurrentMission } from "@/lib/intelligence-os/mission-engine";
import { deriveEvidencePulse } from "@/lib/intelligence-os/evidence-pulse";
import { loadProjects, loadProjectQuestions } from "@/lib/project/project-store";
import { loadHumanImpactForMission } from "@/lib/intelligence-os/human-impact-store";
import { useMissionContext } from "@/components/mission/MissionContextProvider";
import MissionCreationFlow from "@/components/mission/MissionCreationFlow";
import MissionOperatorPresence from "@/components/mission/MissionOperatorPresence";
import HumanImpactPanel from "@/components/mission/HumanImpactPanel";
import SystemAwakeningSequence from "@/components/platform/entry/SystemAwakeningSequence";
import CanvasOperatingObject from "@/components/canvas/CanvasOperatingObject";
import { CanvasContextLayer } from "@/components/canvas/CanvasContextLayer";
import CanvasMissionTimeline from "@/components/canvas/CanvasMissionTimeline";
import CanvasKnowledgeStream, { MissionDnaStrip } from "@/components/canvas/CanvasKnowledgeStream";
import LegacyTrail from "@/components/intelligence-os/LegacyTrail";
import HumanDecisionBoundary from "@/components/intelligence-os/HumanDecisionBoundary";
import EvidencePulsePanel from "@/components/intelligence-os/EvidencePulsePanel";
import EvidenceTrustSurfacePanel from "@/components/evidence/EvidenceTrustSurfacePanel";
import EvidenceJourneyPanel from "@/components/evidence/EvidenceJourneyPanel";
import { cbaiBtnPrimary, cbaiOperatingShell, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

export default function IntelligenceCanvas() {
  const { t } = useTranslation();
  const hydrated = useHydrated();
  const { refreshMissionContext } = useMissionContext();
  const [creating, setCreating] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const mission = hydrated ? getCurrentMission() : null;
  const pulse = useMemo(() => (hydrated ? deriveEvidencePulse(mission) : null), [hydrated, mission]);
  const impact = mission && hydrated ? loadHumanImpactForMission(mission.id) : null;
  const project =
    hydrated && mission?.projectId ? loadProjects().find((p) => p.id === mission.projectId) : null;
  const questionCount = hydrated && project ? loadProjectQuestions(project.id).length : 0;

  const handleMissionCreated = useCallback(() => {
    setCreating(false);
    setRefreshKey((k) => k + 1);
    refreshMissionContext();
  }, [refreshMissionContext]);

  const projectQuery = mission?.projectId ? `?project=${mission.projectId}` : "";

  if (creating) {
    return (
      <div className={`${cbaiOperatingShell} px-4 py-6 sm:px-6`}>
        <MissionCreationFlow onComplete={handleMissionCreated} onCancel={() => setCreating(false)} />
      </div>
    );
  }

  return (
    <div className={`cbai-intelligence-canvas ${cbaiOperatingShell} flex min-h-[calc(100vh-4rem)] flex-col`} key={refreshKey}>
      <SystemAwakeningSequence hasMission={Boolean(mission)} />

      <header className="flex shrink-0 items-center justify-between border-b border-zinc-800/80 px-4 py-2 sm:px-5">
        <div>
          <p className={cbaiSectionEyebrow}>{t("intelligenceCanvas.eyebrow")}</p>
          <p className="text-[11px] text-zinc-600">{t("intelligenceCanvas.notDashboard")}</p>
        </div>
        {!mission ? (
          <button type="button" onClick={() => setCreating(true)} className={`${cbaiBtnPrimary} text-xs`}>
            {t("intelligenceCanvas.beginMission")}
          </button>
        ) : null}
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_16rem] xl:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="flex min-h-0 flex-col overflow-y-auto">
          <div className="grid flex-1 grid-cols-1 gap-px bg-zinc-800/40 sm:grid-cols-2">
            <CanvasOperatingObject
              kind="mission"
              label={t("intelligenceCanvas.centerMission")}
              value={mission?.problem ?? t("intelligenceCanvas.noMissionPrompt")}
              detail={mission?.whoBenefits}
              href={mission ? "/" : undefined}
              status={mission ? "partial" : "attention"}
              className="sm:col-span-2"
            />

            <CanvasOperatingObject
              kind="question"
              label={t("intelligenceCanvas.centerQuestion")}
              value={project?.researchQuestion ?? mission?.whyExists ?? t("missionCenter.noMissionTitle")}
              detail={questionCount > 0 ? `${questionCount} open` : undefined}
              href={mission?.projectId ? `/my-work${projectQuery}#project-questions` : "/my-work"}
              status={questionCount > 0 || mission?.whyExists ? "partial" : "missing"}
            />

            <CanvasOperatingObject
              kind="evidence"
              label={t("intelligenceCanvas.centerEvidence")}
              value={pulse?.label ?? t("evidencePulse.missing")}
              detail={pulse ? `${t("evidencePulse.limitation")}: ${pulse.limitation}` : undefined}
              href={mission?.projectId ? `/my-work${projectQuery}#project-evidence` : "/knowledge"}
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
              value={mission?.evidenceMissing ?? t("missionCenter.missingKnowledge")}
              status={mission?.evidenceMissing ? "attention" : "missing"}
            >
              <CanvasKnowledgeStream />
            </CanvasOperatingObject>

            <CanvasOperatingObject
              kind="impact"
              label={t("intelligenceCanvas.centerImpact")}
              value={impact?.isComplete ? t("missionCenter.impactComplete") : t("missionCenter.impactIncomplete")}
              href={mission?.projectId ? `/my-work${projectQuery}#human-impact` : undefined}
              status={impact?.isComplete ? "complete" : impact ? "partial" : "missing"}
            />

            <div className="cbai-operating-object border-l-2 border-l-teal-300/40 bg-[var(--surface)]/40 sm:col-span-2">
              <p className={`${cbaiSectionEyebrow} px-4 pt-3`}>{t("intelligenceCanvas.centerOperator")}</p>
              <div className="px-2 pb-3">
                <MissionOperatorPresence mission={mission} />
              </div>
            </div>
          </div>

          <MissionDnaStrip mission={mission} />

          {mission ? (
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

          {mission ? (
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
          ) : null}
        </div>

        <div className="hidden lg:block">
          <CanvasContextLayer />
        </div>
      </div>

      <CanvasMissionTimeline mission={mission} />

      <div className="border-t border-zinc-800/80 px-4 py-2 lg:hidden">
        <Link href="/graph" className="text-xs text-teal-400">
          {t("intelligenceCanvas.viewGraph")} →
        </Link>
      </div>
    </div>
  );
}
