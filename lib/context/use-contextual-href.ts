"use client";

import { useCallback, useMemo } from "react";
import {
  buildContextualHref,
  type PlatformContextSnapshot,
} from "@/lib/context";
import { useMissionContext } from "@/components/mission/MissionContextProvider";
import {
  appendOperatingParamsToHref,
  operatingParamsFromMission,
  type OperatingUrlParams,
} from "@/lib/intelligence-os/mission-operating-context";

/** Build cross-module hrefs that preserve entity focus and active mission/project context. */
export function useContextualHref() {
  const { mission } = useMissionContext();

  const operating = useMemo(() => operatingParamsFromMission(mission), [mission]);

  const moduleHref = useCallback(
    (path: string) => appendOperatingParamsToHref(path, operating),
    [operating],
  );

  const contextualHref = useCallback(
    (path: string, snapshot: PlatformContextSnapshot) =>
      buildContextualHref(path, snapshot, operating),
    [operating],
  );

  const entityProfileHref = useCallback(
    (baseHref: string) => appendOperatingParamsToHref(baseHref, operating),
    [operating],
  );

  return { moduleHref, contextualHref, entityProfileHref, operating, mission };
}

export type { OperatingUrlParams };
