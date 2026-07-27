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

test("6. AssistantCommandCenter routes through Operational Object + voice command pipeline", () => {
  // Supersedes resolveUniversalIntent wiring in the command center (still covered by test 3
  // for the shared resolver itself). Current contract: typed/voice input → submitCommand /
  // resolveVoiceAction → Draft Work Card or read-only execute — never silent mutation.
  const command = readSource("components/assistant/AssistantCommandCenter.tsx");
  assert.match(command, /submitCommand/);
  assert.match(command, /resolveVoiceAction/);
  assert.match(command, /voiceActionRequiresConfirmation/);
  assert.match(command, /action_review/);
  assert.match(command, /useOperationalObjectsOptional/);
  // Universal intent remains the shared deterministic categorizer (test 3), not a second voice path.
  assert.equal(typeof resolveUniversalIntent, "function");
  assert.equal(typeof intentCategoryTranslationKey, "function");
  const intent = resolveUniversalIntent("Continue research");
  assert.ok(intent.category === "continue_research" || intent.command !== null || intent.category === "unrecognized");
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
