"use client";

import Link from "next/link";
import { useMemo } from "react";
import { buildReportsCenterModel } from "@/lib/reports-center";
import {
  buildContextualHref,
  getPrimaryEntity,
  PLATFORM_MODULES,
  type ContextEntityRef,
} from "@/lib/context";
import { cbaiPageHeader } from "@/components/brand/brand-classes";
import { usePlatformContext } from "@/components/platform/context/PlatformContextProvider";
import ReportReadinessSection from "@/components/reports/ReportReadinessSection";

function entityProfilePath(entity: ContextEntityRef): string {
  switch (entity.kind) {
    case "country":
      return PLATFORM_MODULES.countries.path;
    case "company":
      return PLATFORM_MODULES.companies.path;
    case "university":
      return PLATFORM_MODULES.universities.path;
  }
}

export default function ReportsCenter() {
  const { context } = usePlatformContext();
  const model = useMemo(() => buildReportsCenterModel(), []);
  const entity = getPrimaryEntity(context);
  const profileHref = entity ? buildContextualHref(entityProfilePath(entity), context) : null;

  return (
    <div className="space-y-8 px-4 sm:space-y-10 sm:px-0">
      <div className={cbaiPageHeader}>
        {entity ? (
          <>
            <p className="text-[10px] font-medium uppercase tracking-widest text-cyan-400">
              Continuing review for
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-50">
              {entity.name}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-500">
              Your profile review continues here — choose a report type below.
            </p>
            {profileHref ? (
              <Link
                href={profileHref}
                className="mt-4 inline-flex min-h-10 items-center text-sm font-medium text-cyan-400 transition-colors hover:text-cyan-300"
              >
                ← Back to profile
              </Link>
            ) : null}
          </>
        ) : (
          <>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">Reports</h1>
            <p className="mt-1 max-w-2xl text-sm text-zinc-500">
              What you can open today — official information required for each report type.
            </p>
          </>
        )}
      </div>

      <ReportReadinessSection reportTypes={model.reportTypes} />
    </div>
  );
}
