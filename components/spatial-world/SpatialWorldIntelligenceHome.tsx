"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useCallback, useMemo, useState } from "react";
import OperatorOrb from "@/components/shared/OperatorOrb";
import { useVoiceOperator } from "@/components/voice-operator/VoiceOperatorProvider";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { useTranslation } from "@/lib/i18n/use-translation";
import { getDictionary } from "@/lib/i18n/translate";
import { loadProjects } from "@/lib/project/project-store";
import { useMissionContext } from "@/components/mission/MissionContextProvider";
import { myWorkHrefForMission } from "@/lib/intelligence-os/mission-operating-context";
import { buildWorldIntelligenceMap } from "@/lib/world-map";
import type { GlobeCountryPoint } from "@/lib/spatial-world/globe-geography";
import SpatialCountryContextPanel from "@/components/spatial-world/SpatialCountryContextPanel";

const InteractiveIntelligenceGlobe = dynamic(
  () => import("@/components/spatial-world/InteractiveIntelligenceGlobe"),
  {
    ssr: false,
    loading: () => (
      <div className="cbai-spatial-globe-stage flex h-[min(52vh,540px)] min-h-[400px] max-h-[540px] items-center justify-center rounded-2xl border border-teal-500/20 bg-[#07101f] text-sm text-slate-400">
        …
      </div>
    ),
  },
);

const ECOSYSTEMS = [
  {
    id: "research",
    href: "/research",
    titleKey: "ecosystemResearchTitle" as const,
    bodyKey: "ecosystemResearchBody" as const,
  },
  {
    id: "economic",
    href: "/investor",
    titleKey: "ecosystemEconomicTitle" as const,
    bodyKey: "ecosystemEconomicBody" as const,
  },
  {
    id: "government",
    href: "/government",
    titleKey: "ecosystemGovernanceTitle" as const,
    bodyKey: "ecosystemGovernanceBody" as const,
  },
] as const;

export default function SpatialWorldIntelligenceHome() {
  const { language } = useTranslation();
  const vo = useVoiceOperator();
  const hydrated = useHydrated();
  const { mission } = useMissionContext();
  const [selectedCountry, setSelectedCountry] = useState<GlobeCountryPoint | null>(null);
  const copy = getDictionary(language).spatialWorld;

  const projects = useMemo(() => (hydrated ? loadProjects().slice(0, 3) : []), [hydrated]);

  const countryStatusMap = useMemo(() => {
    const map = new Map<string, ReturnType<typeof buildWorldIntelligenceMap>[number]["countries"][number]["status"]>();
    for (const group of buildWorldIntelligenceMap()) {
      for (const entry of group.countries) {
        map.set(entry.country.id, entry.status);
      }
    }
    return map;
  }, []);

  const globeLabels = useMemo(
    () => ({
      title: copy.globeTitle,
      hint: copy.globeHint,
      reset: copy.globeReset,
      fallbackTitle: copy.globeFallbackTitle,
      fallbackHint: copy.globeFallbackHint,
      keyboardHint: copy.globeKeyboardHint,
    }),
    [copy],
  );

  const handleSelectCountry = useCallback((point: GlobeCountryPoint | null) => {
    setSelectedCountry(point);
  }, []);

  const handleDeselectCountry = useCallback(() => {
    setSelectedCountry(null);
  }, []);

  return (
    <div className="cbai-spatial-world-home flex w-full flex-col gap-4 px-3 pb-6 pt-2 sm:px-5 sm:pb-7 sm:pt-3 lg:px-6 lg:pb-8 lg:pt-4">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl space-y-2">
          <p className="cbai-section-eyebrow-spatial text-[10px] font-medium uppercase tracking-[0.18em]">{copy.eyebrow}</p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-50 sm:text-[1.75rem] lg:text-[1.875rem]">{copy.welcomeTitle}</h1>
          <p className="max-w-xl text-sm leading-relaxed text-slate-300">{copy.welcomeSubtitle}</p>
        </div>
        <div className="flex flex-col gap-1.5 sm:items-end">
          <button type="button" onClick={vo.openDock} className="cbai-spatial-home-voice-btn inline-flex items-center gap-2 px-5 py-2.5 shadow-[0_8px_24px_-8px_rgba(13,148,136,0.55)]">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
            </svg>
            {copy.primaryAction}
          </button>
          <p className="max-w-xs text-[11px] text-slate-400 sm:text-right">{copy.primaryActionHint}</p>
        </div>
      </header>

      {mission ? (
        <div className="rounded-lg border border-teal-500/25 bg-teal-950/30 px-4 py-2.5">
          <Link href={myWorkHrefForMission(mission)} className="text-sm font-medium text-teal-200 hover:text-teal-100">
            {copy.missionContinue}
          </Link>
        </div>
      ) : null}

      <div className="grid min-h-0 grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(240px,300px)] xl:items-stretch">
        <InteractiveIntelligenceGlobe
          labels={globeLabels}
          selectedCountryId={selectedCountry?.country.id ?? null}
          onSelectCountry={handleSelectCountry}
        />

        <aside className="cbai-spatial-rail flex flex-col gap-3">
          <div className="rounded-2xl border border-teal-500/20 bg-[#0a1528]/95 p-4">
            <div className="flex items-start gap-3">
              <OperatorOrb state="present" size={64} />
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-50">{copy.operatorTitle}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-300">{copy.operatorSubtitle}</p>
                <p className="mt-2 text-xs text-teal-100/90">{copy.operatorStatusReady}</p>
              </div>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-slate-400">{copy.trustLine}</p>
          </div>

          {selectedCountry ? (
            <SpatialCountryContextPanel
              point={selectedCountry}
              status={countryStatusMap.get(selectedCountry.country.id) ?? "not_connected"}
              labels={{
                selected: copy.globeSelected,
                dataAvailability: copy.dataAvailability,
                openCountry: copy.globeOpenCountry,
                deselectCountry: copy.deselectCountry,
              }}
              onDeselect={handleDeselectCountry}
            />
          ) : null}
        </aside>
      </div>

      <section aria-labelledby="spatial-ecosystems-heading" className="pt-1">
        <p id="spatial-ecosystems-heading" className="cbai-section-eyebrow-spatial text-[10px] font-medium uppercase tracking-[0.18em]">
          {copy.ecosystemEyebrow}
        </p>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {ECOSYSTEMS.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="rounded-xl border border-teal-500/15 bg-[#0a1528]/75 px-3.5 py-3 transition-colors hover:border-teal-400/30 hover:bg-[#0d1a30]/90"
            >
              <p className="text-sm font-medium text-slate-50">{copy[item.titleKey]}</p>
              <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-slate-400">{copy[item.bodyKey]}</p>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid gap-3 lg:grid-cols-2">
        <section aria-labelledby="spatial-projects-heading" className="rounded-xl border border-teal-500/15 bg-[#0a1528]/60 p-3.5">
          <p id="spatial-projects-heading" className="cbai-section-eyebrow-spatial text-[10px] font-medium uppercase tracking-[0.18em]">
            {copy.projectsEyebrow}
          </p>
          <h2 className="mt-1 text-sm font-medium text-slate-50">{copy.projectsTitle}</h2>
          {projects.length > 0 ? (
            <ul className="mt-2 space-y-1.5">
              {projects.map((project) => (
                <li key={project.id}>
                  <Link href={`/my-work?project=${project.id}`} className="text-sm text-teal-200 hover:text-teal-100">
                    {project.title}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-slate-400">{copy.projectsEmpty}</p>
          )}
          <Link href="/my-work" className="mt-3 inline-flex text-xs font-medium text-teal-300 hover:text-teal-200">
            {copy.projectsOpen}
          </Link>
        </section>

        <section aria-labelledby="spatial-evidence-heading" className="rounded-xl border border-teal-500/15 bg-[#0a1528]/60 p-3.5">
          <p id="spatial-evidence-heading" className="cbai-section-eyebrow-spatial text-[10px] font-medium uppercase tracking-[0.18em]">
            {copy.evidenceEyebrow}
          </p>
          <h2 className="mt-1 text-sm font-medium text-slate-50">{copy.evidenceTitle}</h2>
          <p className="mt-1.5 text-sm text-slate-400">{copy.evidenceBody}</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <Link href="/knowledge" className="text-xs font-medium text-teal-300 hover:text-teal-200">
              {copy.evidenceOpen}
            </Link>
            <Link href="/graph" className="text-xs font-medium text-teal-300 hover:text-teal-200">
              {copy.knowledgeOpen}
            </Link>
          </div>
          <p className="mt-3 text-[11px] text-slate-500">{copy.noFakeData}</p>
        </section>
      </div>
    </div>
  );
}
