"use client";

import { cbaiBtnSecondary } from "@/components/brand/brand-classes";

/**
 * Real print-to-PDF flow — the browser's own print dialog, which every modern OS offers "Save as
 * PDF" on. No new dependency, no fabricated export pipeline: `window.print()` is a real, native
 * API. Marked `cbai-no-print` so the button itself never appears in the printed output.
 */
export default function ReportPrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className={`${cbaiBtnSecondary} cbai-no-print`}
    >
      Print / Save as PDF
    </button>
  );
}
