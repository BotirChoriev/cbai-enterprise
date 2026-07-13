"use client";

type GenerateReportToggleButtonProps = {
  showReport: boolean;
  onClick: () => void;
};

const TOGGLE_CLASS =
  "inline-flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300 transition-colors hover:border-cyan-500/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400";

/**
 * One real "Generate report" / "Hide report" toggle (Platform Completion mission, Phase 2/9) —
 * previously the exact same className was copy-pasted 5 times across Country/Company/University/
 * Research Topic/Project panels with no shared component, so a future styling change would need
 * 5 identical edits. Behavior is unchanged: the caller still owns the real `showReport` state and
 * decides what to render below.
 */
export default function GenerateReportToggleButton({ showReport, onClick }: GenerateReportToggleButtonProps) {
  return (
    <button type="button" onClick={onClick} className={TOGGLE_CLASS} aria-expanded={showReport}>
      {showReport ? "Hide report" : "Generate report"}
    </button>
  );
}
