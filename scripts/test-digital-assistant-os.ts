/**
 * Digital Assistant platform OS layer smoke tests.
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import { resolveAssistantCommand } from "../lib/assistant/assistant-commands.ts";
import { detectCompareIntent, detectOpenSearchIntent } from "../lib/voice-operator/os/open-search.ts";
import { detectSourceAwarenessIntent } from "../lib/voice-operator/os/source-awareness.ts";
import { detectSmartSummaryIntent } from "../lib/voice-operator/os/smart-summaries.ts";
import { detectMissionCoachIntent } from "../lib/voice-operator/os/mission-coach.ts";
import { buildAssistantOsContext } from "../lib/voice-operator/os/session-context.ts";
import { buildProactiveSuggestions } from "../lib/voice-operator/os/proactive-suggestions.ts";
import { buildVoiceOperatorInstructions } from "../lib/voice-operator/instructions.ts";
import { resolveDigitalAssistantOsIntent } from "../lib/voice-operator/os/index.ts";

test("global module commands resolve", () => {
  for (const phrase of [
    "Open Countries",
    "Open Companies",
    "Open Universities",
    "Open Research",
    "Open Evidence",
    "Open Reports",
    "Open Governance",
    "Open Trust",
  ]) {
    const match = resolveAssistantCommand(phrase);
    assert.ok(match, phrase);
    assert.ok(match.href.startsWith("/"), phrase);
  }
});

test("open United States and search Apple / Stanford", () => {
  const usa = detectOpenSearchIntent("Open United States");
  assert.equal(usa?.href, "/countries?country=usa");
  const apple = detectOpenSearchIntent("Search Apple");
  assert.ok(apple?.href.includes("/companies"));
  const stanford = detectOpenSearchIntent("Search Stanford");
  assert.ok(stanford?.href.includes("/universities"));
});

test("compare USA and Japan", () => {
  const result = detectCompareIntent("Compare USA and Japan");
  assert.ok(result?.href.includes("country=usa"));
  assert.ok(result?.href.includes("compare=japan"));
});

test("source awareness explains coverage without inventing", () => {
  const result = detectSourceAwarenessIntent("Show official sources and evidence coverage");
  assert.ok(result);
  assert.match(result!.assistantText, /Connected sources/);
  assert.match(result!.assistantText, /Confidence/);
  assert.doesNotMatch(result!.assistantText, /\b98%\s+confidence\b/i);
});

test("smart investor summary uses architecture honesty", () => {
  const result = detectSmartSummaryIntent("Generate investor report", null, {
    countryName: null,
    companyName: null,
    universityName: null,
    missionProblem: null,
    researchTopicId: null,
    pathname: "/",
    summary: "No entity selected yet",
    organizationName: null,
    workspaceId: null,
    pendingApprovals: 0,
    unreadNotifications: 0,
    assignedReviews: 0,
    unreadMentions: 0,
  });
  assert.ok(result);
  assert.equal(result!.kind, "investor");
  assert.match(result!.assistantText, /not invent/i);
});

test("mission coach lists human approval step", () => {
  const result = detectMissionCoachIntent("Mission coach step by step");
  assert.ok(result);
  assert.match(result!.assistantText, /Human approval/);
});

test("proactive suggestions stay minimal", () => {
  const os = buildAssistantOsContext(null, "/");
  const suggestions = buildProactiveSuggestions(os);
  assert.ok(suggestions.length <= 3);
});

test("OS intent resolves generate executive summary", () => {
  const result = resolveDigitalAssistantOsIntent("Generate executive summary", null, "/");
  assert.ok(result);
  assert.equal(result!.href, "/reports");
});

test("instructions describe operating layer", () => {
  const text = buildVoiceOperatorInstructions("en");
  assert.match(text, /operating layer/i);
  assert.match(text, /Governance/);
  assert.match(text, /Mission coach/);
});
