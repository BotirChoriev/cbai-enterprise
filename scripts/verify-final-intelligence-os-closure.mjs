/**
 * Final Intelligence OS Closure — screenshot capture (before or after).
 * Usage:
 *   CBAI_VERIFY_PHASE=before node scripts/verify-final-intelligence-os-closure.mjs
 *   CBAI_VERIFY_PHASE=after  node scripts/verify-final-intelligence-os-closure.mjs
 * Requires: npm run dev:voice at CBAI_VERIFY_BASE
 */
import { chromium, devices } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.CBAI_VERIFY_BASE ?? "http://localhost:3000";
const PHASE = process.env.CBAI_VERIFY_PHASE === "after" ? "after" : "before";
const OUT = join(process.cwd(), "docs/verification/final-intelligence-os-closure", PHASE);
mkdirSync(OUT, { recursive: true });

async function waitForTheme(page, light = false) {
  await page.evaluate((isLight) => {
    document.documentElement.classList.toggle("theme-light", isLight);
    localStorage.setItem("cbai-theme", isLight ? "light" : "dark");
  }, light);
  await page.waitForTimeout(250);
}

async function capture(page, name) {
  const path = join(OUT, name);
  await page.screenshot({ path, fullPage: false });
  return name;
}

async function openVoiceDock(page) {
  const btn = page.getByRole("button", { name: /speak to cbai|open voice|ovoz|ses operat/i }).first();
  if (await btn.count()) {
    await btn.click();
    await page.waitForTimeout(700);
    return;
  }
  const fallback = page.locator(".cbai-spatial-voice-cta, .cbai-voice-dock-closed button").first();
  if (await fallback.count()) {
    await fallback.click();
    await page.waitForTimeout(700);
  }
}

const routes = [
  ["home", "/"],
  ["my-work", "/my-work"],
  ["search", "/search"],
  ["research", "/research"],
  ["research-topic", "/research/microbiology"],
  ["evidence", "/evidence"],
  ["countries", "/countries"],
  ["country-detail", "/countries?country=uzbekistan"],
  ["companies", "/companies"],
  ["company-detail", "/companies?company=apple"],
  ["universities", "/universities"],
  ["university-detail", "/universities?university=harvard-university"],
  ["reports", "/reports"],
  ["trust", "/trust"],
  ["investor", "/investor"],
  ["government", "/government"],
  ["governance", "/governance"],
  ["graph", "/graph"],
  ["settings", "/settings"],
  ["about", "/about"],
  ["composer", "/my-work?compose=1"],
];

const browser = await chromium.launch();
const captured = [];

const desktop = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
const page = await desktop.newPage();

for (const [slug, route] of routes) {
  for (const theme of ["dark", "light"]) {
    if (theme === "light" && !["home", "research", "settings", "my-work", "reports"].includes(slug)) {
      continue;
    }
    await page.goto(`${BASE}${route}`, { waitUntil: "networkidle", timeout: 60000 });
    await waitForTheme(page, theme === "light");
    if (slug === "home") {
      await page.waitForSelector(".cbai-intelligence-globe canvas, .cbai-globe-fallback", { timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(800);
    }
    const name = `desktop-1920-${theme}-${slug}.png`;
    await capture(page, name);
    captured.push(name);
    console.log("captured", name);
  }
}

await page.setViewportSize({ width: 1440, height: 900 });
for (const [slug, route] of [
  ["home", "/"],
  ["research", "/research"],
  ["graph", "/graph"],
  ["government", "/government"],
  ["governance", "/governance"],
]) {
  await page.goto(`${BASE}${route}`, { waitUntil: "networkidle", timeout: 60000 });
  await waitForTheme(page, false);
  const name = `desktop-1440-dark-${slug}.png`;
  await capture(page, name);
  captured.push(name);
  console.log("captured", name);
}

await page.setViewportSize({ width: 1920, height: 1080 });
await page.goto(`${BASE}/research`, { waitUntil: "networkidle" });
await waitForTheme(page, false);
await capture(page, "desktop-dark-voice-closed.png");
captured.push("desktop-dark-voice-closed.png");
await openVoiceDock(page);
await capture(page, "desktop-dark-voice-open.png");
captured.push("desktop-dark-voice-open.png");
console.log("captured voice states");

const mobile = await browser.newContext({ ...devices["iPhone 13"] });
const mpage = await mobile.newPage();
for (const [slug, route] of [
  ["home", "/"],
  ["my-work", "/my-work"],
  ["research", "/research"],
  ["evidence", "/evidence"],
  ["settings", "/settings"],
  ["countries", "/countries"],
  ["government", "/government"],
]) {
  await mpage.goto(`${BASE}${route}`, { waitUntil: "networkidle", timeout: 60000 });
  const name = `mobile-${slug}.png`;
  await mpage.screenshot({ path: join(OUT, name), fullPage: false });
  captured.push(name);
  console.log("captured", name);
}
await openVoiceDock(mpage);
await mpage.screenshot({ path: join(OUT, "mobile-voice-dock.png"), fullPage: false });
captured.push("mobile-voice-dock.png");

for (const [locale, slug, route] of [
  ["en", "home", "/"],
  ["uz", "countries", "/countries"],
  ["ru", "research", "/research"],
  ["tr", "settings", "/settings"],
  ["uz", "about", "/about"],
]) {
  const locCtx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
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
  await locPage.goto(`${BASE}${route}`, { waitUntil: "networkidle", timeout: 60000 });
  await locPage.waitForFunction((lang) => document.documentElement.lang === lang, locale, { timeout: 10000 }).catch(() => {});
  const name = `locale-${locale}-${slug}.png`;
  await capture(locPage, name);
  captured.push(name);
  console.log("captured", name);
  await locCtx.close();
}

writeFileSync(
  join(OUT, "manifest.json"),
  JSON.stringify({ phase: PHASE, captured, base: BASE, at: new Date().toISOString() }, null, 2),
);

await desktop.close();
await mobile.close();
await browser.close();
console.log(`\nSaved ${captured.length} screenshots to ${OUT}`);
