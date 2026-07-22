"use client";

import { useOperationalObjects } from "@/components/operational-objects/OperationalObjectProvider";
import { useTranslation } from "@/lib/i18n/use-translation";
import { cbaiFocusRing } from "@/components/brand/brand-classes";

export default function CommandClarifyCard() {
  const { clarifyIntent, dismissClarify, selectClarifyOption } = useOperationalObjects();
  const { t } = useTranslation();

  if (!clarifyIntent || clarifyIntent.kind !== "clarify") return null;

  return (
    <div className="cbai-op-clarify" role="dialog" aria-modal="true">
      <p className="cbai-op-clarify__question">{t(clarifyIntent.questionKey)}</p>
      <div className="cbai-op-clarify__options">
        {clarifyIntent.options.map((option) => (
          <button
            key={option.id}
            type="button"
            className={`cbai-op-clarify__option ${cbaiFocusRing}`}
            onClick={() => selectClarifyOption(option.id)}
          >
            {t(option.labelKey)}
          </button>
        ))}
      </div>
      <button type="button" className={`cbai-op-clarify__dismiss ${cbaiFocusRing}`} onClick={dismissClarify}>
        {t("common.close")}
      </button>
    </div>
  );
}
