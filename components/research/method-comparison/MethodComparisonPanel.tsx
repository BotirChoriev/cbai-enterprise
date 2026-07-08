import type { ResearchTopic } from "@/lib/research/research-topics";
import {
  getMethodComparisonForTopic,
  getWorkspaceMethodRows,
} from "@/lib/research/method-comparison/method-comparison-query";
import MethodComparisonNotice from "@/components/research/method-comparison/MethodComparisonNotice";
import MethodComparisonCard from "@/components/research/method-comparison/MethodComparisonCard";
import MethodEvidenceMatrix from "@/components/research/method-comparison/MethodEvidenceMatrix";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type MethodComparisonPanelProps = {
  topic: ResearchTopic;
  variant?: "topic" | "workspace";
};

export default function MethodComparisonPanel({
  topic,
  variant = "topic",
}: MethodComparisonPanelProps) {
  const comparison = getMethodComparisonForTopic(topic);
  const compact = variant === "workspace";
  const rows =
    variant === "workspace" ? getWorkspaceMethodRows(topic) : comparison.methodEvidenceRows;
  const headingId =
    variant === "topic" ? "topic-method-comparison-heading" : "workspace-methods-to-review-heading";
  const title = variant === "topic" ? "Method comparison" : "Methods to review";

  return (
    <section aria-labelledby={headingId} className="space-y-3">
      <div>
        <p className={cbaiSectionEyebrow}>Catalog methods</p>
        <h2 id={headingId} className="text-sm font-semibold text-zinc-100">
          {title}
        </h2>
        <MethodComparisonNotice compact={compact} />
      </div>

      {rows.length === 0 ? (
        <div className={`${cbaiGlassCard} p-4 text-xs text-zinc-500`}>
          No methods listed in the catalog for this topic.
        </div>
      ) : (
        <div className={`grid gap-2 ${variant === "topic" ? "sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
          {rows.map((row) => (
            <MethodComparisonCard key={row.methodName} row={row} compact={compact} />
          ))}
        </div>
      )}

      {variant === "topic" ? (
        <>
          <MethodEvidenceMatrix comparison={comparison} />
          <div className={`${cbaiGlassCard} space-y-2 p-4`}>
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
              Limitations
            </p>
            <ul className="space-y-1.5">
              {comparison.limitations.map((limitation) => (
                <li
                  key={limitation}
                  className="flex items-start gap-2 text-xs text-zinc-500"
                >
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-zinc-600" />
                  {limitation}
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : null}
    </section>
  );
}
