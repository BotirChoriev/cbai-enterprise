"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useMissionContext } from "@/components/mission/MissionContextProvider";
import { useProgressiveDisclosure } from "@/lib/hooks/use-progressive-disclosure";
import { cbaiLinkMuted, cbaiMineralPanelMd } from "@/components/brand/brand-classes";

export default function ReportsPrimaryActions() {
  const { t } = useTranslation();
  const { mission } = useMissionContext();
  const disclosure = useProgressiveDisclosure();
  const projectQuery = mission?.projectId ? `?project=${mission.projectId}` : "";

  const secondary = useMemo(
    () => [
      { label: t("zeroLearningCurve.reportsReview"), href: "/knowledge" },
      {
        label: t("zeroLearningCurve.reportsGenerate"),
        href: mission?.projectId ? `/my-work${projectQuery}#project-report` : "/search",
      },
    ],
    [t, mission?.projectId, projectQuery],
  );

  if (disclosure.level === "beginner") return null;

  return (
    <nav className={cbaiMineralPanelMd} aria-label={t("zeroLearningCurve.reportsAlsoAvailable")}>
      <div className="flex flex-wrap gap-3">
        {secondary.map((action) => (
          <Link key={action.href} href={action.href} className={cbaiLinkMuted}>
            {action.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
