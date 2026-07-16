"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useMissionContext } from "@/components/mission/MissionContextProvider";
import { useProgressiveDisclosure } from "@/lib/hooks/use-progressive-disclosure";
import { deriveFirstMinuteAction, translateFirstMinuteAction } from "@/lib/intelligence-os/first-minute";
import {
  cbaiBtnPrimarySm,
  cbaiLinkMuted,
  cbaiMineralPanelMd,
  cbaiSectionEyebrow,
} from "@/components/brand/brand-classes";

export default function ReportsPrimaryActions() {
  const { t } = useTranslation();
  const { mission } = useMissionContext();
  const disclosure = useProgressiveDisclosure();
  const projectQuery = mission?.projectId ? `?project=${mission.projectId}` : "";
  const primary = useMemo(() => deriveFirstMinuteAction(mission), [mission]);
  const primaryLabel = translateFirstMinuteAction(t, primary);

  const secondary = [
    { label: t("zeroLearningCurve.reportsReview"), href: "/knowledge" },
    {
      label: t("zeroLearningCurve.reportsGenerate"),
      href: mission?.projectId ? `/my-work${projectQuery}#project-report` : "/search",
    },
  ];

  return (
    <nav className={cbaiMineralPanelMd} aria-label={t("reports.title")}>
      <p className={cbaiSectionEyebrow}>{t("zeroLearningCurve.nextAction")}</p>
      <Link href={primary.href} className={`${cbaiBtnPrimarySm} gap-1.5`}>
        {primaryLabel}
        <span aria-hidden="true">→</span>
      </Link>
      {disclosure.level !== "beginner" ? (
        <div className="flex flex-wrap gap-3">
          {secondary.map((action) => (
            <Link key={action.href} href={action.href} className={cbaiLinkMuted}>
              {action.label}
            </Link>
          ))}
        </div>
      ) : null}
    </nav>
  );
}
