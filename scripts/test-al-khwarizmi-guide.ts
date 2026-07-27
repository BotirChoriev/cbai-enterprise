import assert from "node:assert/strict";
import test from "node:test";
import { existsSync, readFileSync } from "node:fs";
import {
  GUIDE_STAGES,
  guideStageIndexForPath,
  nextGuideStage,
} from "@/lib/al-khwarizmi-guide/progress";

const guide = readFileSync("components/al-khwarizmi-guide/AlKhwarizmiGuide.tsx", "utf8");
const layout = readFileSync("app/(dashboard)/layout.tsx", "utf8");

test("guide represents the six-stage CBAI sequence", () => {
  assert.equal(GUIDE_STAGES.length, 6);
  assert.deepEqual(
    GUIDE_STAGES.map((stage) => stage.id),
    ["problem", "evidence", "contradictions", "scenarios", "decision", "monitoring"],
  );
});

test("route context advances the guide and unlocks the next canonical function", () => {
  assert.equal(guideStageIndexForPath("/problems"), 0);
  assert.equal(guideStageIndexForPath("/research/crispr"), 1);
  assert.equal(guideStageIndexForPath("/graph"), 2);
  assert.equal(guideStageIndexForPath("/reasoning"), 3);
  assert.equal(guideStageIndexForPath("/rooms"), 4);
  assert.equal(guideStageIndexForPath("/trust"), 5);
  assert.equal(nextGuideStage("/research").href, "/evidence");
  assert.equal(nextGuideStage("/reasoning").href, "/reports");
});

test("Al-Khwarizmi asks through the canonical Voice Operator", () => {
  assert.match(guide, /useVoiceOperator/);
  assert.match(guide, /voice\.setTextInput/);
  assert.match(guide, /voice\.openDock/);
  assert.match(guide, /you evaluate the evidence and make the decision/i);
  assert.match(guide, /qarorni siz berasiz/i);
});

test("guide is mounted inside the Voice Operator provider and uses a project asset", () => {
  const guideIndex = layout.indexOf("<AlKhwarizmiGuide />");
  const providerStart = layout.indexOf("<VoiceOperatorProvider>");
  const providerEnd = layout.indexOf("</VoiceOperatorProvider>");
  assert.ok(providerStart >= 0 && guideIndex > providerStart && guideIndex < providerEnd);
  assert.ok(existsSync("public/guides/al-khwarizmi-guide-v1.png"));
});
