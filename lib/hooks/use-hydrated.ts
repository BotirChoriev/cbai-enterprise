"use client";

import { useSyncExternalStore } from "react";

function subscribe(): () => void {
  return () => {};
}

function getSnapshot(): boolean {
  return true;
}

function getServerSnapshot(): boolean {
  return false;
}

/**
 * Real, SSR-safe "has this component finished its first client render" flag — the fix for a real
 * class of hydration-mismatch bug found via actual browser testing (Full Real-User Experience
 * Audit mission): a component that reads a browser-only store (localStorage-backed
 * loadProjects()/loadProject()/etc.) directly during render produces a different DOM structure on
 * the server's pre-render pass (store honestly empty — no `window`) than the client's real
 * post-hydration data (a real project genuinely exists), so React discards and re-renders the
 * whole subtree — visible as a real console error and a wasted render, not merely a cosmetic
 * concern. Consumers gate their store-dependent branch behind this flag so the server and the
 * client's first render are byte-identical by construction, then the real data appears in the very
 * next commit once useSyncExternalStore detects the server/client snapshot mismatch itself — no
 * manual `useEffect` + `setState` needed, and no flash-of-wrong-content in between.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
