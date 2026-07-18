"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { useAssistantProfile } from "@/components/platform/context/AssistantProfileProvider";
import { resolveOperatorName } from "@/lib/assistant/assistant-profile";
import { buildPersonalCabinetSnapshot } from "@/lib/genesis/personal-cabinet-selectors";
import { MISSION_DATA_CHANGED } from "@/lib/intelligence-os/mission-activation-events";
import { useContextualHref } from "@/lib/context/use-contextual-href";
import { cbaiGlassCard, cbaiLoadingLine, cbaiMineralPanel, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

export default function PersonalCabinetPanel() {
  const { t } = useTranslation();
  const hydrated = useHydrated();
  const { profile } = useAssistantProfile();
  const { moduleHref } = useContextualHref();
  const [tick, setTick] = useState(0);
  const bump = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    const onChange = () => bump();
    window.addEventListener(MISSION_DATA_CHANGED, onChange);
    return () => window.removeEventListener(MISSION_DATA_CHANGED, onChange);
  }, [bump]);

  const snapshot = useMemo(() => {
    void tick;
    return hydrated ? buildPersonalCabinetSnapshot(resolveOperatorName(profile)) : null;
  }, [hydrated, profile, tick]);

  if (!hydrated || !snapshot) {
    return (
      <section className={cbaiMineralPanel} aria-busy="true">
        <p className={cbaiLoadingLine}>{t("common.loadingMission")}</p>
      </section>
    );
  }

  const missionTotal =
    snapshot.missions.active.length +
    snapshot.missions.incomplete.length +
    snapshot.missions.completed.length +
    snapshot.missions.archived.length;

  return (
    <section id="personal-cabinet" className="space-y-4" aria-labelledby="personal-cabinet-heading">
      <div className={`${cbaiGlassCard} space-y-3 p-5`}>
        <p className={cbaiSectionEyebrow}>{t("genesisOs.eyebrow")}</p>
        <h2 id="personal-cabinet-heading" className="text-lg font-semibold text-zinc-100">
          {t("genesisOs.personalCabinetTitle")}
        </h2>
        <p className="text-sm text-zinc-400">{t("genesisOs.personalCabinetPurpose")}</p>
        <p className="text-xs text-amber-400/90">{snapshot.limitation}</p>
        <p className="text-xs text-zinc-600">{t("genesisOs.noUniversalScore")}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className={`${cbaiGlassCard} space-y-3 p-5`}>
          <h3 className="text-sm font-semibold text-zinc-200">{t("genesisOs.myMissions")}</h3>
          {missionTotal === 0 ? (
            <p className="text-xs text-zinc-500">
              {t("genesisOs.emptyMissions")}{" "}
              <Link href={moduleHref("/?create=1")} className="text-teal-400 hover:text-teal-300">
                {t("genesisOs.createMission")}
              </Link>
            </p>
          ) : (
            <dl className="grid grid-cols-2 gap-2 text-xs text-zinc-400">
              <div>
                <dt className="text-zinc-600">{t("genesisOs.missionsActive")}</dt>
                <dd className="text-zinc-200">{snapshot.missions.active.length}</dd>
              </div>
              <div>
                <dt className="text-zinc-600">{t("genesisOs.missionsIncomplete")}</dt>
                <dd className="text-zinc-200">{snapshot.missions.incomplete.length}</dd>
              </div>
              <div>
                <dt className="text-zinc-600">{t("genesisOs.missionsCompleted")}</dt>
                <dd className="text-zinc-200">{snapshot.missions.completed.length}</dd>
              </div>
              <div>
                <dt className="text-zinc-600">{t("genesisOs.missionsArchived")}</dt>
                <dd className="text-zinc-200">{snapshot.missions.archived.length}</dd>
              </div>
            </dl>
          )}
        </div>

        <div className={`${cbaiGlassCard} space-y-3 p-5`}>
          <h3 className="text-sm font-semibold text-zinc-200">{t("genesisOs.myWork")}</h3>
          <dl className="grid grid-cols-2 gap-2 text-xs text-zinc-400">
            <div>
              <dt className="text-zinc-600">Projects</dt>
              <dd>{snapshot.work.projectCount}</dd>
            </div>
            <div>
              <dt className="text-zinc-600">Open tasks</dt>
              <dd>{snapshot.work.openTaskCount}</dd>
            </div>
            <div>
              <dt className="text-zinc-600">Evidence refs</dt>
              <dd>{snapshot.work.evidenceRefCount}</dd>
            </div>
            <div>
              <dt className="text-zinc-600">Research objects</dt>
              <dd>{snapshot.work.researchObjectCount}</dd>
            </div>
          </dl>
        </div>

        <div className={`${cbaiGlassCard} space-y-3 p-5`}>
          <h3 className="text-sm font-semibold text-zinc-200">{t("genesisOs.myResponsibilities")}</h3>
          <ul className="space-y-1 text-xs text-zinc-400">
            <li>Execution tasks: {snapshot.responsibilities.assignedTasks.length}</li>
            <li>Overdue: {snapshot.responsibilities.overdueTasks.length}</li>
            <li>Blocked: {snapshot.responsibilities.blockedTasks.length}</li>
            <li>Awaiting review: {snapshot.responsibilities.pendingReviewTasks.length}</li>
          </ul>
        </div>

        <div className={`${cbaiGlassCard} space-y-3 p-5`}>
          <h3 className="text-sm font-semibold text-zinc-200">{t("genesisOs.myTeams")}</h3>
          <p className="text-xs text-zinc-400">
            Teams: {snapshot.teams.length} · Memberships: {snapshot.memberships.length}
          </p>
          <Link href={moduleHref("/organization")} className="text-xs text-teal-400 hover:text-teal-300">
            Organization OS →
          </Link>
        </div>

        <div className={`${cbaiGlassCard} space-y-3 p-5`}>
          <h3 className="text-sm font-semibold text-zinc-200">{t("genesisOs.myCapability")}</h3>
          <p className="text-xs text-zinc-400">
            Passport readiness: {snapshot.capability.passport.readiness} · Records:{" "}
            {snapshot.capability.records.length}
          </p>
        </div>

        <div className={`${cbaiGlassCard} space-y-3 p-5`}>
          <h3 className="text-sm font-semibold text-zinc-200">{t("genesisOs.myOpportunities")}</h3>
          <p className="text-xs text-zinc-400">
            Opportunities: {snapshot.opportunities.length} · Funding needs: {snapshot.fundingNeeds.length}
          </p>
        </div>
      </div>

      <div className={`${cbaiGlassCard} space-y-3 p-5`} id="attention">
        <h3 className="text-sm font-semibold text-zinc-200">{t("genesisOs.whatNeedsAttention")}</h3>
        {snapshot.attention.items.length === 0 ? (
          <p className="text-xs text-zinc-500">{t("genesisOs.emptyAttention")}</p>
        ) : (
          <ul className="list-disc space-y-1 pl-4 text-xs text-amber-300/90">
            {snapshot.attention.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}
        {snapshot.attention.nextAction ? (
          <div className="rounded-lg border border-teal-500/20 bg-teal-950/20 px-4 py-3">
            <p className={cbaiSectionEyebrow}>{t("genesisOs.nextAction")}</p>
            <p className="text-sm text-zinc-200">{snapshot.attention.nextAction.label}</p>
            <Link
              href={moduleHref(snapshot.attention.nextAction.href)}
              className="mt-2 inline-block text-xs text-teal-400 hover:text-teal-300"
            >
              {t("common.continue")} →
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
