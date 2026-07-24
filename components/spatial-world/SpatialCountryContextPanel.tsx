"use client";

import Link from "next/link";
import StatusBadge from "@/components/shared/StatusBadge";
import type { GlobeCountryPoint } from "@/lib/spatial-world/globe-geography";
import type { ProductStatus } from "@/lib/product-status";

type SpatialCountryContextPanelProps = {
  point: GlobeCountryPoint;
  status: ProductStatus;
  labels: {
    selected: string;
    dataAvailability: string;
    openCountry: string;
    deselectCountry: string;
  };
  onDeselect: () => void;
};

export default function SpatialCountryContextPanel({
  point,
  status,
  labels,
  onDeselect,
}: SpatialCountryContextPanelProps) {
  return (
    <section
      aria-labelledby="spatial-country-context-heading"
      className="cbai-spatial-country-panel rounded-xl border border-[#f5f0e8]/12 bg-[#f8f4ec]/[0.05] p-3.5 shadow-[inset_0_1px_0_rgba(245,240,232,0.06)]"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p id="spatial-country-context-heading" className="text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400">
            {labels.selected}
          </p>
          <p className="mt-1 truncate text-base font-semibold text-slate-50">{point.country.name}</p>
        </div>
        <button
          type="button"
          onClick={onDeselect}
          className="shrink-0 rounded-md border border-teal-500/20 px-2 py-1 text-[10px] font-medium text-zinc-400 transition-colors hover:border-teal-400/35 hover:text-teal-100"
          aria-label={labels.deselectCountry}
        >
          ×
        </button>
      </div>
      <div className="mt-3">
        <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400">{labels.dataAvailability}</p>
        <StatusBadge status={status} className="mt-1.5" />
      </div>
      <Link
        href={point.href}
        className="cbai-spatial-country-action mt-3 flex w-full items-center justify-center rounded-lg px-4 py-2.5 text-center text-xs font-medium transition-colors"
      >
        {labels.openCountry}
      </Link>
    </section>
  );
}
