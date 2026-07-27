/**
 * Preview Completion — focused regression suite for trust tiers, storage, visibility, SF-1 origin.
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  mayAccessPersonalCabinet,
  mayAccessTeamCollaboration,
  mayStartCloudObjectUpload,
  trustTierFromAccountMode,
} from "@/lib/canonical-contracts/trust-tiers";
import { STAGE2_STORE_INVENTORY } from "@/lib/canonical-contracts/stage2-store-inventory";
import { SECURITY_FREEZE_BLOCKERS } from "@/lib/canonical-contracts/trust";
import { mayClaimReady, sanitizeUploadFileName, OBJECT_STORAGE_RULES } from "@/lib/object-storage/contracts";
import { attachmentVisibility, mayFinalizeVisibilityChange, VISIBILITY_DEFAULT } from "@/lib/visibility/policy";
import { isAllowedNavigationHref } from "@/lib/platform-actions/registry";
import { resolvePlatformIntent } from "@/lib/platform-actions/intent-matcher";
import { resolveVoiceCommandFromText } from "@/lib/voice-operator/commands";
import {
  handleVoiceSessionBrokerRequest,
  resolveRequestOrigin,
  resetVoiceBrokerRateLimitForTests,
} from "@/lib/voice-operator/session-broker/pages-voice-session-broker";
import { createScientificIntakeDraft, scientificIntakeMayClaimReady } from "@/lib/scientific-intake/scientific-intake";
import { newCorrelationId, recordObservability, setObservabilityAdapter } from "@/lib/observability/contracts";

test("trust tiers: device-local is not team authority", () => {
  assert.equal(trustTierFromAccountMode("signed-out"), "guest");
  assert.equal(trustTierFromAccountMode("device-local"), "device_local");
  assert.equal(mayAccessTeamCollaboration("device-local"), false);
  assert.equal(mayAccessTeamCollaboration("cloud"), true);
  assert.equal(mayAccessPersonalCabinet("device-local"), true);
  assert.equal(mayStartCloudObjectUpload("device-local"), false);
  assert.equal(mayStartCloudObjectUpload("cloud"), true);
});

test("SF-1 remains production blocker even with Origin+rate-limit mitigations", () => {
  const sf1 = SECURITY_FREEZE_BLOCKERS.find((b) => b.id === "SF-1");
  assert.ok(sf1);
  assert.equal(sf1?.productionBlocker, true);
});

test("broker Origin header required — body-only rejected", () => {
  const req = new Request("https://x", { method: "POST" });
  assert.equal(resolveRequestOrigin(req, "http://localhost:3000"), null);
  const withHeader = new Request("https://x", {
    method: "POST",
    headers: { Origin: "http://localhost:3000" },
  });
  assert.equal(resolveRequestOrigin(withHeader, "http://localhost:3000"), "http://localhost:3000");
});

test("broker soft rate limit returns 429", async () => {
  resetVoiceBrokerRateLimitForTests();
  const env = {
    OPENAI_API_KEY: "sk-test-server-key-not-real",
    VOICE_ALLOWED_ORIGINS: "http://localhost:3000",
  };
  const fetchFn = async () =>
    new Response(
      JSON.stringify({
        value: "ek_test",
        expires_at: 1_700_000_000,
        session: { id: "s1", model: "gpt-realtime" },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  let lastStatus = 0;
  for (let i = 0; i < 31; i++) {
    const res = await handleVoiceSessionBrokerRequest(
      new Request("https://cbai.example/api/voice/session", {
        method: "POST",
        headers: { "Content-Type": "application/json", Origin: "http://localhost:3000" },
        body: JSON.stringify({ language: "uz", origin: "http://localhost:3000" }),
      }),
      env,
      { fetchFn: fetchFn as typeof fetch },
    );
    lastStatus = res.status;
  }
  assert.equal(lastStatus, 429);
  resetVoiceBrokerRateLimitForTests();
});

test("navigation allowlist rejects protocol-relative and schemes", () => {
  assert.equal(isAllowedNavigationHref("//evil.example"), false);
  assert.equal(isAllowedNavigationHref("javascript:alert(1)"), false);
  assert.equal(isAllowedNavigationHref("data:text/html,hi"), false);
  assert.equal(isAllowedNavigationHref("/research"), true);
});

test("required UZ navigation phrases resolve allowlisted routes", () => {
  const cases: Array<[string, string | RegExp]> = [
    ["Tadqiqotni och", "/research"],
    ["Kimyo sahifasini och", /\/research\?.*chemistry/],
    ["Dalillarni ko'rsat", "/knowledge"],
    ["Mening ishlarimga olib bor", "/my-work"],
    ["Mamlakatlarni och", "/countries"],
    ["Jamoalarimni och", "/teams"],
    ["Fayl yuklash joyini och", "/files"],
    ["Ovoz operatorini to'xtat", "voice.stop"],
  ];
  for (const [text, expected] of cases) {
    const res = resolveVoiceCommandFromText(text, "uz");
    if (expected === "voice.stop") {
      assert.equal(res.action?.actionId, "voice.stop", text);
    } else if (typeof expected === "string") {
      assert.equal(res.action?.target.href, expected, text);
    } else {
      assert.match(res.action?.target.href ?? "", expected, text);
    }
  }
});

test("vague open page clarifies instead of inventing a route", () => {
  const intent = resolvePlatformIntent("sahifani och", "uz");
  assert.ok(intent);
  assert.equal(intent?.confidence, "low");
  assert.equal(intent?.clarifyQuestionKey, "platformAction.clarifyOpenPage");
});

test("object storage never claims ready without clean scan", () => {
  assert.equal(OBJECT_STORAGE_RULES.noLocalStoragePayloads, true);
  assert.equal(mayClaimReady("ready", "clean"), true);
  assert.equal(mayClaimReady("ready", "not_configured"), false);
  assert.equal(mayClaimReady("uploaded", "clean"), false);
  assert.equal(sanitizeUploadFileName("../evil.pdf"), ".._evil.pdf");
});

test("scientific intake draft does not claim ready", () => {
  const draft = createScientificIntakeDraft({ createdLocale: "uz", title: "PhD" });
  assert.equal(draft.status, "draft");
  assert.equal(scientificIntakeMayClaimReady(draft), false);
  assert.equal(draft.objectId, null);
});

test("visibility default private; public requires confirmation + rights", () => {
  assert.equal(VISIBILITY_DEFAULT, "private");
  assert.equal(
    mayFinalizeVisibilityChange({
      from: "private",
      to: "public",
      includeAttachments: false,
      rightsConfirmed: false,
      consentConfirmed: false,
      licenseSelected: false,
      humanConfirmed: true,
    }).ok,
    false,
  );
  assert.equal(
    mayFinalizeVisibilityChange({
      from: "private",
      to: "public",
      includeAttachments: false,
      rightsConfirmed: true,
      consentConfirmed: true,
      licenseSelected: true,
      humanConfirmed: true,
    }).ok,
    true,
  );
  assert.equal(attachmentVisibility("team", "public"), "team");
  assert.equal(attachmentVisibility("public", "private"), "private");
});

test("stage 2 store inventory has single platform-actions owner", () => {
  const owners = STAGE2_STORE_INVENTORY.filter((e) => e.canonicalOwner === "platform-actions");
  assert.equal(owners.length, 1);
  assert.ok(STAGE2_STORE_INVENTORY.some((e) => e.canonicalOwner === "quarantined-collaboration"));
});

test("observability adapter does not require vendor", () => {
  const seen: string[] = [];
  setObservabilityAdapter({
    record(event) {
      seen.push(event.code);
      assert.ok(!event.message.includes("sk-"));
    },
  });
  recordObservability({
    correlationId: newCorrelationId(),
    environment: "test",
    category: "broker_error",
    routeOrActionId: "voice.session",
    actorCategory: "guest",
    code: "origin_blocked",
    message: "origin blocked",
    at: new Date().toISOString(),
  });
  assert.deepEqual(seen, ["origin_blocked"]);
});
