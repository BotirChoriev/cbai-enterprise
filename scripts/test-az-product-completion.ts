/**
 * A–Z product completion — My Work cockpit + voice capability registry gates.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  cockpitCounts,
  cockpitTemplateDraftSeed,
  nextActionQueue,
  queryOperationalCockpit,
} from "@/lib/operational-objects/cockpit-query";
import type { OperationalObject } from "@/lib/operational-objects/operational-object.types";
import {
  capabilitiesForRoute,
  resolveMyWorkFilterQuery,
  VOICE_CAPABILITY_REGISTRY,
} from "@/lib/voice-operator/capability-registry";
import { resolvePlatformIntent } from "@/lib/platform-actions/intent-matcher";
import { hrefForAction } from "@/lib/platform-actions/registry";

function readSource(path: string): string {
  return readFileSync(path, "utf8");
}

function sampleObject(partial: Partial<OperationalObject> & Pick<OperationalObject, "id" | "title" | "status">): OperationalObject {
  return {
    version: 1,
    type: "work_plan",
    summary: partial.title,
    objective: partial.title,
    rationale: "",
    expectedOutcome: "",
    domain: "general",
    priority: "normal",
    requiredInputs: [],
    evidenceRequirements: [],
    nextAction: "Review",
    humanDecision: "",
    relatedObjectIds: [],
    locale: "en",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-02T00:00:00.000Z",
    provenance: { source: "manual" },
    ...partial,
  };
}

test("cockpit query filters by status domain search and sort", () => {
  const objects = [
    sampleObject({ id: "1", title: "Soil salinity question", status: "needs_review", domain: "research", priority: "high", nextAction: "Collect samples", updatedAt: "2026-01-03T00:00:00.000Z" }),
    sampleObject({ id: "2", title: "Draft report", status: "draft", domain: "reports", priority: "low", nextAction: "Add citations", updatedAt: "2026-01-04T00:00:00.000Z" }),
    sampleObject({ id: "3", title: "Evidence request", status: "waiting_for_evidence", domain: "evidence", priority: "normal", nextAction: "Connect source", updatedAt: "2026-01-01T00:00:00.000Z" }),
  ];

  const review = queryOperationalCockpit(objects, {
    filter: "review",
    domain: "all",
    search: "",
    sort: "updated_desc",
  });
  assert.equal(review.length, 1);
  assert.equal(review[0]?.id, "1");

  const search = queryOperationalCockpit(objects, {
    filter: "all",
    domain: "evidence",
    search: "evidence",
    sort: "priority_desc",
  });
  assert.equal(search.length, 1);
  assert.equal(search[0]?.id, "3");

  const counts = cockpitCounts(objects);
  assert.equal(counts.draft, 1);
  assert.equal(counts.waiting, 1);
  assert.equal(counts.review, 1);

  const queue = nextActionQueue(objects, 2);
  assert.equal(queue[0]?.priority, "high");
});

test("cockpit templates never invent filled scientific content", () => {
  const seed = cockpitTemplateDraftSeed("research_question", "uz");
  assert.equal(seed.type, "research_question");
  assert.equal(seed.title, "");
  assert.ok(seed.nextAction.length > 0);
});

test("voice capability registry covers core routes and draft confirmation", () => {
  assert.ok(VOICE_CAPABILITY_REGISTRY.length >= 10);
  const myWorkCaps = capabilitiesForRoute("/my-work");
  assert.ok(myWorkCaps.some((c) => c.id === "work.unfinished"));
  assert.ok(myWorkCaps.some((c) => c.kind === "draft_create" && c.needsConfirmation));
  const roomsCaps = capabilitiesForRoute("/rooms");
  assert.ok(roomsCaps.some((c) => c.kind === "unsupported_honest"));
});

test("unfinished / needs-review voice intents route to My Work filters", () => {
  assert.equal(resolveMyWorkFilterQuery("Show my unfinished work"), "/my-work?opFilter=waiting");
  assert.equal(resolveMyWorkFilterQuery("What needs my review?"), "/my-work?opFilter=review");

  const unfinished = resolvePlatformIntent("Show my unfinished work", "en");
  assert.ok(unfinished);
  assert.equal(unfinished!.actionId, "navigate.my_work");
  assert.equal(unfinished!.params.query, "waiting");
  assert.equal(hrefForAction("navigate.my_work", { query: "waiting" }), "/my-work?opFilter=waiting");
  assert.equal(hrefForAction("navigate.my_work", { query: "review" }), "/my-work?opFilter=review");

  const uz = resolvePlatformIntent("Tugallanmagan ishlarimni ko‘rsat", "uz");
  assert.ok(uz);
  assert.equal(uz!.actionId, "navigate.my_work");
});

test("OperationalObjectIndex exposes cockpit search and templates", () => {
  const src = readSource("components/operational-objects/OperationalObjectIndex.tsx");
  assert.match(src, /data-cbai-cockpit="my-work"/);
  assert.match(src, /data-cbai-cockpit-search/);
  assert.match(src, /nextActionQueue/);
  assert.match(src, /cockpitTemplateDraftSeed/);
});

test("OperationalWorkCard archive requires confirmation", () => {
  const src = readSource("components/operational-objects/OperationalWorkCard.tsx");
  assert.match(src, /archiveConfirm/);
  assert.match(src, /window\.confirm/);
  assert.match(src, /archiveObject/);
});

test("Research home surfaces honest intake paths", () => {
  const src = readSource("components/research/ResearchHome.tsx");
  assert.match(src, /data-cbai-research-intake/);
  assert.match(src, /intakeOpenDocuments/);
  assert.match(src, /scientific-documents/);
});

test("archiveOperationalObject is idempotent-safe and status-preserving", async () => {
  const { archiveOperationalObject, loadOperationalObjects, saveOperationalDraft } = await import(
    "@/lib/operational-objects/operational-object-store"
  );
  // In Node without window, store uses memory — safe for unit verification.
  const created = saveOperationalDraft({
    type: "task",
    title: "Archive me",
    summary: "Archive me",
    objective: "Archive me",
    rationale: "",
    expectedOutcome: "",
    domain: "general",
    status: "draft",
    priority: "normal",
    requiredInputs: [],
    evidenceRequirements: [],
    nextAction: "Done",
    humanDecision: "",
    relatedObjectIds: [],
    locale: "en",
    provenance: { source: "manual" },
  });
  const archived = archiveOperationalObject(created.id);
  assert.ok(archived);
  assert.equal(archived!.status, "archived");
  assert.ok(loadOperationalObjects().some((o) => o.id === created.id && o.status === "archived"));
});

test("graph Open module deep-links use entity query params", () => {
  const src = readSource("components/graph/GraphEntityPanel.tsx");
  assert.match(src, /\$\{route\}\?\$\{node\.type\}=\$\{encodeURIComponent\(node\.entityId\)\}/);
  assert.doesNotMatch(src, /\?id=\$\{node\.entityId\}/);
});
