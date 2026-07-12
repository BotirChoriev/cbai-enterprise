"use client";

import { useSyncExternalStore } from "react";
import { pendingSyncCount, subscribeSyncStatus } from "@/lib/supabase/outbox";

/** Real, honest count of changes still waiting to reach the cloud — never silently claims
 * everything is saved (Phase 10/13). Renders nothing once the queue is empty. */
export default function PendingSyncNotice({ cloudUserId }: { cloudUserId: string }) {
  const count = useSyncExternalStore(
    subscribeSyncStatus,
    () => pendingSyncCount(cloudUserId),
    () => 0,
  );

  if (count === 0) return null;

  return (
    <p className="mt-2 text-[11px] text-amber-400">
      {count} change{count === 1 ? "" : "s"} waiting to sync to the cloud…
    </p>
  );
}
