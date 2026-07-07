"use client";

import { useMemo } from "react";
import { buildReportsCenterModel } from "@/lib/reports-center";
import ReportReadinessSection from "@/components/reports/ReportReadinessSection";

export default function ReportsCenter() {
  const model = useMemo(() => buildReportsCenterModel(), []);

  return (
    <div className="space-y-8 px-4 sm:space-y-10 sm:px-0">
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-5 sm:px-6">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">Reports</h1>
        <p className="mt-1 max-w-2xl text-sm text-zinc-500">
          What you can open today — evidence required for each report type.
        </p>
      </div>

      <ReportReadinessSection reportTypes={model.reportTypes} />
    </div>
  );
}
