"use client";

import { useState } from "react";
import { saveReport, type ReportKind } from "@/lib/reports/reports-store";
import { cbaiBtnSecondary } from "@/components/brand/brand-classes";

type SaveReportButtonProps = {
  kind: ReportKind;
  entityId: string;
  entityName: string;
  title: string;
  projectId?: string;
};

/**
 * Real, persisted report ownership (Real Supabase Authentication + Cloud Persistence mission,
 * Phase 11). Saves an index record — kind/entity/when — to My Reports (Reports Center); the
 * report content itself is never duplicated into storage (see lib/reports/reports-store.ts) — a
 * saved report always reopens to the live, current profile/project report.
 */
export default function SaveReportButton({ kind, entityId, entityName, title, projectId }: SaveReportButtonProps) {
  const [saved, setSaved] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        saveReport({ kind, entityId, entityName, title, projectId });
        setSaved(true);
        window.setTimeout(() => setSaved(false), 3000);
      }}
      className={`${cbaiBtnSecondary} cbai-no-print`}
    >
      {saved ? "Saved to My Reports" : "Save to My Reports"}
    </button>
  );
}
