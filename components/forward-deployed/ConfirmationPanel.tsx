"use client";

import { cbaiBtnPrimary, cbaiBtnSecondary, cbaiMineralPanel, cbaiSectionEyebrow, cbaiTextMuted } from "@/components/brand/brand-classes";
import { useTranslation } from "@/lib/i18n/use-translation";

type Props = {
  canConfirm: boolean;
  canCancel: boolean;
  readOnly: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmationPanel({ canConfirm, canCancel, readOnly, onConfirm, onCancel }: Props) {
  const { t } = useTranslation();

  return (
    <section className={cbaiMineralPanel} aria-labelledby="engine-confirmation">
      <h2 className={cbaiSectionEyebrow} id="engine-confirmation">
        {t("forwardDeployed.confirmation")}
      </h2>
      <p className={cbaiTextMuted}>
        {readOnly ? t("forwardDeployed.noMutationNote") : t("forwardDeployedEngineAction.confirmationRequired")}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {canConfirm ? (
          <button type="button" className={cbaiBtnPrimary} onClick={onConfirm}>
            {t("forwardDeployed.confirmPlan")}
          </button>
        ) : null}
        {canCancel ? (
          <button type="button" className={cbaiBtnSecondary} onClick={onCancel}>
            {t("forwardDeployed.cancelRun")}
          </button>
        ) : null}
      </div>
    </section>
  );
}
