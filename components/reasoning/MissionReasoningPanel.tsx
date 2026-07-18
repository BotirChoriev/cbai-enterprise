"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useMissionContext } from "@/components/mission/MissionContextProvider";
import {
  deriveMissionLifecycle,
  getMissionNextAction,
} from "@/lib/intelligence-os/mission-lifecycle";
import {
  loadProjectEntities,
  loadProjectNotes,
  loadProjectQuestions,
  loadProjectEvidence,
} from "@/lib/project/project-store";
import HumanDecisionBoundary from "@/components/intelligence-os/HumanDecisionBoundary";
import { cbaiGlassCard, cbaiSectionEyebrow, cbaiTextMuted } from "@/components/brand/brand-classes";

export default function MissionReasoningPanel() {
  const { t } = useTranslation();
  const { mission } = useMissionContext();

  const snapshot = useMemo(() => {
    if (!mission?.projectId) return null;
    const projectId = mission.projectId;
    return {
      notes: loadProjectNotes(projectId),
      questions: loadProjectQuestions(projectId),
      evidence: loadProjectEvidence(projectId),
      entities: loadProjectEntities(projectId),
      next: getMissionNextAction(mission),
      lifecycle: deriveMissionLifecycle(mission),
    };
  }, [mission]);

  if (!mission) {
    return (
      <div className={cbaiGlassCard}>
        <p className={cbaiTextMuted}>{t("zeroLearningCurve.reasoningNoMission")}</p>
        <Link href="/?create=1" className="mt-3 inline-block text-sm text-teal-400 hover:text-teal-300">
          {t("missionHome.startMission")} →
        </Link>
      </div>
    );
  }

  if (!snapshot) {
    return (
      <div className={cbaiGlassCard}>
        <p className={cbaiTextMuted}>{t("missionOperating.noProject")}</p>
      </div>
    );
  }

  const hasArtifacts =
    snapshot.notes.length > 0 || snapshot.questions.length > 0 || snapshot.evidence.length > 0;

  return (
    <section className={`${cbaiGlassCard} space-y-4`} aria-labelledby="mission-reasoning-heading">
      <div>
        <p className={cbaiSectionEyebrow} id="mission-reasoning-heading">
          {t("missionOperating.reasoningTitle")}
        </p>
        <p className="mt-1 text-sm text-zinc-300">{mission.problem}</p>
      </div>

      {!hasArtifacts ? (
        <p className={cbaiTextMuted}>{t("missionOperating.reasoningEmpty")}</p>
      ) : (
        <dl className="grid gap-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-xs uppercase tracking-wider text-zinc-600">{t("missionOperating.notesLabel")}</dt>
            <dd className="mt-1 font-mono text-zinc-200">{snapshot.notes.length}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-zinc-600">{t("missionOperating.questionsLabel")}</dt>
            <dd className="mt-1 font-mono text-zinc-200">{snapshot.questions.length}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-zinc-600">{t("missionOperating.evidenceLabel")}</dt>
            <dd className="mt-1 font-mono text-zinc-200">{snapshot.evidence.length}</dd>
          </div>
        </dl>
      )}

      {snapshot.entities.length > 0 ? (
        <div>
          <p className={cbaiSectionEyebrow}>{t("missionOperating.linkedEntities")}</p>
          <ul className="mt-2 space-y-1 text-sm text-zinc-400">
            {snapshot.entities.map((entity) => (
              <li key={`${entity.kind}-${entity.id}`}>
                {entity.name} <span className="text-zinc-600">({entity.kind})</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {snapshot.next ? (
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 px-4 py-3">
          <p className={cbaiSectionEyebrow}>{t("missionOperating.nextHonestAction")}</p>
          <p className="mt-1 text-sm text-zinc-300">{snapshot.next.nextAction}</p>
          <Link href={snapshot.next.href} className="mt-2 inline-block text-sm text-teal-400 hover:text-teal-300">
            {snapshot.next.nextAction} →
          </Link>
        </div>
      ) : null}

      <HumanDecisionBoundary variant="compact" />
      <p className="text-xs text-zinc-600">{t("missionOperating.reasoningHumanReview")}</p>
    </section>
  );
}
