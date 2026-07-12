"use client";

import Link from "next/link";
import type { ReportTypeDefinition } from "@/lib/reports-center";
import { buildContextualHref } from "@/lib/context";
import { usePlatformContext } from "@/components/platform/context/PlatformContextProvider";

type EntityReportsAvailableProps = {
  reports: readonly ReportTypeDefinition[];
  entityLabel: "country" | "company" | "university";
};

export function EntityReportsAvailable({ reports, entityLabel }: EntityReportsAvailableProps) {
  const { context } = usePlatformContext();

  if (reports.length === 0) return null;

  const reportsHref = buildContextualHref("/analytics", context);

  return (
    <section id="reports" className="scroll-mt-6 space-y-3" aria-labelledby="reports-heading">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 id="reports-heading" className="text-base font-semibold text-zinc-200">
            Reports
          </h3>
          <p className="mt-0.5 text-sm text-zinc-500">
            This profile&apos;s own report is available directly below (Generate report). Reports
            Center has {reports.length > 1 ? "more report types" : "other report types"} across
            profiles.
          </p>
        </div>
        <Link
          href={reportsHref}
          className="inline-flex min-h-10 w-full shrink-0 items-center justify-center rounded-lg bg-zinc-100 px-4 text-sm font-semibold text-zinc-900 transition-colors hover:bg-white sm:w-auto"
        >
          Open Reports Center <span className="sr-only">for this {entityLabel}</span>→
        </Link>
      </div>
    </section>
  );
}
