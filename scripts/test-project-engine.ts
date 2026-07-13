// Focused tests for the "Project Engine Activation" mission — real Project persistence
// (SSR-safety, honest emptiness outside a browser), the Universal Entity Engine extension
// (EntityType "project", relationships, reports), progress calculation, and Command Center
// integration. Same zero-dependency harness as the other test scripts (Node's native `node:test`
// + the `@/` alias loader — no DOM/localStorage in this environment, the honest SSR case every
// store function must handle safely).
// Run with: npm run test:project-engine

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createProject,
  loadProjects,
  loadProject,
  loadProjectEntities,
  loadProjectNotes,
} from "@/lib/project/project-store";
import { PROJECT_TYPES, getProjectTypeLabel } from "@/lib/project/project-types";
import { toProjectEntity } from "@/lib/project/project.adapter";
import { deriveProjectHealth } from "@/lib/project/project-health";
import { buildEntityRelationships } from "@/lib/entity/entity-relationships";
import { buildEntityReport } from "@/lib/entity/entity-report";
import { buildPlatformEntityHref } from "@/lib/global-search";
import { ENTITY_MODULE_CONFIGS } from "@/lib/entity/entity.types";
import { isValidEntity } from "@/lib/entity/entity.helpers";
import { resolveAssistantCommand } from "@/lib/assistant/assistant-commands";
import { resolveProjectCommand } from "@/lib/project/project-commands";
import { resolveRelationshipCommand } from "@/lib/assistant/assistant-relationship-commands";

test("1. PROJECT_TYPES is real configuration — every mission-named type present with a real label", () => {
  const ids = PROJECT_TYPES.map((t) => t.id);
  assert.deepEqual(
    ids,
    [
      "research_project",
      "country_analysis",
      "company_analysis",
      "university_study",
      "policy_analysis",
      "investment_analysis",
      "technology_assessment",
      "evidence_review",
    ],
  );
  for (const type of PROJECT_TYPES) {
    assert.ok(type.label.length > 0);
    assert.ok(type.description.length > 0);
  }
  assert.equal(getProjectTypeLabel("research_project"), "Research Project");
});

test("2. Creating a project outside a browser never throws and returns the real shape", () => {
  assert.doesNotThrow(() => {
    const project = createProject({
      title: "Test Project",
      type: "research_project",
      description: "A test project",
      tags: ["test"],
      visibility: "private",
      status: "active",
    });
    assert.equal(project.title, "Test Project");
    assert.ok(project.id.length > 0);
    assert.ok(project.createdAt.length > 0);
  });
});

test("3. loadProjects/loadProject are honestly empty outside a browser — never throws", () => {
  assert.doesNotThrow(() => {
    assert.deepEqual(loadProjects(), []);
    assert.equal(loadProject("not-a-real-id"), null);
  });
});

test("4. toProjectEntity produces a valid universal Entity", () => {
  const project = createProject({
    title: "Semiconductor Policy Review",
    type: "policy_analysis",
    description: "Reviewing semiconductor export policy.",
    tags: [],
    visibility: "private",
    status: "active",
  });
  const entity = toProjectEntity(project);
  assert.ok(isValidEntity(entity));
  assert.equal(entity.type, "project");
  assert.equal(entity.name, project.title);
});

test("5. ENTITY_MODULE_CONFIGS.project is real, not an orphaned type", () => {
  assert.equal(ENTITY_MODULE_CONFIGS.project.label, "Project");
  assert.equal(ENTITY_MODULE_CONFIGS.project.pluralLabel, "Projects");
});

test("6. buildEntityRelationships(project) is honestly empty outside a browser — never fabricated", () => {
  assert.doesNotThrow(() => {
    assert.deepEqual(buildEntityRelationships("project", "any-id"), []);
  });
});

test("7. buildEntityReport(project) returns null for a non-existent project — never fabricated", () => {
  assert.equal(buildEntityReport("project", "not-a-real-project"), null);
});

test("8. buildPlatformEntityHref routes a project entity to /my-work?project=id, not the query-param pattern", () => {
  const project = createProject({
    title: "Href Test",
    type: "research_project",
    description: "test",
    tags: [],
    visibility: "private",
    status: "active",
  });
  const entity = toProjectEntity(project);
  assert.equal(buildPlatformEntityHref(entity), `/my-work?project=${project.id}`);
});

test("9. deriveProjectHealth calculates only from real completed work — never a fabricated percentage", () => {
  const bareProject = createProject({
    title: "Bare Project",
    type: "research_project",
    description: "test",
    tags: [],
    visibility: "private",
    status: "active",
  });
  const health = deriveProjectHealth(bareProject);
  assert.ok(!("percentage" in health));
  assert.ok(!("score" in health));
  // Outside a browser, notes/entities/evidence honestly load as empty, and researchQuestion/
  // objectives were never set — every signal must be false/zero, not a default-true fabrication.
  assert.equal(health.questionExists, false);
  assert.equal(health.objectivesExist, false);
  assert.equal(health.evidenceCount, 0);

  const projectWithQuestion = createProject({
    title: "Project With Question",
    type: "research_project",
    description: "test",
    researchQuestion: "Does this work?",
    tags: [],
    visibility: "private",
    status: "active",
  });
  assert.equal(deriveProjectHealth(projectWithQuestion).questionExists, true);
});

test("10. Command Center resolves \"create project\" and \"open project\" to the real My Work route", () => {
  const create = resolveAssistantCommand("create project");
  assert.ok(create);
  assert.equal(create!.href, "/my-work");

  const open = resolveAssistantCommand("open project");
  assert.ok(open);
  assert.equal(open!.href, "/my-work");
});

test("11. resolveProjectCommand is honest when no projects exist and never throws outside a browser", () => {
  assert.doesNotThrow(() => {
    const result = resolveProjectCommand("continue project");
    assert.ok(result);
    // Outside a browser, loadProjects() is honestly empty, so this must be the no-projects
    // message, never a fabricated "continuing" confirmation.
    assert.equal(result!.type, "message");
  });
});

test("12. resolveProjectCommand returns null for phrases it doesn't own, falling through to other resolvers", () => {
  assert.equal(resolveProjectCommand("open my work"), null);
});

test("13. resolveRelationshipCommand supports a project focus and is honest when nothing is linked", () => {
  const result = resolveRelationshipCommand("open related company", { kind: "project", id: "any-project" });
  assert.ok(result);
  assert.equal(result!.type, "message");
});

test("14. Every real project note is honestly empty outside a browser", () => {
  assert.doesNotThrow(() => {
    assert.deepEqual(loadProjectNotes("any-project"), []);
  });
});

test("15. loadProjectEntities is honestly empty outside a browser", () => {
  assert.doesNotThrow(() => {
    assert.deepEqual(loadProjectEntities("any-project"), []);
  });
});
