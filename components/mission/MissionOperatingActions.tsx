"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ContextEntityRef } from "@/lib/context";
import { useMissionContext } from "@/components/mission/MissionContextProvider";
import {
  addEntityToActiveMission,
  isEntityLinkedToActiveMission,
  isMissionLinkableEntity,
  myWorkHrefForMission,
  startMissionFromProblem,
} from "@/lib/intelligence-os/mission-operating-context";
import { MISSION_DATA_CHANGED } from "@/lib/intelligence-os/mission-activation-events";
import ActivationStatusLine from "@/components/shared/ActivationStatusLine";
import { useTranslation } from "@/lib/i18n/use-translation";
import { cbaiBtnSecondary, cbaiProminentAction } from "@/components/brand/brand-classes";

type AddToMissionButtonProps = {
  entity: ContextEntityRef;
  reason?: string;
  className?: string;
  compact?: boolean;
};

export default function AddToMissionButton({
  entity,
  reason,
  className = "",
  compact = false,
}: AddToMissionButtonProps) {
  const { t } = useTranslation();
  const { mission, refreshMissionContext } = useMissionContext();
  const [status, setStatus] = useState<string | null>(null);
  const [linkedRevision, setLinkedRevision] = useState(0);

  useEffect(() => {
    const onChanged = () => setLinkedRevision((n) => n + 1);
    window.addEventListener(MISSION_DATA_CHANGED, onChanged);
    return () => window.removeEventListener(MISSION_DATA_CHANGED, onChanged);
  }, []);

  const alreadyLinked = useMemo(() => {
    void linkedRevision;
    return isEntityLinkedToActiveMission(entity);
  }, [entity, linkedRevision, mission?.id, mission?.projectId]);

  if (!isMissionLinkableEntity(entity)) {
    return null;
  }

  function handleAdd() {
    if (!mission) {
      setStatus(t("missionOperating.noMission"));
      return;
    }

    if (alreadyLinked) {
      setStatus(t("missionOperating.addedToMission", { name: entity.name }));
      return;
    }

    const result = addEntityToActiveMission(entity, reason);
    if (!result.ok) {
      setStatus(t("missionOperating.noProject"));
      return;
    }

    refreshMissionContext();
    setLinkedRevision((n) => n + 1);
    setStatus(
      result.alreadyLinked
        ? t("missionOperating.addedToMission", { name: entity.name })
        : t("missionOperating.added", { name: entity.name }),
    );
  }

  if (!mission) {
    return (
      <div className={className}>
        <Link href="/?create=1" className={compact ? cbaiBtnSecondary : cbaiProminentAction}>
          {t("missionOperating.startToAdd")}
        </Link>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-2">
        {alreadyLinked ? (
          <span
            className={`${compact ? cbaiBtnSecondary : cbaiProminentAction} cursor-default opacity-80`}
            aria-disabled="true"
          >
            {t("missionOperating.addedToMissionLabel")}
          </span>
        ) : (
          <button
            type="button"
            onClick={handleAdd}
            className={compact ? cbaiBtnSecondary : cbaiProminentAction}
          >
            {t("missionOperating.addToMission")}
          </button>
        )}
        <Link href={myWorkHrefForMission(mission)} className="text-xs text-teal-400 hover:text-teal-300">
          {t("missionOperating.viewInMyWork")} →
        </Link>
      </div>
      {status ? <ActivationStatusLine message={status} compact /> : null}
    </div>
  );
}

type QuickStartMissionFormProps = {
  onStarted?: (missionId: string, projectId: string) => void;
};

/** Home entry — one problem statement starts a real mission + project. */
export function QuickStartMissionForm({ onStarted }: QuickStartMissionFormProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { refreshMissionContext } = useMissionContext();
  const [problem, setProblem] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const mission = startMissionFromProblem(problem);
    if (!mission?.projectId) {
      setError(t("missionOperating.problemTooShort"));
      return;
    }
    refreshMissionContext();
    onStarted?.(mission.id, mission.projectId);
    router.push(`/my-work?mission=${mission.id}&project=${mission.projectId}`);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4 text-left">
      <label className="block space-y-2">
        <span className="text-sm font-medium text-zinc-200">{t("missionCreation.problemLabel")}</span>
        <textarea
          value={problem}
          onChange={(e) => {
            setProblem(e.target.value);
            setError(null);
          }}
          placeholder={t("missionOperating.problemPlaceholder")}
          rows={3}
          className="w-full rounded-lg border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus-visible:border-teal-500/40"
        />
      </label>
      {error ? <p className="text-xs text-amber-400">{error}</p> : null}
      <button type="submit" className={`${cbaiProminentAction} gap-2`}>
        {t("zeroLearningCurve.startMission")}
        <span aria-hidden="true">→</span>
      </button>
    </form>
  );
}
