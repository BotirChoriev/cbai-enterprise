"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useMissionContext } from "@/components/mission/MissionContextProvider";
import { loadProjectEntities } from "@/lib/project/project-store";
import { myWorkHrefForMission } from "@/lib/intelligence-os/mission-operating-context";
import { cbaiGlassCard, cbaiSectionEyebrow, cbaiTextMuted } from "@/components/brand/brand-classes";
import { PLATFORM_MODULES } from "@/lib/context";

export default function MissionLinkedEntitiesPanel() {
  const { t } = useTranslation();
  const { mission } = useMissionContext();

  const entities = useMemo(() => {
    if (!mission?.projectId) return [];
    return loadProjectEntities(mission.projectId);
  }, [mission]);

  if (!mission || entities.length === 0) return null;

  function entityHref(kind: string, id: string): string {
    switch (kind) {
      case "country":
        return `${PLATFORM_MODULES.countries.path}?country=${id}&mission=${mission!.id}&project=${mission!.projectId}`;
      case "company":
        return `${PLATFORM_MODULES.companies.path}?company=${id}&mission=${mission!.id}&project=${mission!.projectId}`;
      case "university":
        return `${PLATFORM_MODULES.universities.path}?university=${id}&mission=${mission!.id}&project=${mission!.projectId}`;
      default:
        return myWorkHrefForMission(mission);
    }
  }

  return (
    <section className={`${cbaiGlassCard} space-y-3 p-5`} aria-labelledby="mission-entities-heading">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className={cbaiSectionEyebrow} id="mission-entities-heading">
          {t("missionOperating.linkedEntities")}
        </p>
        <Link href={myWorkHrefForMission(mission)} className="text-xs text-teal-400 hover:text-teal-300">
          {t("missionOperating.viewInMyWork")} →
        </Link>
      </div>
      <ul className="space-y-2">
        {entities.map((entity) => (
          <li key={`${entity.kind}-${entity.id}`}>
            <Link href={entityHref(entity.kind, entity.id)} className="text-sm text-zinc-200 hover:text-teal-300">
              {entity.name}
            </Link>
            <p className={cbaiTextMuted}>{entity.kind}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
