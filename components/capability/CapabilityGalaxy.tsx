"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { useAssistantProfile } from "@/components/platform/context/AssistantProfileProvider";
import { buildCapabilityPassport } from "@/lib/capability/capability-passport-builder";
import { deriveCapabilityGrowth } from "@/lib/capability/capability-growth";
import { resolveOperatorName } from "@/lib/assistant/assistant-profile";
import { cbaiMineralSurface, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

const MATURITY_RING: Record<string, string> = {
  none: "border-zinc-700/60",
  emerging: "border-teal-500/30",
  developing: "border-emerald-500/40",
  demonstrated: "border-emerald-400/60",
};

const GROWTH_LABEL: Record<string, string> = {
  none: "",
  new: "livingIntelligence.newActivity",
  growing: "livingIntelligence.growing",
  steady: "livingIntelligence.steady",
};

/** Living capability — growth from real project work, never rank. */
export default function CapabilityGalaxy() {
  const { t } = useTranslation();
  const hydrated = useHydrated();
  const { profile } = useAssistantProfile();
  const passport = useMemo(
    () => (hydrated ? buildCapabilityPassport(resolveOperatorName(profile)) : null),
    [hydrated, profile],
  );
  const growth = useMemo(
    () => (passport ? deriveCapabilityGrowth(passport) : []),
    [passport],
  );

  if (!hydrated || !passport) {
    return (
      <section className={`${cbaiMineralSurface} p-5`} aria-busy="true">
        <p className="text-sm text-zinc-500">{t("common.loading")}</p>
      </section>
    );
  }

  return (
    <section className={`${cbaiMineralSurface} space-y-4 p-5`} aria-labelledby="capability-galaxy-heading">
      <p className={cbaiSectionEyebrow}>{t("intelligenceSpaces.capabilityGalaxy")}</p>
      <h2 id="capability-galaxy-heading" className="text-sm font-medium text-zinc-200">
        {t("intelligenceSpaces.capabilityGalaxyBody")}
      </h2>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6" role="list">
        {passport.domains.map((domain) => {
          const domainGrowth = growth.find((g) => g.domainId === domain.domainId);
          const growthKey = domainGrowth ? GROWTH_LABEL[domainGrowth.growth] : "";
          return (
            <li key={domain.domainId} className="flex flex-col items-center gap-2 text-center">
              <div
                className={`flex h-14 w-14 flex-col items-center justify-center rounded-full border-2 ${MATURITY_RING[domain.maturity] ?? MATURITY_RING.none} bg-zinc-950/50`}
                title={`${t(`capabilityDomains.${domain.domainId}` as "capabilityDomains.research")} — ${domain.signalCount} ${t("intelligenceSpaces.domainSignals")}`}
              >
                <span className="text-sm font-medium text-zinc-300">{domain.signalCount}</span>
                {growthKey ? (
                  <span className="text-[8px] uppercase tracking-wide text-teal-400/80">{t(growthKey)}</span>
                ) : null}
              </div>
              <p className="text-[10px] leading-tight text-zinc-500">
                {t(`capabilityDomains.${domain.domainId}` as "capabilityDomains.research")}
              </p>
              {domain.lastActivityAt ? (
                <p className="text-[9px] text-zinc-600">
                  {t("livingIntelligence.lastActivity")}: {new Date(domain.lastActivityAt).toLocaleDateString()}
                </p>
              ) : null}
            </li>
          );
        })}
      </ul>
      <p className="text-xs text-zinc-600">{t("capabilityPassportExt.uncertaintyNotice")}</p>
      <p className="text-[10px] text-zinc-700">{t("livingIntelligence.noDecorativeActivity")}</p>
      <Link href="/graph" className="text-xs text-teal-400 hover:text-teal-300">
        {t("intelligenceSpaces.knowledgeUniverseSpace")} →
      </Link>
    </section>
  );
}
