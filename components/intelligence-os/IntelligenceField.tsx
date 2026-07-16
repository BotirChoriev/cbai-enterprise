"use client";

import { useTranslation } from "@/lib/i18n/use-translation";
import { cbaiMineralSurface, cbaiSectionEyebrow } from "@/components/brand/brand-classes";
import type { Mission } from "@/lib/intelligence-os/mission.types";

type IntelligenceFieldProps = {
  mission: Mission | null;
  projectCount: number;
  evidenceCount: number;
};

export default function IntelligenceField({ mission, projectCount, evidenceCount }: IntelligenceFieldProps) {
  const { t } = useTranslation();

  return (
    <section
      className={`${cbaiMineralSurface} relative overflow-hidden p-5`}
      aria-labelledby="intelligence-field-heading"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(13,148,136,0.06),transparent_55%)]"
      />
      <p className={cbaiSectionEyebrow}>{t("missionCenter.intelligenceField")}</p>
      <h2 id="intelligence-field-heading" className="relative text-sm font-medium text-zinc-200">
        {mission ? mission.problem : t("missionCenter.noMissionTitle")}
      </h2>
      <p className="relative mt-2 text-xs leading-relaxed text-zinc-500">{t("missionCenter.intelligenceFieldBody")}</p>
      <dl className="relative mt-4 grid grid-cols-3 gap-3 text-center">
        <div>
          <dt className="text-[10px] uppercase tracking-wider text-zinc-600">{t("missionCenter.missionActive")}</dt>
          <dd className="text-sm font-medium text-zinc-300">{mission ? "1" : "0"}</dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-wider text-zinc-600">{t("missionCenter.openProjects")}</dt>
          <dd className="text-sm font-medium text-zinc-300">{projectCount}</dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-wider text-zinc-600">{t("missionCenter.evidenceNetwork")}</dt>
          <dd className="text-sm font-medium text-zinc-300">{evidenceCount}</dd>
        </div>
      </dl>
    </section>
  );
}
