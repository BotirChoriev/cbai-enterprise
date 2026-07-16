"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n/use-translation";
import { cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type KnowledgeUniverseViewsProps = {
  focusMode: "mission" | "evidence" | "all";
  onFocusModeChange: (mode: "mission" | "evidence" | "all") => void;
};

/** Views into one shared universe — not separate features. */
export default function KnowledgeUniverseViews({
  focusMode,
  onFocusModeChange,
}: KnowledgeUniverseViewsProps) {
  const { t } = useTranslation();

  const views = [
    { mode: "mission" as const, label: t("experienceEngineering.viewMission") },
    { mode: "evidence" as const, label: t("experienceEngineering.viewEvidence") },
    { mode: "all" as const, label: t("experienceEngineering.viewRelationships") },
  ];

  return (
    <nav
      className="flex flex-wrap gap-2"
      aria-label={t("experienceEngineering.universeViews")}
    >
      <p className={`${cbaiSectionEyebrow} w-full`}>{t("experienceEngineering.universeViews")}</p>
      {views.map((view) => (
        <button
          key={view.mode}
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
      <Link href="/my-work" className="self-center text-xs text-zinc-600 hover:text-teal-400">
        {t("experienceEngineering.viewCapability")} →
      </Link>
    </nav>
  );
}
