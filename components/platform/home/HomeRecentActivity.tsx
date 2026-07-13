"use client";

import { usePlatformContext } from "@/components/platform/context/PlatformContextProvider";
import RecentEntities from "@/components/platform/context/RecentEntities";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

/**
 * Recent Activity (Platform Completion mission, Phase 7) — thin wrapper around the existing,
 * already-real `RecentEntities` (real view history, honest empty state), not a second recent-
 * activity implementation. One of the 8 sections the approved first screen is scoped to.
 */
export default function HomeRecentActivity() {
  const { context } = usePlatformContext();

  return (
    <section aria-labelledby="home-recent-activity-heading" className={`${cbaiGlassCard} space-y-2 p-5`}>
      <p className={cbaiSectionEyebrow} id="home-recent-activity-heading">
        Recent Activity
      </p>
      <RecentEntities entities={context.recentEntities} />
    </section>
  );
}
