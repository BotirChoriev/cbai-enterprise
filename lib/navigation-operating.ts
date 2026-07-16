/** BUILD-013 — Operating Navigation items for Intelligence Canvas home. */

import type { NavItem } from "@/lib/navigation";

export const operatingNavigationItems: readonly NavItem[] = [
  {
    label: "Mission",
    href: "/",
    icon: "home",
    description: "Current intelligence mission and operating canvas.",
  },
  {
    label: "Knowledge",
    href: "/research",
    icon: "research",
    description: "Research catalog and knowledge organization.",
  },
  {
    label: "Evidence",
    href: "/knowledge",
    icon: "knowledge",
    description: "Official source status and evidence infrastructure.",
  },
  {
    label: "Research",
    href: "/research/workspace",
    icon: "research",
    description: "Structured research workspace.",
  },
  {
    label: "Countries",
    href: "/countries",
    icon: "countries",
    description: "Country intelligence profiles.",
  },
  {
    label: "Companies",
    href: "/companies",
    icon: "companies",
    description: "Company intelligence profiles.",
  },
  {
    label: "Universities",
    href: "/universities",
    icon: "universities",
    description: "University intelligence profiles.",
  },
  {
    label: "Reports",
    href: "/reports",
    icon: "analytics",
    description: "Report readiness and saved reports.",
  },
  {
    label: "Trust",
    href: "/trust",
    icon: "trust",
    description: "Constitution, methodology, and accountability.",
  },
  {
    label: "Settings",
    href: "/settings",
    icon: "settings",
    description: "Assistant, accessibility, and preferences.",
  },
] as const;
