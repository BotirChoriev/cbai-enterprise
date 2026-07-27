import assert from "node:assert/strict";
import test from "node:test";
import { resolvePlatformIntent } from "@/lib/platform-actions/intent-matcher";
import { resolvePlatformActionFromIntent } from "@/lib/platform-actions/resolve-platform-action";
import {
  hrefForAction,
  isAllowedNavigationHref,
} from "@/lib/platform-actions/registry";
import { classifyVoiceActionLevel } from "@/lib/voice-operator/identity/action-levels";
import { requiresConfirmation } from "@/lib/voice-operator/commands/voice-command-policy";
import { buildProblemVoiceSummary } from "@/lib/problems/problem-voice-summary";
import { problemBriefFromConfirmedCard } from "@/lib/problems/problem-lifecycle";
import { buildStarterWorkCard } from "@/lib/activation/starter-work-card";

test("voice can navigate to the canonical Problem Space", () => {
  const intent = resolvePlatformIntent("Muammo maydonini och", "uz");
  assert.equal(intent?.actionId, "navigate.problems");
  assert.equal(hrefForAction("navigate.problems", {}), "/problems");
  assert.equal(isAllowedNavigationHref("/problems"), true);
  assert.equal(classifyVoiceActionLevel("navigate.problems"), 1);
  assert.equal(requiresConfirmation("navigate.problems"), false);
});

test("voice problem creation reuses Starter Work Card and existing confirmation pipeline", () => {
  const statement = "Yangi muammo och: ishlab chiqarishdagi to'xtashlarni kamaytirish kerak.";
  const intent = resolvePlatformIntent(statement, "uz");
  assert.equal(intent?.actionId, "problem.compose");

  const result = resolvePlatformActionFromIntent(intent!, {
    locale: "uz",
    pathname: "/",
    missionId: null,
    projectId: null,
    originalText: statement,
  });

  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.ok(result.mutation);
  assert.equal(result.mutation?.draft.provenance.source, "voice_command");
  assert.equal(result.mutation?.draft.activation?.schema, 1);
  assert.equal(
    (result.mutation?.draft.activation?.card as { createdVia?: string }).createdVia,
    "activation",
  );
  assert.equal(result.mutation?.draft.humanApprovalRequired, true);
  assert.equal(classifyVoiceActionLevel("problem.compose"), 2);
  assert.equal(requiresConfirmation("problem.compose"), true);
});

test("problem voice draft preserves the exact spoken statement as provenance", () => {
  const statement = "Open a problem: supplier delays are creating production risk.";
  const intent = resolvePlatformIntent(statement, "en")!;
  const result = resolvePlatformActionFromIntent(intent, {
    locale: "en",
    pathname: "/companies",
    missionId: null,
    projectId: null,
    originalText: statement,
  });

  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.mutation?.draft.sourceCommand, statement);
  assert.equal(result.mutation?.draft.provenance.originalText, statement);
  assert.equal(result.mutation?.draft.provenance.routePath, "/companies");
});

test("read-only voice summary exposes recorded state and preserves the human boundary", () => {
  const card = buildStarterWorkCard({
    text: "Supplier delays are creating production risk.",
    locale: "en",
    source: "voice_command",
    route: "/problems",
  });
  const problem = problemBriefFromConfirmedCard(card, "op-summary", "2026-01-01T00:00:00.000Z");
  const summary = buildProblemVoiceSummary(problem, "en");

  assert.match(summary, /Supplier delays/);
  assert.match(summary, /Open unknowns:/);
  assert.match(summary, /final decision remains human/i);

  const intent = resolvePlatformIntent("Summarize this problem", "en");
  assert.equal(intent?.actionId, "problem.read_summary");
  assert.equal(resolvePlatformIntent("Read problem summary", "en")?.actionId, "problem.read_summary");
  assert.equal(resolvePlatformIntent("Summarize the current problem", "en")?.actionId, "problem.read_summary");
  assert.equal(classifyVoiceActionLevel("problem.read_summary"), 1);
  assert.equal(requiresConfirmation("problem.read_summary"), false);
});
