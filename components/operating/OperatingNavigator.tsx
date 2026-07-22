"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { primaryNavSections, secondaryNavSections } from "@/lib/navigation";
import { operatingNavigationItems } from "@/lib/navigation-operating";
import { deriveNavLiveState, type NavLiveState } from "@/lib/intelligence-os/nav-live-state";
import { translateNavLabel, translateNavSectionTitle } from "@/lib/i18n/nav-translation";
import NavIcon from "@/components/layout/NavIcon";
import { useContextualHref } from "@/lib/context/use-contextual-href";
import {
  cbaiNavEyebrow,
  cbaiNavRow,
  cbaiNavRowActive,
  cbaiNavRowIdle,
  cbaiSpatialNavRow,
  cbaiSpatialNavRowActive,
  cbaiSpatialNavRowIdle,
} from "@/components/brand/brand-classes";

const LIVE_LABEL: Record<NavLiveState, string> = {
  active: "operatingNav.liveActive",
  ready: "operatingNav.liveReady",
  attention: "operatingNav.liveAttention",
  neutral: "operatingNav.liveNeutral",
};

const LIVE_DOT: Record<NavLiveState, string> = {
  active: "bg-[var(--cbai-accent-primary)] shadow-[0_0_6px_color-mix(in_srgb,var(--cbai-accent-primary)_45%,transparent)]",
  ready: "bg-[color-mix(in_srgb,var(--cbai-accent-primary)_70%,transparent)]",
  attention: "bg-[var(--gold)]/80",
  neutral: "bg-[color-mix(in_srgb,var(--cbai-text-muted)_60%,transparent)]",
};

function NavRow({
  href,
  label,
  icon,
  live,
  t,
  spatial = false,
}: {
  href: string;
  label: string;
  icon: Parameters<typeof NavIcon>[0]["name"];
  live: NavLiveState;
  t: (path: string) => string;
  spatial?: boolean;
}) {
  const row = spatial ? cbaiSpatialNavRow : cbaiNavRow;
  const active = spatial ? cbaiSpatialNavRowActive : cbaiNavRowActive;
  const idle = spatial ? cbaiSpatialNavRowIdle : cbaiNavRowIdle;

  return (
    <Link
      href={href}
      className={`${row} ${live === "active" ? active : idle}`}
      title={`${label} — ${t(LIVE_LABEL[live])}`}
    >
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${LIVE_DOT[live]}`} aria-hidden="true" />
      <NavIcon name={icon} />
      <span className="truncate">{label}</span>
    </Link>
  );
}

/** Operating Navigator — live state on every item, never icon-only. */
export default function OperatingNavigator() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const hydrated = useHydrated();
  const { moduleHref } = useContextualHref();
  const isHome = pathname === "/";

  if (isHome) {
    return (
      <nav aria-label={t("intelligenceSpaces.operatingNavigator")} className="space-y-1">
        <p className={`${cbaiNavEyebrow} px-2 pb-2`}>
          {t("intelligenceSpaces.operatingNavigator")}
        </p>
        <ul className="space-y-0.5">
          {operatingNavigationItems.map((item) => {
            const live = hydrated ? deriveNavLiveState(item.href, pathname) : "neutral";
            return (
              <li key={item.href}>
                <NavRow
                  href={moduleHref(item.href)}
                  label={translateNavLabel(t, item.href, item.label)}
                  icon={item.icon}
                  live={live}
                  t={t}
                  spatial={isHome}
                />
              </li>
            );
          })}
        </ul>
      </nav>
    );
  }

  return (
    <nav aria-label={t("intelligenceSpaces.operatingNavigator")} className="space-y-4">
      <p className={`${cbaiNavEyebrow} px-2`}>
        {t("intelligenceSpaces.operatingNavigator")}
      </p>
      {primaryNavSections.map((section, index) => (
        <div key={section.title || `section-${index}`}>
          {section.title ? (
            <p className={`${cbaiNavEyebrow} mb-2 px-2`}>
              {translateNavSectionTitle(t, section.title)}
            </p>
          ) : null}
          <ul className="space-y-0.5">
            {section.items.map((item) => {
              const live = hydrated ? deriveNavLiveState(item.href, pathname) : "neutral";
              return (
                <li key={item.href}>
                  <NavRow
                    href={moduleHref(item.href)}
                    label={translateNavLabel(t, item.href, item.label)}
                    icon={item.icon}
                    live={live}
                    t={t}
                    spatial={isHome}
                  />
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      <details className="cbai-nav-disclosure border-t pt-3">
        <summary className={`cbai-nav-disclosure-summary ${cbaiNavEyebrow} mb-2 cursor-pointer list-none px-2`}>
          {t("navigation.intelligenceCabinet")}
        </summary>
        {secondaryNavSections.map((section, index) => (
          <div key={section.title || `secondary-${index}`} className="mb-3">
            <p className={`cbai-nav-disclosure-section ${cbaiNavEyebrow} mb-2 px-2`}>
              {translateNavSectionTitle(t, section.title)}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const live = hydrated ? deriveNavLiveState(item.href, pathname) : "neutral";
                return (
                  <li key={item.href}>
                    <NavRow
                      href={moduleHref(item.href)}
                      label={translateNavLabel(t, item.href, item.label)}
                      icon={item.icon}
                      live={live}
                      t={t}
                      spatial={isHome}
                    />
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </details>
    </nav>
  );
}
