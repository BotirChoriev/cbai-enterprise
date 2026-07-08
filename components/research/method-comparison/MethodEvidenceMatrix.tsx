import type { MethodComparison } from "@/lib/research/method-comparison/method-comparison-types";
import { METHOD_COMPARISON_STATUS_LABELS } from "@/lib/research/method-comparison/method-comparison-types";
import { buildMethodEvidenceMatrix } from "@/lib/research/method-comparison/method-comparison-builder";
import { cbaiGlassCard } from "@/components/brand/brand-classes";

type MethodEvidenceMatrixProps = {
  comparison: MethodComparison;
  compact?: boolean;
};

function cellLabel(catalogListed: boolean): string {
  return catalogListed ? "Catalog listed" : "Not listed";
}

function cellClass(catalogListed: boolean): string {
  return catalogListed
    ? "border-emerald-500/25 bg-emerald-500/5 text-emerald-300"
    : "border-zinc-800 bg-zinc-900/40 text-zinc-600";
}

export default function MethodEvidenceMatrix({
  comparison,
  compact = false,
}: MethodEvidenceMatrixProps) {
  const cells = buildMethodEvidenceMatrix(comparison);

  if (comparison.methods.length === 0 || comparison.evidenceTypes.length === 0) {
    return (
      <div className={`${cbaiGlassCard} p-3 text-xs text-zinc-500`}>
        No method or evidence type catalog data available for this topic.
      </div>
    );
  }

  return (
    <div className={`${cbaiGlassCard} overflow-x-auto p-3`}>
      <p className="mb-3 text-[10px] font-medium uppercase tracking-wider text-zinc-600">
        Evidence matrix — topic catalog associations only
      </p>
      <table className={`w-full min-w-[28rem] border-collapse ${compact ? "text-[10px]" : "text-xs"}`}>
        <thead>
          <tr>
            <th className="border border-zinc-800/80 px-2 py-1.5 text-left font-medium text-zinc-500">
              Method
            </th>
            {comparison.evidenceTypes.map((evidenceType) => (
              <th
                key={evidenceType}
                className="border border-zinc-800/80 px-2 py-1.5 text-left font-medium text-zinc-500"
              >
                {evidenceType}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {comparison.methods.map((methodName) => (
            <tr key={methodName}>
              <th className="border border-zinc-800/80 px-2 py-1.5 text-left font-medium text-zinc-300">
                {methodName}
              </th>
              {comparison.evidenceTypes.map((evidenceType) => {
                const cell = cells.find(
                  (entry) =>
                    entry.methodName === methodName && entry.evidenceType === evidenceType,
                );
                const catalogListed = cell?.catalogListed ?? false;

                return (
                  <td key={`${methodName}:${evidenceType}`} className="border border-zinc-800/80 p-1">
                    <span
                      className={`block rounded border px-1.5 py-0.5 text-center ${cellClass(catalogListed)}`}
                      title={
                        catalogListed
                          ? METHOD_COMPARISON_STATUS_LABELS.catalog_available
                          : METHOD_COMPARISON_STATUS_LABELS.evidence_not_connected
                      }
                    >
                      {cellLabel(catalogListed)}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 text-[10px] text-zinc-600">
        Live evidence for all cells is not connected yet.
      </p>
    </div>
  );
}
