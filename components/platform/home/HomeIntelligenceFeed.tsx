"use client";

import { useMemo } from "react";
import Link from "next/link";
import { loadProjects } from "@/lib/project/project-store";
import { loadReports } from "@/lib/reports/reports-store";
import { useTranslation } from "@/lib/i18n/use-translation";
import { translateProjectTypeLabel } from "@/lib/i18n/project-translation";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type FeedItem = {
  id: string;
  category: string;
  title: string;
  sourceLabel: string;
  date: string;
  href: string;
};

/**
 * Intelligence Feed (Phase 14) — populated only from real data this browser actually has: recent
 * Project activity and saved Reports. There is no global "news" source in this platform (no
 * server, no external feed), so this is honestly a real *personal* activity feed, not a
 * fabricated global intelligence stream. When there is genuinely nothing yet, this shows the
 * exact honest empty state the mission requires rather than inventing content.
 */
export default function HomeIntelligenceFeed() {
  const { t } = useTranslation();
  // Re-derived whenever the interface language changes (not a one-time useState) — category/
  // sourceLabel are real translated strings, so a language switch must not leave this feed
  // showing stale text from whichever language was active when the component first mounted.
  const items = useMemo<FeedItem[]>(() => {
    const projectItems: FeedItem[] = loadProjects()
      .slice(0, 4)
      .map((project) => ({
        id: `project-${project.id}`,
        category: translateProjectTypeLabel(t, project.type),
        title: project.title,
        sourceLabel: t("home.feedYourProjectActivity"),
        date: project.updatedAt,
        href: `/my-work?project=${project.id}`,
      }));

    const reportItems: FeedItem[] = loadReports()
      .slice(0, 4)
      .map((report) => ({
        id: `report-${report.id}`,
        category: t("home.feedSavedReport"),
        title: report.title,
        sourceLabel: t("home.feedYourSavedReports"),
        date: report.generatedAt,
        href: report.kind === "project" ? `/my-work?project=${report.projectId ?? report.entityId}#project-report` : "/analytics",
      }));

    return [...projectItems, ...reportItems].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
  }, [t]);

  return (
    <section aria-labelledby="home-feed-heading" className={`${cbaiGlassCard} space-y-3 p-5`}>
      <p className={cbaiSectionEyebrow} id="home-feed-heading">
        {t("home.feedHeading")}
      </p>

      {items.length === 0 ? (
        <div className="space-y-3">
          <p className="text-sm text-zinc-500">{t("home.feedEmptyTitle")}</p>
          <div className="flex flex-wrap gap-2">
            <Link href="/research" className="rounded-full border border-zinc-800 bg-zinc-900/40 px-3 py-1.5 text-xs text-zinc-300 hover:text-cyan-300">
              {t("home.feedExploreResearch")}
            </Link>
            <Link href="/knowledge" className="rounded-full border border-zinc-800 bg-zinc-900/40 px-3 py-1.5 text-xs text-zinc-300 hover:text-cyan-300">
              {t("home.feedSearchEvidence")}
            </Link>
            <Link href="/countries" className="rounded-full border border-zinc-800 bg-zinc-900/40 px-3 py-1.5 text-xs text-zinc-300 hover:text-cyan-300">
              {t("home.feedOpenCountries")}
            </Link>
          </div>
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id} className="rounded-lg border border-zinc-800/80 bg-zinc-900/40 px-3 py-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-zinc-600">{item.category}</p>
                  <Link href={item.href} className="text-sm font-medium text-cyan-400 hover:text-cyan-300">
                    {item.title}
                  </Link>
                  <p className="mt-0.5 text-[11px] text-zinc-600">
                    {item.sourceLabel} · {new Date(item.date).toLocaleDateString()}
                  </p>
                </div>
                <Link href={item.href} className="shrink-0 text-xs font-medium text-zinc-400 hover:text-cyan-300">
                  {t("common.open")} →
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
