"use client";

import { useMemo } from "react";
import { useAssistantProfile } from "@/components/platform/context/AssistantProfileProvider";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { buildCapabilityPassport } from "@/lib/capability/capability-passport-builder";
import { deriveAdaptiveIntelligence } from "@/lib/intelligence-os/adaptive-intelligence";
import { runDiscoveryEngine } from "@/lib/discovery/discovery-engine";
import { resolveOperatorName } from "@/lib/assistant/assistant-profile";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";
import Link from "next/link";

export default function CapabilityPassportPanel() {
  const { t } = useTranslation();
  const hydrated = useHydrated();
  const { profile } = useAssistantProfile();
  const ownerLabel = resolveOperatorName(profile);

  const passport = useMemo(
    () => (hydrated ? buildCapabilityPassport(ownerLabel) : null),
    [hydrated, ownerLabel],
  );

  const discovery = useMemo(
    () => (hydrated ? runDiscoveryEngine(ownerLabel) : null),
    [hydrated, ownerLabel],
  );

  const adaptive = useMemo(
    () =>
      passport
        ? deriveAdaptiveIntelligence(passport, profile.workspaceRole ?? null)
        : null,
    [passport, profile.workspaceRole],
  );

  if (!hydrated || !passport || !discovery || !adaptive) {
    return (
      <section className={`${cbaiGlassCard} p-6`} aria-busy="true">
        <p className="text-sm text-zinc-500">{t("common.loading")}</p>
      </section>
    );
  }

  const readinessLabel =
    passport.readiness === "empty"
      ? t("capabilityPassport.readinessEmpty")
      : passport.readiness === "emerging"
        ? t("capabilityPassport.readinessEmerging")
        : t("capabilityPassport.readinessActive");

  return (
    <section className="space-y-6" aria-labelledby="capability-passport-heading">
      <div className={`${cbaiGlassCard} space-y-4 p-6`}>
        <p className={cbaiSectionEyebrow}>{t("capabilityPassport.eyebrow")}</p>
        <h2 id="capability-passport-heading" className="text-lg font-semibold text-zinc-100">
          {t("capabilityPassport.title")}
        </h2>
        <p className="text-sm leading-relaxed text-zinc-400">{t("capabilityPassport.description")}</p>
        <p className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-sm text-zinc-400">
          {t("capabilityPassport.notCvNotice")}
        </p>
        <p className="text-xs text-zinc-500">{t("capabilityPassportExt.uncertaintyNotice")}</p>
        <p className="text-xs text-zinc-600">{t("capabilityPassportExt.visibilityNote")}</p>
        <p className="text-xs font-medium uppercase tracking-wider text-teal-400">{readinessLabel}</p>

        <div>
          <h3 className="text-sm font-semibold text-zinc-200">{t("capabilityPassport.domainsHeading")}</h3>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {passport.domains.map((domain) => (
              <li
                key={domain.domainId}
                className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-4 py-3"
              >
                <p className="text-sm font-medium text-zinc-200">
                  {t(`capabilityDomains.${domain.domainId}` as "capabilityDomains.research")}
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  {domain.maturity === "none"
                    ? t("capabilityPassport.maturityNone")
                    : domain.maturity === "emerging"
                      ? t("capabilityPassport.maturityEmerging")
                      : domain.maturity === "developing"
                        ? t("capabilityPassport.maturityDeveloping")
                        : t("capabilityPassport.maturityDemonstrated")}
                  {" · "}
                  {t("capabilityPassport.signalCount", {
                    count: String(domain.signalCount),
                    plural: domain.signalCount === 1 ? "" : "s",
                  })}
                </p>
              </li>
            ))}
          </ul>
        </div>

        {passport.recentSignals.length > 0 ? (
          <div>
            <h3 className="text-sm font-semibold text-zinc-200">
              {t("capabilityPassport.recentSignalsHeading")}
            </h3>
            <ul className="mt-2 space-y-2">
              {passport.recentSignals.slice(0, 6).map((signal) => (
                <li key={signal.id} className="rounded-lg border border-zinc-800/60 px-3 py-2 text-sm text-zinc-400">
                  <span>{signal.label}</span>
                  <span className="mt-1 block text-[10px] text-zinc-600">
                    {t("capabilityPassportExt.signalSource")}: {signal.source.replace(/_/g, " ")} ·{" "}
                    {t("capabilityPassportExt.signalDate")}: {signal.occurredAt.slice(0, 10)} ·{" "}
                    {t("capabilityPassportExt.developmentDirection")}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-sm text-zinc-500">{t("capabilityPassport.noSignals")}</p>
        )}
      </div>

      <div className={`${cbaiGlassCard} space-y-4 p-6`}>
        <p className={cbaiSectionEyebrow}>{t("discoveryEngine.eyebrow")}</p>
        <h3 className="text-base font-semibold text-zinc-100">{t("discoveryEngine.title")}</h3>
        <p className="text-sm text-zinc-400">{t("discoveryEngine.description")}</p>
        <p className="text-xs text-amber-400/90">{t("discoveryEngine.notConnected")}</p>
        {discovery.candidates.length > 0 ? (
          <ul className="space-y-2">
            {discovery.candidates.map((c) => (
              <li key={c.id} className="rounded-lg bg-zinc-900/50 px-4 py-3 text-sm text-zinc-400">
                {c.label}
                <span className="ml-2 text-xs text-zinc-600">({t("discoveryEngine.localOnly")})</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-zinc-500">{t("discoveryEngine.noCandidates")}</p>
        )}
      </div>

      <div className={`${cbaiGlassCard} space-y-3 p-6`}>
        <p className={cbaiSectionEyebrow}>{t("adaptiveIntelligence.eyebrow")}</p>
        <h3 className="text-base font-semibold text-zinc-100">{t("adaptiveIntelligence.title")}</h3>
        <p className="text-sm text-zinc-400">{adaptive.explanation}</p>
        <p className="text-xs text-zinc-500">
          {adaptive.mode === "capability"
            ? t("adaptiveIntelligence.modeCapability")
            : t("adaptiveIntelligence.modePreference")}
        </p>
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-600">
          {t("adaptiveIntelligence.suggestedRoutes")}
        </p>
        <div className="flex flex-wrap gap-2">
          {adaptive.suggestedRoutes.map((href) => (
            <Link
              key={href}
              href={href}
              className="rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:border-teal-500/30 hover:text-teal-300"
            >
              {href}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
