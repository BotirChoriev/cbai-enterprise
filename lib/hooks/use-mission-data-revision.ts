"use client";

import { useSyncExternalStore } from "react";
import { MISSION_DATA_CHANGED } from "@/lib/intelligence-os/mission-activation-events";

let revision = 0;

function subscribe(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => {
    revision += 1;
    onStoreChange();
  };
  window.addEventListener(MISSION_DATA_CHANGED, handler);
  return () => window.removeEventListener(MISSION_DATA_CHANGED, handler);
}

function getSnapshot(): number {
  return revision;
}

function getServerSnapshot(): number {
  return 0;
}

/** Re-render when mission-relevant local data changes — no page reload. */
export function useMissionDataRevision(): number {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
