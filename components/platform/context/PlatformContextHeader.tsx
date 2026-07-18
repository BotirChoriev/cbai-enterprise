"use client";

import { useMemo } from "react";
import { buildContextHeaderModel } from "@/lib/context";
import { usePlatformContext } from "@/components/platform/context/PlatformContextProvider";
import { useMissionContext } from "@/components/mission/MissionContextProvider";
import { operatingParamsFromMission } from "@/lib/intelligence-os/mission-operating-context";
import PlatformBreadcrumb from "@/components/platform/context/PlatformBreadcrumb";
import PlatformQuickActions from "@/components/platform/context/PlatformQuickActions";
import RelatedModules from "@/components/platform/context/RelatedModules";
import RecentEntities from "@/components/platform/context/RecentEntities";
import PinnedEntities from "@/components/platform/context/PinnedEntities";

type PlatformContextHeaderProps = {
  moduleLabel: string;
};

export default function PlatformContextHeader({ moduleLabel }: PlatformContextHeaderProps) {
  const { context } = usePlatformContext();
  const { mission } = useMissionContext();

  const model = useMemo(
    () => buildContextHeaderModel(context, moduleLabel, operatingParamsFromMission(mission)),
    [context, moduleLabel, mission],
  );

  return (
    <section
      aria-label="Platform context"
      className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-4 sm:px-5"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-2">
          <p className="text-[10px] font-medium uppercase tracking-widest text-teal-400">
            Platform Context
          </p>
          <p className="text-lg font-semibold text-zinc-50">{model.primaryEntityLabel}</p>
          <PlatformBreadcrumb segments={model.breadcrumbs} />
          <p className="text-[11px] text-zinc-600">{model.timelineMessage}</p>
        </div>

        <div className="shrink-0 space-y-2 text-right lg:max-w-xs">
          {model.searchQuery && (
            <p className="text-[11px] text-zinc-500">
              Search: <span className="text-zinc-300">{model.searchQuery}</span>
            </p>
          )}
          {model.workspace && (
            <p className="text-[11px] text-zinc-500">
              Workspace:{" "}
              <span className="capitalize text-zinc-300">{model.workspace}</span>
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-3 border-t border-zinc-800 pt-4">
        <div>
          <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
            Quick actions
          </p>
          <PlatformQuickActions actions={model.quickActions} />
        </div>

        <div>
          <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
            Related modules
          </p>
          <RelatedModules modules={model.relatedModules} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <RecentEntities entities={model.recentEntities} />
          <PinnedEntities entities={model.pinnedEntities} />
        </div>
      </div>
    </section>
  );
}
