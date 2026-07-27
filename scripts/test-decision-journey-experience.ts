import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { hrefForAction } from "@/lib/platform-actions/registry";
import { resolvePlatformIntent } from "@/lib/platform-actions/intent-matcher";

const HERO = readFileSync("components/experience/DecisionJourneyHero.tsx", "utf8");
const HERO_CSS = readFileSync("components/experience/DecisionJourneyHero.module.css", "utf8");

test("decision journey hero communicates the complete collaborative intelligence workflow", () => {
  for (const stage of ["Problem", "Evidence", "Contradictions", "Scenarios", "Human decision", "Monitoring"]) {
    assert.match(HERO, new RegExp(stage, "i"));
  }
  assert.match(HERO, /openDock/);
  assert.match(HERO, /Open Voice Operator/);
});

test("canonical decision surfaces use one shared experience layer", () => {
  const routes = [
    ["components/problems/ProblemWorkspace.tsx", "problem"],
    ["app/(dashboard)/evidence/page.tsx", "evidence"],
    ["components/reasoning/ReasoningExplorer.tsx", "scenarios"],
    ["components/reports/ReportsCenter.tsx", "reports"],
    ["app/(dashboard)/rooms/page.tsx", "collaboration"],
    ["app/(dashboard)/organization/page.tsx", "collaboration"],
    ["components/governance-control/GovernancePageClient.tsx", "governance"],
  ] as const;

  for (const [path, variant] of routes) {
    const source = readFileSync(path, "utf8");
    assert.match(source, /DecisionJourneyHero/, path);
    assert.match(source, new RegExp(`variant="${variant}"`), path);
  }
});

test("experience layer is container-responsive, motion-safe, and mobile-aware", () => {
  assert.match(HERO_CSS, /container-type:\s*inline-size/);
  assert.match(HERO_CSS, /@container\s*\(max-width:\s*52rem\)/);
  assert.match(HERO_CSS, /@media\s*\(max-width:\s*560px\)/);
  assert.match(HERO_CSS, /prefers-reduced-motion/);
});

test("Voice Operator routes scenario comparison and collaboration through the canonical registry", () => {
  const scenarios = resolvePlatformIntent("ssenariylarni taqqosla", "uz");
  assert.equal(scenarios?.actionId, "navigate.reasoning");
  assert.equal(hrefForAction("navigate.reasoning", {}), "/reasoning");

  const collaboration = resolvePlatformIntent("hamkorlikni och", "uz");
  assert.equal(collaboration?.actionId, "navigate.organization");
  assert.equal(hrefForAction("navigate.organization", {}), "/organization");
});
