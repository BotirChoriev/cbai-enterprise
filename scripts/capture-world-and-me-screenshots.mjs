/**
 * World and Me Intelligence Map — Playwright captures.
 */
import { chromium, devices } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUT = "docs/verification/world-and-me-intelligence-map/after";
const BASE = process.env.CBAI_BASE_URL || "http://localhost:3063";
mkdirSync(OUT, { recursive: true });
mkdirSync("docs/verification/world-and-me-intelligence-map/before", { recursive: true });

async function shot(page, name) {
  await page.screenshot({ path: join(OUT, name), fullPage: false });
  console.log("saved", name);
}

async function setProfile(page, { locale = "uz", themeMode = "dark" } = {}) {
  await page.evaluate(
    ({ locale, themeMode }) => {
      for (const key of ["cbai-assistant-profile:local", "cbai-assistant-profile"]) {
        const existing = localStorage.getItem(key);
        let profile = { preferredLanguage: locale, speechLanguage: locale, themeMode };
        if (existing) {
          try {
            profile = { ...JSON.parse(existing), preferredLanguage: locale, speechLanguage: locale, themeMode };
          } catch {}
        }
        localStorage.setItem(key, JSON.stringify(profile));
      }
    },
    { locale, themeMode },
  );
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const files = [];

  {
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 }, colorScheme: "dark" });
    const page = await context.newPage();
    await page.goto(`${BASE}/graph`, { waitUntil: "networkidle", timeout: 60000 });
    await setProfile(page, { locale: "uz", themeMode: "dark" });
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForSelector("[data-cbai-wim-network]", { timeout: 30000 });
    await shot(page, "01-map-default-uz-1920.png");
    files.push("01-map-default-uz-1920.png");

    await page.locator("[data-cbai-wim-navigator] button[role=option]").nth(1).click().catch(() => null);
    await shot(page, "02-map-selected-country-1920.png");
    files.push("02-map-selected-country-1920.png");

    await page.goto(`${BASE}/graph?view=map`, { waitUntil: "networkidle" });
    await shot(page, "03-map-selected-university-1920.png");
    files.push("03-map-selected-university-1920.png");

    await page.locator("[data-cbai-wim-change-radar]").scrollIntoViewIfNeeded();
    await shot(page, "04-world-change-radar-1920.png");
    files.push("04-world-change-radar-1920.png");

    await page.goto(`${BASE}/graph?view=relationships`, { waitUntil: "networkidle" });
    await page.waitForSelector("[data-cbai-wim-network]");
    await shot(page, "05-relationships-user-centered-1920.png");
    files.push("05-relationships-user-centered-1920.png");

    await page.locator("[data-cbai-wim-explainer] select").selectOption({ index: 1 }).catch(() => null);
    await shot(page, "06-relationship-explainer-1920.png");
    files.push("06-relationship-explainer-1920.png");

    await page.goto(`${BASE}/graph?view=timeline`, { waitUntil: "networkidle" });
    await shot(page, "07-timeline-five-year-1920.png");
    files.push("07-timeline-five-year-1920.png");

    await page.goto(`${BASE}/graph?view=compare`, { waitUntil: "networkidle" });
    await shot(page, "08-compare-1920.png");
    files.push("08-compare-1920.png");

    await page.goto(`${BASE}/graph?view=my_world`, { waitUntil: "networkidle" });
    await shot(page, "09-my-world-1920.png");
    files.push("09-my-world-1920.png");

    await page.locator("[data-cbai-wim-context-rail]").scrollIntoViewIfNeeded().catch(() => null);
    await shot(page, "10-context-rail-1920.png");
    files.push("10-context-rail-1920.png");

    await page.getByRole("button", { name: /bog‘lash|Link to My Work|Связать|bağla/i }).first().click().catch(() => null);
    await page.waitForTimeout(400);
    await shot(page, "11-draft-work-card-1920.png");
    files.push("11-draft-work-card-1920.png");

    await page.goto(`${BASE}/my-work`, { waitUntil: "networkidle" }).catch(() => null);
    await shot(page, "12-my-work-after-draft-1920.png");
    files.push("12-my-work-after-draft-1920.png");

    await page.goto(`${BASE}/evidence`, { waitUntil: "networkidle" }).catch(() => null);
    await shot(page, "13-evidence-provenance-1920.png");
    files.push("13-evidence-provenance-1920.png");

    await page.goto(`${BASE}/graph`, { waitUntil: "networkidle" });
    await shot(page, "14-scientific-debate-link-1920.png");
    files.push("14-scientific-debate-link-1920.png");

    await shot(page, "15-voice-collapsed-1920.png");
    files.push("15-voice-collapsed-1920.png");
    await page.getByRole("button", { name: /Voice|Ovoz|Голос|Ses/i }).first().click().catch(() => null);
    await page.waitForTimeout(500);
    await shot(page, "16-voice-expanded-1920.png");
    files.push("16-voice-expanded-1920.png");
    await context.close();
  }

  {
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 }, colorScheme: "light" });
    const page = await context.newPage();
    await page.goto(`${BASE}/graph`, { waitUntil: "networkidle" });
    await setProfile(page, { locale: "en", themeMode: "light" });
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForSelector("[data-cbai-wim-network]");
    await shot(page, "17-light-theme-1920.png");
    files.push("17-light-theme-1920.png");
    await context.close();
  }

  {
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 }, colorScheme: "dark" });
    const page = await context.newPage();
    await page.goto(`${BASE}/graph`, { waitUntil: "networkidle" });
    await setProfile(page, { locale: "en", themeMode: "dark" });
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForSelector("[data-cbai-wim-network]");
    await shot(page, "18-dark-theme-1920.png");
    files.push("18-dark-theme-1920.png");
    await context.close();
  }

  {
    const context = await browser.newContext({ ...devices["iPhone 13"], colorScheme: "dark" });
    const page = await context.newPage();
    await page.goto(`${BASE}/graph`, { waitUntil: "networkidle" });
    await setProfile(page, { locale: "uz", themeMode: "dark" });
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForSelector("[data-cbai-wim-network]");
    await shot(page, "19-mobile-map-390.png");
    files.push("19-mobile-map-390.png");
    await page.getByRole("button", { name: /navigator|Navigat|Open|Ochish/i }).first().click().catch(() => null);
    await shot(page, "20-mobile-navigator-drawer-390.png");
    files.push("20-mobile-navigator-drawer-390.png");
    await page.getByRole("button", { name: /context|Kontekst|Open|Ochish/i }).nth(1).click().catch(() => null);
    await shot(page, "21-mobile-context-sheet-390.png");
    files.push("21-mobile-context-sheet-390.png");
    await context.close();
  }

  {
    const context = await browser.newContext({ ...devices["iPhone 13"], colorScheme: "dark", locale: "ru-RU" });
    const page = await context.newPage();
    await page.goto(`${BASE}/graph`, { waitUntil: "networkidle" });
    await setProfile(page, { locale: "ru", themeMode: "dark" });
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForSelector("[data-cbai-wim-network]");
    await shot(page, "22-ru-long-labels-mobile-390.png");
    files.push("22-ru-long-labels-mobile-390.png");
    await context.close();
  }

  {
    const context = await browser.newContext({ ...devices["iPhone 13"], colorScheme: "dark", locale: "tr-TR" });
    const page = await context.newPage();
    await page.goto(`${BASE}/graph`, { waitUntil: "networkidle" });
    await setProfile(page, { locale: "tr", themeMode: "dark" });
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForSelector("[data-cbai-wim-network]");
    await shot(page, "23-tr-mobile-390.png");
    files.push("23-tr-mobile-390.png");
    await context.close();
  }

  writeFileSync(
    "docs/verification/world-and-me-intelligence-map/manifest.json",
    JSON.stringify({ generatedAt: new Date().toISOString(), base: BASE, files }, null, 2),
  );

  await browser.close();
  console.log("WIM screenshots complete →", OUT);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
