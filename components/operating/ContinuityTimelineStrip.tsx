"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { useTranslation } from "@/lib/i18n/use-translation";
import { getCurrentMission } from "@/lib/intelligence-os/mission-engine";
import { deriveEvidenceJourney } from "@/lib/evidence-runtime/evidence-journey";
import { cbaiSectionEyebrow } from "@/components/brand/brand-classes";

const STATUS_COLOR: Record<string, string> = {
  complete: "bg-emerald-500/80",
  partial: "bg-amber-500/70",
  missing: "bg-zinc-600/60",
  attention: "bg-[var(--gold)]/70",
};

/** Bottom continuity strip — mission evidence journey on non-home routes. */
export default function ContinuityTimelineStrip() {
  const { t } = useTranslation();
  const hydrated = useHydrated();
  const mission = hydrated ? getCurrentMission() : null;
  const journey = useMemo(() => (hydrated ? deriveEvidenceJourney(mission) : []), [hydrated, mission]);

  if (!hydrated || journey.length === 0) return null;

  return (
    <footer
      className="cbai-continuity-timeline shrink-0 border-t border-zinc-800/80 bg-[var(--surface)]/30 px-4 py-2"
      aria-label={t("intelligenceSpaces.continuityTimeline")}
    >
      <p className={`${cbaiSectionEyebrow} mb-1.5`}>{t("intelligenceSpaces.continuityTimeline")}</p>
      <ol className="flex gap-1 overflow-x-auto pb-0.5">
        {journey.map((stage) => (
          <li key={stage.id} className="min-w-[4.5rem] flex-1">
            {stage.href ? (
              <Link
                href={stage.href}
                className="group flex flex-col items-center gap-0.5 rounded px-1 py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/40"
              >
                <span className={`h-1 w-full max-w-[2rem] rounded-full ${STATUS_COLOR[stage.status] ?? STATUS_COLOR.missing}`} />
                <span className="text-[8px] uppercase tracking-wider text-zinc-600 group-hover:text-teal-400/80">{stage.label}</span>
              </Link>
            ) : (
              <span className="flex flex-col items-center gap-0.5">
                <span className={`h-1 w-full max-w-[2rem] rounded-full ${STATUS_COLOR[stage.status] ?? STATUS_COLOR.missing}`} />
                <span className="text-[8px] uppercase text-zinc-600">{stage.label}</span>
              </span>
            )}
          </li>
        ))}
      </ol>
    </footer>
  );
}
