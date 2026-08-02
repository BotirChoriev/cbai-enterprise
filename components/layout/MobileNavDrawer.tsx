"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  getNavigationCenterHref,
  isContextualNavigationRoute,
  navigationAdvancedSections,
  navigationCenterItems,
} from "@/lib/navigation";
import NavIcon from "@/components/layout/NavIcon";
import CBAILogo from "@/components/brand/CBAILogo";
import { useTranslation } from "@/lib/i18n/use-translation";
import { translateNavLabel, translateNavSectionTitle } from "@/lib/i18n/nav-translation";
import { useContextualHref } from "@/lib/context/use-contextual-href";

function isNavItemActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

type MobileNavDrawerProps = {
  open: boolean;
  onClose: () => void;
};

/**
 * Mobile navigation drawer — same IA source as desktop (`primaryNavSections` /
 * `secondaryNavSections`). Focus trap + Escape; deliberate sheet, not a squeezed sidebar.
 */
export default function MobileNavDrawer({ open, onClose }: MobileNavDrawerProps) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { moduleHref } = useContextualHref();
  const activeCenterHref = getNavigationCenterHref(pathname);
  const dialogRef = useRef<HTMLElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = dialogRef.current;
    const focusable = dialog?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), summary, [tabindex]:not([tabindex="-1"])',
    );
    focusable?.[0]?.focus();
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab" || !focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex md:hidden">
      <button
        type="button"
        aria-label={t("common.close")}
        onClick={onClose}
        className="absolute inset-0 bg-[color-mix(in_srgb,var(--cbai-text-inverse)_55%,transparent)] backdrop-blur-sm"
      />
      <nav
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={t("intelligenceSpaces.operatingNavigator")}
        className="relative flex h-full w-72 max-w-[85vw] flex-col overflow-y-auto border-r border-[var(--cbai-border-subtle)] bg-[var(--cbai-sidebar-bg)] p-4"
      >
        <div className="mb-4 flex items-center justify-between">
          <Link href="/" onClick={onClose}>
            <CBAILogo showTagline size="sm" />
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("common.close")}
            className="flex h-11 w-11 items-center justify-center rounded-md text-[var(--cbai-nav-text)] hover:bg-[var(--cbai-surface-hover)] hover:text-[var(--cbai-nav-text-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--cbai-focus-ring)]"
          >
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-5 w-5">
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="mb-4 space-y-0.5">
          {navigationCenterItems.map((item) => (
            <Link
              key={item.href}
              href={moduleHref(item.href)}
              onClick={onClose}
              className={`cbai-nav-row ${
                activeCenterHref === item.href ? "cbai-nav-row-active" : "cbai-nav-row-idle"
              }`}
            >
              <NavIcon name={item.icon} />
              {translateNavLabel(t, item.href, item.label)}
            </Link>
          ))}
        </div>

        <details
          className="mt-2 border-t border-[var(--cbai-border-subtle)] pt-3"
          open={isContextualNavigationRoute(pathname)}
        >
          <summary className="cbai-nav-eyebrow cursor-pointer px-2 pb-2">
            {t("navigation.advanced")}
          </summary>
          {navigationAdvancedSections.map((section, index) => (
            <div key={section.title || `secondary-${index}`} className="mb-3">
              <p className="cbai-nav-eyebrow mb-1.5 px-2">
                {translateNavSectionTitle(t, section.title)}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <Link
                    key={item.href}
                    href={moduleHref(item.href)}
                    onClick={onClose}
                    className={`cbai-nav-row ${
                      isNavItemActive(pathname, item.href) ? "cbai-nav-row-active" : "cbai-nav-row-idle"
                    }`}
                  >
                    <NavIcon name={item.icon} />
                    {translateNavLabel(t, item.href, item.label)}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </details>
      </nav>
    </div>
  );
}
