/**
 * Capture final-product-finish acceptance screenshots (Chromium via Playwright).
 * Usage: node scripts/capture-final-product-finish-screenshots.mjs
 * Requires local app on http://localhost:3000.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { chromium } from "playwright";

const OUT = resolve("docs/verification/final-product-finish/screenshots");
const BASE = process.env.CBAI_BASE_URL ?? "http://localhost:3000";

const DESKTOP = [
  { name: "home-dark", path: "/", theme: "deep" },
  { name: "home-light", path: "/", theme: "light" },
  { name: "research", path: "/research", theme: "deep" },
  { name: "countries", path: "/countries", theme: "deep" },
  { name: "companies", path: "/companies", theme: "deep" },
  { name: "universities", path: "/universities", theme: "deep" },
  { name: "discover", path: "/discover", theme: "deep" },
  { name: "search", path: "/search", theme: "deep" },
  { name: "my-work", path: "/my-work", theme: "deep" },
  { name: "rooms", path: "/rooms", theme: "deep" },
  { name: "evidence", path: "/evidence", theme: "deep" },
  { name: "graph", path: "/graph", theme: "deep" },
  { name: "reports", path: "/reports", theme: "deep" },
  { name: "investor", path: "/investor", theme: "deep" },
  { name: "government", path: "/government", theme: "deep" },
  { name: "governance", path: "/governance", theme: "deep" },
  { name: "trust", path: "/trust", theme: "deep" },
  { name: "settings", path: "/settings", theme: "deep" },
  { name: "about", path: "/about", theme: "deep" },
];

const MOBILE = [
  { name: "mobile-home", path: "/", theme: "deep" },
  { name: "mobile-research", path: "/research", theme: "deep" },
  { name: "mobile-my-work", path: "/my-work", theme: "deep" },
  { name: "mobile-rooms", path: "/rooms", theme: "deep" },
];

const LOCALES = [
  { name: "uz-research", path: "/research", locale: "uz", theme: "deep" },
  { name: "ru-research", path: "/research", locale: "ru", theme: "deep" },
  { name: "tr-settings", path: "/settings", locale: "tr", theme: "deep" },
];

async function applyTheme(page, theme) {
  await page.evaluate((mode) => {
    const root = document.documentElement;
    root.classList.remove("theme-light", "theme-deep");
    if (mode === "light") root.classList.add("theme-light");
    else root.classList.add("theme-deep");
    try {
      localStorage.setItem("cbai-theme", mode === "light" ? "light" : "deep");
    } catch {
      /* ignore */
    }
  }, theme);
}

async function applyLocale(page, locale) {
  if (!locale) return;
  await page.evaluate((code) => {
    try {
      localStorage.setItem("cbai-language", code);
      localStorage.setItem("cbai-locale", code);
    } catch {
      /* ignore */
    }
  }, locale);
}

async function capture(page, name, viewport) {
  await page.setViewportSize(viewport);
  await page.mouse.move(0, 0);
  await page.waitForTimeout(400);
  const file = resolve(OUT, `${name}.png`);
  mkdirSync(dirname(file), { recursive: true });
  await page.screenshot({ path: file, fullPage: false });
  return file;
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const manifest = [];

  for (const shot of DESKTOP) {
    await page.goto(`${BASE}${shot.path}`, { waitUntil: "networkidle", timeout: 60000 });
    await applyTheme(page, shot.theme);
    if (shot.locale) await applyLocale(page, shot.locale);
    await page.reload({ waitUntil: "networkidle" });
    await applyTheme(page, shot.theme);
    const file = await capture(page, `desktop-${shot.name}`, { width: 1440, height: 900 });
    manifest.push({ name: shot.name, file, viewport: "1440x900" });
  }

  // Voice ready + listening if dock available
  await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 60000 });
  await applyTheme(page, "deep");
  const openVoice = page.getByRole("button", { name: /Open Voice Operator|Speak to CBAI|Ovoz|Голос|Ses/i }).first();
  if (await openVoice.count()) {
    await openVoice.click();
    await page.waitForTimeout(800);
    await capture(page, "desktop-voice-ready", { width: 1440, height: 900 });
    const mic = page.getByRole("button", { name: /microphone|Mikrofon|микрофон|mikrofon/i }).first();
    if (await mic.count()) {
      await mic.click();
      await page.waitForTimeout(2500);
      await capture(page, "desktop-voice-listening", { width: 1440, height: 900 });
    }
  }

  for (const shot of MOBILE) {
    await page.goto(`${BASE}${shot.path}`, { waitUntil: "networkidle", timeout: 60000 });
    await applyTheme(page, shot.theme);
    const file = await capture(page, shot.name, { width: 390, height: 844 });
    manifest.push({ name: shot.name, file, viewport: "390x844" });
  }

  for (const shot of LOCALES) {
    await page.goto(`${BASE}${shot.path}`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await applyLocale(page, shot.locale);
    await applyTheme(page, shot.theme);
    await page.reload({ waitUntil: "networkidle" });
    await applyTheme(page, shot.theme);
    const file = await capture(page, `locale-${shot.name}`, { width: 1440, height: 900 });
    manifest.push({ name: shot.name, file, viewport: "1440x900", locale: shot.locale });
  }

  writeFileSync(resolve(OUT, "manifest.json"), JSON.stringify(manifest, null, 2));
  await browser.close();
  console.log(`Captured ${manifest.length}+ screenshots → ${OUT}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
