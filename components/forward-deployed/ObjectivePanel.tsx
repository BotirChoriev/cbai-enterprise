"use client";

import { cbaiMineralPanel, cbaiSectionEyebrow, cbaiTextBody } from "@/components/brand/brand-classes";
import { useTranslation } from "@/lib/i18n/use-translation";

type Props = {
  statement: string;
};

export default function ObjectivePanel({ statement }: Props) {
  const { t } = useTranslation();
  return (
    <section className={cbaiMineralPanel} aria-labelledby="engine-objective">
      <h2 className={cbaiSectionEyebrow} id="engine-objective">
        {t("forwardDeployed.objective")}
      </h2>
      <p className={cbaiTextBody}>{statement}</p>
    </section>
  );
}
