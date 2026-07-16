// EPIC-06 — Evidence & Trust Engine verification.
// Run with: npm run test:epic-06-evidence-trust

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  deriveEvidenceRuntime,
  deriveEvidenceHeatmap,
  projectRefToEvidence,
} from "@/lib/evidence-runtime";
import { deriveMissionEvidenceTrustSurface } from "@/lib/evidence-runtime/evidence-trust-surface";
import { deriveEvidenceJourney } from "@/lib/evidence-runtime/evidence-journey";
import { deriveEvidencePulse } from "@/lib/intelligence-os/evidence-pulse";
import { validateEvidenceRecord } from "@/lib/evidence/evidence-validation";
import type { Mission } from "@/lib/intelligence-os/mission.types";
import en from "@/lib/i18n/dictionaries/en";
import uz from "@/lib/i18n/dictionaries/uz";
import ru from "@/lib/i18n/dictionaries/ru";
import tr from "@/lib/i18n/dictionaries/tr";

function readSource(relativePath: string): string {
  return readFileSync(join(process.cwd(), relativePath), "utf-8");
}

const mission: Mission = {
  id: "m-ev-1",
  problem: "Assess water quality evidence for rural clinics",
  whyExists: "Protect patient health",
  whoBenefits: "Rural communities",
  whoCouldBeHarmed: "Patients if evidence is weak",
  evidenceHave: "WHO guidelines",
  evidenceMissing: "Local lab results",
  disciplines: ["health"],
  capabilitiesNeeded: "Field epidemiologist",
  environmentalImpact: "Minimal",
  successCriteria: "Traceable evidence chain",
  projectId: "p-ev-1",
  status: "active",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

test("1. Evidence runtime returns honest empty state without browser storage", () => {
  const runtime = deriveEvidenceRuntime(null);
  assert.equal(runtime.projectId, null);
  assert.equal(runtime.records.length, 0);
  assert.equal(runtime.machineValidationConnected, false);
});

test("2. Project ref adapter builds valid foundation Evidence", () => {
  const evidence = projectRefToEvidence({
    evidenceRefId: "pev-1",
    projectId: "p-1",
    title: "WHO Water Quality Guidelines",
    sourceUrl: "https://example.org/who-water",
    createdAt: "2026-06-01T00:00:00.000Z",
  });
  const validation = validateEvidenceRecord(evidence);
  assert.equal(validation.valid, true);
  assert.equal(evidence.verificationStatus, "verification_pending");
});

test("3. Trust surface answers all eight EPIC-06 questions", () => {
  const surface = deriveMissionEvidenceTrustSurface(mission);
  assert.ok(surface.whatWeKnow.length > 0);
  assert.ok(surface.howWeKnow.length > 0);
  assert.ok(surface.whoVerified.length > 0);
  assert.ok(surface.whenVerified.length > 0);
  assert.ok(surface.whyTrust.length > 0);
  assert.ok(surface.whatMissing.length > 0);
  assert.ok(surface.whatContradicts.length > 0);
  assert.ok(surface.needsResearch.length > 0);
});

test("4. Evidence pulse implements conflicting and outdated states in type system", () => {
  const pulse = deriveEvidencePulse(null);
  assert.ok(["missing", "unverified", "partial", "available", "conflicting", "outdated"].includes(pulse.state));
  assert.equal(typeof pulse.conflictCount, "number");
  assert.equal(typeof pulse.outdatedCount, "number");
});

test("5. Evidence journey stages link to real routes", () => {
  const journey = deriveEvidenceJourney(mission);
  assert.ok(journey.length >= 5);
  assert.ok(journey.some((s) => s.href?.includes("/knowledge") || s.href?.includes("/my-work")));
});

test("6. Evidence heatmap uses categorical counts only — no scores", () => {
  const heatmap = deriveEvidenceHeatmap(deriveEvidenceRuntime(null));
  for (const cell of heatmap) {
    assert.equal(typeof cell.count, "number");
    assert.ok(!String(cell.count).includes("%"));
  }
});

test("7. Evidence Explorer wires all model sections", () => {
  const explorer = readSource("components/evidence/EvidenceExplorer.tsx");
  assert.match(explorer, /EvidenceLifecycle/);
  assert.match(explorer, /EvidenceTrust/);
  assert.match(explorer, /EvidenceMethodology/);
  assert.match(explorer, /EvidenceIndicatorMap/);
  assert.match(explorer, /EvidenceTrustSurfacePanel/);
});

test("8. Intelligence Canvas wires Evidence Pulse, Journey, and Trust Surface", () => {
  const canvas = readSource("components/canvas/IntelligenceCanvas.tsx");
  assert.match(canvas, /EvidencePulsePanel/);
  assert.match(canvas, /EvidenceJourneyPanel/);
  assert.match(canvas, /EvidenceTrustSurfacePanel/);
});

test("9. BUILD-014 i18n in all four active languages", () => {
  for (const dict of [en, uz, ru, tr]) {
    assert.ok(dict.evidenceRuntime.whatWeKnow);
    assert.ok(dict.evidenceRuntime.trustProperty);
    assert.ok(dict.evidenceRuntime.journeyEyebrow);
  }
});

test("10. lib/evidence barrel exports evidence runtime", () => {
  const barrel = readSource("lib/evidence/index.ts");
  assert.match(barrel, /evidence-runtime/);
});
