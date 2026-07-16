"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useTranslation } from "@/lib/i18n/use-translation";
import { deriveEvidenceJourney } from "@/lib/evidence-runtime/evidence-journey";
import type { Mission } from "@/lib/intelligence-os/mission.types";
import { cbaiMineralSurface, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

const STATUS_COLOR: Record<string, string> = {
  complete: "bg-emerald-500/80",
  partial: "bg-amber-500/70",
  missing: "bg-zinc-600/60",
  attention: "bg-[var(--gold)]/70",
};

type EvidenceJourneyPanelProps = {
  mission: Mission | null;
};

export default function EvidenceJourneyPanel({ mission }: EvidenceJourneyPanelProps) {
  const { t } = useTranslation();
  const journey = useMemo(() => deriveEvidenceJourney(mission), [mission]);

  return (
    <section className={`${cbaiMineralSurface} space-y-3 p-5`} aria-labelledby="evidence-journey-heading">
      <p className={cbaiSectionEyebrow}>{t("evidenceRuntime.journeyEyebrow")}</p>
      <h2 id="evidence-journey-heading" className="sr-only">
        {t("evidenceRuntime.journeyEyebrow")}
      </h2>
      <ol className="flex gap-1 overflow-x-auto pb-1">
        {journey.map((stage) => (
          <li key={stage.id} className="min-w-[5rem] flex-1">
            {stage.href ? (
              <Link
                href={stage.href}
                className="group flex flex-col items-center gap-1 rounded-md px-1 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/40"
              >
                <span className={`h-1.5 w-full max-w-[2.5rem] rounded-full ${STATUS_COLOR[stage.status] ?? STATUS_COLOR.missing}`} />
                <span className="text-[9px] font-medium uppercase tracking-wider text-zinc-600 group-hover:text-teal-400/80">
                  {stage.label}
                </span>
                <span className="line-clamp-2 max-w-[5.5rem] text-center text-[10px] text-zinc-500 group-hover:text-zinc-400">
                  {stage.detail}
                </span>
              </Link>
            ) : (
              <div className="flex flex-col items-center gap-1 px-1 py-1">
                <span className={`h-1.5 w-full max-w-[2.5rem] rounded-full ${STATUS_COLOR[stage.status] ?? STATUS_COLOR.missing}`} />
                <span className="text-[9px] font-medium uppercase tracking-wider text-zinc-600">{stage.label}</span>
                <span className="text-[10px] text-zinc-500">{stage.detail}</span>
              </div>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
