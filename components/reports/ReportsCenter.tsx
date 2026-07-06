"use client";

import { useMemo } from "react";
import { buildReportsCenterModel } from "@/lib/reports-center";
import { getReportPipelineReadiness } from "@/lib/pipeline-readiness";
import ReportReadinessSection from "@/components/reports/ReportReadinessSection";
import ReportPipelineReadinessSection from "@/components/pipeline/ReportPipelineReadinessSection";
import ReportsIndicatorExplorerSection from "@/components/indicator-explorer/ReportsIndicatorExplorerSection";
import ReportsEvidenceWatchSection from "@/components/evidence-watch/ReportsEvidenceWatchSection";
import {
  ReportExportFuture,
  ReportNoFakeNotice,
  ReportPersonasSection,
  ReportTrustSection,
} from "@/components/reports/ReportSections";

export default function ReportsCenter() {
  const model = useMemo(() => buildReportsCenterModel(), []);
  const reportPipelineReadiness = useMemo(() => getReportPipelineReadiness(), []);

  return (
    <div className="space-y-10">
      <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 px-6 py-5">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-sky-500/5 to-violet-500/5"
        />
        <div className="relative">
          <p className="text-[10px] font-medium uppercase tracking-widest text-cyan-400">
            CBAI Reports Center v{model.version}
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-50">
            Reports Center
          </h1>
          <p className="mt-1 max-w-3xl text-sm text-zinc-500">
            Reports Center prepares evidence-based reports from connected sources and
            methodology. This is not fake analytics — no charts, KPIs, or usage statistics.
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
            Report types
          </p>
          <p className="mt-1 text-xl font-semibold text-zinc-100">
            {model.summary.reportTypes}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
            Partial scope today
          </p>
          <p className="mt-1 text-xl font-semibold text-zinc-100">
            {model.summary.availableTodayCount}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
            Sources connected
          </p>
          <p className="mt-1 text-xl font-semibold text-zinc-100">
            {model.summary.connectedSources}
            <span className="text-sm font-normal text-zinc-500">
              {" "}
              / {model.summary.totalSources}
            </span>
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
            Registry entities
          </p>
          <p className="mt-1 text-xl font-semibold text-zinc-100">
            {model.summary.registryEntityCount}
          </p>
        </div>
      </div>

      <ReportReadinessSection reportTypes={model.reportTypes} />
      <ReportsIndicatorExplorerSection />
      <ReportsEvidenceWatchSection />
      <ReportPipelineReadinessSection model={reportPipelineReadiness} />
      <ReportExportFuture items={model.exportFuture} />
      <ReportNoFakeNotice />
      <ReportPersonasSection personas={model.personas} />
      <ReportTrustSection pillars={model.trustPillars} />

      <footer className="border-t border-zinc-800 pt-6 text-xs text-zinc-600">
        Global Indicator Framework v{model.frameworkVersion} · Evidence Infrastructure v
        {model.infrastructureVersion} · Governance v{model.governanceVersion}
      </footer>
    </div>
  );
}
