"use client";

import { useSyncExternalStore } from "react";
import { getSyncStatus, subscribeSyncStatus, type SyncStatus } from "@/lib/supabase/outbox";
import type { SyncTableName } from "@/lib/supabase/cloud-tables";

type SyncStatusBadgeProps = {
  table: SyncTableName;
  localId: string;
};

const LABELS: Record<Exclude<SyncStatus, "idle">, string> = {
  saving: "Saving…",
  saved: "Saved to cloud",
  error: "Could not save — will retry",
};

const CLASSES: Record<Exclude<SyncStatus, "idle">, string> = {
  saving: "text-zinc-500",
  saved: "text-emerald-400",
  error: "text-amber-400",
};

/**
 * Real, per-record cloud save status (Phase 9/13) — reads the outbox's live status map, never a
 * fabricated instantaneous "Saved." In Local Mode this never renders anything, since there is no
 * cloud write in flight to report on (the outbox only enqueues while a cloud session is active).
 */
export default function SyncStatusBadge({ table, localId }: SyncStatusBadgeProps) {
  const status = useSyncExternalStore(
    subscribeSyncStatus,
    () => getSyncStatus(table, localId),
    () => "idle" as SyncStatus,
  );

  if (status === "idle") return null;

  return <span className={`text-[11px] ${CLASSES[status]}`}>{LABELS[status]}</span>;
}
