"use client";

import type { ReactNode } from "react";
import EntityPageHeader from "@/components/shared/EntityPageHeader";
import ContextualOperatorBanner from "@/components/assistant/ContextualOperatorBanner";
import EngineRouteEntryStrip from "@/components/forward-deployed/EngineRouteEntryStrip";
import { useProgressiveDisclosure } from "@/lib/hooks/use-progressive-disclosure";
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

  return (
    <div className={`${cbaiPageWorkspace} ${cbaiPageStack}`}>
      <EntityPageHeader title={title} description={description} />
      {notFoundNotice}
      {disclosure.level === "expert" ? <ContextualOperatorBanner /> : null}
      <EngineRouteEntryStrip />
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
