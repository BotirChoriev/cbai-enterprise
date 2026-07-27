import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const routeHero = readFileSync("components/experience/RouteExperienceHero.tsx", "utf8");
const hero = readFileSync("components/experience/DecisionJourneyHero.tsx", "utf8");
const layout = readFileSync("app/(dashboard)/layout.tsx", "utf8");

test("route-aware experience layer is mounted once at dashboard level", () => {
  assert.match(layout, /<RouteExperienceHero \/>/);
  assert.equal((layout.match(/<RouteExperienceHero \/>/g) ?? []).length, 1);
});

test("core functional routes receive explicit visual context", () => {
  for (const route of [
    "/my-work",
    "/search",
    "/research",
    "/universities",
    "/countries",
    "/companies",
    "/files",
    "/scientific-documents",
    "/trust",
    "/settings",
  ]) {
    assert.match(routeHero, new RegExp(`"${route.replace("/", "\\/")}"`), `${route} must be mapped`);
  }
});

test("existing cinematic routes and graph work surface are not duplicated", () => {
  for (const route of [
    "/problems",
    "/evidence",
    "/reasoning",
    "/reports",
    "/organization",
    "/rooms",
    "/governance",
    "/graph",
  ]) {
    assert.match(routeHero, new RegExp(`"${route.replace("/", "\\/")}"`), `${route} must be skipped`);
  }
});

test("every route visual preserves voice control and human decision framing", () => {
  assert.match(hero, /useVoiceOperator/);
  assert.match(hero, /onClick=\{openDock\}/);
  assert.match(routeHero, /human confirmation/i);
  assert.match(routeHero, /inson tasdig/i);
});

test("route visuals use only the approved cinematic asset family", () => {
  for (const asset of [
    "problem-space-v1.webp",
    "evidence-engine-v1.webp",
    "scenario-engine-v1.webp",
    "collaboration-v1.webp",
    "governance-monitoring-v1.webp",
  ]) {
    assert.match(routeHero, new RegExp(asset.replace(".", "\\.")));
  }
});
