/**
 * Final Intelligence OS screenshot capture.
 * Run: node scripts/verify-final-intelligence-os.mjs
 * Requires: npm run dev (or dev:voice) at CBAI_VERIFY_BASE
 */
import { chromium, devices } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.CBAI_VERIFY_BASE ?? "http://localhost:3000";
const OUT = join(process.cwd(), "docs/verification/final-intelligence-os/final");
mkdirSync(OUT, { recursive: true });

async function waitForTheme(page, light = false) {
  await page.evaluate((isLight) => {
    document.documentElement.classList.toggle("theme-light", isLight);
    localStorage.setItem("cbai-theme", isLight ? "light" : "dark");
  }, light);
  await page.waitForTimeout(200);
}


async function capture(page, name) {
  const path = join(OUT, name);
  await page.screenshot({ path, fullPage: false });
  return path;
}

async function openVoiceDock(page) {
  const btn = page.getByRole("button", { name: /open voice|ovoz operator|ses operat/i }).first();
  if (await btn.count()) {
    await btn.click();
    await page.waitForTimeout(600);
    return;
  }
  const fallback = page.locator(".cbai-spatial-voice-cta, .cbai-voice-dock-closed button").first();
  if (await fallback.count()) {
    await fallback.click();
    await page.waitForTimeout(600);
  }
}

const routes = [
  ["home", "/", false],
  ["my-work", "/my-work", false],
  ["search", "/search", false],
  ["research", "/research", false],
  ["research-topic", "/research/microbiology", false],
  ["research-canvas", "/research/canvas", false],
  ["evidence", "/knowledge", false],
  ["countries", "/countries", false],
  ["country-detail", "/countries?country=uzbekistan", false],
  ["companies", "/companies", false],
  ["company-detail", "/companies?company=apple", false],
  ["universities", "/universities", false],
  ["university-detail", "/universities?university=harvard-university", false],
  ["reports", "/reports", false],
  ["trust", "/trust", false],
  ["investor", "/investor", false],
  ["governance", "/governance", false],
  ["graph", "/graph", false],
  ["settings", "/settings", false],
  ["about", "/about", false],
  ["composer", "/my-work?compose=1", false],
];

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
const captured = [];

for (const [slug, route, light] of routes) {
  for (const theme of light ? ["light"] : ["dark", "light"]) {
    await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
    await waitForTheme(page, theme === "light");
    if (slug === "home") {
      await page.waitForSelector(".cbai-intelligence-globe canvas, .cbai-globe-fallback", { timeout: 12000 }).catch(() => {});
      await page.waitForTimeout(600);
    }
    if (slug === "settings") {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(200);
    }
    await capture(page, `desktop-${theme}-${slug}.png`);
    captured.push(`desktop-${theme}-${slug}.png`);
    console.log("captured", `desktop-${theme}-${slug}.png`);
  }
}

await page.goto(`${BASE}/research`, { waitUntil: "networkidle" });
await openVoiceDock(page);
await capture(page, "desktop-dark-voice-open.png");
captured.push("desktop-dark-voice-open.png");
console.log("captured", "desktop-dark-voice-open.png");

await page.goto(`${BASE}/research`, { waitUntil: "networkidle" });
await capture(page, "desktop-dark-voice-closed.png");
captured.push("desktop-dark-voice-closed.png");
console.log("captured", "desktop-dark-voice-closed.png");

const mobile = await browser.newContext({ ...devices["iPhone 13"] });
const mpage = await mobile.newPage();
for (const [slug, route] of [
  ["home", "/"],
  ["my-work", "/my-work"],
  ["research", "/research"],
  ["evidence", "/knowledge"],
  ["settings", "/settings"],
  ["countries", "/countries"],
]) {
  await mpage.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
  await mpage.screenshot({ path: join(OUT, `mobile-${slug}.png`), fullPage: false });
  captured.push(`mobile-${slug}.png`);
  console.log("captured", `mobile-${slug}.png`);
}

for (const [locale, slug, route] of [
  ["en", "home", "/"],
  ["uz", "countries", "/countries"],
  ["ru", "research", "/research"],
  ["tr", "settings", "/settings"],
]) {
  const locCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await locCtx.addInitScript((lang) => {
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
  const locPage = await locCtx.newPage();
  await locPage.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
  await locPage.waitForFunction((lang) => document.documentElement.lang === lang, locale, { timeout: 8000 });
  await capture(locPage, `locale-${locale}-${slug}.png`);
  captured.push(`locale-${locale}-${slug}.png`);
  console.log("captured", `locale-${locale}-${slug}.png`);
  await locCtx.close();
}

writeFileSync(join(OUT, "manifest.json"), JSON.stringify({ captured, base: BASE, at: new Date().toISOString() }, null, 2));

await browser.close();
console.log(`\nSaved ${captured.length} screenshots to ${OUT}`);
