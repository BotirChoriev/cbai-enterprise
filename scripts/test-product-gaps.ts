// Focused tests for "CBAI PLATFORM ACTIVATION — Close the final documented product gaps":
// Evidence bookmarking (Task 1) and Project catalog translation (Task 2). Same zero-dependency
// harness as every other test script (Node's native node:test + the `@/` alias loader — no DOM/
// localStorage in this environment, so bookmark persistence itself is exercised the same honest
// way every other *-intelligence.ts suite already does: pinEntity/unpinEntity never throw outside
// a browser and honestly report an empty list, exactly as they do for every other real entity kind).
// Run with: npm run test:product-gaps

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { pinEntity, unpinEntity, loadPinnedEntities } from "@/lib/context/context-history";
import {
  parseEvidenceItemId,
  evidenceItemHref,
  toEvidenceEntityRef,
} from "@/lib/research/evidence/evidence-bookmark";
import { buildEvidenceItemId } from "@/lib/research/evidence/evidence-topic-builder";
import { PROJECT_TYPES, type ProjectTypeId } from "@/lib/project/project-types";
import {
  translateProjectTypeLabel,
  translateProjectTypeDescription,
  translateProjectStatus,
  translateProjectVisibility,
  translateProjectTaskStatus,
} from "@/lib/i18n/project-translation";
import { getDictionary, translate } from "@/lib/i18n/translate";
import en from "@/lib/i18n/dictionaries/en";
import uz from "@/lib/i18n/dictionaries/uz";
import ru from "@/lib/i18n/dictionaries/ru";
import tr from "@/lib/i18n/dictionaries/tr";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
function read(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), "utf8");
}

// ---------------------------------------------------------------------------
// Task 1 — Evidence bookmarking
// ---------------------------------------------------------------------------

test("1. buildEvidenceItemId/parseEvidenceItemId round-trip — a bookmark's id always parses back to its real owning topic", () => {
  const id = buildEvidenceItemId("microbiology", "peer-reviewed-studies");
  const parsed = parseEvidenceItemId(id);
  assert.deepEqual(parsed, { topicId: "microbiology", slug: "peer-reviewed-studies" });
});

test("2. parseEvidenceItemId honestly returns null for anything that isn't a real catalog evidence id", () => {
  assert.equal(parseEvidenceItemId("not-a-real-evidence-id"), null);
  assert.equal(parseEvidenceItemId("topic-evidence:only-one-segment"), null);
  assert.equal(parseEvidenceItemId(""), null);
});

test("3. evidenceItemHref resolves a bookmarked Evidence item back to its real owning research topic page", () => {
  const id = buildEvidenceItemId("microbiology", "peer-reviewed-studies");
  const href = evidenceItemHref(id);
  assert.match(href, /^\/research\/microbiology/);
});

test("4. evidenceItemHref never fabricates a destination for an unparseable id — falls back to the real Evidence catalog", () => {
  assert.equal(evidenceItemHref("garbage"), "/knowledge");
});

test("5. toEvidenceEntityRef builds the exact same ContextEntityRef shape every other bookmark kind uses", () => {
  const ref = toEvidenceEntityRef({
    evidenceItemId: buildEvidenceItemId("microbiology", "peer-reviewed-studies"),
    slug: "peer-reviewed-studies",
    topicId: "microbiology",
    label: "Peer-reviewed studies",
    status: "catalog_available",
    note: "test",
  });
  assert.deepEqual(ref, {
    kind: "evidence",
    id: buildEvidenceItemId("microbiology", "peer-reviewed-studies"),
    name: "Peer-reviewed studies",
  });
});

test("6. Bookmark architecture accepts \"evidence\" as a real kind and never throws outside a browser", () => {
  assert.doesNotThrow(() => {
    const before = loadPinnedEntities();
    assert.deepEqual(before, []);
    const evidenceId = buildEvidenceItemId("microbiology", "peer-reviewed-studies");
    const afterPin = pinEntity({ kind: "evidence", id: evidenceId, name: "Peer-reviewed studies" });
    assert.ok(Array.isArray(afterPin));
    const afterUnpin = unpinEntity("evidence", evidenceId);
    assert.ok(Array.isArray(afterUnpin));
  });
});

test("7. SaveToWorkspaceButton (the real, existing bookmark toggle) is reused for Evidence — no second bookmark component", () => {
  const lifecyclePanel = read("components/research/topic/EvidenceLifecyclePanel.tsx");
  assert.match(lifecyclePanel, /SaveToWorkspaceButton/);
  assert.match(lifecyclePanel, /toEvidenceEntityRef/);
  const supportingCounter = read("components/research/topic/SupportingCounterEvidencePanel.tsx");
  assert.match(supportingCounter, /SaveToWorkspaceButton/);
  assert.match(supportingCounter, /kind: "evidence"/);
});

test("8. My Work renders a dedicated Saved Evidence section, distinct from the generic Pinned entities list", () => {
  const myWork = read("components/my-work/MyWork.tsx");
  assert.match(myWork, /SavedEvidence/);
  assert.match(myWork, /entity\.kind !== "evidence"/);
  assert.match(myWork, /entity\.kind === "evidence"/);
  const savedEvidence = read("components/my-work/SavedEvidence.tsx");
  assert.match(savedEvidence, /savedEvidence\.empty/);
  assert.match(savedEvidence, /EmptyState/);
});

test("9. Evidence bookmarks are distinguished from linked Project Evidence at the schema level, not just in the UI", () => {
  const migrationSql = read("supabase/migrations/0004_evidence_bookmarks.sql");
  assert.match(migrationSql, /bookmarks/);
  assert.match(migrationSql, /'evidence'/);
  // project_entity_links (Related Entities) and project_evidence (linked Project Evidence) both
  // stay scoped to their original 5 kinds — this migration only widens `bookmarks`.
  const initSql = read("supabase/migrations/0001_init_schema.sql");
  assert.doesNotMatch(
    initSql.split("project_entity_links")[1]?.split("create table")[0] ?? "",
    /'evidence'/,
  );
});

// ---------------------------------------------------------------------------
// Task 2 — Project catalog translation
// ---------------------------------------------------------------------------

test("10. Every real Project Type has a real, non-English-identical translation in Uzbek/Russian/Turkish", () => {
  for (const projectType of PROJECT_TYPES) {
    const enLabel = translateProjectTypeLabel((path) => translate(en, path), projectType.id);
    const uzLabel = translateProjectTypeLabel((path) => translate(uz, path), projectType.id);
    const ruLabel = translateProjectTypeLabel((path) => translate(ru, path), projectType.id);
    const trLabel = translateProjectTypeLabel((path) => translate(tr, path), projectType.id);
    assert.ok(enLabel.length > 0, `${projectType.id} must have a real English label`);
    assert.notEqual(uzLabel, enLabel, `${projectType.id} Uzbek label must be real, not English fallback`);
    assert.notEqual(ruLabel, enLabel, `${projectType.id} Russian label must be real, not English fallback`);
    assert.notEqual(trLabel, enLabel, `${projectType.id} Turkish label must be real, not English fallback`);
  }
});

test("11. Every real Project Type description is translated in all 4 languages, never blank", () => {
  const dictionaries = [en, uz, ru, tr];
  for (const projectType of PROJECT_TYPES) {
    for (const dict of dictionaries) {
      const description = translateProjectTypeDescription((path) => translate(dict, path), projectType.id);
      assert.ok(description.length > 0, `${projectType.id} description must not be blank`);
    }
  }
});

test("12. Project status/visibility/task-status labels are all real and translated in all 4 languages", () => {
  const dictionaries = [en, uz, ru, tr];
  for (const dict of dictionaries) {
    const t = (path: string) => translate(dict, path);
    for (const status of ["active", "paused", "completed", "archived"] as const) {
      assert.ok(translateProjectStatus(t, status).length > 0);
    }
    for (const visibility of ["private", "team", "public"] as const) {
      assert.ok(translateProjectVisibility(t, visibility).length > 0);
    }
    for (const taskStatus of ["todo", "in_progress", "done"] as const) {
      assert.ok(translateProjectTaskStatus(t, taskStatus).length > 0);
    }
  }
});

test("13. getDictionary honestly falls back to English for an unsupported language code — never a raw key, never a crash", () => {
  const dictionary = getDictionary("fr");
  assert.equal(dictionary, en);
  const label = translateProjectTypeLabel((path) => translate(dictionary, path), "research_project" as ProjectTypeId);
  assert.equal(label, "Research Project");
});

test("14. translate() never returns a raw dotted key for any real Project translation path in any of the 4 dictionaries", () => {
  const paths = [
    ...PROJECT_TYPES.flatMap((pt) => {
      const key = pt.id.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
      return [`project.types.${key}.label`, `project.types.${key}.description`];
    }),
    "project.status.active",
    "project.visibility.private",
    "project.taskStatus.inProgress",
    "project.catalog.recentProjects",
    "project.catalog.noProjectsCreatedYet",
    "project.form.submit",
    "project.form.requiredError",
  ];
  for (const dict of [en, uz, ru, tr]) {
    for (const path of paths) {
      const value = translate(dict, path);
      assert.notEqual(value, path, `"${path}" resolved to the raw key, not a real translation`);
    }
  }
});

test("15. Every core Project UI surface reads labels through the real translation helpers, not the raw English constants directly", () => {
  const surfaces = [
    "components/project/CreateProjectForm.tsx",
    "components/project/ProjectList.tsx",
    "components/project/ProjectHome.tsx",
    "components/project/ProjectTasksPanel.tsx",
    "components/project/ProjectReportView.tsx",
    "components/my-work/MyWork.tsx",
    "components/workspaces/RoleProjectEntry.tsx",
  ];
  for (const path of surfaces) {
    const content = read(path);
    assert.doesNotMatch(
      content,
      /PROJECT_STATUS_LABELS\[|PROJECT_VISIBILITY_LABELS\[|PROJECT_TASK_STATUS_LABELS\[|getProjectTypeLabel\(/,
      `${path} must not read a Project label from the raw English constant directly`,
    );
  }
});
