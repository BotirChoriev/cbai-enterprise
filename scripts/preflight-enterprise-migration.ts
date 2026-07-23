/**
 * Print enterprise migration preflight report (no apply, no secrets).
 */
import { runEnterpriseMigrationPreflight } from "@/lib/enterprise-collaboration/migration-preflight";

const report = runEnterpriseMigrationPreflight();
console.log("=== Enterprise collaboration migration preflight ===");
console.log(`okToApply: ${report.okToApply}`);
for (const f of report.findings) {
  console.log(`[${f.severity}] ${f.id}: ${f.message}`);
}
process.exitCode = report.okToApply ? 0 : 2;
