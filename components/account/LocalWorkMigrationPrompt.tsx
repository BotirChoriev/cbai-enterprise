"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/components/platform/context/AuthProvider";
import { detectLocalWork, hasMigratedToCloud, migrateLocalWorkToCloud, type MigrationSummary } from "@/lib/supabase/migration";
import { cbaiBtnPrimary, cbaiBtnSecondary, cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

const DISMISSED_KEY_PREFIX = "cbai-migration-dismissed:";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function isDismissed(cloudUserId: string): boolean {
  if (!isBrowser()) return false;
  return window.localStorage.getItem(`${DISMISSED_KEY_PREFIX}${cloudUserId}`) !== null;
}

/**
 * "Local work was found on this device." (Phase 8) — shown once per cloud sign-in when this
 * device has real local Projects/Notes/Tasks/Questions/Evidence/Bookmarks/Reports that have not
 * yet been uploaded to the signed-in cloud account. Import is additive and retry-safe; declining
 * never deletes anything local.
 *
 * Eligibility is computed directly during render (a synchronous localStorage read, same pattern
 * as every other store in this app) rather than mirrored into state via an effect — the one piece
 * of real component state is `dismissed`, set only by the user's own "Keep Local for Now" click.
 */
export default function LocalWorkMigrationPrompt() {
  const { cloudUser } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [status, setStatus] = useState<"idle" | "importing" | "done" | "error">("idle");
  const [summary, setSummary] = useState<MigrationSummary | null>(null);

  const counts = useMemo(() => (isBrowser() ? detectLocalWork() : null), []);

  // Checked before the `visible` gate below: a successful import marks this device as migrated
  // (hasMigratedToCloud becomes true), which would otherwise hide this component — including its
  // own just-earned success message — the instant status flips to "done".
  if (status === "done" && summary) {
    return (
      <div className={`${cbaiGlassCard} space-y-2 border-emerald-500/20 p-5`}>
        <p className={cbaiSectionEyebrow}>Import Complete</p>
        <p className="text-sm text-zinc-200">
          Imported {summary.projects} project{summary.projects === 1 ? "" : "s"}, {summary.notes} note
          {summary.notes === 1 ? "" : "s"}, {summary.tasks} task{summary.tasks === 1 ? "" : "s"}, {summary.questions}{" "}
          open question{summary.questions === 1 ? "" : "s"}, {summary.evidence} evidence reference
          {summary.evidence === 1 ? "" : "s"}, {summary.entityLinks} related entit
          {summary.entityLinks === 1 ? "y" : "ies"}, {summary.bookmarks} bookmark{summary.bookmarks === 1 ? "" : "s"}, and{" "}
          {summary.reports} report{summary.reports === 1 ? "" : "s"} to your cloud account.
        </p>
        <p className="text-xs text-zinc-500">Your local copy on this device was not deleted.</p>
        <button type="button" onClick={() => setDismissed(true)} className={cbaiBtnSecondary}>
          Done
        </button>
      </div>
    );
  }

  const visible =
    Boolean(cloudUser) &&
    isBrowser() &&
    !dismissed &&
    !hasMigratedToCloud(cloudUser!.id) &&
    !isDismissed(cloudUser!.id) &&
    Boolean(counts) &&
    !counts!.isEmpty;

  if (!visible || !cloudUser || !counts) return null;

  async function handleImport() {
    if (!cloudUser) return;
    setStatus("importing");
    const result = await migrateLocalWorkToCloud(cloudUser.id);
    setSummary(result);
    setStatus(result.failures.length === 0 ? "done" : "error");
  }

  function handleKeepLocal() {
    if (isBrowser() && cloudUser) {
      window.localStorage.setItem(`${DISMISSED_KEY_PREFIX}${cloudUser.id}`, new Date().toISOString());
    }
    setDismissed(true);
  }

  return (
    <div className={`${cbaiGlassCard} space-y-3 border-teal-500/20 p-5`}>
      <p className={cbaiSectionEyebrow}>Local work was found on this device</p>
      <p className="text-sm text-zinc-300">
        {counts.projects} project{counts.projects === 1 ? "" : "s"}, {counts.notes} note{counts.notes === 1 ? "" : "s"},{" "}
        {counts.tasks} task{counts.tasks === 1 ? "" : "s"}, {counts.questions} open question{counts.questions === 1 ? "" : "s"},{" "}
        {counts.evidence} evidence reference{counts.evidence === 1 ? "" : "s"}, {counts.bookmarks} bookmark
        {counts.bookmarks === 1 ? "" : "s"}, and {counts.reports} report{counts.reports === 1 ? "" : "s"} exist on this device
        but are not yet in your cloud account ({cloudUser.email}).
      </p>

      {status === "error" && summary ? (
        <p className="rounded-md bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
          {summary.failures.length} item{summary.failures.length === 1 ? "" : "s"} could not be imported (network or
          server issue). Nothing local was lost — you can retry the import below.
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={handleImport} disabled={status === "importing"} className={`${cbaiBtnPrimary} disabled:opacity-50`}>
          {status === "importing" ? "Importing…" : status === "error" ? "Retry Import" : "Import to Cloud"}
        </button>
        <button type="button" onClick={handleKeepLocal} className={cbaiBtnSecondary}>
          Keep Local for Now
        </button>
      </div>
      <p className="text-xs text-zinc-600">
        Importing only adds to your cloud account — nothing on this device is deleted or changed.
      </p>
    </div>
  );
}
