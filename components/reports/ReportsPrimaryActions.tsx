"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useMissionContext } from "@/components/mission/MissionContextProvider";
import { cbaiMineralSurface, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

/** Reports primary actions — Continue, Generate, Review, Share. */
export default function ReportsPrimaryActions() {
  const { t } = useTranslation();
  const { mission } = useMissionContext();
  const projectQuery = mission?.projectId ? `?project=${mission.projectId}` : "";

  const actions = [
    { label: t("zeroLearningCurve.reportsContinue"), href: mission?.projectId ? `/my-work${projectQuery}` : "/my-work" },
    { label: t("zeroLearningCurve.reportsGenerate"), href: `/reports${projectQuery}` },
    { label: t("zeroLearningCurve.reportsReview"), href: `/knowledge` },
    { label: t("zeroLearningCurve.reportsShare"), href: "/reports" },
  ];

  return (
    <nav className={`${cbaiMineralSurface} flex flex-wrap gap-2 p-4`} aria-label={t("reports.title")}>
      <p className={`${cbaiSectionEyebrow} w-full`}>{t("zeroLearningCurve.nextAction")}</p>
      {actions.map((action) => (
        <Link
          key={action.label}
          href={action.href}
          className="rounded-md border border-zinc-800 px-4 py-2 text-sm text-zinc-300 hover:border-teal-500/30 hover:text-teal-300"
        >
          {action.label}
        </Link>
      ))}
    </nav>
  );
}
