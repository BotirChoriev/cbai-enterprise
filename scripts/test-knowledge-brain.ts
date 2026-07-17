// Knowledge Brain — BUILD-026 foundation tests.
// Run with: npm run test:knowledge-brain

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import en from "@/lib/i18n/dictionaries/en";
import uz from "@/lib/i18n/dictionaries/uz";
import ru from "@/lib/i18n/dictionaries/ru";
import tr from "@/lib/i18n/dictionaries/tr";
import {
  resolveMissionKnowledgeExplanation,
} from "@/lib/intelligence-os/knowledge-brain";
import { resolveUniversalIntent, intentCategoryTranslationKey } from "@/lib/intelligence-os/universal-intent";
import { KNOWLEDGE_SOURCE_NOT_CONNECTED } from "@/lib/intelligence-os/knowledge-source-contract";

function readSource(relativePath: string): string {
  return readFileSync(join(process.cwd(), relativePath), "utf-8");
}

test("1. BUILD-026 i18n present in all four languages", () => {
  for (const dict of [en, uz, ru, tr]) {
    assert.ok(dict.knowledgeBrain.eyebrow);
    assert.ok(dict.researchTopicCompletion.openQuestionsTitle);
    assert.ok(dict.universalIntent.categoryStartMission);
    assert.ok(dict.researchTopicCompletion.experimentLimitationFallback);
  }
});

test("2. resolveMissionKnowledgeExplanation returns categorical buckets without numeric confidence", () => {
  const explanation = resolveMissionKnowledgeExplanation(null);
  assert.equal(explanation.ref, null);
  assert.ok("known" in explanation.primary);
  assert.ok("unknown" in explanation.primary);
  assert.ok("conflict" in explanation.primary);
  assert.ok("needs_review" in explanation.primary);
  assert.equal(explanation.sources.length, 0);
});

test("3. resolveUniversalIntent uses same resolver as typing — no separate voice path", () => {
  const intent = resolveUniversalIntent("Continue research");
  assert.ok(intent.command);
  assert.notEqual(intent.category, "unrecognized");
  assert.ok(intentCategoryTranslationKey(intent.category).startsWith("universalIntent."));
});

test("4. Knowledge source contract stays honest about external connections", () => {
  assert.ok(KNOWLEDGE_SOURCE_NOT_CONNECTED.includes("not connected"));
});

test("5. KnowledgeBrainPanel wired to EvidenceExplorer and UniversalInspector", () => {
  const evidence = readSource("components/evidence/EvidenceExplorer.tsx");
  const inspector = readSource("components/operating/UniversalInspector.tsx");
  assert.match(evidence, /KnowledgeBrainPanel/);
  assert.match(inspector, /KnowledgeBrainPanel/);
});

test("6. AssistantCommandCenter routes through resolveUniversalIntent", () => {
  const command = readSource("components/assistant/AssistantCommandCenter.tsx");
  assert.match(command, /resolveUniversalIntent/);
  assert.match(command, /intentCategoryTranslationKey/);
});

test("7. Research completion panels use researchTopicCompletion i18n", () => {
  for (const file of [
    "components/research/topic/OpenResearchQuestions.tsx",
    "components/research/topic/NegativeResultsOverview.tsx",
    "components/research/topic/ResearchEvidenceReadiness.tsx",
    "components/research/topic/ResearchTopicReportView.tsx",
  ]) {
    const src = readSource(file);
    assert.match(src, /researchTopicCompletion\./);
  }
});

test("8. IntelligenceCanvas thinking desk for primaryActionOnly active mission", () => {
  const canvas = readSource("components/canvas/IntelligenceCanvas.tsx");
  assert.match(canvas, /primaryActionOnly/);
  assert.match(canvas, /KnowledgeBrainPanel/);
});
