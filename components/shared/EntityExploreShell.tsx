"use client";

import type { ReactNode } from "react";
import EntityPageHeader from "@/components/shared/EntityPageHeader";
import MissionOperatingContextBar from "@/components/mission/MissionOperatingContextBar";
import ContextualOperatorBanner from "@/components/assistant/ContextualOperatorBanner";
import { useProgressiveDisclosure } from "@/lib/hooks/use-progressive-disclosure";
import { cbaiEntitySidebarStack, cbaiPageStack } from "@/components/brand/brand-classes";

type EntityExploreShellProps = {
  title: string;
  description: string;
  notFoundNotice?: ReactNode;
  beforeGrid?: ReactNode;
  statusStrip?: ReactNode;
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
  statusStrip,
  filters,
  list,
  detail,
}: EntityExploreShellProps) {
  const disclosure = useProgressiveDisclosure();

  return (
    <div className={cbaiPageStack}>
      <EntityPageHeader title={title} description={description} />
      <MissionOperatingContextBar variant="compact" />
      {statusStrip}
      {notFoundNotice}
      {disclosure.level === "expert" ? <ContextualOperatorBanner /> : null}
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
