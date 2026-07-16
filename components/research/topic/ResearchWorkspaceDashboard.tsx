"use client";

import { useState } from "react";
import Link from "next/link";
import type { ResearchTopic } from "@/lib/research/research-topics";
import { buildResearchMission } from "@/lib/research-mission/research-mission-builder";
import { deriveResearchReadiness } from "@/lib/research/readiness/readiness-engine";
import { deriveEvidenceGapIntelligence } from "@/lib/research/intelligence/intelligence-engine";
import { loadResearchNotes } from "@/lib/research/research-workspace-store";
import { usePlatformContext } from "@/components/platform/context/PlatformContextProvider";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { useTranslation } from "@/lib/i18n/use-translation";
import { profileSectionHref } from "@/components/shared/entity-profile-path";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type ResearchWorkspaceDashboardProps = {
  topic: ResearchTopic;
};

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className={`${cbaiGlassCard} p-3`}>
      <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">{label}</p>
      <p className="mt-1 text-sm font-semibold text-zinc-100">{value}</p>
    </div>
  );
}

/** Research summary — one glance at question, progress, evidence, notes, and reports. */
export default function ResearchWorkspaceDashboard({ topic }: ResearchWorkspaceDashboardProps) {
  const { t } = useTranslation();
  const { isEntityPinned } = usePlatformContext();
  const [mission] = useState(() => buildResearchMission({ missionId: topic.topicId }));
  const [readiness] = useState(() => deriveResearchReadiness(topic.topicId));
  const [intelligence] = useState(() => deriveEvidenceGapIntelligence(topic.topicId));
  const hydrated = useHydrated();
  const recentNotes = hydrated ? loadResearchNotes(topic.topicId).slice(0, 3) : [];

  const question = mission.workspaceContract?.missionSummary.missionCenter.question.question ?? topic.description;
  const openTasksCount =
    (intelligence?.disconnectedEvidence.length ?? 0) +
    (intelligence?.reviewGatedEvidence.length ?? 0) +
    (intelligence?.reviewStatus.reviewOpened ? 0 : 1);
  const missingEvidenceCount = intelligence?.disconnectedEvidence.length ?? 0;
  const pinned = isEntityPinned("research_topic", topic.topicId);
  const totalMilestones =
    (readiness?.completedMilestones.length ?? 0) + (readiness?.remainingMilestones.length ?? 0);

  return (
    <section aria-labelledby="research-dashboard-heading" className={`${cbaiGlassCard} space-y-4 p-4 sm:p-5`}>
      <div>
        <p className={cbaiSectionEyebrow} id="research-dashboard-heading">
          {t("researchDashboard.eyebrow")}
        </p>
        <p className="mt-1 text-sm text-zinc-300">{question}</p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <StatCard
          label={t("researchDashboard.progress")}
          value={
            readiness
              ? t("researchDashboard.progressValue", {
                  complete: String(readiness.completedMilestones.length),
                  total: String(totalMilestones),
                })
              : t("researchDashboard.progressUnavailable")
          }
        />
        <StatCard
          label={t("researchDashboard.evidenceConnected")}
          value={intelligence ? String(intelligence.connectedEvidence.length) : "0"}
        />
        <StatCard label={t("researchDashboard.missingEvidence")} value={String(missingEvidenceCount)} />
        <StatCard label={t("researchDashboard.openTasks")} value={String(openTasksCount)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-1.5 text-[10px] uppercase tracking-wider text-zinc-600">
            {t("researchDashboard.recentNotes")}
          </p>
          {recentNotes.length > 0 ? (
            <ul className="space-y-1">
              {recentNotes.map((note) => (
                <li key={note.noteId} className="text-xs text-zinc-500">
                  {note.body.length > 80 ? `${note.body.slice(0, 80)}…` : note.body}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-zinc-600">{t("researchDashboard.noNotesYet")}</p>
          )}
        </div>

        <div>
          <p className="mb-1.5 text-[10px] uppercase tracking-wider text-zinc-600">
            {t("researchDashboard.relatedReports")}
          </p>
          <p className="text-xs text-zinc-500">
            <Link
              href={profileSectionHref(`/research/${topic.topicId}`, "generate-report")}
              className="text-teal-400 hover:underline"
            >
              {t("researchDashboard.reportAvailable")} →
            </Link>
          </p>
        </div>
      </div>

      <div className="border-t border-zinc-800/80 pt-3">
        <p className="text-[10px] uppercase tracking-wider text-zinc-600">{t("researchDashboard.savedStatus")}</p>
        <p className="mt-1 text-xs text-zinc-400">
          {pinned ? t("researchDashboard.savedToBookmarks") : t("researchDashboard.notSavedYet")}
        </p>
      </div>
    </section>
  );
}
