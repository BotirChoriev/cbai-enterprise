/**
 * Final system completion screenshot capture (DD-001).
 * Run: node scripts/verify-final-system-completion.mjs [before|after]
 * Requires: npm run dev (or dev:voice) at CBAI_VERIFY_BASE
 */
import { chromium, devices } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.CBAI_VERIFY_BASE ?? "http://localhost:3000";
const phase = process.argv[2] === "before" ? "before" : "after";
const ROOT = join(process.cwd(), "docs/verification/final-system-completion");
const OUT = join(ROOT, phase);
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

const routes = [
  ["desktop-dark-home", "/", false],
  ["desktop-light-home", "/", true],
  ["desktop-dark-my-work", "/my-work", false],
  ["desktop-dark-knowledge", "/knowledge", false],
  ["desktop-dark-countries", "/countries", false],
  ["desktop-dark-research", "/research", false],
  ["desktop-dark-graph", "/graph", false],
  ["desktop-dark-reports", "/reports", false],
  ["desktop-dark-investor", "/investor", false],
  ["desktop-dark-government", "/government", false],
  ["desktop-dark-governance", "/governance", false],
  ["desktop-dark-trust", "/trust", false],
  ["desktop-dark-settings", "/settings", false],
  ["desktop-dark-about", "/about", false],
  ["desktop-dark-composer", "/my-work?compose=1", false],
  ["locale-uz-knowledge", "/knowledge", false],
  ["locale-ru-settings", "/settings", false],
];

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
const captured = [];

for (const [slug, route, light] of routes) {
  await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
  await waitForTheme(page, light);
  if (slug.includes("home")) {
    await page.waitForSelector(".cbai-intelligence-globe canvas, .cbai-globe-fallback", { timeout: 12000 }).catch(() => {});
    await page.waitForTimeout(600);
  }
  if (slug.startsWith("locale-uz")) await setLocale(page, "uz");
  if (slug.startsWith("locale-ru")) await setLocale(page, "ru");
  await capture(page, `${slug}.png`);
  captured.push(`${slug}.png`);
}

const mobile = await browser.newContext({ ...devices["iPhone 14 Pro Max"] });
const mobilePage = await mobile.newPage();
await mobilePage.goto(`${BASE}/`, { waitUntil: "networkidle" });
await capture(mobilePage, "mobile-home.png");
captured.push("mobile-home.png");
await mobilePage.goto(`${BASE}/knowledge`, { waitUntil: "networkidle" });
await setLocale(mobilePage, "tr");
await capture(mobilePage, "locale-tr-mobile-knowledge.png");
captured.push("locale-tr-mobile-knowledge.png");

await browser.close();

writeFileSync(
  join(OUT, "manifest.json"),
  JSON.stringify({ phase, base: BASE, captured, capturedAt: new Date().toISOString() }, null, 2),
);

console.log(`Captured ${captured.length} screenshots to ${OUT}`);
