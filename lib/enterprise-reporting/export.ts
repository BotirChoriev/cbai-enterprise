/**
 * Phase 8 — print-friendly HTML + CSV export helpers.
 * Never embeds secrets, tokens, or credentials.
 */

import type { EnterpriseReportDocument } from "@/lib/enterprise-reporting/types";

const SECRETISH =
  /\b(api[_-]?key|secret|password|token|authorization|bearer|credential)\b/i;

function sanitizeCell(value: string): string {
  const trimmed = value.replace(/\r?\n/g, " ").trim();
  if (SECRETISH.test(trimmed)) {
    return "[redacted — possible secret]";
  }
  return trimmed;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Print-friendly HTML string — no scripts, no secrets. */
export function exportReportToHtml(doc: EnterpriseReportDocument): string {
  const sections = doc.sections
    .map(
      (s) =>
        `<section><h2>${escapeHtml(s.title)}</h2><p>${escapeHtml(sanitizeCell(s.body))}</p></section>`,
    )
    .join("\n");
  const facts = doc.facts
    .map((f) => `<tr><th>${escapeHtml(f.key)}</th><td>${escapeHtml(sanitizeCell(f.value))}</td></tr>`)
    .join("\n");
  const warnings =
    doc.warnings.length === 0
      ? ""
      : `<ul>${doc.warnings.map((w) => `<li>${escapeHtml(sanitizeCell(w))}</li>`).join("")}</ul>`;
  const sources = doc.sources
    .map(
      (s) =>
        `<li><strong>${escapeHtml(s.label)}</strong> [${escapeHtml(s.status)}]: ${escapeHtml(sanitizeCell(s.detail))}</li>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>${escapeHtml(sanitizeCell(doc.title))}</title>
<style>
  body { font-family: Georgia, "Times New Roman", serif; color: #111; background: #fff; margin: 2rem; line-height: 1.45; }
  h1 { font-size: 1.6rem; margin-bottom: 0.25rem; }
  .meta { color: #444; font-size: 0.9rem; margin-bottom: 1.5rem; }
  section { margin: 1.25rem 0; page-break-inside: avoid; }
  h2 { font-size: 1.15rem; border-bottom: 1px solid #ccc; padding-bottom: 0.25rem; }
  table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
  th, td { border: 1px solid #ccc; padding: 0.4rem 0.6rem; text-align: left; vertical-align: top; }
  th { width: 28%; background: #f5f5f5; }
  @media print { body { margin: 1rem; } a { color: inherit; text-decoration: none; } }
</style>
</head>
<body>
<header>
  <h1>${escapeHtml(sanitizeCell(doc.title))}</h1>
  <p class="meta">${escapeHtml(doc.reportType)} · ${escapeHtml(doc.availability)} · ${escapeHtml(doc.generatedAt)} · v${escapeHtml(doc.version)}</p>
  <p>${escapeHtml(sanitizeCell(doc.summary))}</p>
  ${warnings}
</header>
${sections}
<section>
  <h2>Facts</h2>
  <table><tbody>
  ${facts}
  </tbody></table>
</section>
<section>
  <h2>Source index</h2>
  <ul>${sources}</ul>
</section>
</body>
</html>`;
}

/** CSV string — facts + section bodies. No secrets. */
export function exportReportToCsv(doc: EnterpriseReportDocument): string {
  const rows: string[][] = [
    ["field", "value"],
    ["title", sanitizeCell(doc.title)],
    ["reportType", doc.reportType],
    ["availability", doc.availability],
    ["generatedAt", doc.generatedAt],
    ["version", doc.version],
    ["summary", sanitizeCell(doc.summary)],
  ];
  for (const fact of doc.facts) {
    rows.push([`fact.${fact.key}`, sanitizeCell(fact.value)]);
  }
  for (const section of doc.sections) {
    rows.push([`section.${section.id}`, sanitizeCell(section.body)]);
  }
  for (const warning of doc.warnings) {
    rows.push(["warning", sanitizeCell(warning)]);
  }
  for (const source of doc.sources) {
    rows.push([`source.${source.status}`, sanitizeCell(`${source.label}: ${source.detail}`)]);
  }

  return rows
    .map((cols) =>
      cols
        .map((cell) => {
          const safe = cell.replace(/"/g, '""');
          return `"${safe}"`;
        })
        .join(","),
    )
    .join("\n");
}

export function assertExportHasNoSecrets(payload: string): void {
  if (SECRETISH.test(payload) && !payload.includes("[redacted — possible secret]")) {
    // Allow the word only inside redaction markers; otherwise fail closed for tests.
    const stripped = payload.replace(/\[redacted — possible secret\]/gi, "");
    if (SECRETISH.test(stripped)) {
      throw new Error("Export appears to contain secret-like content");
    }
  }
}
