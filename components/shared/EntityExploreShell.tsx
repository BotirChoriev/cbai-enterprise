"use client";

import type { ReactNode } from "react";
import EntityPageHeader from "@/components/shared/EntityPageHeader";
import ContextualOperatorBanner from "@/components/assistant/ContextualOperatorBanner";
import EngineRouteEntryStrip from "@/components/forward-deployed/EngineRouteEntryStrip";
import IntelligenceStatusRail from "@/components/shared/IntelligenceStatusRail";
import { useProgressiveDisclosure } from "@/lib/hooks/use-progressive-disclosure";
import { useTranslation } from "@/lib/i18n/use-translation";
import { cbaiEntitySidebarStack, cbaiPageStack, cbaiPageWorkspace } from "@/components/brand/brand-classes";

type EntityExploreShellProps = {
  title: string;
  description: string;
  notFoundNotice?: ReactNode;
  beforeGrid?: ReactNode;
  filters: ReactNode;
  list: ReactNode;
  detail: ReactNode;
};

const ENTITY_SIDEBAR =
  `${cbaiEntitySidebarStack} xl:sticky xl:top-6 xl:col-span-4 xl:max-h-[calc(100vh-3rem)] xl:overflow-y-auto`;

/** One layout grammar for Countries, Companies, and Universities explore pages. */
export default function EntityExploreShell({
  title,
  description,
  notFoundNotice,
  beforeGrid,
  filters,
  list,
  detail,
}: EntityExploreShellProps) {
  const disclosure = useProgressiveDisclosure();
  const { language } = useTranslation();

  return (
    <div className={`${cbaiPageWorkspace} ${cbaiPageStack}`}>
      <EntityPageHeader title={title} description={description} />
      {notFoundNotice}
      {disclosure.level === "expert" ? <ContextualOperatorBanner /> : null}
      <IntelligenceStatusRail
        context={title}
        evidence={description}
        unknown={null}
        humanBoundary={null}
        compact
      />
      <details className="rounded-xl border border-[var(--cbai-border-subtle)] bg-[var(--cbai-surface-muted)] px-4 py-3">
        <summary className="cursor-pointer list-none text-xs text-[var(--cbai-accent-primary)] marker:content-none [&::-webkit-details-marker]:hidden">
          {language === "uz" ? "Intellekt yordamchilari" : "Intelligence engines"}
        </summary>
        <div className="mt-3 border-t border-[var(--cbai-border-subtle)] pt-3">
          <EngineRouteEntryStrip />
        </div>
      </details>
      {beforeGrid}
      <div className="grid gap-6 xl:grid-cols-12 xl:items-start">
        <div className={ENTITY_SIDEBAR}>
          {filters}
          {list}
        </div>
        <div className={`${cbaiPageStack} xl:col-span-8`}>{detail}</div>
      </div>
    </div>
  );
}
