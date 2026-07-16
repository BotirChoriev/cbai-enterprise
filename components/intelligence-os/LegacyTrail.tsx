"use client";

import { useMemo } from "react";
import { useTranslation } from "@/lib/i18n/use-translation";
import { cbaiMineralSurface, cbaiSectionEyebrow } from "@/components/brand/brand-classes";
import { deriveLegacyTrail } from "@/lib/intelligence-os/legacy-trail";
import type { Mission } from "@/lib/intelligence-os/mission.types";
import { useHydrated } from "@/lib/hooks/use-hydrated";

const KIND_LABEL: Record<string, string> = {
  mission: "Mission",
  question: "Question",
  evidence: "Evidence",
  note: "Note",
  methodology: "Methodology",
  impact: "Impact",
  decision: "Decision",
};

export default function LegacyTrail({ mission }: { mission: Mission | null }) {
  const { t } = useTranslation();
  const hydrated = useHydrated();
  const trail = useMemo(
    () => (hydrated && mission ? deriveLegacyTrail(mission) : { artifacts: [], isEmpty: true, summary: null }),
    [hydrated, mission],
  );

  return (
    <section className={`${cbaiMineralSurface} space-y-3 p-5`} aria-labelledby="legacy-trail-heading">
      <p className={cbaiSectionEyebrow}>{t("missionCenter.legacyTrail")}</p>
      <h2 id="legacy-trail-heading" className="text-sm font-medium text-zinc-200">
        {t("missionCenter.legacyTrailBody")}
      </h2>
      {trail.isEmpty ? (
        <p className="text-sm text-zinc-500">{t("missionCenter.legacyEmpty")}</p>
      ) : (
        <>
          {trail.summary ? <p className="text-xs text-zinc-500">{trail.summary}</p> : null}
          <ul className="space-y-2">
            {trail.artifacts.map((item) => (
              <li
                key={`${item.kind}-${item.sourceId ?? item.label}`}
                className="rounded-md border border-zinc-800/80 bg-zinc-950/30 px-3 py-2"
              >
                <p className="text-[10px] uppercase tracking-wider text-teal-400/80">
                  {KIND_LABEL[item.kind] ?? item.kind}
                </p>
                <p className="text-xs font-medium text-zinc-300">{item.label}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">{item.detail}</p>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
