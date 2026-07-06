"use client";

import { useMemo } from "react";
import { buildReportsCenterModel } from "@/lib/reports-center";
import ReportReadinessSection from "@/components/reports/ReportReadinessSection";

export default function ReportsCenter() {
  const model = useMemo(() => buildReportsCenterModel(), []);

  return (
    <div className="space-y-10">
      <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 px-6 py-5">
        <div className="relative">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">Reports</h1>
          <p className="mt-1 max-w-3xl text-sm text-zinc-500">
            Evidence-based report types from connected sources and documented methodology.
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
            Available today
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
    </div>
  );
}
