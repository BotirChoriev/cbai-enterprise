"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  createEvidenceRecord,
  evidenceStatusDisplayLabel,
  isEvidencePresentedAsVerified,
  listAllowedEvidenceTransitions,
  loadEvidenceRecords,
  transitionEvidenceRecordStatus,
  type EvidenceLifecycleStatus,
  type EvidenceRecord,
} from "@/lib/evidence-engine";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import {
  cbaiMineralSurface,
  cbaiSectionEyebrow,
  cbaiTextBody,
  cbaiTextMuted,
} from "@/components/brand/brand-classes";

/**
 * Device-local evidence workspace — starts empty; no fabricated live sources.
 */
export default function EvidenceWorkspacePanel() {
  const hydrated = useHydrated();
  const [records, setRecords] = useState<EvidenceRecord[]>([]);
  const [title, setTitle] = useState("");
  const [missionId, setMissionId] = useState("");
  const [reportId, setReportId] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  function refresh() {
    setRecords(loadEvidenceRecords());
  }

  useEffect(() => {
    if (!hydrated) return;
    refresh();
  }, [hydrated]);

  function onCreate() {
    const trimmed = title.trim();
    if (!trimmed) {
      setMessage("Title required — no empty fabricated records.");
      return;
    }
    createEvidenceRecord({
      title: trimmed,
      status: "unverified",
      missionId: missionId.trim() || null,
      reportId: reportId.trim() || null,
      provenance: {
        publisher: "Not specified",
        confidenceBasis: "User-entered draft — unverified until review",
      },
    });
    setTitle("");
    setMissionId("");
    setReportId("");
    setMessage("Draft evidence saved as Unverified on this device.");
    refresh();
  }

  function onTransition(id: string, to: EvidenceLifecycleStatus) {
    const result = transitionEvidenceRecordStatus(id, to, {
      reviewer: "local-user",
      reviewNotes: `Status moved to ${to}`,
    });
    if (!result.ok) {
      setMessage(result.reason);
      return;
    }
    setMessage(`Updated to ${evidenceStatusDisplayLabel(result.record.status)}.`);
    refresh();
  }

  return (
    <section className={`${cbaiMineralSurface} space-y-4 p-4`} aria-labelledby="evidence-workspace-heading">
      <div className="space-y-1">
        <p className={cbaiSectionEyebrow} id="evidence-workspace-heading">
          Evidence workspace
        </p>
        <p className={cbaiTextMuted}>
          Device-local evidence records with provenance and lifecycle status. Unverified is never
          shown as verified. No live connector data is fabricated here.
        </p>
        <p className="text-[10px] text-zinc-600">
          Also see the catalog explorer at{" "}
          <Link href="/knowledge" className="text-teal-400 hover:text-teal-300">
            /knowledge
          </Link>
          .
        </p>
      </div>

      <div className="space-y-2 rounded-md border border-zinc-800 p-3">
        <p className="text-xs text-zinc-400">Add draft (starts as Unverified)</p>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Evidence title"
          className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200"
        />
        <div className="grid gap-2 sm:grid-cols-2">
          <input
            value={missionId}
            onChange={(event) => setMissionId(event.target.value)}
            placeholder="missionId (optional link)"
            className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-300"
          />
          <input
            value={reportId}
            onChange={(event) => setReportId(event.target.value)}
            placeholder="reportId (optional link)"
            className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-300"
          />
        </div>
        <button
          type="button"
          onClick={onCreate}
          aria-label="Save draft evidence as unverified"
          className="rounded-md border border-teal-500/40 bg-teal-500/10 px-3 py-1.5 text-xs text-teal-300"
        >
          Save draft evidence
        </button>
      </div>

      {message ? <p className="text-xs text-amber-300/90">{message}</p> : null}

      {!hydrated ? (
        <p className={cbaiTextMuted}>Loading device-local evidence…</p>
      ) : records.length === 0 ? (
        <p className={cbaiTextBody}>
          No evidence records yet. This workspace is empty by design until you add a draft.
        </p>
      ) : (
        <ul className="space-y-3">
          {records.map((record) => {
            const label = evidenceStatusDisplayLabel(record.status);
            const shownAsVerified = isEvidencePresentedAsVerified(record.status);
            const allowed = listAllowedEvidenceTransitions(record.status);
            return (
              <li key={record.id} className="space-y-2 rounded-md border border-zinc-800 p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm text-zinc-200">{record.title}</p>
                    <p className={cbaiTextMuted}>{record.summary}</p>
                  </div>
                  <span
                    className={`rounded border px-2 py-0.5 text-[10px] ${
                      shownAsVerified
                        ? "border-emerald-500/40 text-emerald-300"
                        : "border-zinc-600 text-zinc-400"
                    }`}
                  >
                    {label}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-600">
                  Publisher: {record.provenance.publisher} · Confidence basis:{" "}
                  {record.provenance.confidenceBasis}
                </p>
                <p className="text-[10px] text-zinc-600">
                  missionId: {record.missionId ?? "—"} · reportId: {record.reportId ?? "—"}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {allowed.map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => onTransition(record.id, status)}
                      aria-label={`Move evidence ${record.title} to ${evidenceStatusDisplayLabel(status)}`}
                      className="rounded border border-zinc-700 px-2 py-1 text-[10px] text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
                    >
                      → {evidenceStatusDisplayLabel(status)}
                    </button>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
