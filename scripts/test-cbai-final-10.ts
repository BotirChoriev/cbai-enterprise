import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import {
  assertSourceClaimable,
  createUnavailableProvenance,
  resolveFreshnessStatus,
} from "@/lib/intelligence-os/source-provenance";
import {
  appendNotificationOnce,
  createNotificationDedupeKey,
  formatCountryTime,
} from "@/lib/notifications/verified-change-model";
import {
  canExportApprovedReport,
  isDuplicatePdf,
  validatePdfFile,
} from "@/lib/pdf-ingestion/local-pdf-ingestion";
import { isOperationalObjectType } from "@/lib/operational-objects/operational-object.types";
import { primaryNavSections, secondaryNavSections } from "@/lib/navigation";
import { resolveCanonicalVoiceState } from "@/lib/voice-operator/state-machine";
import { countries } from "@/lib/countries";
import { describeUpdateCapability } from "@/lib/notifications/verified-change-model";
import {
  findCountryTimeZone,
  isResolvableTimeZone,
  listCountryTimeZones,
} from "@/lib/notifications/country-timezones";
import {
  addWatch,
  clearWatchStoreForTests,
  isWatched,
  listVerifiedChangeEvents,
  listWatches,
  removeWatch,
} from "@/lib/notifications/watch-store";
import { getUpdatesCopy } from "@/lib/i18n/platform-copy-updates";
import { translateNavLabel } from "@/lib/i18n/nav-translation";
import { getDictionary, translate } from "@/lib/i18n/translate";

test("canonical IA exposes CORE Intelligence Operations Oversight System destinations", () => {
  // Final-product-finish DD-FPF-001: full product groups in primary; Advanced for extras.
  const items = primaryNavSections.flatMap((section) => section.items);
  const hrefs = items.map((item) => item.href);
  assert.ok(hrefs.includes("/"));
  assert.ok(hrefs.includes("/my-work"));
  assert.ok(hrefs.includes("/search"));
  assert.ok(hrefs.includes("/countries"));
  assert.ok(hrefs.includes("/companies"));
  assert.ok(hrefs.includes("/universities"));
  assert.ok(hrefs.includes("/research"));
  assert.ok(hrefs.includes("/evidence"));
  assert.ok(hrefs.includes("/graph"));
  assert.ok(hrefs.includes("/rooms"));
  assert.ok(hrefs.includes("/reports"));
  assert.ok(hrefs.includes("/investor"));
  assert.ok(hrefs.includes("/government"));
  assert.ok(hrefs.includes("/governance"));
  assert.ok(hrefs.includes("/trust"));
  assert.ok(hrefs.includes("/settings"));
  assert.ok(hrefs.includes("/about"));
  assert.equal(primaryNavSections.some((section) => section.title === "Intelligence"), true);
  assert.equal(primaryNavSections.some((section) => section.title === "Operations"), true);
  assert.equal(primaryNavSections.some((section) => section.title === "Oversight"), true);
  assert.equal(primaryNavSections.some((section) => section.title === "System"), true);
  const secondary = secondaryNavSections.flatMap((section) => section.items).map((item) => item.href);
  assert.ok(secondary.includes("/discover"), "Global Activity remains reachable via Advanced");
  assert.ok(secondaryNavSections.some((section) => section.title === "Advanced"));
});

test("canonical freshness never invents an unknown verification date", () => {
  assert.equal(resolveFreshnessStatus({ available: true, verifiedAt: null }), "verification_required");
  assert.equal(resolveFreshnessStatus({ available: false, verifiedAt: new Date().toISOString() }), "unavailable");
  assert.equal(
    resolveFreshnessStatus({
      available: true,
      verifiedAt: "2026-01-01T00:00:00.000Z",
      nextExpectedUpdate: "2026-02-01T00:00:00.000Z",
      now: new Date("2026-03-01T00:00:00.000Z"),
    }),
    "update_expected",
  );
});

test("unavailable provenance cannot be claimed as a used source", () => {
  const source = createUnavailableProvenance({
    id: "missing-feed",
    sourceOrganization: "Not configured",
    sourceTitle: "Licensed update feed",
    sourceType: "licensed_news",
    limitation: "No licensed feed is configured.",
  });
  assert.equal(source.freshness.verifiedAt, null);
  assert.equal(assertSourceClaimable(source), false);
});

test("verified-change notifications deduplicate deterministically", () => {
  const dedupeKey = createNotificationDedupeKey({
    watchId: "watch-1",
    eventType: "indicator_updated",
    sourceId: "source-1",
    newVerifiedValue: 42,
    effectiveAt: "2026-01-01",
  });
  const source = createUnavailableProvenance({
    id: "source-1",
    sourceOrganization: "Official office",
    sourceTitle: "Dataset",
    sourceType: "dataset",
    limitation: "Verification pending.",
  });
  const notification = {
    id: "notification-1",
    dedupeKey,
    watchId: "watch-1",
    eventType: "indicator_updated" as const,
    title: "Indicator updated",
    whatChanged: "A verified value changed.",
    oldVerifiedValue: 41,
    newVerifiedValue: 42,
    effectiveAt: "2026-01-01",
    detectedAt: "2026-01-02",
    verificationStatus: "human_review_required" as const,
    source,
    supportingEvidenceUrl: null,
    readAt: null,
    dismissedAt: null,
  };
  const once = appendNotificationOnce([], notification);
  assert.equal(appendNotificationOnce(once, notification), once);
});

test("country time uses IANA timezone rules and rejects invalid zones", () => {
  assert.match(formatCountryTime("Europe/Istanbul", "tr", new Date("2026-07-24T12:00:00Z")) ?? "", /2026/);
  assert.equal(formatCountryTime("Not/A_Zone", "en"), null);
});

test("PDF intake is PDF-only, bounded, deduplicated, and approval-gated", () => {
  assert.deepEqual(validatePdfFile({ name: "report.pdf", type: "application/pdf", size: 1024 }), { ok: true });
  assert.deepEqual(validatePdfFile({ name: "report.docx", type: "application/pdf", size: 1024 }), {
    ok: false,
    reason: "invalid_type",
  });
  assert.equal(isDuplicatePdf("abc", [{ checksumSha256: "abc" }]), true);
  assert.equal(
    canExportApprovedReport({
      reportTitle: "Evidence report",
      subject: "Country",
      generatedAt: "2026-07-24",
      coveragePeriod: null,
      evidenceStatus: "partial",
      sourceIds: [],
      limitations: ["No verified sources."],
      humanApprovalState: "approved",
      locale: "en",
    }),
    false,
  );
});

test("Operational Objects support the final common work types", () => {
  for (const type of [
    "meeting",
    "intelligence_room",
    "source_review",
    "country_watch",
    "indicator_watch",
    "pdf_review",
    "report_draft",
    "decision_review",
  ]) {
    assert.equal(isOperationalObjectType(type), true, type);
  }
});

test("Voice state classification preserves credential and quota root causes", () => {
  const base = { dockState: "error" as const, permissionIssue: null, textUsable: true };
  assert.equal(resolveCanonicalVoiceState({ ...base, brokerIssue: "invalid_api_key" }), "invalid_api_key");
  assert.equal(
    resolveCanonicalVoiceState({ ...base, brokerIssue: "quota_or_account_blocked" }),
    "quota_billing_unavailable",
  );
  assert.equal(resolveCanonicalVoiceState({ ...base, brokerIssue: "origin_blocked" }), "origin_blocked");
  assert.equal(resolveCanonicalVoiceState({ ...base, brokerIssue: "required" }), "text_fallback");
});

test("broker failures outrank stale live-mic flags so Listening never coexists with service errors", () => {
  // Honest classification: broker/network failures must not be relabeled as Listening
  // even if a stale micLive flag remains. Capture teardown is the provider's job;
  // the status label must never contradict the broker notice.
  const listeningWithBrokerDown = {
    dockState: "listening" as const,
    brokerIssue: "unreachable" as const,
    permissionIssue: null,
    textUsable: true,
  };
  assert.equal(
    resolveCanonicalVoiceState({ ...listeningWithBrokerDown, micLive: true }),
    "text_fallback",
  );
  assert.equal(
    resolveCanonicalVoiceState({ ...listeningWithBrokerDown, micLive: false }),
    "text_fallback",
  );
  assert.equal(
    resolveCanonicalVoiceState({
      dockState: "user_speaking",
      brokerIssue: "connection_failed",
      permissionIssue: null,
      textUsable: true,
      micLive: true,
    }),
    "webrtc_connection_failed",
  );
  // A credential or quota problem with no live capture still reports the real root cause.
  assert.equal(
    resolveCanonicalVoiceState({
      dockState: "listening",
      brokerIssue: "quota_or_account_blocked",
      permissionIssue: null,
      textUsable: true,
      micLive: false,
    }),
    "quota_billing_unavailable",
  );
  // Live mic without broker issue still maps to listening.
  assert.equal(
    resolveCanonicalVoiceState({
      dockState: "listening",
      brokerIssue: null,
      permissionIssue: null,
      textUsable: true,
      micLive: true,
    }),
    "listening",
  );
});

test("semantic design token roles are present", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  for (const token of [
    "--cbai-canvas",
    "--cbai-sidebar",
    "--cbai-topbar",
    "--cbai-solid-surface-role",
    "--cbai-glass-surface-role",
    "--cbai-inspector-surface",
    "--cbai-status-partial",
    "--cbai-status-missing",
    "--cbai-status-critical",
    "--cbai-status-source",
    "--cbai-status-live",
  ]) {
    assert.match(css, new RegExp(token));
  }
});

test("registered country time zones resolve through tzdb and disclose multi-zone countries", () => {
  const zones = listCountryTimeZones();
  assert.ok(zones.length > 0);
  for (const zone of zones) {
    assert.equal(isResolvableTimeZone(zone.capitalTimeZone), true, zone.countryId);
    assert.ok(
      countries.some((country) => country.id === zone.countryId),
      `${zone.countryId} must exist in the country registry`,
    );
    assert.match(
      formatCountryTime(zone.capitalTimeZone, "en", new Date("2026-07-24T12:00:00Z")) ?? "",
      /2026/,
    );
  }
  assert.equal(findCountryTimeZone("usa")?.multipleZones, true);
  assert.equal(findCountryTimeZone("uzbekistan")?.capitalTimeZone, "Asia/Tashkent");
  assert.equal(findCountryTimeZone("not-a-country"), null);
});

test("daylight saving comes from tzdb rules, never a stored offset", async () => {
  const source = await readFile(
    new URL("../lib/notifications/country-timezones.ts", import.meta.url),
    "utf8",
  );
  assert.ok(!/utcOffset|offsetMinutes/.test(source), "no stored offsets");
  const winter = formatCountryTime("Europe/Berlin", "en", new Date("2026-01-15T12:00:00Z")) ?? "";
  const summer = formatCountryTime("Europe/Berlin", "en", new Date("2026-07-15T12:00:00Z")) ?? "";
  assert.notEqual(winter, summer, "CET and CEST must render differently");
});

test("watch subscriptions are idempotent and removable without touching other records", () => {
  clearWatchStoreForTests();
  const first = addWatch({
    targetType: "country",
    targetId: "uzbekistan",
    targetLabel: "Uzbekistan",
    contentLocale: "uz",
  });
  const again = addWatch({
    targetType: "country",
    targetId: "uzbekistan",
    targetLabel: "Uzbekistan",
    contentLocale: "en",
  });
  assert.equal(again.id, first.id, "no duplicate creation");
  assert.equal(again.contentLocale, "uz", "stored content locale is preserved");
  assert.equal(listWatches().length, 1);
  assert.equal(first.pollingDisclosure, "manual_refresh");

  addWatch({ targetType: "report", targetId: "r-1", targetLabel: "Report", contentLocale: "en" });
  assert.equal(listWatches().length, 2);
  assert.equal(removeWatch(first.id), true);
  assert.equal(removeWatch(first.id), false);
  assert.equal(isWatched("country", "uzbekistan"), false);
  assert.equal(listWatches().length, 1, "unrelated watches survive");
  clearWatchStoreForTests();
});

test("no verified change is invented when no detection pipeline has run", () => {
  clearWatchStoreForTests();
  addWatch({ targetType: "country", targetId: "japan", targetLabel: "Japan", contentLocale: "en" });
  assert.deepEqual(listVerifiedChangeEvents(), []);
  assert.equal(
    describeUpdateCapability({ licensedFeedConfigured: false, pollingIntervalMinutes: null }),
    "manual_refresh_only",
  );
  clearWatchStoreForTests();
});

test("Global Updates copy has EN/UZ/RU/TR parity with no English leakage", () => {
  const en = getUpdatesCopy("en");
  const keys = Object.keys(en) as (keyof typeof en)[];
  for (const locale of ["uz", "ru", "tr"]) {
    const copy = getUpdatesCopy(locale);
    assert.deepEqual(Object.keys(copy), keys, locale);
    for (const key of keys) {
      assert.ok(copy[key].trim().length > 0, `${locale}.${key} is empty`);
      assert.notEqual(copy[key], en[key], `${locale}.${key} is untranslated English`);
    }
  }
  assert.deepEqual(getUpdatesCopy("de"), en, "unknown locale falls back to English, not blank copy");
});

test("the Global Updates route renders the real surface, not an empty placeholder", async () => {
  const page = await readFile(
    new URL("../app/(dashboard)/notifications/page.tsx", import.meta.url),
    "utf8",
  );
  assert.match(page, /GlobalUpdatesClient/);
  assert.ok(!/SimpleEmptyWorkspace/.test(page));

  const client = await readFile(
    new URL("../components/notifications/GlobalUpdatesClient.tsx", import.meta.url),
    "utf8",
  );
  for (const marker of [
    "data-update-capability",
    "data-country-clock",
    "data-updates-feed",
    "getUpdatesCopy",
    "IANA_TZDB_SOURCE_URL",
  ]) {
    assert.match(client, new RegExp(marker), marker);
  }
  assert.ok(!/Reuters|Bloomberg|breaking news/i.test(client), "no sample news content");
});

test("Global Updates is reachable once from navigation and labelled in every locale", () => {
  const entries = secondaryNavSections
    .flatMap((section) => section.items)
    .filter((entry) => entry.href === "/notifications");
  assert.equal(entries.length, 1, "exactly one navigation entry, no duplicate call to action");
  for (const locale of ["en", "uz", "ru", "tr"]) {
    const label = translateNavLabel(
      (path: string) => translate(getDictionary(locale), path),
      "/notifications",
      entries[0]!.label,
    );
    assert.ok(label.trim().length > 0, locale);
    assert.ok(!label.includes("navigation."), `${locale} leaked a raw dictionary key`);
  }
});

test("the voice dock classifies state through the single canonical state machine", async () => {
  const dock = await readFile(
    new URL("../components/voice-operator/VoiceOperatorDock.tsx", import.meta.url),
    "utf8",
  );
  assert.match(dock, /resolveCanonicalVoiceState/);
  assert.match(dock, /data-voice-state=\{canonicalState\}/);
  assert.match(dock, /data-mic-live=/, "mic indicator must reflect live tracks");
});
