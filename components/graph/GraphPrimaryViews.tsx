"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n/use-translation";
import { cbaiSectionEyebrow } from "@/components/brand/brand-classes";

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
  const projectQuery = missionProjectId ? `?project=${missionProjectId}` : "";

  const toggles = [
    { id: "people", label: t("zeroLearningCurve.graphPeople"), mode: "all" as const },
    { id: "evidence", label: t("zeroLearningCurve.graphEvidence"), mode: "evidence" as const },
    { id: "knowledge", label: t("zeroLearningCurve.graphKnowledge"), mode: "mission" as const },
  ];

  const links = [
    { id: "questions", label: t("zeroLearningCurve.graphQuestions"), href: `/my-work${projectQuery}#project-questions` },
    { id: "impact", label: t("zeroLearningCurve.graphImpact"), href: `/my-work${projectQuery}#human-impact` },
  ];

  return (
    <nav className="flex flex-wrap gap-2" aria-label={t("experienceEngineering.universeViews")}>
      <p className={`${cbaiSectionEyebrow} w-full`}>{t("experienceEngineering.universeViews")}</p>
      {toggles.map((view) => (
        <button
          key={view.id}
          type="button"
          aria-pressed={focusMode === view.mode}
          onClick={() => onFocusModeChange(view.mode)}
          className={`rounded-md px-3 py-1.5 text-xs ${
            focusMode === view.mode
              ? "border border-teal-500/30 bg-teal-500/10 text-teal-300"
              : "border border-zinc-800 text-zinc-500 hover:text-zinc-300"
          }`}
        >
          {view.label}
        </button>
      ))}
      {links.map((link) => (
        <Link
          key={link.id}
          href={link.href}
          className="rounded-md border border-zinc-800 px-3 py-1.5 text-xs text-zinc-500 hover:text-teal-300"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
