// Phase 8 — Enterprise reporting builder + exports.
// Run with: npm run test:phase-8-reporting

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import {
  ENTERPRISE_REPORT_SECTIONS,
  ENTERPRISE_REPORT_TYPES,
  ENTERPRISE_REPORTING_VERSION,
  assertExportHasNoSecrets,
  buildEnterpriseReport,
  exportReportToCsv,
  exportReportToHtml,
  isEnterpriseReportType,
} from "@/lib/enterprise-reporting";

function readSource(relativePath: string): string {
  return readFileSync(join(process.cwd(), relativePath), "utf-8");
}

test("1. Report types and required sections are complete", () => {
  assert.equal(ENTERPRISE_REPORTING_VERSION, "1.0.0-phase8");
  assert.deepEqual([...ENTERPRISE_REPORT_TYPES], [
    "executive",
    "country",
    "company",
    "university",
    "investor",
    "mission",
    "evidence",
    "risk",
    "comparison",
    "scenario",
    "org_activity",
    "approval_history",
  ]);
  assert.deepEqual([...ENTERPRISE_REPORT_SECTIONS], [
    "methodology",
    "confidence",
    "missing_data",
    "sources",
    "audit",
  ]);
  assert.equal(isEnterpriseReportType("executive"), true);
  assert.equal(isEnterpriseReportType("secret"), false);
});

test("2. Builder pulls authorized-store facts with honest empty/partial labels", () => {
  const empty = buildEnterpriseReport(
    { reportType: "executive", title: "Empty exec" },
    {
      actorId: null,
      missionCount: 0,
      evidenceCount: 0,
      missingEvidenceCount: 0,
      orgEventCount: 0,
      approvalCount: 0,
    },
  );
  assert.equal(empty.availability, "empty");
  assert.ok(empty.warnings.some((w) => /no facts/i.test(w)));
  assert.ok(empty.sections.every((s) => ENTERPRISE_REPORT_SECTIONS.includes(s.id)));

  const partial = buildEnterpriseReport(
    { reportType: "mission", missionId: "m1" },
    {
      actorId: "user-1",
      missionCount: 2,
      evidenceCount: 1,
      missingEvidenceCount: 3,
      orgEventCount: 1,
      approvalCount: 0,
      recentOrgEvents: ["approval_requested — alice"],
    },
  );
  assert.equal(partial.availability, "partial");
  assert.match(partial.sections.find((s) => s.id === "confidence")!.body, /Partial|missing/i);
  assert.match(partial.sections.find((s) => s.id === "missing_data")!.body, /3/);
});

test("3. Type-specific facts for org activity and approval history", () => {
  const org = buildEnterpriseReport(
    { reportType: "org_activity" },
    {
      actorId: "user-1",
      missionCount: 0,
      evidenceCount: 0,
      missingEvidenceCount: 0,
      orgEventCount: 2,
      approvalCount: 0,
      recentOrgEvents: ["member_role_changed — bob"],
    },
  );
  assert.ok(org.facts.some((f) => f.key === "orgEventCount" && f.value === "2"));

  const approvals = buildEnterpriseReport(
    { reportType: "approval_history" },
    {
      actorId: "user-1",
      missionCount: 0,
      evidenceCount: 0,
      missingEvidenceCount: 0,
      orgEventCount: 0,
      approvalCount: 1,
      recentApprovals: ["pending: Review pack (apr-1)"],
    },
  );
  assert.ok(approvals.facts.some((f) => f.key === "approvalCount" && f.value === "1"));
  assert.ok(approvals.sources.some((s) => /approvals/i.test(s.label)));
});

test("4. HTML and CSV exports are print/CSV helpers without secrets", () => {
  const doc = buildEnterpriseReport(
    { reportType: "evidence", title: "Evidence pack" },
    {
      actorId: "user-1",
      missionCount: 1,
      evidenceCount: 1,
      missingEvidenceCount: 0,
      orgEventCount: 0,
      approvalCount: 0,
    },
  );
  const html = exportReportToHtml(doc);
  assert.match(html, /<!DOCTYPE html>/);
  assert.match(html, /@media print/);
  assert.match(html, /Evidence pack/);
  assert.doesNotMatch(html, /<script/i);
  assertExportHasNoSecrets(html);

  const csv = exportReportToCsv(doc);
  assert.match(csv, /"field","value"/);
  assert.match(csv, /"reportType","evidence"/);
  assertExportHasNoSecrets(csv);

  const redacted = exportReportToCsv({
    ...doc,
    facts: [...doc.facts, { key: "note", value: "user pasted api_key=should-not-leak" }],
  });
  assert.match(redacted, /\[redacted — possible secret\]/);
  assert.doesNotMatch(redacted, /should-not-leak/);
});

test("5. UI page and ReportsCenter link exist", () => {
  assert.ok(existsSync(join(process.cwd(), "app/(dashboard)/reports/builder/page.tsx")));
  assert.ok(
    existsSync(join(process.cwd(), "components/reports/EnterpriseReportBuilderClient.tsx")),
  );
  const center = readSource("components/reports/ReportsCenter.tsx");
  assert.match(center, /\/reports\/builder/);
  const builderLib = readSource("lib/enterprise-reporting/builder.ts");
  assert.match(builderLib, /loadMissionEngineRuntimes/);
  assert.match(builderLib, /loadEvidenceRecords/);
});
