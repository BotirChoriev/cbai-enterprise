"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useMissionContext } from "@/components/mission/MissionContextProvider";
import HumanDecisionBoundary from "@/components/intelligence-os/HumanDecisionBoundary";
import { cbaiMineralSurface, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type MissionOperatingContextBarProps = {
  /** Compact strip only — full boundary on mission-heavy routes */
  variant?: "compact" | "full";
};

const PRIMARY_ROUTES_WITH_CONTEXT = new Set([
  "/my-work",
  "/search",
  "/countries",
  "/companies",
  "/universities",
  "/research",
  "/knowledge",
  "/graph",
  "/reasoning",
  "/reports",
  "/analytics",
  "/trust",
  "/ai-control",
  "/settings",
  "/account",
]);

export default function MissionOperatingContextBar({
  variant = "compact",
}: MissionOperatingContextBarProps) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { mission, evidencePulse, adaptive, humanImpact } = useMissionContext();

  const basePath = pathname.split("?")[0];
  if (basePath === "/" || (!PRIMARY_ROUTES_WITH_CONTEXT.has(basePath) && !basePath.startsWith("/research/"))) {
    return null;
  }

  const nextHref =
    adaptive?.suggestedRoutes[0] ??
    (mission?.projectId ? `/my-work?project=${mission.projectId}` : "/my-work");

  return (
    <aside
      className={`${cbaiMineralSurface} space-y-3 p-4`}
      aria-label={t("operatingContext.missionContext")}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <p className={cbaiSectionEyebrow}>{t("operatingContext.missionContext")}</p>
          <p className="truncate text-sm font-medium text-zinc-200">
            {mission?.problem ?? t("operatingContext.noMission")}
          </p>
          {evidencePulse ? (
            <p className="text-xs text-zinc-500">
              {t("operatingContext.evidenceState")}: {evidencePulse.label}
            </p>
          ) : null}
          {humanImpact && !humanImpact.isComplete ? (
            <p className="text-xs text-amber-400/90">{t("humanImpact.requiredForReport")}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Link href="/" className="text-xs text-teal-400 hover:text-teal-300">
            {t("operatingContext.returnPath")}
          </Link>
          <Link href={nextHref} className="text-xs text-zinc-400 hover:text-teal-300">
            {t("missionCenter.nextAction")} →
          </Link>
        </div>
      </div>
      {variant === "full" ? <HumanDecisionBoundary /> : null}
    </aside>
  );
}
