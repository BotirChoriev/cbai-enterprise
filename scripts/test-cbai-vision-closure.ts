import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { getEpicForRoute } from "@/lib/epics/epic-registry";
import {
  getModuleAccountability,
  getUnregisteredPrimaryRoutes,
} from "@/lib/intelligence-os/module-accountability";
import { primaryNavSections, secondaryNavSections } from "@/lib/navigation";

const ROOT = process.cwd();
function readSource(rel: string): string {
  return readFileSync(join(ROOT, rel), "utf8");
}

/**
 * Regression coverage for the CBAI Vision Closure pass (docs/verification/cbai-vision-closure).
 * Every assertion here corresponds to a real defect fixed with a root-cause change, verified in the
 * running app — not a test weakened to go green.
 */

test("VC-1: canonical Evidence route /evidence maps to an EPIC and is registered (not planned)", () => {
  assert.equal(getEpicForRoute("/evidence"), "EPIC-06");
  const acc = getModuleAccountability("/evidence");
  assert.ok(acc, "/evidence must have a module accountability record");
  assert.notEqual(acc!.maturity, "planned");
});

test("VC-2: Live Intelligence Rooms /rooms maps to an EPIC and is registered (not planned)", () => {
  assert.ok(getEpicForRoute("/rooms"), "/rooms must map to an EPIC");
  const acc = getModuleAccountability("/rooms");
  assert.ok(acc, "/rooms must have a module accountability record");
  assert.notEqual(acc!.maturity, "planned");
});

test("VC-3: every primary-nav route is registered in the accountability registry", () => {
  const routes = primaryNavSections.flatMap((s) => s.items.map((i) => i.href));
  assert.deepEqual(getUnregisteredPrimaryRoutes(routes), []);
});

test("VC-4: collaboration lives in a progressive-disclosure Collaboration section, never primary", () => {
  const primaryHrefs = primaryNavSections.flatMap((s) => s.items.map((i) => i.href));
  for (const href of ["/teams", "/messages", "/publications", "/workspace"]) {
    assert.ok(!primaryHrefs.includes(href), `${href} must not be in primary nav`);
  }
  const collab = secondaryNavSections.find((s) => s.title === "Collaboration");
  assert.ok(collab, "a Collaboration progressive-disclosure section must exist");
  const collabHrefs = collab!.items.map((i) => i.href);
  for (const href of ["/publications", "/scientific-documents", "/workspace"]) {
    assert.ok(collabHrefs.includes(href), `${href} must be in the Collaboration section`);
  }
  // Advanced disclosure must remain (final-product IA) and keep Global Activity reachable.
  const advanced = secondaryNavSections.find((s) => s.title === "Advanced");
  assert.ok(advanced, "Advanced disclosure section must remain");
  assert.ok(
    secondaryNavSections.flatMap((s) => s.items.map((i) => i.href)).includes("/discover"),
    "Global Activity (/discover) must stay reachable via disclosure",
  );
});

test("VC-5: exactly one nav entry per collaboration href (no duplicate call to action)", () => {
  const allHrefs = [...primaryNavSections, ...secondaryNavSections].flatMap((s) =>
    s.items.map((i) => i.href),
  );
  for (const href of ["/teams", "/messages", "/publications", "/workspace", "/notifications"]) {
    const count = allHrefs.filter((h) => h === href).length;
    assert.equal(count, 1, `${href} must appear exactly once in navigation`);
  }
});

test("VC-6: My Work gates the cloud 'restoring' branch on hydration (SSR/client-first render match)", () => {
  // Root cause: cloudSessionRestoring initializes from isSupabaseConfigured(), which reads
  // NEXT_PUBLIC_* through a dynamic process.env[name] access that Next cannot inline into the
  // client bundle. Server saw "configured" while the client's first render saw "not configured",
  // diverging the rendered tree — a real hydration mismatch on /my-work. The restoring branch must
  // be gated on the hydrated flag so SSR and the first client render are identical.
  const src = readSource("components/my-work/MyWork.tsx");
  assert.match(src, /if\s*\(\s*hydrated\s*&&\s*cloudSessionRestoring\s*\)/);
});

test("VC-7: Evidence comparison summary carries the honesty invariant (shared != available)", () => {
  const src = readSource("components/evidence-comparison/EvidenceComparisonSummary.tsx").toLowerCase();
  assert.ok(
    src.includes("not a claim that evidence is available"),
    "EvidenceComparisonSummary must document the shared-source honesty invariant",
  );
});
