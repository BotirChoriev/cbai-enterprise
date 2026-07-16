"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { useAssistantProfile } from "@/components/platform/context/AssistantProfileProvider";
import { buildCapabilityPassport } from "@/lib/capability/capability-passport-builder";
import { resolveOperatorName } from "@/lib/assistant/assistant-profile";
import { cbaiLoadingLine, cbaiMineralPanel, cbaiMineralSurface, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

export default function CapabilityConstellation() {
  const { t } = useTranslation();
  const hydrated = useHydrated();
  const { profile } = useAssistantProfile();
  const ownerLabel = resolveOperatorName(profile);

  const passport = useMemo(
    () => (hydrated ? buildCapabilityPassport(ownerLabel) : null),
    [hydrated, ownerLabel],
  );

  if (!hydrated || !passport) {
    return (
      <section className={cbaiMineralPanel} aria-busy="true">
        <p className={cbaiLoadingLine}>{t("common.loadingKnowledge")}</p>
      </section>
    );
  }

  const activeDomains = passport.domains.filter((d) => d.signalCount > 0);

  return (
    <section className={`${cbaiMineralSurface} space-y-4 p-5`} aria-labelledby="capability-constellation-heading">
      <p className={cbaiSectionEyebrow}>{t("missionCenter.capabilitySummary")}</p>
      <h2 id="capability-constellation-heading" className="text-sm font-medium text-zinc-200">
        {passport.readiness === "empty"
          ? t("capabilityPassport.readinessEmpty")
          : t("capabilityPassport.readinessActive")}
      </h2>
      {activeDomains.length > 0 ? (
        <ul className="flex flex-wrap gap-3" role="list">
          {activeDomains.map((domain) => (
            <li
              key={domain.domainId}
              className="relative flex flex-col items-center gap-1 rounded-lg border border-teal-500/15 bg-zinc-950/40 px-3 py-2"
            >
              <span
                className="h-2 w-2 rounded-full bg-teal-400/70"
                style={{ opacity: Math.min(1, 0.4 + domain.signalCount * 0.08) }}
                aria-hidden="true"
              />
              <span className="text-[10px] font-medium text-zinc-400">
                {t(`capabilityDomains.${domain.domainId}` as "capabilityDomains.research")}
              </span>
              <span className="text-[9px] text-zinc-600">{domain.signalCount}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-zinc-500">{t("capabilityPassport.noSignals")}</p>
      )}
      <Link href="/my-work" className="text-xs text-teal-400 hover:text-teal-300">
        {t("missionCenter.viewPassport")} →
      </Link>
    </section>
  );
}
