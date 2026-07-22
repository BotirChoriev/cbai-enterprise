/**
 * Final product completion screenshot capture.
 * Run: node scripts/verify-final-product-completion.mjs
 * Requires: npm run dev (or dev:voice) at CBAI_VERIFY_BASE
 */
import { chromium, devices } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.CBAI_VERIFY_BASE ?? "http://localhost:3000";
const OUT = join(process.cwd(), "docs/verification/final-product-completion");
mkdirSync(OUT, { recursive: true });

async function waitForTheme(page, light = false) {
  await page.evaluate((isLight) => {
    document.documentElement.classList.toggle("theme-light", isLight);
    localStorage.setItem("cbai-theme", isLight ? "light" : "dark");
  }, light);
  await page.waitForTimeout(200);
}

async function setLocale(page, locale) {
  await page.evaluate((lang) => {
    const key = "cbai-assistant-profile";
    const raw = localStorage.getItem(key);
    const profile = raw ? JSON.parse(raw) : {};
    profile.preferredLanguage = lang;
    localStorage.setItem(key, JSON.stringify(profile));
  }, locale);
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(400);
}

async function capture(page, name) {
  const path = join(OUT, name);
  await page.screenshot({ path, fullPage: false });
  return path;
}

async function openVoiceDock(page) {
  const btn = page.getByRole("button", { name: /voice|ovoz/i }).first();
  if (await btn.count()) {
    await btn.click();
    await page.waitForTimeout(400);
  }
}

const desktopRoutes = [
  ["01-home-dark.png", "/", false],
  ["02-home-light.png", "/", true],
  ["03-research-dark.png", "/research", false],
  ["04-research-light.png", "/research", true],
  ["05-evidence-dark.png", "/knowledge", false],
  ["06-evidence-light.png", "/knowledge", true],
  ["07-reports-dark.png", "/reports", false],
  ["08-reports-light.png", "/reports", true],
  ["09-universities-dark.png", "/universities", false],
  ["10-universities-light.png", "/universities", true],
  ["11-settings-dark.png", "/settings", false],
  ["12-settings-light.png", "/settings", true],
  ["13-governance-dark.png", "/governance", false],
  ["14-governance-light.png", "/governance", true],
  ["15-countries-selected.png", "/countries?country=uzbekistan", false],
  ["16-graph-selected.png", "/graph", false],
  ["17-my-work.png", "/my-work", false],
  ["18-composer.png", "/my-work?compose=1", false],
  ["19-voice-not-configured.png", "/research", false],
  ["21-logo-dark.png", "/", false],
];

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();

for (const [file, route, light] of desktopRoutes) {
  await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
  await waitForTheme(page, light);
  if (file === "19-voice-not-configured.png") await openVoiceDock(page);
  if (file === "21-logo-dark.png") {
    await page.setViewportSize({ width: 1440, height: 900 });
  }
  await capture(page, file);
  console.log("captured", file);
}

await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
await waitForTheme(page, false);
await page.locator(".cbai-platform-sidebar").first().screenshot({ path: join(OUT, "21-logo-sidebar.png") });

const mobile = await browser.newContext({ ...devices["iPhone 13"] });
const mpage = await mobile.newPage();
const mobileRoutes = [
  ["22-mobile-home.png", "/"],
  ["23-mobile-research.png", "/research"],
  ["24-mobile-evidence.png", "/knowledge"],
  ["25-mobile-settings.png", "/settings"],
  ["26-mobile-my-work.png", "/my-work"],
  ["27-mobile-composer.png", "/my-work?compose=1"],
  ["28-mobile-voice-dock.png", "/research"],
  ["29-mobile-navigation.png", "/research"],
];

for (const [file, route] of mobileRoutes) {
  await mpage.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
  if (file === "28-mobile-voice-dock.png") await openVoiceDock(mpage);
  if (file === "29-mobile-navigation.png") {
    await mpage.getByRole("button", { name: /navigation|navigatsiya|gezinme/i }).click();
    await mpage.waitForTimeout(300);
  }
  await mpage.screenshot({ path: join(OUT, file), fullPage: false });
  console.log("captured", file);
}

for (const [file, route, locale] of [
  ["30-universities-uz.png", "/universities", "uz"],
  ["31-investor-uz.png", "/investor", "uz"],
  ["32-governance-uz.png", "/governance", "uz"],
  ["33-research-ru.png", "/research", "ru"],
  ["34-settings-tr.png", "/settings", "tr"],
]) {
  await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
  await setLocale(page, locale);
  await capture(page, file);
  console.log("captured", file);
}

await browser.close();
console.log(`\nSaved ${desktopRoutes.length + mobileRoutes.length + 6} screenshots to ${OUT}`);
