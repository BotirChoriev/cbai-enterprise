"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import EngineRouteEntryStrip from "@/components/forward-deployed/EngineRouteEntryStrip";
import ResearchHero from "@/components/research/ResearchHero";
import ResearchNetwork from "@/components/research/network/ResearchNetwork";
import ResearchEcosystemOverview from "@/components/research/ResearchEcosystemOverview";
import ResearchTopicCatalog from "@/components/research/ResearchTopicCatalog";
import ResearchGraphPanel from "@/components/research/graph/ResearchGraphPanel";
import ResearchPrinciples from "@/components/research/ResearchPrinciples";
import { cbaiBtnPrimary, cbaiBtnSecondary, cbaiGlassCard, cbaiHeroGlow, cbaiSectionEyebrow } from "@/components/brand/brand-classes";
import { WORKSPACE_PATH } from "@/lib/research/workspace";
import { useTranslation } from "@/lib/i18n/use-translation";
import { getDictionary } from "@/lib/i18n/translate";

export default function ResearchHome() {
  const searchParams = useSearchParams();
  const { t, language } = useTranslation();
  const researchHome = getDictionary(language).researchHome;
  const query = (searchParams.get("q") ?? searchParams.get("topic") ?? "").trim();

  return (
    <>
      <div
        className={`mx-auto max-w-6xl space-y-14 px-4 py-10 sm:px-6 sm:py-14 ${cbaiHeroGlow}`}
      >
        <ResearchHero query={query} />
        <EngineRouteEntryStrip />

        <section
          aria-labelledby="research-status-heading"
          className="rounded-xl border border-teal-500/20 bg-teal-500/5 px-5 py-4"
        >
          <h2 id="research-status-heading" className="sr-only">
            {t("researchHome.statusHeading")}
          </h2>
          <p className="text-sm font-semibold text-teal-300">{researchHome.statusLabel}</p>
          <div className="mt-4 grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-emerald-400/90">
                {t("researchHome.availableToday")}
              </p>
              <ul className="mt-2 space-y-1.5 text-sm text-zinc-400">
                {researchHome.availableTodayItems.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                {t("researchHome.notAvailableYet")}
              </p>
              <ul className="mt-2 space-y-1.5 text-sm text-zinc-500">
                {researchHome.notAvailableYetItems.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-zinc-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>

      <ResearchNetwork />

      <div
        className={`mx-auto max-w-6xl space-y-14 px-4 pb-10 sm:px-6 sm:pb-14 ${cbaiHeroGlow}`}
      >
        <section aria-labelledby="research-canvas-cta-heading" className="space-y-3">
          <p className={cbaiSectionEyebrow}>{t("researchCanvas.eyebrow")}</p>
          <div className={`${cbaiGlassCard} flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between`}>
            <div>
              <h2 id="research-canvas-cta-heading" className="text-lg font-semibold text-zinc-100">
                {t("researchCanvas.pageTitle")}
              </h2>
              <p className="mt-1 text-sm text-zinc-500">{t("researchCanvas.purpose")}</p>
              <p className="mt-2 text-xs text-zinc-600">{t("researchCanvas.defaultPrivate")}</p>
            </div>
            <Link href="/research/canvas" className={`${cbaiBtnPrimary} shrink-0`}>
              {t("researchCanvas.createSmartIdea")} →
            </Link>
          </div>
        </section>

        <section aria-labelledby="research-workspace-cta-heading" className="space-y-3">
          <p className={cbaiSectionEyebrow}>{researchHome.workspaceEyebrow}</p>
          <div className={`${cbaiGlassCard} flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between`}>
            <div>
              <h2 id="research-workspace-cta-heading" className="text-lg font-semibold text-zinc-100">
                {researchHome.workspaceTitle}
              </h2>
              <p className="mt-1 text-sm text-zinc-500">{researchHome.workspaceBody}</p>
            </div>
            <Link href={WORKSPACE_PATH} className={`${cbaiBtnSecondary} shrink-0`}>
              {t("researchHome.openWorkspace")} →
            </Link>
          </div>
        </section>

        <ResearchTopicCatalog initialQuery={query} />
        <ResearchGraphPanel variant="global" />
        <ResearchEcosystemOverview />
        <ResearchPrinciples />
      </div>
    </>
  );
}
