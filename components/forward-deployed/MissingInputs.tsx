"use client";

import { cbaiMineralPanel, cbaiSectionEyebrow, cbaiTextBody, cbaiTextMuted } from "@/components/brand/brand-classes";
import type { EngineInputField, EnginePlan } from "@/lib/forward-deployed-engines/engine-types";
import { useTranslation } from "@/lib/i18n/use-translation";

type Props = {
  plan: EnginePlan;
};

function InputRow({ field }: { field: EngineInputField }) {
  const { t } = useTranslation();
  return (
    <li className="flex flex-wrap items-baseline gap-2 border-b border-zinc-800/60 py-2 last:border-0">
      <span className={cbaiTextBody}>{t(field.labelKey)}</span>
      {field.provided ? (
        <span className="text-xs text-teal-400/90">
          {field.inferred ? t("forwardDeployed.inferredField") : t("forwardDeployed.userProvidedField")}
        </span>
      ) : (
        <span className="text-xs text-amber-400/90">{t("forwardDeployed.missingInputs")}</span>
      )}
      {field.value ? <span className={cbaiTextMuted}>{field.value}</span> : null}
    </li>
  );
}

export default function MissingInputs({ plan }: Props) {
  const { t } = useTranslation();
  const missing = plan.missingInputs.filter((f) => f.required && !f.provided);
  if (missing.length === 0) return null;

  return (
    <section className={cbaiMineralPanel} aria-labelledby="engine-missing">
      <h2 className={cbaiSectionEyebrow} id="engine-missing">
        {t("forwardDeployed.missingInputs")}
      </h2>
      <ul>{plan.missingInputs.map((f) => <InputRow key={f.key} field={f} />)}</ul>
    </section>
  );
}

export function UnderstandingPanel({ plan }: Props) {
  const { t } = useTranslation();
  return (
    <section className={cbaiMineralPanel} aria-labelledby="engine-understanding">
      <h2 className={cbaiSectionEyebrow} id="engine-understanding">
        {t("forwardDeployed.understanding")}
      </h2>
      <p className={cbaiTextBody}>{plan.clarifiedObjective}</p>
      {plan.inferredFields.length > 0 ? (
        <p className={cbaiTextMuted}>
          {t("forwardDeployed.inferredField")}: {plan.inferredFields.join(", ")}
        </p>
      ) : null}
    </section>
  );
}
