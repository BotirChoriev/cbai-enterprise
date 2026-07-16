"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useMissionContext } from "@/components/mission/MissionContextProvider";
import { useProgressiveDisclosure } from "@/lib/hooks/use-progressive-disclosure";
import { deriveFirstMinuteAction } from "@/lib/intelligence-os/first-minute";
import { cbaiBtnPrimary, cbaiMineralSurface, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

export default function ReportsPrimaryActions() {
  const { t } = useTranslation();
  const { mission } = useMissionContext();
  const disclosure = useProgressiveDisclosure();
  const projectQuery = mission?.projectId ? `?project=${mission.projectId}` : "";
  const primary = useMemo(() => deriveFirstMinuteAction(mission), [mission]);

  const secondary = [
    { label: t("zeroLearningCurve.reportsReview"), href: "/knowledge" },
    {
      label: t("zeroLearningCurve.reportsGenerate"),
      href: mission?.projectId ? `/my-work${projectQuery}#project-report` : "/search",
    },
  ];

  return (
    <nav className={`${cbaiMineralSurface} space-y-3 p-4`} aria-label={t("reports.title")}>
      <p className={cbaiSectionEyebrow}>{t("zeroLearningCurve.nextAction")}</p>
      <Link href={primary.href} className={`${cbaiBtnPrimary} inline-flex text-xs`}>
        {primary.label} →
      </Link>
      {disclosure.level !== "beginner" ? (
        <div className="flex flex-wrap gap-3 text-xs">
          {secondary.map((action) => (
            <Link key={action.href} href={action.href} className="text-zinc-500 hover:text-teal-300">
              {action.label}
            </Link>
          ))}
        </div>
      ) : null}
    </nav>
  );
}
