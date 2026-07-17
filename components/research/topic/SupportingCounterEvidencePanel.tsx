"use client";

import type { Evidence } from "@/lib/foundation/foundation-model";
import SaveToWorkspaceButton from "@/components/shared/SaveToWorkspaceButton";
import { useTranslation } from "@/lib/i18n/use-translation";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type SupportingCounterEvidencePanelProps = {
  supportingEvidence: readonly Evidence[];
  counterEvidence: readonly Evidence[];
};

function EvidenceColumn({
  title,
  items,
  emptyLabel,
  statusLabel,
}: {
  title: string;
  items: readonly Evidence[];
  emptyLabel: string;
  statusLabel: (status: string) => string;
}) {
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
              <p className="mt-0.5 text-[10px] text-zinc-600">{statusLabel(item.status)}</p>
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

export default function SupportingCounterEvidencePanel({
  supportingEvidence,
  counterEvidence,
}: SupportingCounterEvidencePanelProps) {
  const { t } = useTranslation();
  const statusLabel = (status: string) => t("researchTopicPanels.evidenceStatusLabel", { status });

  return (
    <section aria-labelledby="supporting-counter-evidence-heading" className="space-y-3">
      <div>
        <p className={cbaiSectionEyebrow} id="supporting-counter-evidence-heading">
          {t("researchTopicPanels.supportingCounterEyebrow")}
        </p>
        <p className="mt-1 text-xs text-zinc-600">{t("researchTopicPanels.supportingCounterDetail")}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <EvidenceColumn
          title={t("researchTopicPanels.supportingEvidence")}
          items={supportingEvidence}
          emptyLabel={t("researchTopicPanels.noSupportingEvidence")}
          statusLabel={statusLabel}
        />
        <EvidenceColumn
          title={t("researchTopicPanels.counterEvidence")}
          items={counterEvidence}
          emptyLabel={t("researchTopicPanels.noCounterEvidence")}
          statusLabel={statusLabel}
        />
      </div>
    </section>
  );
}
