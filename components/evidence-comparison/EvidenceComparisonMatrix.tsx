"use client";

import type { EvidenceComparisonRecord } from "@/lib/evidence-comparison";
import { comparisonNoteClass } from "@/lib/evidence-comparison";
import { gapStatusClass } from "@/lib/evidence-gap";
import type { EvidenceGapStatus } from "@/lib/evidence-gap";
import { useTranslation } from "@/lib/i18n/use-translation";

type EvidenceComparisonMatrixProps = {
  comparison: EvidenceComparisonRecord;
};

function statusClass(status: string): string {
  return gapStatusClass(status as EvidenceGapStatus);
}

export default function EvidenceComparisonMatrix({ comparison }: EvidenceComparisonMatrixProps) {
  const { t } = useTranslation();

  function statusLabel(status: string): string {
    if (status === "available") return t("evidenceComparisonUi.gapAvailable");
    if (status === "planned") return t("evidenceComparisonUi.gapPlanned");
    if (status === "blocked") return t("evidenceComparisonUi.gapBlocked");
    return t("evidenceComparisonUi.gapMissing");
  }

  function noteLabel(note: string): string {
    if (note === "same evidence status") return t("evidenceComparisonUi.noteSameStatus");
    if (note === "evidence gap differs") return t("evidenceComparisonUi.noteGapDiffers");
    if (note === "more evidence connected on left") return t("evidenceComparisonUi.noteMoreLeft");
    if (note === "more evidence connected on right") return t("evidenceComparisonUi.noteMoreRight");
    if (note === "source not connected") return t("evidenceComparisonUi.noteSourceNotConnected");
    if (note === "methodology required") return t("evidenceComparisonUi.noteMethodologyRequired");
    return note;
  }

  return (
    <section className="space-y-4" aria-labelledby="comparison-matrix-heading">
      <div>
        <h4
          id="comparison-matrix-heading"
          className="text-sm font-semibold uppercase tracking-wider text-[var(--cbai-text-muted)]"
        >
          {t("evidenceComparisonUi.matrixHeading")}
        </h4>
        <p className="mt-1 text-sm text-[var(--cbai-text-muted)]">
          {t("evidenceComparisonUi.matrixDescription")}
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[var(--cbai-border-default)]">
        <table className="min-w-full text-sm">
          <thead className="border-b border-[var(--cbai-border-default)] bg-[var(--cbai-surface-muted)]">
            <tr>
              <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--cbai-text-muted)]">
                {t("evidenceComparisonUi.matrixTopic")}
              </th>
              <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--cbai-text-muted)]">
                {comparison.leftEntityLabel}
              </th>
              <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--cbai-text-muted)]">
                {comparison.rightEntityLabel}
              </th>
              <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--cbai-text-muted)]">
                {t("evidenceComparisonUi.matrixNote")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--cbai-border-default)] bg-[var(--cbai-solid-surface)]">
            {comparison.indicatorRows.map((row) => (
              <tr key={row.indicatorId}>
                <td className="px-4 py-3">
                  <p className="font-medium text-[var(--cbai-text-secondary)]">{row.indicatorTitle}</p>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${statusClass(row.leftStatus)}`}
                  >
                    {statusLabel(row.leftStatus)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${statusClass(row.rightStatus)}`}
                  >
                    {statusLabel(row.rightStatus)}
                  </span>
                </td>
                <td className={`px-4 py-3 text-xs ${comparisonNoteClass(row.note)}`}>
                  {noteLabel(row.note)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
