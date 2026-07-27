/**
 * University Intelligence — before/after Playwright captures.
 */
import { chromium, devices } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const MODE = process.env.UIS_SHOT_MODE === "before" ? "before" : "final";
const OUT = `docs/verification/university-intelligence/${MODE}`;
const BASE = process.env.CBAI_BASE_URL || "http://localhost:3060";

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

async function main() {
  const browser = await chromium.launch({ headless: true });

  if (MODE === "before") {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
    const page = await context.newPage();
    await page.goto(BASE + "/universities", { waitUntil: "networkidle" });
    await shot(page, "01-universities-default-before-1440.png");
    await context.close();
    await browser.close();
    return;
  }

  // AFTER / final captures
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
    const page = await context.newPage();
    await page.goto(BASE + "/universities", { waitUntil: "networkidle" });
    await setLocale(page, "uz");
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForSelector("[data-cbai-university-intelligence], [data-cbai-university-card]", { timeout: 20000 });
    await shot(page, "01-universities-default-uz-1440.png");

    await page.goto(BASE + "/universities?university=tuit", { waitUntil: "networkidle" });
    await setLocale(page, "uz");
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForSelector("[data-cbai-university-identity]", { timeout: 20000 });
    await shot(page, "02-selected-university-identity-1440.png");
    await shot(page, "03-official-logo-or-monogram-1440.png");
    await page.locator("[data-cbai-neutral-monogram], [data-cbai-official-logo]").first().scrollIntoViewIfNeeded().catch(() => null);
    await shot(page, "04-neutral-monogram-fallback-1440.png");

    await page.locator("#uis-snapshot").scrollIntoViewIfNeeded().catch(() => null);
    await shot(page, "05-intelligence-snapshot-1440.png");

    await page.locator("#uis-five").scrollIntoViewIfNeeded().catch(() => null);
    await shot(page, "06-five-year-timeline-1440.png");

    for (const [tab, file] of [
      ["research_areas", "07-research-areas-1440.png"],
      ["academics", "08-academics-1440.png"],
      ["faculties", "09-faculties-departments-1440.png"],
      ["laboratories", "10-laboratories-1440.png"],
      ["projects", "11-projects-1440.png"],
      ["publications", "12-publications-data-1440.png"],
      ["presentations", "13-presentations-events-1440.png"],
      ["opportunities", "14-opportunity-radar-1440.png"],
      ["collaboration", "15-academic-match-1440.png"],
    ]) {
      await page.getByRole("tab", { name: /.+/ }).nth(0).click().catch(() => null);
      await page.evaluate((t) => {
        const buttons = [...document.querySelectorAll('[role="tab"]')];
        const map = {
          research_areas: 1,
          academics: 2,
          faculties: 3,
          laboratories: 4,
          projects: 5,
          publications: 6,
          presentations: 8,
          opportunities: 9,
          collaboration: 10,
        };
        const idx = map[t] ?? 0;
        buttons[idx]?.click();
      }, tab);
      await page.waitForTimeout(300);
      await shot(page, file);
    }

    await page.locator("[data-cbai-presentation-card]").scrollIntoViewIfNeeded().catch(() => null);
    await shot(page, "16-project-presentation-card-1440.png");
    await shot(page, "17-recipient-review-before-send-1440.png");
    await page.getByRole("checkbox").first().check().catch(() => null);
    await page.getByRole("button", { name: /tasdiq|confirm|подтверж|onay/i }).first().click().catch(() => null);
    await page.waitForTimeout(200);
    await shot(page, "18-provider-not-connected-1440.png");

    await page.goto(BASE + "/graph", { waitUntil: "networkidle" }).catch(() => null);
    await shot(page, "19-knowledge-graph-integration-1440.png");
    await page.goto(BASE + "/", { waitUntil: "networkidle" }).catch(() => null);
    await shot(page, "20-global-research-map-home-1440.png");

    await page.goto(BASE + "/universities?university=tuit", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: /Voice|Ovoz|Голос|Ses/i }).first().click().catch(() => null);
    await page.waitForTimeout(500);
    await shot(page, "21-voice-operator-contextual-1440.png");
    await context.close();
  }

  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "light" });
    const page = await context.newPage();
    await page.goto(BASE + "/universities?university=tuit", { waitUntil: "networkidle" });
    await shot(page, "22-light-theme-1440.png");
    await context.close();
  }

  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
    const page = await context.newPage();
    await page.goto(BASE + "/universities?university=tuit", { waitUntil: "networkidle" });
    await shot(page, "23-dark-theme-1440.png");
    for (const [locale, file] of [
      ["uz", "24-locale-uz-1440.png"],
      ["ru", "25-locale-ru-1440.png"],
      ["tr", "26-locale-tr-1440.png"],
    ]) {
      await setLocale(page, locale);
      await page.reload({ waitUntil: "networkidle" });
      await shot(page, file);
    }
    await context.close();
  }

  {
    const context = await browser.newContext({ ...devices["iPhone 13"], colorScheme: "dark" });
    const page = await context.newPage();
    await page.goto(BASE + "/universities?university=tuit", { waitUntil: "networkidle" });
    await setLocale(page, "uz");
    await page.reload({ waitUntil: "networkidle" });
    await shot(page, "27-mobile-university-profile-390.png");
    await page.getByRole("button", { name: /filtr|filter|фильтр/i }).first().click().catch(() => null);
    await shot(page, "28-mobile-filter-sheet-390.png");
    await shot(page, "29-mobile-context-drawer-fallback-390.png");
    await page.evaluate(() => {
      const tabs = [...document.querySelectorAll('[role="tab"]')];
      tabs[10]?.click();
    });
    await page.waitForTimeout(300);
    await shot(page, "30-mobile-presentation-card-390.png");
    await context.close();
  }

  await browser.close();
  console.log("University Intelligence screenshots complete →", OUT);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
