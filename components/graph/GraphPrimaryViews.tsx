"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useProgressiveDisclosure } from "@/lib/hooks/use-progressive-disclosure";
import {
  cbaiChip,
  cbaiChipActive,
  cbaiFocusRing,
  cbaiSectionEyebrow,
} from "@/components/brand/brand-classes";

type GraphPrimaryViewsProps = {
  focusMode: "mission" | "evidence" | "all";
  onFocusModeChange: (mode: "mission" | "evidence" | "all") => void;
  missionProjectId?: string | null;
};

/** Primary graph views — People, Evidence, Knowledge, Questions, Impact. */
export default function GraphPrimaryViews({
  focusMode,
  onFocusModeChange,
  missionProjectId,
}: GraphPrimaryViewsProps) {
  const { t } = useTranslation();
  const disclosure = useProgressiveDisclosure();

  if (disclosure.primaryActionOnly) return null;

  const projectQuery = missionProjectId ? `?project=${missionProjectId}` : "";

  const toggles = [
    { id: "people", label: t("zeroLearningCurve.graphPeople"), mode: "all" as const },
    { id: "evidence", label: t("zeroLearningCurve.graphEvidence"), mode: "evidence" as const },
    { id: "knowledge", label: t("zeroLearningCurve.graphKnowledge"), mode: "mission" as const },
  ];

  const links = disclosure.showGatewayGoalChips
    ? [
        { id: "questions", label: t("zeroLearningCurve.graphQuestions"), href: `/my-work${projectQuery}#project-questions` },
        { id: "impact", label: t("zeroLearningCurve.graphImpact"), href: `/my-work${projectQuery}#human-impact` },
      ]
    : [];

  return (
    <nav className="space-y-2" aria-label={t("experienceEngineering.universeViews")}>
      <p className={cbaiSectionEyebrow}>{t("experienceEngineering.universeViews")}</p>
      <div className="flex flex-wrap gap-2">
        {toggles.map((view) => (
          <button
            key={view.id}
            type="button"
            aria-pressed={focusMode === view.mode}
            onClick={() => onFocusModeChange(view.mode)}
            className={`${focusMode === view.mode ? cbaiChipActive : cbaiChip} ${cbaiFocusRing}`}
          >
            {view.label}
          </button>
        ))}
        {links.map((link) => (
          <Link key={link.id} href={link.href} className={cbaiChip}>
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
