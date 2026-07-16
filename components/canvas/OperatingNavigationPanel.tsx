"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { operatingNavigationItems } from "@/lib/navigation-operating";
import { deriveNavLiveState, type NavLiveState } from "@/lib/intelligence-os/nav-live-state";
import NavIcon from "@/components/layout/NavIcon";
import { cbaiSectionEyebrow } from "@/components/brand/brand-classes";

const LIVE_LABEL: Record<NavLiveState, keyof typeof import("@/lib/i18n/platform-copy-build013-en").OPERATING_NAV_EN> = {
  active: "liveActive",
  ready: "liveReady",
  attention: "liveAttention",
  neutral: "liveNeutral",
};

const LIVE_DOT: Record<NavLiveState, string> = {
  active: "bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.5)]",
  ready: "bg-emerald-500/80",
  attention: "bg-[var(--gold)]/80",
  neutral: "bg-zinc-600/50",
};

function navLabel(href: string, fallback: string, t: (path: string) => string): string {
  if (href === "/") return t("intelligenceCanvas.centerMission");
  if (href === "/knowledge") return t("intelligenceCanvas.centerEvidence");
  if (href === "/research") return t("intelligenceCanvas.centerKnowledge");
  if (href === "/research/workspace") return t("navigation.researchWorkspace");
  if (href === "/reports") return t("navigation.reports");
  if (href === "/trust") return t("navigation.trust");
  if (href === "/settings") return t("navigation.settings");
  if (href === "/countries") return t("navigation.countries");
  if (href === "/companies") return t("navigation.companies");
  if (href === "/universities") return t("navigation.universities");
  return fallback;
}

export default function OperatingNavigationPanel() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const hydrated = useHydrated();

  return (
    <nav aria-label={t("intelligenceCanvas.operatingNavigation")} className="space-y-1">
      <p className={`${cbaiSectionEyebrow} px-2 pb-2`}>{t("intelligenceCanvas.operatingNavigation")}</p>
      <ul className="space-y-0.5">
        {operatingNavigationItems.map((item) => {
          const live = hydrated ? deriveNavLiveState(item.href, pathname) : "neutral";
          const label = navLabel(item.href, item.label, t);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-2.5 rounded-md px-2 py-2 text-xs transition-colors ${
                  live === "active"
                    ? "bg-teal-500/10 text-teal-300"
                    : "text-zinc-500 hover:bg-zinc-900/60 hover:text-zinc-200"
                }`}
                title={`${label} — ${t(`operatingNav.${LIVE_LABEL[live]}`)}`}
              >
                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${LIVE_DOT[live]}`} aria-hidden="true" />
                <NavIcon name={item.icon} />
                <span className="truncate">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
