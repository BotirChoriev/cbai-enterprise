import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import {
  getProfessionTemplate,
  interpretProfession,
} from "@/lib/personal-workspace/profession-engine";

const gateway = readFileSync("components/personal-workspace/PersonalWorkspaceGateway.tsx", "utf8");
const home = readFileSync("components/spatial-world/SpatialWorldIntelligenceHome.tsx", "utf8");

test("profession engine adapts to painter, cook, scientist, and unknown work", () => {
  assert.equal(interpretProfession("Men malyarman").templateId, "painter");
  assert.equal(interpretProfession("Men oshpazman").templateId, "cook");
  assert.equal(interpretProfession("Men olimman").templateId, "scientist");
  assert.equal(interpretProfession("Men floristman").templateId, "general");
});

test("generic craft receives a specialty follow-up instead of a guessed template", () => {
  const interpretation = interpretProfession("Men ustaman");
  assert.equal(interpretation.templateId, "general");
  assert.match(interpretation.followUp ?? "", /Qanday ustasiz/);
});

test("each daily desk has tasks and connected CBAI modules", () => {
  for (const id of ["painter", "cook", "scientist", "general"] as const) {
    const template = getProfessionTemplate(id);
    assert.ok(template.starterTasks.length >= 3);
    assert.ok(template.modules.length >= 4);
  }
});

test("human confirmation, persistence, voice, and canonical Operational Objects are integrated", () => {
  assert.match(gateway, /data-human-checkpoint="profession-confirmation"/);
  assert.match(gateway, /savePersonalWorkspace/);
  assert.match(gateway, /voice\.openDock/);
  assert.match(gateway, /objects\?\.openComposer/);
  assert.match(gateway, /humanApprovalRequired: true/);
});

test("People block is mounted on the real platform home", () => {
  assert.match(home, /<PersonalWorkspaceGateway \/>/);
});
