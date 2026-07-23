"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ENTERPRISE_REPORT_TYPES,
  buildEnterpriseReport,
  exportReportToCsv,
  exportReportToHtml,
  reportTypeLabel,
  type EnterpriseReportType,
} from "@/lib/enterprise-reporting";
import {
  cbaiMineralPanelMd,
  cbaiPageStack,
  cbaiProminentAction,
  cbaiSectionTitle,
  cbaiTextBody,
  cbaiTextMuted,
} from "@/components/brand/brand-classes";

export default function EnterpriseReportBuilderClient() {
  const [reportType, setReportType] = useState<EnterpriseReportType>("executive");
  const [title, setTitle] = useState("");
  const [exportKind, setExportKind] = useState<"html" | "csv" | null>(null);

  const document = useMemo(
    () =>
      buildEnterpriseReport({
        reportType,
        title: title.trim() || undefined,
      }),
    [reportType, title],
  );

  const exportText = useMemo(() => {
    if (exportKind === "html") return exportReportToHtml(document);
    if (exportKind === "csv") return exportReportToCsv(document);
    return null;
  }, [document, exportKind]);

  return (
    <div className={cbaiPageStack}>
      <p className={cbaiTextMuted}>
        Builds from authorized device-local and org-scoped stores only. Labels stay honest —
        empty stores stay empty. Exports never include secrets.
      </p>

      <div className={cbaiMineralPanelMd}>
        <h2 className={cbaiSectionTitle}>Report type</h2>
        <label className="mt-3 block text-sm text-zinc-300" htmlFor="report-type">
          Type
        </label>
        <select
          id="report-type"
          className="mt-1 w-full max-w-md rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
          value={reportType}
          onChange={(e) => setReportType(e.target.value as EnterpriseReportType)}
        >
          {ENTERPRISE_REPORT_TYPES.map((type) => (
            <option key={type} value={type}>
              {reportTypeLabel(type)}
            </option>
          ))}
        </select>

        <label className="mt-4 block text-sm text-zinc-300" htmlFor="report-title">
          Title (optional)
        </label>
        <input
          id="report-title"
          className="mt-1 w-full max-w-md rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={`${reportTypeLabel(reportType)} report`}
        />

        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" className={cbaiProminentAction} onClick={() => setExportKind("html")}>
            Export print HTML
          </button>
          <button type="button" className={cbaiProminentAction} onClick={() => setExportKind("csv")}>
            Export CSV
          </button>
          <Link href="/reports" className="inline-flex min-h-10 items-center text-sm text-zinc-400 hover:text-zinc-200">
            Back to Reports Center
          </Link>
        </div>
      </div>

      <div className={cbaiMineralPanelMd}>
        <h2 className={cbaiSectionTitle}>{document.title}</h2>
        <p className={`mt-2 ${cbaiTextMuted}`}>
          {document.availability} · {document.generatedAt}
        </p>
        <p className={`mt-3 ${cbaiTextBody}`}>{document.summary}</p>
        {document.warnings.length > 0 ? (
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-amber-200/90">
            {document.warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        ) : null}
        <div className="mt-5 space-y-4">
          {document.sections.map((section) => (
            <section key={section.id}>
              <h3 className="text-sm font-semibold text-zinc-100">{section.title}</h3>
              <p className={`mt-1 ${cbaiTextBody}`}>{section.body}</p>
            </section>
          ))}
        </div>
      </div>

      {exportText ? (
        <div className={cbaiMineralPanelMd}>
          <h2 className={cbaiSectionTitle}>
            {exportKind === "html" ? "Print-friendly HTML" : "CSV"} export
          </h2>
          <pre className="mt-3 max-h-96 overflow-auto whitespace-pre-wrap break-words rounded-md border border-zinc-800 bg-zinc-950 p-3 text-xs text-zinc-300">
            {exportText}
          </pre>
        </div>
      ) : null}
    </div>
  );
}
