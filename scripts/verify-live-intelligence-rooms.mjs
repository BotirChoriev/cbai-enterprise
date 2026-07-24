/**
 * Live Intelligence Rooms visual verification.
 * Run after app is up:
 *   CBAI_VERIFY_BASE=http://localhost:3000 PLAYWRIGHT_BROWSERS_PATH=$HOME/Library/Caches/ms-playwright \
 *   node scripts/verify-live-intelligence-rooms.mjs
 */
import { chromium, devices } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.CBAI_VERIFY_BASE ?? "http://localhost:3000";
const OUT = join(process.cwd(), "docs/verification/live-intelligence-rooms");
mkdirSync(OUT, { recursive: true });

const captured = [];

async function setLocale(page, locale) {
  await page.evaluate((lang) => {
    const profile = {
      name: "",
      avatar: "orb",
      voiceInputEnabled: true,
      preferredLanguage: lang,
      translationLanguage: lang,
      speechLanguage: lang,
      workspaceRole: "researcher",
      timezone: "UTC",
      country: "",
      organization: "",
      notifications: { evidenceUpdates: false, missionActivity: false, weeklySummary: false },
      accessibility: { reducedMotion: false, highContrast: false, largerText: false },
      themeMode: "dark",
      displayDensity: "standard",
    };
    localStorage.setItem("cbai-assistant-profile:local", JSON.stringify(profile));
    localStorage.setItem("cbai-locale", lang);
    localStorage.setItem("cbai-language", lang);
  }, locale);
}

async function setTheme(page, light) {
  await page.evaluate((isLight) => {
    document.documentElement.classList.toggle("theme-light", isLight);
    localStorage.setItem("cbai-theme", isLight ? "light" : "dark");
  }, light);
}

async function shot(page, name) {
  const path = join(OUT, name);
  await page.screenshot({ path, fullPage: false });
  captured.push(name);
  return path;
}

async function seedRoom(page, roomType = "meeting_hall") {
  return page.evaluate((type) => {
    const key =
      Object.keys(localStorage).find((k) => k.startsWith("cbai-live-intelligence-rooms")) ||
      "cbai-live-intelligence-rooms:local";
    const now = new Date().toISOString();
    const hostId = "host-verify-1";
    const roomId = `room-verify-${type}`;
    const room = {
      schemaVersion: 1,
      roomId,
      roomType: type,
      title: type === "laboratory" ? "Lab verify" : type === "practice" ? "Practice verify" : type === "collaboration" ? "Collab verify" : "Meeting verify",
      description: "",
      objective: "Visual acceptance seed",
      lifecycle: "ready",
      connectionState: "ready",
      operationalObjectIds: [],
      relatedEntities: [],
      sourceRoute: "/rooms",
      hostParticipantId: hostId,
      participants: [
        {
          id: hostId,
          displayName: "Host",
          kind: "human",
          role: "host",
          speakLocale: "uz",
          readLocale: "uz",
          hearLocale: "en",
          hearTranslatedAudio: false,
          joinedAt: now,
          leftAt: null,
        },
        {
          id: "sim-en",
          displayName: "EN listener (simulated)",
          kind: "ai_simulated",
          role: "ai_simulated",
          speakLocale: "en",
          readLocale: "en",
          hearLocale: "en",
          hearTranslatedAudio: false,
          joinedAt: now,
          leftAt: null,
        },
      ],
      activeSpeakerParticipantId: hostId,
      agenda: [{ id: "a1", title: "Open evidence", done: false }],
      glossary: [
        {
          id: "g1",
          term: "CRISPR",
          preferredTranslations: {},
          doNotTranslate: true,
          definition: "Preserve original",
        },
      ],
      transcript: [
        {
          id: "t1",
          speakerParticipantId: hostId,
          originalText: "Dalillar panelini oching",
          originalLocale: "uz",
          translatedVariants: { en: "Open the evidence panel" },
          translationStatus: "translated",
          translationUncertainty: null,
          createdAt: now,
        },
      ],
      questions: [{ id: "q1", text: "Clarify CRISPR retention?", locale: "en", resolved: false, createdAt: now }],
      decisions: [
        {
          id: "d1",
          text: "Keep CRISPR untranslated until review",
          requiresHumanConfirmation: true,
          confirmed: false,
          createdAt: now,
        },
      ],
      actionItems: [],
      evidenceRefs: [{ id: "e1", label: "Country registry", href: "/countries", note: null }],
      laboratory:
        type === "laboratory"
          ? {
              hypothesis: null,
              method: null,
              variables: [],
              observations: [],
              uncertainties: [],
              contradictions: [],
              safetyNotes: "CBAI does not perform physical laboratory work.",
            }
          : null,
      practice:
        type === "practice"
          ? { scenario: "Thesis defence rehearsal", feedbackNotes: [], aiParticipantsLabeled: true }
          : null,
      consent: {
        recordingAllowed: false,
        translationAudioAllowed: false,
        retentionDays: 30,
        acknowledgedAt: now,
        policyVersion: "live-rooms-consent-v1",
      },
      multiPartyTransportAvailable: false,
      multiPartyTransportLabel: "EXTERNAL_BLOCKED",
      createdLocale: "uz",
      contentLocale: "uz",
      createdAt: now,
      updatedAt: now,
      startedAt: null,
      endedAt: null,
    };
    localStorage.setItem(key, JSON.stringify((() => {
      const existing = (() => {
        try {
          const raw = localStorage.getItem(key);
          const parsed = raw ? JSON.parse(raw) : [];
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      })().filter((r) => r && r.roomId !== roomId);
      return [room, ...existing];
    })()));
    return roomId;
  }, roomType);
}

const browser = await chromium.launch();
const desktop = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
const page = await desktop.newPage();

await page.goto(`${BASE}/rooms`, { waitUntil: "load", timeout: 60000 });
await setTheme(page, false);
await setLocale(page, "en");
await page.reload({ waitUntil: "load", timeout: 60000 });
await shot(page, "desktop-1920-rooms-list-en-dark.png");

await page.getByRole("button", { name: /meeting hall|yig‘ilish|зал|toplantı/i }).first().click().catch(() => {});
await shot(page, "desktop-1920-rooms-create-consent-en-dark.png");

const meetingId = await seedRoom(page, "meeting_hall");
await page.goto(`${BASE}/rooms/session?id=${encodeURIComponent(meetingId)}`, { waitUntil: "load", timeout: 60000 });
await shot(page, "desktop-1920-meeting-idle-en-dark.png");

await page.getByRole("button", { name: /start session|seansni boshlash|начать|oturumu başlat/i }).first().click().catch(() => {});
await page.waitForTimeout(400);
await shot(page, "desktop-1920-meeting-live-translated-en-dark.png");

await page.evaluate(() => {
  const details = [...document.querySelectorAll("details")];
  for (const d of details) d.open = true;
});
await shot(page, "desktop-1920-meeting-glossary-evidence-en-dark.png");

await page.getByRole("button", { name: /end session|seansni tugatish|завершить|oturumu bitir/i }).first().click().catch(() => {});
await page.waitForTimeout(400);
await shot(page, "desktop-1920-meeting-post-session-proposals-en-dark.png");

const labId = await seedRoom(page, "laboratory");
await page.goto(`${BASE}/rooms/session?id=${encodeURIComponent(labId)}`, { waitUntil: "load", timeout: 60000 });
await shot(page, "desktop-1920-laboratory-en-dark.png");

const practiceId = await seedRoom(page, "practice");
await page.goto(`${BASE}/rooms/session?id=${encodeURIComponent(practiceId)}`, { waitUntil: "load", timeout: 60000 });
await shot(page, "desktop-1920-practice-en-dark.png");

const collabId = await seedRoom(page, "collaboration");
await page.goto(`${BASE}/rooms/session?id=${encodeURIComponent(collabId)}`, { waitUntil: "load", timeout: 60000 });
await shot(page, "desktop-1920-collaboration-en-dark.png");

await page.setViewportSize({ width: 1440, height: 900 });
await page.goto(`${BASE}/rooms`, { waitUntil: "load", timeout: 60000 });
await shot(page, "desktop-1440-rooms-list-en-dark.png");

await setTheme(page, true);
await page.reload({ waitUntil: "load", timeout: 60000 });
await shot(page, "desktop-1440-rooms-list-en-light.png");
await setTheme(page, false);

for (const [locale, slug] of [
  ["uz", "uz"],
  ["ru", "ru"],
  ["tr", "tr"],
]) {
  await setLocale(page, locale);
  await seedRoom(page, "meeting_hall");
  await page.goto(`${BASE}/rooms`, { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(700);
  await shot(page, `desktop-1440-rooms-list-${slug}-dark.png`);
  await page.goto(`${BASE}/rooms/session?id=${encodeURIComponent(meetingId)}`, {
    waitUntil: "load",
    timeout: 60000,
  });
  await page.waitForTimeout(900);
  await shot(page, `desktop-1440-meeting-${slug}-dark.png`);
}

await page.goto(`${BASE}/countries?country=uzbekistan`, { waitUntil: "load", timeout: 60000 });
await setLocale(page, "en");
await page.reload({ waitUntil: "load", timeout: 60000 });
await page.waitForTimeout(800);
await shot(page, "desktop-1440-country-live-rooms-panel-en-dark.png");

const mobile = await browser.newContext({
  ...devices["iPhone 12"],
  viewport: { width: 390, height: 844 },
});
const mpage = await mobile.newPage();
await mpage.goto(`${BASE}/rooms`, { waitUntil: "load", timeout: 60000 });
await setTheme(mpage, false);
await setLocale(mpage, "en");
await seedRoom(mpage, "meeting_hall");
await mpage.reload({ waitUntil: "load", timeout: 60000 });
await mpage.waitForTimeout(800);
await shot(mpage, "mobile-390-rooms-list-en-dark.png");
await mpage.goto(`${BASE}/rooms/session?id=${encodeURIComponent(meetingId)}`, {
  waitUntil: "load",
  timeout: 60000,
});
await mpage.waitForTimeout(900);
await shot(mpage, "mobile-390-meeting-en-dark.png");

await browser.close();

writeFileSync(
  join(OUT, "manifest.json"),
  JSON.stringify({ base: BASE, captured, at: new Date().toISOString() }, null, 2),
);
console.log(`\nSaved ${captured.length} screenshots to ${OUT}`);
