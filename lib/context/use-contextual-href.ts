"use client";

import { useCallback } from "react";
import { buildContextualHref, type PlatformContextSnapshot } from "@/lib/context";
import { useMissionContext } from "@/components/mission/MissionContextProvider";
import { operatingParamsFromMission } from "@/lib/intelligence-os/mission-operating-context";

/** Build cross-module hrefs that preserve entity focus and active mission/project context. */
export function useContextualHref() {
  const { mission } = useMissionContext();

  return useCallback(
    (path: string, snapshot: PlatformContextSnapshot) => {
      const operating = operatingParamsFromMission(mission);
      return buildContextualHref(path, snapshot, operating);
    },
    [mission],
  );
}
