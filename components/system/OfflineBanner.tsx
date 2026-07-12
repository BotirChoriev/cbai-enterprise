"use client";

import { useEffect, useState } from "react";

/**
 * Real connectivity detection (the browser's own online/offline events) — not a fabricated
 * status. CBAI's data is local-first (localStorage), so being offline doesn't break navigation;
 * this banner exists only so a user isn't left guessing why something feels stale.
 *
 * Checks `window`, not just `navigator` — modern Node has a global `navigator` object (with
 * `onLine` always `undefined`), so a `typeof navigator` check alone reads as "offline" during
 * every server render, which both misrepresents server-side state and risks a hydration mismatch
 * against a genuinely-online browser.
 */
function isCurrentlyOffline(): boolean {
  return typeof window !== "undefined" && typeof navigator !== "undefined" && !navigator.onLine;
}

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(() => isCurrentlyOffline());

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div
      role="status"
      className="flex items-center justify-center gap-2 border-b border-amber-500/20 bg-amber-500/10 px-4 py-1.5 text-xs text-amber-300"
    >
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-amber-400" />
      You&apos;re offline — saved Projects and notes are still available; anything requiring a
      connection will resume once you&apos;re back online.
    </div>
  );
}
