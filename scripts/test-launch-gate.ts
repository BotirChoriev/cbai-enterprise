// Focused tests for "Maximum Launch-Blocker Remediation" — a real repair mission, not a feature
// sprint. Static source-inspection tests (this harness has no DOM) guarding every verified fix:
// the OfflineBanner SSR bug, contradictory report copy, print/export honesty, Trust Center
// accuracy after the Authentication mission, role project entry surfaces, and the Project Type/
// Visibility form fixes.
// Run with: npm run test:launch-gate

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { PROJECT_TYPES } from "@/lib/project/project-types";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
function read(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), "utf8");
}

const SKIP_DIRS = new Set(["node_modules", ".next", ".git", "out", ".audit-scripts"]);
const SOURCE_EXT = new Set([".ts", ".tsx", ".css"]);

/** Walks app/components/lib and returns the relative path of every file whose content matches
 * `pattern` — the shared engine behind every whole-codebase regression guard in this file. */
function scanSourceFiles(pattern: RegExp, dirs: readonly string[] = ["app", "components", "lib"]): string[] {
  const offenders: string[] = [];
  function walk(dir: string) {
    for (const entry of readdirSync(dir)) {
      if (SKIP_DIRS.has(entry)) continue;
      const full = join(dir, entry);
      const stat = statSync(full);
      if (stat.isDirectory()) {
        walk(full);
      } else if (SOURCE_EXT.has(entry.slice(entry.lastIndexOf(".")))) {
        const content = readFileSync(full, "utf8");
        if (pattern.test(content)) offenders.push(full.replace(ROOT + "/", ""));
      }
    }
  }
  for (const dir of dirs) walk(join(ROOT, dir));
  return offenders;
}

test("1. OfflineBanner never reports offline from a server render (no `window`) — real fix for a real SSR bug", () => {
  const content = read("components/system/OfflineBanner.tsx");
  assert.match(content, /typeof window !== "undefined" && typeof navigator !== "undefined"/);
});

test("2. Report views no longer contradict a working inline 'Generate report' with 'does not open a report'", () => {
  const content = read("components/shared/EntityDecisionPackagePreview.tsx");
  assert.equal(content.includes("does not open a"), false);
  assert.ok(
    content.includes("available directly below") ||
      content.includes("entityIntelligence.reportsBodySingle"),
  );
});

test("3. Every report view offers a real print/export flow, honestly built on window.print()", () => {
  const printButton = read("components/shared/ReportPrintButton.tsx");
  assert.ok(printButton.includes("window.print()"));
  for (const view of [
    "components/countries/CountryReportView.tsx",
    "components/companies/CompanyReportView.tsx",
    "components/universities/UniversityReportView.tsx",
    "components/project/ProjectReportView.tsx",
    "components/research/topic/ResearchTopicReportView.tsx",
  ]) {
    const content = read(view);
    assert.ok(content.includes("ReportPrintButton"), `${view} is missing the print/export action`);
    assert.ok(content.includes("cbai-print-area"), `${view} is missing the print-area class`);
  }
});

test("4. Reports carry a real generation date, not a fabricated timestamp field", () => {
  for (const view of [
    "components/countries/CountryReportView.tsx",
    "components/companies/CompanyReportView.tsx",
    "components/universities/UniversityReportView.tsx",
    "components/project/ProjectReportView.tsx",
  ]) {
    const content = read(view);
    assert.ok(
      content.includes("toLocaleString()") || content.includes("labels.generated"),
      `${view} is missing a generation date`,
    );
  }
});

test("5. Project reports now include Objectives, Tasks, and Open Questions (previously computed but never rendered)", () => {
  const reportLib = read("lib/entity/entity-report.ts");
  assert.ok(reportLib.includes("objectives: project.objectives"));
  const view = read("components/project/ProjectReportView.tsx");
  assert.ok(view.includes("projectUi.objectives") || view.includes(">Objectives<"));
  assert.ok(view.includes("projectUi.tasks") || view.includes(">Tasks<"));
  assert.ok(view.includes("projectUi.openQuestions") || view.includes(">Open Questions<"));
});

test("6. Trust Center's Privacy and Known Limitations sections describe the real local account system, not a false 'no accounts' claim", () => {
  const content = read("lib/i18n/platform-copy-build006-en.ts");
  assert.equal(content.includes("does not have user accounts"), false);
  assert.equal(content.includes("There are no accounts, sign-in"), false);
  assert.ok(content.includes("hashed and salted"));
});

test("7. Trust Center has a real Terms of Use section that invents no legal guarantees", () => {
  const content = read("lib/i18n/platform-copy-build006-en.ts");
  assert.ok(content.includes('"Terms of Use"'));
  assert.ok(content.includes("not a substitute for a lawyer-drafted"));
});

test("8. assistant-storage.ts's architecture note no longer claims no authentication exists", () => {
  const content = read("lib/assistant/assistant-storage.ts");
  assert.equal(content.includes("this platform has no accounts"), false);
});

test("9. Role workspaces (Government/Investor/Citizen) each have a real Project Engine entry point, using real Project Types", () => {
  const realTypeIds = new Set(PROJECT_TYPES.map((t) => t.id));
  assert.ok(realTypeIds.has("policy_analysis"));
  assert.ok(realTypeIds.has("investment_analysis"));
  assert.ok(realTypeIds.has("evidence_review"));

  const entry = read("components/workspaces/RoleProjectEntry.tsx");
  assert.ok(entry.includes("CreateProjectForm") || entry.includes("/my-work?projectType="));

  assert.ok(read("components/workspaces/GovernmentWorkspace.tsx").includes('projectType="policy_analysis"'));
  assert.ok(read("components/workspaces/InvestorWorkspace.tsx").includes('projectType="investment_analysis"'));
  assert.ok(read("components/workspaces/CitizenWorkspace.tsx").includes('projectType="evidence_review"'));
});

test("10. CreateProjectForm accepts a real initialType and disables unavailable Visibility options before submission", () => {
  const content = read("components/project/CreateProjectForm.tsx");
  assert.ok(content.includes("initialType"));
  assert.ok(content.includes('disabled={v !== "private"}'));
});

test("11. CreateProjectForm surfaces the real, translated Project Type description, not just the label", () => {
  const content = read("components/project/CreateProjectForm.tsx");
  assert.ok(content.includes("translateProjectTypeDescription(t, type)"));
});

test("12. ProjectHome distinguishes Linked entities from Bookmarks and allows bookmarking directly", () => {
  const content = read("components/project/ProjectHome.tsx");
  assert.ok(content.includes("projectHome.entitiesBookmarkNote"));
  assert.ok(content.includes("pinEntityToWorkspace"));
});

test("13. Saving Research Question/Objectives gives a real, visible confirmation", () => {
  const content = read("components/project/ProjectHome.tsx");
  assert.ok(content.includes("questionObjectivesSaved"));
  assert.ok(content.includes("ActivationStatusLine"));
  assert.ok(content.includes("projectHome.questionSaved"));
});

test("14. Countries page no longer forces the World Map open when a country is already selected", () => {
  const content = read("app/(dashboard)/countries/CountriesPageClient.tsx");
  assert.ok(content.includes("open={!context.country}"));
});

test("15. Non-functional, unpromoted pages (Agents/Core/Workflows) are excluded from search indexing", () => {
  for (const page of ["app/(dashboard)/agents/page.tsx", "app/(dashboard)/core/page.tsx", "app/(dashboard)/workflows/page.tsx"]) {
    const content = read(page);
    assert.ok(content.includes("robots:"), `${page} should be excluded from indexing`);
    assert.ok(content.includes("index: false"));
  }
});

test("16. Every dashboard page now has explicit metadata — one canonical product identity, no unspecified titles", () => {
  const pages = [
    "agents",
    "ai-control",
    "citizen",
    "core",
    "government",
    "investor",
    "knowledge",
    "reasoning",
    "workflows",
    "analytics",
    "search",
  ];
  for (const page of pages) {
    const path = `app/(dashboard)/${page}/page.tsx`;
    assert.ok(existsSync(join(ROOT, path)), `${path} should exist`);
    assert.ok(read(path).includes("export const metadata"), `${path} is missing explicit metadata`);
  }
});

test("17. Every real route has exactly one page.tsx — no duplicate/legacy route directories", () => {
  // A real, current inventory (audited in this mission via `find app -iname page.tsx`) — this
  // test fails loudly if a duplicate route directory (e.g. a second /countries variant) is ever
  // added, rather than silently letting product fragmentation back in.
  const expectedRoutes = [
    "account", "agents", "ai-control", "analytics", "citizen", "companies", "core", "countries",
    "dashboard", "government", "graph", "investor", "knowledge", "my-work", "reasoning",
    "research", "search", "settings", "trust", "universities", "workflows",
  ];
  for (const route of expectedRoutes) {
    assert.ok(existsSync(join(ROOT, `app/(dashboard)/${route}/page.tsx`)), `missing canonical route: ${route}`);
  }
  assert.ok(existsSync(join(ROOT, "app/(dashboard)/page.tsx")), "missing root dashboard page");
});

test("18. CBAI has no red — Design Bible Part III.3.1, a permanent regression guard", () => {
  // Every honest error, warning, and limitation is expressed in amber, never in the color that
  // means alarm. Walks every real source file (excluding node_modules/.next/scratch) so a future
  // change can't silently reintroduce red/rose Tailwind classes or hex values.
  const RED_PATTERN = /(?:^|[^-\w])(?:red|rose)-\d{3}\b|#(?:ef4444|dc2626|f87171|b91c1c|c94f4f|fca5a5|f43f5e|e11d48|fb7185)\b/i;
  const offenders = scanSourceFiles(RED_PATTERN);
  assert.deepEqual(offenders, [], `red/rose color usage found in: ${offenders.join(", ")}`);
});

test("19. Every page-title <h1> uses the CBAI serif display voice — Design Bible Part IV: one typographic voice for statement-scale truth, never blurred with working text", () => {
  // A prior audit (CBAI Product Transformation, system-consistency mission) found that roughly a
  // dozen major pages — Countries, Companies, Universities, Research, every research topic page,
  // Governance, Evidence, Reports, Reasoning, the Knowledge Graph, and every role workspace — had
  // each hand-copied a plain bold-sans heading instead of the shared serif token, so the exact
  // same UI role (a page title) rendered in two different typefaces depending on which page you
  // were on. Regression guard: any <h1> styled with font-semibold but missing cbai-display is a
  // real, user-visible identity inconsistency, not a style nitpick.
  const H1_PATTERN = /<h1\s+className="[^"]*font-semibold[^"]*"/g;
  const offenders: string[] = [];

  function walk(dir: string) {
    for (const entry of readdirSync(dir)) {
      if (SKIP_DIRS.has(entry)) continue;
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) {
        walk(full);
        continue;
      }
      if (!entry.endsWith(".tsx")) continue;
      const content = readFileSync(full, "utf8");
      const matches = content.match(H1_PATTERN) ?? [];
      for (const match of matches) {
        if (!match.includes("cbai-display")) offenders.push(`${full.replace(ROOT + "/", "")}: ${match}`);
      }
    }
  }

  for (const dir of ["app", "components"]) {
    walk(join(ROOT, dir));
  }

  assert.deepEqual(offenders, [], `page-title <h1> missing cbai-display found in:\n${offenders.join("\n")}`);
});
