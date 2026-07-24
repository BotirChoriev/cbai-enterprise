/**
 * Final product closure screenshot capture.
 * Run: PLAYWRIGHT_BROWSERS_PATH=$HOME/Library/Caches/ms-playwright node scripts/verify-final-product-closure.mjs
 * Requires: npm run dev:voice at CBAI_VERIFY_BASE
 */
import { chromium, devices } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.CBAI_VERIFY_BASE ?? "http://localhost:3000";
const ROOT = join(process.cwd(), "docs/verification/final-product-closure");
const OUT = join(ROOT, "final");
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

const desktopRoutes = [
  ["home-dark", "/", false],
  ["home-light", "/", true],
  ["home-country-selected", "/?country=USA", false],
  ["my-work", "/my-work", false],
  ["search", "/search", false],
  ["countries", "/countries", false],
  ["countries-selected", "/countries?country=USA", false],
  ["companies", "/companies?company=Apple", false],
  ["universities", "/universities?university=Stanford%20University", false],
  ["research", "/research", false],
  ["research-topic", "/research/microbiology", false],
  ["evidence", "/knowledge", false],
  ["graph", "/graph", false],
  ["reports", "/reports", false],
  ["investor", "/investor", false],
  ["government", "/government", false],
  ["governance", "/governance", false],
  ["trust", "/trust", false],
  ["settings", "/settings", false],
  ["about", "/about", false],
  ["composer", "/my-work?compose=1", false],
  ["locale-uz-home", "/", false],
  ["locale-ru-governance", "/governance", false],
];

const browser = await chromium.launch();
const desktop = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
const page = await desktop.newPage();
const captured = [];

for (const [slug, route, light] of desktopRoutes) {
  await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
  await waitForTheme(page, light);
  if (slug.includes("home")) {
    await page.waitForSelector(".cbai-intelligence-globe canvas, .cbai-globe-fallback", { timeout: 12000 }).catch(() => {});
    await page.waitForTimeout(500);
  }
  if (slug.startsWith("locale-uz")) await setLocale(page, "uz");
  if (slug.startsWith("locale-ru")) await setLocale(page, "ru");
  await capture(page, `${slug}.png`);
  captured.push(`${slug}.png`);
}

await page.goto(`${BASE}/settings`, { waitUntil: "networkidle" });
await page.getByRole("button", { name: /open voice|ovoz|голос|ses/i }).first().click({ timeout: 5000 }).catch(() => {});
await page.waitForTimeout(400);
await capture(page, "voice-open.png");
captured.push("voice-open.png");

const mobile = await browser.newContext({ ...devices["iPhone 14 Pro Max"] });
const mobilePage = await mobile.newPage();
for (const [slug, route] of [
  ["mobile-home", "/"],
  ["mobile-my-work", "/my-work"],
  ["mobile-countries", "/countries"],
  ["mobile-research", "/research"],
  ["mobile-settings", "/settings"],
  ["mobile-about", "/about"],
]) {
  await mobilePage.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
  await capture(mobilePage, `${slug}.png`);
  captured.push(`${slug}.png`);
}

await browser.close();

writeFileSync(
  join(OUT, "manifest.json"),
  JSON.stringify({ base: BASE, captured, capturedAt: new Date().toISOString() }, null, 2),
);
console.log(`Captured ${captured.length} screenshots to ${OUT}`);
