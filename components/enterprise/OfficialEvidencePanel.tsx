"use client";

import { useCallback, useEffect, useState } from "react";
import type { VerifiedObservation } from "@/lib/official-connectors/types";
import type { OfficialGeneratedReport } from "@/lib/official-connectors/reports";
import {
  refreshOfficialConnectorsInBrowser,
  browserEvidenceReport,
  browserExecutiveSummary,
} from "@/lib/official-connectors/browser-refresh";
import { cbaiGlassCard, cbaiSectionEyebrow, cbaiBtnSecondary } from "@/components/brand/brand-classes";

type ObservationsResponse = {
  ok: boolean;
  observations?: VerifiedObservation[];
  connectedSources?: string[];
  observationCount?: number;
  error?: string;
  report?: OfficialGeneratedReport;
};

type OfficialEvidencePanelProps = {
  entityId?: string;
  showReports?: boolean;
};

export default function OfficialEvidencePanel({
  entityId,
  showReports = true,
}: OfficialEvidencePanelProps) {
  const [observations, setObservations] = useState<VerifiedObservation[]>([]);
  const [connectedSources, setConnectedSources] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<OfficialGeneratedReport | null>(null);
  const [mode, setMode] = useState<string>("api");

  const load = useCallback(
    async (refresh: boolean) => {
      setStatus("loading");
      setError(null);
      try {
        const params = new URLSearchParams();
        if (entityId) params.set("entityId", entityId);
        if (refresh) params.set("refresh", "1");
        const response = await fetch(`/api/evidence-observations?${params.toString()}`, {
          method: refresh ? "POST" : "GET",
          credentials: "include",
        });
        if (response.ok) {
          const data = (await response.json()) as ObservationsResponse;
          if (!data.ok) {
            setStatus("error");
            setError(data.error ?? "Official evidence request failed");
            return;
          }
          setObservations(data.observations ?? []);
          setConnectedSources(data.connectedSources ?? []);
          setMode("api");
          setStatus("ready");
          return;
        }

        const fallback = await refreshOfficialConnectorsInBrowser(entityId ?? "usa");
        setObservations(
          entityId
            ? fallback.observations.filter((item) => item.entityId === entityId)
            : fallback.observations,
        );
        setConnectedSources([...fallback.connectedSources]);
        setMode(fallback.mode);
        setStatus("ready");
      } catch (err) {
        try {
          const fallback = await refreshOfficialConnectorsInBrowser(entityId ?? "usa");
          setObservations(
            entityId
              ? fallback.observations.filter((item) => item.entityId === entityId)
              : fallback.observations,
          );
          setConnectedSources([...fallback.connectedSources]);
          setMode(fallback.mode);
          setStatus("ready");
        } catch (inner) {
          setStatus("error");
          setError(inner instanceof Error ? inner.message : String(err));
        }
      }
    },
    [entityId],
  );

  useEffect(() => {
    void load(true);
  }, [load]);

  async function loadReport(kind: "evidence" | "executive") {
    try {
      const params = new URLSearchParams({ report: kind });
      if (entityId) params.set("entityId", entityId);
      const response = await fetch(`/api/evidence-observations?${params.toString()}`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = (await response.json()) as ObservationsResponse;
        if (data.ok && data.report) {
          setReport(data.report);
          return;
        }
      }
    } catch {
      /* fall through to browser */
    }
    await refreshOfficialConnectorsInBrowser(entityId ?? "usa");
    setReport(kind === "evidence" ? browserEvidenceReport(entityId) : browserExecutiveSummary(entityId));
  }

  return (
    <section className="space-y-4" aria-labelledby="official-evidence-heading">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className={cbaiSectionEyebrow}>Official sources</p>
          <h3 id="official-evidence-heading" className="mt-1 text-base font-semibold text-zinc-100">
            Verified observations
          </h3>
          <p className="mt-1 text-sm text-zinc-500">
            Live connector outputs only. Missing values stay Missing / Planned / Awaiting official source.
            {mode === "browser-keyless"
              ? " Browser keyless refresh is active while the Pages Function deploys."
              : null}
          </p>
        </div>
        <button type="button" className={cbaiBtnSecondary} onClick={() => void load(true)}>
          Refresh official sources
        </button>
      </div>

      {status === "loading" ? <p className="text-sm text-zinc-500">Checking official sources…</p> : null}
      {error ? <p className="text-sm text-amber-300">{error}</p> : null}

      <div className={`${cbaiGlassCard} px-4 py-3 text-sm text-zinc-400`}>
        Connected live sources:{" "}
        <span className="text-zinc-200">
          {connectedSources.length > 0 ? connectedSources.join(", ") : "None yet — awaiting successful retrieval"}
        </span>
      </div>

      {observations.length === 0 && status === "ready" ? (
        <p className="text-sm text-zinc-500">
          No verified observations published for this scope. Placeholders remain Planned / Missing.
        </p>
      ) : (
        <ul className="space-y-3">
          {observations.map((item) => (
            <li key={item.id} className={`${cbaiGlassCard} p-4`}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-zinc-100">{item.indicatorName}</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {item.entityLabel} · {item.referencePeriod} · {item.officialSource}
                  </p>
                </div>
                <p className="font-mono text-sm text-teal-300">
                  {typeof item.value === "number"
                    ? new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(item.value)
                    : String(item.value)}{" "}
                  <span className="text-zinc-500">{item.unit}</span>
                </p>
              </div>
              <dl className="mt-3 grid gap-2 text-xs text-zinc-500 sm:grid-cols-2">
                <div>
                  <dt className="uppercase tracking-wider text-zinc-600">Retrieved</dt>
                  <dd>{item.provenance.retrievedAt}</dd>
                </div>
                <div>
                  <dt className="uppercase tracking-wider text-zinc-600">Source URL</dt>
                  <dd className="truncate">
                    <a
                      href={item.provenance.sourceUrl}
                      className="text-teal-400 hover:text-teal-300"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {item.provenance.sourceUrl}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="uppercase tracking-wider text-zinc-600">Verification</dt>
                  <dd>{item.verificationState}</dd>
                </div>
                <div>
                  <dt className="uppercase tracking-wider text-zinc-600">Confidence basis</dt>
                  <dd>{item.confidenceBasis}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      )}

      {showReports ? (
        <div className="flex flex-wrap gap-2">
          <button type="button" className={cbaiBtnSecondary} onClick={() => void loadReport("evidence")}>
            Generate Evidence Report
          </button>
          <button type="button" className={cbaiBtnSecondary} onClick={() => void loadReport("executive")}>
            Generate Executive Summary
          </button>
        </div>
      ) : null}

      {report ? (
        <article className={`${cbaiGlassCard} space-y-3 p-5`}>
          <h4 className="text-sm font-semibold text-zinc-100">{report.title}</h4>
          <p className="text-sm text-zinc-400">{report.narrative}</p>
          <p className="text-xs text-zinc-500">{report.confidenceExplanation}</p>
          <p className="text-xs text-amber-200/90">{report.humanReviewNotice}</p>
          {report.evidenceTable.length > 0 ? (
            <ul className="space-y-2 text-xs text-zinc-400">
              {report.evidenceTable.map((row) => (
                <li key={`${row.indicatorName}-${row.referencePeriod}-${row.sourceUrl}`}>
                  {row.indicatorName}: {row.value} {row.unit} ({row.referencePeriod}) — {row.source}
                </li>
              ))}
            </ul>
          ) : null}
        </article>
      ) : null}
    </section>
  );
}
