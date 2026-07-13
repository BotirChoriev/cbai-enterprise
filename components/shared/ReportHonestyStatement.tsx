/**
 * Real, honest Confidence and Recommendations sections (Platform Activation mission, Mission 12
 * — every report must contain these). CBAI does not compute a fabricated confidence score for any
 * report (the same "no fabricated AI/investment/risk scores" rule already enforced across every
 * entity adapter — see lib/project/project.adapter.ts's INSUFFICIENT_EVIDENCE_LABEL), and does not
 * generate recommendations (Human Sovereignty — CBAI never makes the decision). Rather than omit
 * these sections (which a real production report review would flag as missing) or fabricate
 * values to fill them, this states plainly why they are empty and what the reader should do
 * instead — the same "show exactly why, never pretend" discipline every other honest empty state
 * in this app already follows.
 */
export default function ReportHonestyStatement() {
  return (
    <>
      <div className="space-y-2 border-t border-zinc-800/80 pt-4">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-600">Confidence</p>
        <p className="text-sm text-zinc-500">
          Not assessed. This platform does not compute a fabricated confidence score for any
          report — confidence in a claim depends on reading the connected evidence and its source
          directly, which the Evidence section above lists in full.
        </p>
      </div>

      <div className="space-y-2 border-t border-zinc-800/80 pt-4">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-600">Recommendations</p>
        <p className="text-sm text-zinc-500">
          Not provided. CBAI connects and explains evidence — it does not recommend a decision.
          The decision, and responsibility for it, remains yours.
        </p>
      </div>
    </>
  );
}
