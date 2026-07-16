/**
 * Real, persisted Report ownership (Real Supabase Authentication + Cloud Persistence mission,
 * Phase 11 / product-activation-audit.md's Reports and Bookmark Ownership requirement).
 *
 * A saved Report is an index record — kind, entity, title, when it was generated — never a stored
 * content snapshot. "Reopen" always re-renders the live profile/project report at read time (see
 * components/*ReportView.tsx), so a saved Report can never go stale relative to corrected evidence.
 * What is genuinely persisted is *that the user saved this report and when*, which is what "Reports
 * must persist independently from browser memory" actually requires: real ownership and history,
 * not a second, potentially-stale copy of report content.
 *
 * Same isBrowser-guarded, namespaced-key pattern as every other store in this app (see
 * lib/project/project-store.ts) — real-user-namespaced, synced to the cloud via the outbox when a
 * cloud session is active (see lib/supabase/outbox.ts).
 */

import { resolveStorageKey } from "@/lib/storage/namespaced-key";
import { getSyncedCloudUserId } from "@/lib/supabase/cloud-session-sync";
import { enqueueSync } from "@/lib/supabase/outbox";
import type { ReportKindValue } from "@/lib/supabase/database.types";
import { notifyMissionDataChanged } from "@/lib/intelligence-os/mission-activation-events";

const REPORTS_KEY = "cbai-saved-reports";

export type ReportKind = ReportKindValue;

export type SavedReport = {
  id: string;
  kind: ReportKind;
  entityId: string;
  entityName: string;
  projectId?: string;
  title: string;
  generatedAt: string;
  createdAt: string;
};

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function isSavedReport(value: unknown): value is SavedReport {
  const v = value as SavedReport;
  return (
    typeof v === "object" &&
    v !== null &&
    typeof v.id === "string" &&
    (v.kind === "project" || v.kind === "country" || v.kind === "company" || v.kind === "university" || v.kind === "research_topic") &&
    typeof v.entityId === "string" &&
    typeof v.entityName === "string" &&
    typeof v.title === "string" &&
    typeof v.generatedAt === "string" &&
    typeof v.createdAt === "string"
  );
}

function readReports(): SavedReport[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(resolveStorageKey(REPORTS_KEY));
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isSavedReport);
  } catch {
    return [];
  }
}

function writeReports(reports: readonly SavedReport[]): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(resolveStorageKey(REPORTS_KEY), JSON.stringify(reports));
}

function newId(): string {
  return `report-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function syncReportRow(report: SavedReport): void {
  const ownerId = getSyncedCloudUserId();
  if (!ownerId) return;
  enqueueSync(ownerId, "reports", "upsert", report.id, {
    owner_id: ownerId,
    local_id: report.id,
    kind: report.kind,
    entity_id: report.entityId,
    entity_name: report.entityName,
    project_id: report.projectId ?? null,
    title: report.title,
    generated_at: report.generatedAt,
  });
}

function syncDeleteReport(reportId: string): void {
  const ownerId = getSyncedCloudUserId();
  if (!ownerId) return;
  enqueueSync(ownerId, "reports", "delete", reportId);
}

export function loadReports(): SavedReport[] {
  return readReports().sort((a, b) => b.generatedAt.localeCompare(a.generatedAt));
}

export type SaveReportInput = {
  kind: ReportKind;
  entityId: string;
  entityName: string;
  projectId?: string;
  title: string;
};

/** Real, user-caused save — dedups by (kind, entityId): re-saving the same report updates its
 * generatedAt timestamp rather than creating a second entry. */
export function saveReport(input: SaveReportInput): SavedReport {
  const all = readReports();
  const existing = all.find((r) => r.kind === input.kind && r.entityId === input.entityId);
  const now = new Date().toISOString();

  const report: SavedReport = existing
    ? { ...existing, title: input.title, projectId: input.projectId, generatedAt: now }
    : { ...input, id: newId(), generatedAt: now, createdAt: now };

  const next = existing ? all.map((r) => (r.id === report.id ? report : r)) : [...all, report];
  writeReports(next);
  syncReportRow(report);
  notifyMissionDataChanged("report");
  return report;
}

export function deleteReport(id: string): void {
  writeReports(readReports().filter((r) => r.id !== id));
  syncDeleteReport(id);
  notifyMissionDataChanged("report");
}

export const NO_REPORTS_NOTE = "No reports saved yet — no fabricated history, save one from any report view below.";
