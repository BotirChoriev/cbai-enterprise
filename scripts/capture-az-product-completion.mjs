/**
 * A–Z product completion visual capture (subset for acceptance).
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.CBAI_BASE_URL ?? "http://localhost:3012";
const OUT = "docs/verification/az-product-completion/after";

const ROUTES = [
  { id: "home", path: "/" },
  { id: "my-work", path: "/my-work" },
  { id: "research", path: "/research" },
  { id: "evidence", path: "/evidence" },
  { id: "countries", path: "/countries" },
  { id: "companies", path: "/companies" },
  { id: "rooms", path: "/rooms" },
  { id: "reports", path: "/reports" },
  { id: "settings", path: "/settings" },
];

function profile(lang) {
  return JSON.stringify({
    name: "",
    operatorName: "",
    avatar: "orb",
    voiceInputEnabled: true,
    preferredLanguage: lang,
    translationLanguage: lang,
    speechLanguage: lang,
    workspaceRole: "researcher",
    timezone: "",
    country: "",
    organization: "",
    notifications: { evidenceUpdates: false, missionActivity: false, weeklySummary: false },
    accessibility: { reducedMotion: true, highContrast: false, largerText: false },
    themeMode: "dark",
    displayDensity: "standard",
  });
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.addInitScript((raw) => {
    localStorage.setItem("cbai-assistant-profile:local", raw);
    localStorage.setItem("cbai-assistant-profile", raw);
  }, profile("uz"));

  await page.setViewportSize({ width: 1280, height: 800 });
  for (const route of ROUTES) {
    await page.goto(`${BASE}${route.path}`, { waitUntil: "domcontentloaded", timeout: 90000 });
    await page.waitForTimeout(700);
    const file = join(OUT, `${route.id}-uz-dark-1280.png`);
    await page.screenshot({ path: file, fullPage: false });
    console.log("wrote", file);
  }

  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of ROUTES.filter((r) => ["home", "my-work", "research", "rooms"].includes(r.id))) {
    await page.goto(`${BASE}${route.path}`, { waitUntil: "domcontentloaded", timeout: 90000 });
    await page.waitForTimeout(600);
    const file = join(OUT, `${route.id}-uz-dark-390.png`);
    await page.screenshot({ path: file, fullPage: false });
    console.log("wrote", file);
  }

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
