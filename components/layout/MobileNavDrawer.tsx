"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { primaryNavSections, secondaryNavSections } from "@/lib/navigation";
import NavIcon from "@/components/layout/NavIcon";
import CBAILogo from "@/components/brand/CBAILogo";

function isNavItemActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

type MobileNavDrawerProps = {
  open: boolean;
  onClose: () => void;
};

/**
 * Responsive mobile navigation (Phase 1/19) — the desktop Sidebar (components/layout/Sidebar.tsx)
 * is hidden below `md:`; this drawer is the mobile equivalent, reusing the exact same
 * `primaryNavSections`/`secondaryNavSections` data so there is only ever one real navigation
 * source. Real focus handling (Escape closes, backdrop click closes) — no third-party dialog
 * dependency.
 */
export default function MobileNavDrawer({ open, onClose }: MobileNavDrawerProps) {
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex md:hidden">
      <button
        type="button"
        aria-label="Close navigation"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <nav
        aria-label="Mobile navigation"
        className="relative flex h-full w-72 max-w-[85vw] flex-col overflow-y-auto border-r border-cyan-500/10 bg-[#050810] p-4"
      >
        <div className="mb-4 flex items-center justify-between">
          <Link href="/" onClick={onClose}>
            <CBAILogo showTagline size="sm" />
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="flex h-11 w-11 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400"
          >
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-5 w-5">
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {primaryNavSections.map((section, index) => (
          <div key={section.title || `primary-${index}`} className="mb-4">
            {section.title ? (
              <p className="mb-1.5 px-2 text-[10px] font-medium uppercase tracking-widest text-zinc-600">
                {section.title}
              </p>
            ) : null}
            <div className="space-y-1">
              {section.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isNavItemActive(pathname, item.href)
                      ? "bg-cyan-500/10 text-cyan-400"
                      : "text-zinc-300 hover:bg-zinc-900"
                  }`}
                >
                  <NavIcon name={item.icon} />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        ))}

        <details className="mt-2 border-t border-zinc-800/80 pt-3">
          <summary className="cursor-pointer px-2 pb-2 text-[10px] font-medium uppercase tracking-widest text-zinc-600">
            More
          </summary>
          {secondaryNavSections.map((section, index) => (
            <div key={section.title || `secondary-${index}`} className="mb-3">
              <p className="mb-1.5 px-2 text-[10px] font-medium uppercase tracking-widest text-zinc-700">
                {section.title}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isNavItemActive(pathname, item.href)
                        ? "bg-cyan-500/10 text-cyan-400"
                        : "text-zinc-400 hover:bg-zinc-900"
                    }`}
                  >
                    <NavIcon name={item.icon} />
                    {item.label}
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
