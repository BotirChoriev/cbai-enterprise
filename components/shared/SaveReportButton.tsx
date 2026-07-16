"use client";

import { useState } from "react";
import { saveReport, type ReportKind } from "@/lib/reports/reports-store";
import ActivationStatusLine from "@/components/shared/ActivationStatusLine";
import { cbaiBtnSecondary } from "@/components/brand/brand-classes";
import { useTranslation } from "@/lib/i18n/use-translation";

type SaveReportButtonProps = {
  kind: ReportKind;
  entityId: string;
  entityName: string;
  title: string;
  projectId?: string;
};

export default function SaveReportButton({ kind, entityId, entityName, title, projectId }: SaveReportButtonProps) {
  const { t } = useTranslation();
  const [status, setStatus] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => {
          saveReport({ kind, entityId, entityName, title, projectId });
          setStatus(t("activation.reportSaved"));
        }}
        className={`${cbaiBtnSecondary} cbai-no-print`}
      >
        {t("reports.saveToMyReports")}
      </button>
      {status ? <ActivationStatusLine message={status} compact /> : null}
    </div>
  );
}
