"use client";

import {
  DIGITAL_TWIN_MODULES,
  DIGITAL_TWIN_PERMISSIONS_NOTE,
  locationsFoundationSummary,
} from "@/lib/digital-twin";
import { getPhase12Labels, resolvePhase12Locale } from "@/lib/i18n/phase-12-labels";
import { useTranslation } from "@/lib/i18n/use-translation";
import { PRODUCT_STATUS_LABELS } from "@/lib/product-status";
import OperatingPageShell from "@/components/shared/OperatingPageShell";
import {
  cbaiMineralSurface,
  cbaiSectionEyebrow,
  cbaiTextBody,
  cbaiTextMuted,
} from "@/components/brand/brand-classes";

/**
 * Enterprise Digital Twin — registry + empty foundations.
 * No fabricated metrics, camera feeds, or live KPIs.
 */
export default function DigitalTwinPageClient() {
  const { language } = useTranslation();
  const labels = getPhase12Labels(resolvePhase12Locale(language));
  const locations = locationsFoundationSummary("org-not-connected");

  return (
    <OperatingPageShell
      title={labels.digitalTwinTitle}
      description={labels.digitalTwinDescription}
      showMissionContext={false}
    >
      <div className="space-y-6 md:space-y-8">
        <p className={`md:hidden ${cbaiTextMuted}`}>{labels.mobileNavNote}</p>
        <section
          className={`${cbaiMineralSurface} space-y-3 p-4`}
          aria-labelledby="digital-twin-permissions-heading"
        >
          <p className={cbaiSectionEyebrow}>Permissions</p>
          <h2 id="digital-twin-permissions-heading" className="text-sm font-medium text-zinc-100">
            Organization-scoped access
          </h2>
          <p className={cbaiTextBody}>{DIGITAL_TWIN_PERMISSIONS_NOTE.summary}</p>
          <ul className={`list-disc space-y-1 pl-5 ${cbaiTextMuted}`}>
            {DIGITAL_TWIN_PERMISSIONS_NOTE.details.map((detail) => (
              <li key={detail}>{detail}</li>
            ))}
          </ul>
        </section>

        <section
          className={`${cbaiMineralSurface} space-y-3 p-4`}
          aria-labelledby="digital-twin-locations-heading"
        >
          <p className={cbaiSectionEyebrow}>Locations foundation</p>
          <h2 id="digital-twin-locations-heading" className="text-sm font-medium text-zinc-100">
            Organization locations
          </h2>
          <p className={cbaiTextBody}>{locations.note}</p>
          <p className={cbaiTextMuted}>
            Count: {locations.count}. Map coordinates appear only when a verified source provides them.
          </p>
        </section>

        <section
          className={`${cbaiMineralSurface} space-y-3 p-4`}
          aria-labelledby="digital-twin-modules-heading"
        >
          <p className={cbaiSectionEyebrow}>Modules</p>
          <h2 id="digital-twin-modules-heading" className="text-sm font-medium text-zinc-100">
            {labels.digitalTwinModules}
          </h2>
          <p className={cbaiTextMuted}>
            Responsive registry grid — scroll on small screens; multi-column from sm breakpoint up.
          </p>
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {DIGITAL_TWIN_MODULES.map((module) => (
              <li
                key={module.id}
                className="rounded-lg border border-teal-500/10 bg-slate-950/40 p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-medium text-zinc-100">{module.label}</h3>
                  <span className="shrink-0 text-[10px] uppercase tracking-wide text-zinc-500">
                    {PRODUCT_STATUS_LABELS[module.integrationStatus]}
                  </span>
                </div>
                <p className={`mt-1 ${cbaiTextMuted}`}>{module.description}</p>
                <p className={`mt-2 text-xs ${cbaiTextMuted}`}>{module.integrationNote}</p>
                {module.camerasRegistryOnly ? (
                  <p className="mt-2 text-xs text-amber-200/80">
                    Camera registry only — no live video feed is shown or simulated.
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </OperatingPageShell>
  );
}
