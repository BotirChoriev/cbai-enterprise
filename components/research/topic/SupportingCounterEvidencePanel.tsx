import type { Evidence } from "@/lib/foundation/foundation-model";
import SaveToWorkspaceButton from "@/components/shared/SaveToWorkspaceButton";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type SupportingCounterEvidencePanelProps = {
  supportingEvidence: readonly Evidence[];
  counterEvidence: readonly Evidence[];
};

function EvidenceColumn({ title, items, emptyLabel }: { title: string; items: readonly Evidence[]; emptyLabel: string }) {
  return (
    <div className={`${cbaiGlassCard} space-y-2 p-4`}>
      <p className={cbaiSectionEyebrow}>{title}</p>
      {items.length > 0 ? (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.evidenceId} className="text-xs text-zinc-400">
              <div className="flex items-start justify-between gap-2">
                <p className="text-zinc-300">{item.label}</p>
                <SaveToWorkspaceButton
                  entity={{ kind: "evidence", id: item.evidenceId, name: item.label }}
                  className="!px-2 !py-0.5 !text-[10px]"
                />
              </div>
              <p className="mt-0.5 text-[10px] text-zinc-600">Status: {item.status}</p>
              {item.note ? <p className="mt-0.5 text-[10px] text-zinc-600">{item.note}</p> : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-zinc-600">{emptyLabel}</p>
      )}
    </div>
  );
}

/**
 * Real Supporting vs. Counter Evidence — sourced from
 * ResearchWorkspaceContract.evidenceSummary.supportingEvidence/conflictingEvidence, computed by
 * the Reasoning Engine from real `contradicts` relationships (never inferred). Already computed
 * platform-wide but previously dropped by research-mission-builder.ts's evidence field and never
 * rendered anywhere — this surfaces it. "Never assume one conclusion": both columns render with
 * equal weight, neither implies the other is wrong.
 */
export default function SupportingCounterEvidencePanel({
  supportingEvidence,
  counterEvidence,
}: SupportingCounterEvidencePanelProps) {
  return (
    <section aria-labelledby="supporting-counter-evidence-heading" className="space-y-3">
      <div>
        <p className={cbaiSectionEyebrow} id="supporting-counter-evidence-heading">
          Supporting &amp; Counter Evidence
        </p>
        <p className="mt-1 text-xs text-zinc-600">
          Real evidence only — counter evidence is never inferred, only shown when a verified
          contradicting relationship exists. Neither column implies a conclusion.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <EvidenceColumn
          title="Supporting Evidence"
          items={supportingEvidence}
          emptyLabel="No supporting evidence connected yet."
        />
        <EvidenceColumn
          title="Counter Evidence"
          items={counterEvidence}
          emptyLabel="No counter evidence connected yet — this does not mean none exists, only that none is verified in this catalog."
        />
      </div>
    </section>
  );
}
