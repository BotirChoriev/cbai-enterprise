"use client";

import { useMemo } from "react";
import { useTranslation } from "@/lib/i18n/use-translation";
import { deriveMissionEvidenceTrustSurface } from "@/lib/evidence-runtime/evidence-trust-surface";
import type { Mission } from "@/lib/intelligence-os/mission.types";
import { cbaiMineralSurface, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type EvidenceTrustSurfacePanelProps = {
  mission: Mission | null;
  variant?: "full" | "compact";
};

const TRUST_KEYS = [
  ["whatWeKnow", "whatWeKnow"],
  ["howWeKnow", "howWeKnow"],
  ["whoVerified", "whoVerified"],
  ["whenVerified", "whenVerified"],
  ["whyTrust", "whyTrust"],
  ["whatMissing", "whatMissing"],
  ["whatContradicts", "whatContradicts"],
  ["needsResearch", "needsResearch"],
] as const;

export default function EvidenceTrustSurfacePanel({
  mission,
  variant = "full",
}: EvidenceTrustSurfacePanelProps) {
  const { t } = useTranslation();
  const surface = useMemo(() => deriveMissionEvidenceTrustSurface(mission), [mission]);

  if (variant === "compact") {
    return (
      <section
        className="rounded-md border border-zinc-800/80 bg-zinc-950/40 px-3 py-2"
        aria-label={t("evidenceRuntime.trustProperty")}
      >
        <p className={cbaiSectionEyebrow}>{t("evidenceRuntime.trustProperty")}</p>
        <p className="mt-1 text-xs text-zinc-400">{surface.whatWeKnow}</p>
        <p className="mt-1 text-[10px] text-zinc-600">{surface.whyTrust}</p>
      </section>
    );
  }

  return (
    <section className={`${cbaiMineralSurface} space-y-3 p-5`} aria-labelledby="evidence-trust-surface-heading">
      <p className={cbaiSectionEyebrow}>{t("evidenceRuntime.trustProperty")}</p>
      <h2 id="evidence-trust-surface-heading" className="sr-only">
        {t("evidenceRuntime.trustProperty")}
      </h2>
      <dl className="grid gap-2 sm:grid-cols-2">
        {TRUST_KEYS.map(([key, labelKey]) => (
          <div key={key} className="rounded-md border border-zinc-800/80 bg-zinc-950/30 px-3 py-2">
            <dt className="text-[10px] uppercase tracking-wider text-teal-400/80">
              {t(`evidenceRuntime.${labelKey}`)}
            </dt>
            <dd className="mt-1 text-xs leading-relaxed text-zinc-400">
              {surface[key]}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
