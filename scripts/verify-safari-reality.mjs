/**
 * Safari reality screenshot capture — post voice/localization fixes.
 * Run while npm run dev:voice is active.
 */
import { chromium, devices } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.CBAI_VERIFY_BASE ?? "http://localhost:3000";
const OUT = join(process.cwd(), "docs/verification/final-intelligence-os/safari-reality");
mkdirSync(OUT, { recursive: true });

async function primeLocale(page, locale) {
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
  }, locale);
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForFunction((lang) => document.documentElement.lang === lang, locale, { timeout: 8000 });
}

async function openVoiceDock(page) {
  const btn = page.getByRole("button", { name: /open voice|ovoz operator|ses operat/i }).first();
  if (await btn.count()) {
    await btn.click();
    await page.waitForTimeout(700);
  }
}

async function capture(page, name) {
  const path = join(OUT, name);
  await page.screenshot({ path, fullPage: false });
  console.log("captured", name);
  return path;
}

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
const captured = [];

await page.goto(`${BASE}/research`, { waitUntil: "networkidle" });
await openVoiceDock(page);
await capture(page, "voice-unavailable-or-ready.png");

await page.goto(`${BASE}/research`, { waitUntil: "networkidle" });
await openVoiceDock(page);
const mic = page.locator(".cbai-voice-dock-open button[aria-label]").last();
if (await mic.count()) {
  const disabled = await mic.isDisabled();
  if (!disabled) {
    await mic.click();
    await page.waitForTimeout(1200);
    await capture(page, "voice-connecting-or-listening.png");
  }
}

await primeLocale(page, "uz");
for (const [slug, route] of [
  ["country-detail", "/countries?country=uzbekistan"],
  ["company-detail", "/companies?company=apple"],
  ["university-detail", "/universities?university=harvard"],
]) {
  await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
  await capture(page, `uz-${slug}.png`);
  captured.push(`uz-${slug}.png`);
}

const mobile = await browser.newContext({ ...devices["iPhone 13"] });
const mpage = await mobile.newPage();
await mpage.goto(`${BASE}/settings`, { waitUntil: "networkidle" });
await mpage.screenshot({ path: join(OUT, "mobile-voice-dock-closed.png"), fullPage: false });
captured.push("mobile-voice-dock-closed.png");
console.log("captured", "mobile-voice-dock-closed.png");

writeFileSync(
  join(OUT, "manifest.json"),
  JSON.stringify({ captured, base: BASE, at: new Date().toISOString() }, null, 2),
);

await browser.close();
console.log(`\nSaved ${captured.length} safari-reality screenshots to ${OUT}`);
