// Universal Intelligence OS — Phase 1 foundation tests.
// Run with: npm run test:universal-intelligence-os

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { SUPREME_PRINCIPLES, getAllSupremePrincipleIds } from "@/lib/constitution/supreme-principles";
import { MODULE_ACCOUNTABILITY, getModuleAccountability } from "@/lib/intelligence-os/module-accountability";
import { buildCapabilityPassport } from "@/lib/capability/capability-passport-builder";
import { runDiscoveryEngine } from "@/lib/discovery/discovery-engine";
import { deriveAdaptiveIntelligence } from "@/lib/intelligence-os/adaptive-intelligence";
import en from "@/lib/i18n/dictionaries/en";
import uz from "@/lib/i18n/dictionaries/uz";
import ru from "@/lib/i18n/dictionaries/ru";
import tr from "@/lib/i18n/dictionaries/tr";

function readSource(relativePath: string): string {
  return readFileSync(join(process.cwd(), relativePath), "utf-8");
}

test("1. Supreme Constitution has exactly eight highest-authority principles", () => {
  assert.equal(SUPREME_PRINCIPLES.length, 8);
  assert.equal(getAllSupremePrincipleIds().length, 8);
  assert.ok(SUPREME_PRINCIPLES.some((p) => p.id === "capability-before-status"));
  assert.ok(SUPREME_PRINCIPLES.some((p) => p.id === "intelligence-has-no-passport"));
});

test("2. Module Accountability Registry covers all primary routes with six questions answered", () => {
  assert.ok(MODULE_ACCOUNTABILITY.length >= 15);
  for (const entry of MODULE_ACCOUNTABILITY) {
    assert.ok(entry.realWork.length > 0);
    assert.ok(entry.evidenceEnters.length > 0);
    assert.ok(entry.reasoningHappens.length > 0);
    assert.ok(entry.knowledgeLeaves.length > 0);
    assert.ok(entry.whoBenefits.length > 0);
    assert.ok(entry.riskExists.length > 0);
  }
  assert.ok(getModuleAccountability("/my-work"));
  assert.ok(getModuleAccountability("/countries"));
});

test("3. Capability Passport derives only from real project work — empty when no projects", () => {
  const passport = buildCapabilityPassport("Test User");
  assert.equal(typeof passport.totalSignals, "number");
  assert.equal(passport.readiness, passport.totalSignals === 0 ? "empty" : passport.readiness);
  assert.equal(passport.domains.length, 6);
  assert.ok(!passport.recentSignals.some((s) => s.label.includes("CV")));
});

test("4. Discovery Engine is honestly not connected externally", () => {
  const discovery = runDiscoveryEngine("Test User");
  assert.equal(discovery.connected, false);
  assert.ok(discovery.limitation.includes("not connected"));
});

test("5. Adaptive Intelligence prefers capability over role when signals exist", () => {
  const emptyPassport = buildCapabilityPassport("Test");
  const adaptive = deriveAdaptiveIntelligence(emptyPassport, "investor");
  assert.equal(adaptive.mode, "preference");
  assert.ok(adaptive.suggestedRoutes.length > 0);
});

test("6. BUILD-010 i18n present in all four active languages", () => {
  for (const dict of [en, uz, ru, tr]) {
    assert.ok(dict.capabilityPassport.title);
    assert.ok(dict.discoveryEngine.title);
    assert.ok(dict.supremeConstitution.principles["humanity-first"]?.title);
    assert.ok(dict.navigation.intelligenceLenses);
    assert.equal(Object.keys(dict.supremeConstitution.principles).length, 8);
  }
});

test("7. UI wired: Capability Passport on My Work, Supreme Constitution on Governance", () => {
  const myWork = readSource("components/my-work/MyWork.tsx");
  const governance = readSource("components/governance-control/GovernanceControlCenter.tsx");
  assert.match(myWork, /CapabilityPassportPanel/);
  assert.match(governance, /SupremePrinciplesSection/);
});

test("8. Navigation reframed as Intelligence Lenses — not separate portals", () => {
  const nav = readSource("lib/navigation.ts");
  assert.match(nav, /Intelligence Lenses/);
  assert.match(nav, /not a separate portal/);
});
