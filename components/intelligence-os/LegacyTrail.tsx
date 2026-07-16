"use client";

import { useTranslation } from "@/lib/i18n/use-translation";
import { cbaiMineralSurface, cbaiSectionEyebrow } from "@/components/brand/brand-classes";
import { loadHumanImpactForMission } from "@/lib/intelligence-os/human-impact-store";
import type { Mission } from "@/lib/intelligence-os/mission.types";
import { useHydrated } from "@/lib/hooks/use-hydrated";

export default function LegacyTrail({ mission }: { mission: Mission | null }) {
  const { t } = useTranslation();
  const hydrated = useHydrated();
  const impact = hydrated && mission ? loadHumanImpactForMission(mission.id) : null;

  return (
    <section className={`${cbaiMineralSurface} space-y-3 p-5`} aria-labelledby="legacy-trail-heading">
      <p className={cbaiSectionEyebrow}>{t("missionCenter.legacyTrail")}</p>
      <h2 id="legacy-trail-heading" className="text-sm font-medium text-zinc-200">
        {t("missionCenter.legacyTrailBody")}
      </h2>
      {impact?.isComplete ? (
        <p className="text-sm text-zinc-400">{impact.humanBenefit}</p>
      ) : (
        <p className="text-sm text-zinc-500">{t("missionCenter.legacyEmpty")}</p>
      )}
    </section>
  );
}
