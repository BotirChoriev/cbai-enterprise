/**
 * Global Research Intelligence — Playwright captures.
 */
import { chromium, devices } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const MODE = process.env.GRI_SHOT_MODE === "before" ? "before" : "final";
const OUT = `docs/verification/global-research-intelligence/${MODE}`;
const BASE = process.env.CBAI_BASE_URL || "http://localhost:3061";

mkdirSync(OUT, { recursive: true });

async function shot(page, name) {
  await page.screenshot({ path: join(OUT, name), fullPage: false });
  console.log("saved", MODE, name);
}

async function setLocale(page, code) {
  await page.evaluate((locale) => {
    try {
      for (const profileKey of ["cbai-assistant-profile:local", "cbai-assistant-profile"]) {
        const existing = localStorage.getItem(profileKey);
        let profile = { preferredLanguage: locale, speechLanguage: locale };
        if (existing) {
          try {
            profile = { ...JSON.parse(existing), preferredLanguage: locale, speechLanguage: locale };
          } catch {
            /* ignore */
          }
        }
        localStorage.setItem(profileKey, JSON.stringify(profile));
      }
    } catch {
      /* ignore */
    }
  }, code);
}

async function setThemeMode(page, themeMode) {
  await page.evaluate((mode) => {
    try {
      for (const profileKey of ["cbai-assistant-profile:local", "cbai-assistant-profile"]) {
        const existing = localStorage.getItem(profileKey);
        let profile = { themeMode: mode };
        if (existing) {
          try {
            profile = { ...JSON.parse(existing), themeMode: mode };
          } catch {
            /* ignore */
          }
        }
        localStorage.setItem(profileKey, JSON.stringify(profile));
      }
    } catch {
      /* ignore */
    }
  }, themeMode);
}

async function gotoResearch(page, view) {
  const qs = view ? `?view=${encodeURIComponent(view)}` : "";
  await page.goto(`${BASE}/research${qs}`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForSelector("[data-cbai-gri-network]", { timeout: 30000 });
}

async function main() {
  const browser = await chromium.launch({ headless: true });

  if (MODE === "before") {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
    const page = await context.newPage();
    await page.goto(`${BASE}/research`, { waitUntil: "networkidle" });
    await shot(page, "01-research-home-before-1440.png");
    await context.close();
    await browser.close();
    return;
  }

  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
    const page = await context.newPage();
    await setLocale(page, "en");
    await gotoResearch(page);
    await shot(page, "01-research-home-1440.png");

    await gotoResearch(page, "map");
    await page.locator("[data-cbai-gri-map]").scrollIntoViewIfNeeded().catch(() => null);
    await shot(page, "02-global-research-map-1440.png");

    await gotoResearch(page, "intelligence");
    await page.getByText(/Active research|Aktif|Активн/i).first().scrollIntoViewIfNeeded().catch(() => null);
    await shot(page, "03-active-research-1440.png");
    await page.getByText(/Completed research|Tamamlangan|Заверш/i).first().scrollIntoViewIfNeeded().catch(() => null);
    await shot(page, "04-completed-research-1440.png");
    await page.locator("[data-cbai-stopped-research]").scrollIntoViewIfNeeded().catch(() => null);
    await shot(page, "05-stopped-inconclusive-1440.png");

    await page.locator("[data-cbai-gri-profile]").scrollIntoViewIfNeeded().catch(() => null);
    await shot(page, "06-research-profile-1440.png");

    await gotoResearch(page, "scientist");
    await shot(page, "07-scientist-profile-1440.png");
    await gotoResearch(page, "center");
    await shot(page, "08-research-center-profile-1440.png");
    await gotoResearch(page, "laboratory");
    await shot(page, "09-laboratory-profile-1440.png");

    await gotoResearch(page, "cabinet");
    await shot(page, "10-scientific-control-cabinet-1440.png");

    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    await page.waitForTimeout(400);
    await shot(page, "11-starter-work-card-home-1440.png");

    await gotoResearch(page, "match");
    await shot(page, "12-academic-match-engine-1440.png");
    await gotoResearch(page, "opportunities");
    await shot(page, "13-opportunity-radar-1440.png");
    await gotoResearch(page, "library");
    await shot(page, "14-library-source-view-1440.png");
    await gotoResearch(page, "evidence");
    await shot(page, "15-evidence-comparison-1440.png");
    await gotoResearch(page, "meeting");
    await shot(page, "16-research-meeting-1440.png");

    await setLocale(page, "uz");
    await gotoResearch(page);
    await shot(page, "17-uz-desktop-1440.png");

    await page.getByRole("button", { name: /Voice|Ovoz|Голос|Ses/i }).first().click().catch(() => null);
    await page.waitForTimeout(500);
    await shot(page, "19-voice-open-1440.png");
    await context.close();
  }

  {
    const context = await browser.newContext({
      ...devices["iPhone 13"],
      colorScheme: "dark",
      locale: "ru-RU",
    });
    const page = await context.newPage();
    await page.goto(`${BASE}/research`, { waitUntil: "networkidle", timeout: 60000 });
    await setLocale(page, "ru");
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForSelector("[data-cbai-gri-network]", { timeout: 30000 });
    await shot(page, "18-ru-mobile-390.png");
    await context.close();
  }

  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "light" });
    const page = await context.newPage();
    await page.goto(`${BASE}/research`, { waitUntil: "networkidle", timeout: 60000 });
    await setLocale(page, "en");
    await setThemeMode(page, "light");
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForSelector("[data-cbai-gri-network]", { timeout: 30000 });
    await shot(page, "20-light-theme-1440.png");
    await context.close();
  }

  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
    const page = await context.newPage();
    await page.goto(`${BASE}/research`, { waitUntil: "networkidle", timeout: 60000 });
    await setLocale(page, "en");
    await setThemeMode(page, "dark");
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForSelector("[data-cbai-gri-network]", { timeout: 30000 });
    await shot(page, "20-dark-theme-1440.png");
    await context.close();
  }

  await browser.close();
  console.log("Global Research Intelligence screenshots complete →", OUT);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
