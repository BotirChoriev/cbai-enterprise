// Phase 10 — Production readiness (report + machine blockers). Production untouched.
// Run with: npm run test:phase-10-production-readiness

import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  PRODUCTION_LAUNCH_BLOCKERS,
  isProductionLaunchAllowed,
  openProductionBlockers,
  productionReadinessReportPath,
} from "@/lib/production-readiness";

function readSource(relativePath: string): string {
  return readFileSync(join(process.cwd(), relativePath), "utf-8");
}

test("1. Production readiness report exists and covers required sections", () => {
  const path = productionReadinessReportPath();
  assert.equal(existsSync(join(process.cwd(), path)), true);
  const doc = readSource(path);
  for (const heading of [
    "Security",
    "Secrets",
    "Row Level Security",
    "Authorization",
    "Backups",
    "Rollback",
    "Disaster recovery",
    "Retention",
    "Launch checklist",
    "blockers",
  ]) {
    assert.match(doc, new RegExp(heading, "i"), `missing section: ${heading}`);
  }
  assert.match(doc, /Production remains untouched/i);
  assert.match(doc, /not production-ready/i);
});

test("2. Machine-readable blockers exist and launch is disallowed", () => {
  assert.ok(PRODUCTION_LAUNCH_BLOCKERS.length >= 5);
  assert.ok(openProductionBlockers().length >= 1);
  assert.equal(isProductionLaunchAllowed(), false);
  assert.ok(PRODUCTION_LAUNCH_BLOCKERS.some((b) => b.id === "prod-untouched"));
  assert.ok(PRODUCTION_LAUNCH_BLOCKERS.some((b) => b.area === "rls"));
  assert.ok(PRODUCTION_LAUNCH_BLOCKERS.some((b) => b.area === "secrets"));
  assert.ok(PRODUCTION_LAUNCH_BLOCKERS.some((b) => b.area === "disaster_recovery"));
  assert.ok(PRODUCTION_LAUNCH_BLOCKERS.some((b) => b.area === "retention"));
});

test("3. Checklist source refuses production authorization language", () => {
  const checklist = readSource("lib/production-readiness/checklist.ts");
  assert.match(checklist, /Production remains untouched/i);
  assert.equal(checklist.includes("PRODUCTION_READY = true"), false);
  assert.equal(checklist.toLowerCase().includes("launch allowed: true"), false);
});
