"use client";

import { useCallback, useState } from "react";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { useTranslation } from "@/lib/i18n/use-translation";
import { getCurrentMission } from "@/lib/intelligence-os/mission-engine";
import { loadProjects, loadProjectEvidence } from "@/lib/project/project-store";
import HumanImpactPanel from "@/components/mission/HumanImpactPanel";
import { useMissionContext } from "@/components/mission/MissionContextProvider";
import MissionOperatorPresence from "@/components/mission/MissionOperatorPresence";
import MissionCreationFlow from "@/components/mission/MissionCreationFlow";
import MissionThread from "@/components/intelligence-os/MissionThread";
import EvidencePulsePanel from "@/components/intelligence-os/EvidencePulsePanel";
import IntelligenceField from "@/components/intelligence-os/IntelligenceField";
import CapabilityConstellation from "@/components/intelligence-os/CapabilityConstellation";
import ContextHorizon from "@/components/intelligence-os/ContextHorizon";
import HumanDecisionBoundary from "@/components/intelligence-os/HumanDecisionBoundary";
import LegacyTrail from "@/components/intelligence-os/LegacyTrail";
import IntelligenceLensesGrid from "@/components/intelligence-os/IntelligenceLensesGrid";
import HomeProjectsSection from "@/components/platform/home/HomeProjectsSection";
import SystemAwakeningSequence from "@/components/platform/entry/SystemAwakeningSequence";
import { cbaiBtnPrimary, cbaiMineralSurface, cbaiOperatingShell, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

export default function MissionCenter() {
  const { t } = useTranslation();
  const hydrated = useHydrated();
  const { refreshMissionContext } = useMissionContext();
  const [creating, setCreating] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const mission = hydrated ? getCurrentMission() : null;
  const projects = hydrated ? loadProjects() : [];
  const evidenceCount = projects.reduce(
    (sum, p) => sum + loadProjectEvidence(p.id).length,
    0,
  );

  const handleMissionCreated = useCallback(() => {
    setCreating(false);
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <div className={`mission-center ${cbaiOperatingShell} pb-16`} key={refreshKey}>
      <SystemAwakeningSequence hasMission={Boolean(mission)} />

      <div className="mx-auto max-w-7xl space-y-8 px-4 pt-6 sm:px-8 sm:pt-8">
        <header className="border-b border-teal-500/10 pb-6">
          <p className={cbaiSectionEyebrow}>{t("missionCenter.eyebrow")}</p>
          <p className="mt-1 text-xs text-zinc-600">{t("missionCenter.notHomepage")}</p>
        </header>

        {creating ? (
          <MissionCreationFlow onComplete={handleMissionCreated} onCancel={() => setCreating(false)} />
        ) : (
          <>
            {!mission ? (
              <div className={`${cbaiMineralSurface} space-y-4 p-6`}>
                <h2 className="text-lg font-semibold text-zinc-100">{t("missionCenter.noMissionTitle")}</h2>
                <p className="text-sm text-zinc-400">{t("missionCenter.noMissionBody")}</p>
                <button type="button" onClick={() => setCreating(true)} className={cbaiBtnPrimary}>
                  {t("missionCenter.createMission")}
                </button>
              </div>
            ) : null}

            <MissionOperatorPresence mission={mission} />

            <div className="grid gap-6 lg:grid-cols-12">
              <div className="space-y-6 lg:col-span-8">
                <IntelligenceField mission={mission} projectCount={projects.length} evidenceCount={evidenceCount} />
                <MissionThread mission={mission} />
                <EvidencePulsePanel mission={mission} />
                <HomeProjectsSection />
                <ContextHorizon mission={mission} />
                <HumanDecisionBoundary />
              </div>
              <div className="space-y-6 lg:col-span-4">
                <CapabilityConstellation />
                {mission ? (
                  <HumanImpactPanel
                    missionId={mission.id}
                    projectId={mission.projectId}
                    onSaved={() => {
                      refreshMissionContext();
                      setRefreshKey((k) => k + 1);
                    }}
                  />
                ) : (
                  <div className={`${cbaiMineralSurface} space-y-3 p-5`}>
                    <p className={cbaiSectionEyebrow}>{t("missionCenter.humanityImpact")}</p>
                    <p className="text-sm text-zinc-400">{t("missionCenter.impactIncomplete")}</p>
                  </div>
                )}
                <LegacyTrail mission={mission} />
              </div>
            </div>

            <IntelligenceLensesGrid />
          </>
        )}
      </div>
    </div>
  );
}
