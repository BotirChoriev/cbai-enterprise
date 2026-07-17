"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useMissionContext } from "@/components/mission/MissionContextProvider";
import { deriveMissionLifecycle } from "@/lib/intelligence-os/mission-lifecycle";
import { loadProjects } from "@/lib/project/project-store";
import EmptyState from "@/components/shared/EmptyState";
import ActivationStatusLine from "@/components/shared/ActivationStatusLine";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { useMissionDataRevision } from "@/lib/hooks/use-mission-data-revision";
import {
  cbaiGlassCard,
  cbaiProminentAction,
  cbaiSectionEyebrow,
  cbaiTextBody,
  cbaiTextMuted,
} from "@/components/brand/brand-classes";

/** Mission Home — progress and resume point from real mission data (next action lives in page companion). */
export default function MissionHomeSummary() {
  const { t } = useTranslation();
  const { mission, evidencePulse, humanImpact } = useMissionContext();
  const hydrated = useHydrated();
  useMissionDataRevision();

  const lifecycle = useMemo(() => deriveMissionLifecycle(mission), [mission]);
  const completeCount = lifecycle.filter((s) => s.status === "complete").length;
  const project =
    hydrated && mission?.projectId
      ? (loadProjects().find((p) => p.id === mission.projectId) ?? null)
      : null;

  if (!mission) {
    return (
      <EmptyState
        title={t("missionHome.noMissionTitle")}
        message={t("missionHome.noMissionBody")}
        action={
          <Link href="/?create=1" className={cbaiProminentAction}>
            {t("missionHome.startMission")} →
          </Link>
        }
      />
    );
  }

  const evidenceLabel =
    evidencePulse?.state === "conflicting"
      ? t("evidenceRuntime.consensusConflicted")
      : evidencePulse && evidencePulse.count > 0
        ? t("evidenceRuntime.consensusPartial")
        : t("evidenceRuntime.consensusNone");

  const impactLabel = humanImpact?.isComplete
    ? t("missionCenter.impactComplete")
    : t("missionCenter.impactIncomplete");

  return (
    <section className={`${cbaiGlassCard} space-y-4 border-teal-500/15 p-5`} aria-labelledby="mission-home-heading">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className={cbaiSectionEyebrow} id="mission-home-heading">
            {t("missionHome.eyebrow")}
          </p>
          <p className={`${cbaiTextBody} line-clamp-2`}>{mission.problem}</p>
          <p className={cbaiTextMuted}>
            {t("missionHome.stagesComplete", {
              complete: String(completeCount),
              total: String(lifecycle.length),
            })}
          </p>
        </div>
        {project ? (
          <Link
            href={`/my-work?project=${project.id}`}
            className={`${cbaiProminentAction} shrink-0 gap-1.5`}
          >
            {t("missionHome.resumeProject")}
            <span aria-hidden="true">→</span>
          </Link>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-0.5">
          <p className={cbaiSectionEyebrow}>{t("missionCenter.evidenceNetwork")}</p>
          <p className={cbaiTextMuted}>{evidenceLabel}</p>
        </div>
        <div className="space-y-0.5">
          <p className={cbaiSectionEyebrow}>{t("missionCenter.humanityImpact")}</p>
          <p className={cbaiTextMuted}>{impactLabel}</p>
        </div>
      </div>

      {project ? (
        <ActivationStatusLine
          compact
          message={`${t("missionHome.lastActivity")}: ${new Date(project.updatedAt).toLocaleString()}`}
        />
      ) : null}
    </section>
  );
}
