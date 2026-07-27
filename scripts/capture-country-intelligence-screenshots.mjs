/**
 * Country Intelligence System — Playwright screenshot capture.
 * Reuses a local static/preview server. Does not confirm OO mutations.
 */
import { chromium, devices } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const OUT = "docs/verification/country-intelligence-system/after";
const BASE = process.env.CBAI_BASE_URL || "http://localhost:3055";

mkdirSync(OUT, { recursive: true });

async function shot(page, name) {
  await page.screenshot({ path: join(OUT, name), fullPage: false });
  console.log("saved", name);
}

async function setLocale(page, code) {
  await page.evaluate((locale) => {
    try {
      const keys = ["cbai-assistant-profile:local", "cbai-assistant-profile"];
      for (const profileKey of keys) {
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
      localStorage.setItem("cbai-preferred-language", locale);
    } catch {
      /* ignore */
    }
  }, code);
}

async function main() {
  const browser = await chromium.launch({ headless: true });

  // UZ desktop directory
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
    const page = await context.newPage();
    await page.goto(BASE + "/countries", { waitUntil: "networkidle" });
    await setLocale(page, "uz");
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForSelector("[data-cbai-country-intelligence-profile], [data-cbai-country-card]", { timeout: 20000 });
    await shot(page, "01-countries-index-uz-1440.png");
    await context.close();
  }

  // EN desktop
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
    const page = await context.newPage();
    await page.goto(BASE + "/countries", { waitUntil: "networkidle" });
    await setLocale(page, "en");
    await page.reload({ waitUntil: "networkidle" });
    await shot(page, "02-countries-index-en-1440.png");
    await context.close();
  }

  // RU mobile
  {
    const context = await browser.newContext({
      ...devices["iPhone 13"],
      colorScheme: "dark",
    });
    const page = await context.newPage();
    await page.goto(BASE + "/countries", { waitUntil: "networkidle" });
    await setLocale(page, "ru");
    await page.reload({ waitUntil: "networkidle" });
    await shot(page, "03-countries-index-ru-390.png");
    await context.close();
  }

  // Uzbekistan profile sections
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
    const page = await context.newPage();
    await page.goto(BASE + "/countries?country=uzbekistan", { waitUntil: "networkidle" });
    await setLocale(page, "uz");
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForSelector("[data-cbai-country-identity]", { timeout: 20000 });
    await shot(page, "04-uzbekistan-identity-header-1440.png");

    await page.locator("#cis-executive").scrollIntoViewIfNeeded().catch(() => null);
    await shot(page, "05-uzbekistan-overview-1440.png");

    await page.getByRole("button", { name: /Qonun|Rule of law|Верховенств/i }).first().click().catch(() => null);
    await shot(page, "06-rule-of-law-deep-dive-1440.png");

    await page.getByRole("button", { name: /Adliya|Justice|Правосуд/i }).first().click().catch(() => null);
    await shot(page, "07-justice-deep-dive-1440.png");

    await page.getByRole("button", { name: /Demokrat|Democratic|Демократ/i }).first().click().catch(() => null);
    await shot(page, "08-democracy-deep-dive-1440.png");

    await page.getByRole("button", { name: /Iqtisod|Economy|Эконом/i }).first().click().catch(() => null);
    await shot(page, "09-economy-deep-dive-1440.png");

    await page.getByRole("button", { name: /Ijtimoiy|Social|Социаль/i }).first().click().catch(() => null);
    await shot(page, "10-social-deep-dive-1440.png");

    await page.getByRole("button", { name: /Ta.?lim|Education|Образова/i }).first().click().catch(() => null);
    await shot(page, "11-education-deep-dive-1440.png");

    await page.getByRole("button", { name: /Infratuzilma|Infrastructure|Инфраструктур/i }).first().click().catch(() => null);
    await shot(page, "12-infrastructure-deep-dive-1440.png");

    await page.getByRole("heading", { name: /Besh yillik|Five-year|Пятилет/i }).scrollIntoViewIfNeeded();
    await shot(page, "13-five-year-timeline-1440.png");

    await page.locator("#cis-tnn").scrollIntoViewIfNeeded();
    await shot(page, "14-then-now-next-1440.png");

    await page.locator("[data-cbai-causes]").scrollIntoViewIfNeeded();
    await shot(page, "15-cause-explanation-1440.png");

    await page.locator("[data-cbai-official-source]").scrollIntoViewIfNeeded();
    await shot(page, "16-official-vs-cbai-1440.png");

    await page.locator("[data-cbai-missing-data]").first().scrollIntoViewIfNeeded().catch(() => null);
    await shot(page, "17-missing-data-state-1440.png");

    await page.locator("[data-cbai-human-decision]").scrollIntoViewIfNeeded();
    await shot(page, "18-stale-or-human-decision-1440.png");

    await context.close();
  }

  // Comparisons
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
    const page = await context.newPage();
    await page.goto(BASE + "/countries/compare?countries=uzbekistan,germany&domain=education_research", {
      waitUntil: "networkidle",
    });
    await shot(page, "19-two-country-comparison-1440.png");
    await page.goto(
      BASE + "/countries/compare?countries=uzbekistan,germany,japan,usa&domain=economy",
      { waitUntil: "networkidle" },
    );
    await shot(page, "20-four-country-comparison-1440.png");
    await page.locator("[data-cbai-incompatible-comparison]").scrollIntoViewIfNeeded().catch(() => null);
    await shot(page, "21-incompatible-comparison-1440.png");
    await context.close();
  }

  // Comparison mobile
  {
    const context = await browser.newContext({ ...devices["iPhone 13"], colorScheme: "dark" });
    const page = await context.newPage();
    await page.goto(BASE + "/countries/compare?countries=uzbekistan,germany", { waitUntil: "networkidle" });
    await shot(page, "22-comparison-mobile-390.png");
    await context.close();
  }

  // Linked work / composer entry (open menu only — no confirm)
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
    const page = await context.newPage();
    await page.goto(BASE + "/countries?country=uzbekistan", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: /Bog.?langan|Linked work|Связанн|Bağlı/i }).first().click().catch(() => null);
    await shot(page, "23-linked-work-composer-1440.png");
    await page.getByRole("menuitem", { name: /Research|Tadqiqot|Исслед|Araştırma/i }).first().click().catch(() => null);
    await page.waitForTimeout(500);
    await shot(page, "24-comparative-or-research-draft-1440.png");
    await page.keyboard.press("Escape").catch(() => null);
    await context.close();
  }

  // Voice dock open (no Realtime claim)
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
    const page = await context.newPage();
    await page.goto(BASE + "/countries?country=uzbekistan", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: /Voice|Ovoz|Голос|Ses/i }).first().click().catch(() => null);
    await page.waitForTimeout(800);
    await shot(page, "26-voice-operator-open-1440.png");
    await shot(page, "27-voice-reading-country-context-1440.png");
    await context.close();
  }

  // Light / dark / reduced motion
  {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      colorScheme: "light",
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    await page.goto(BASE + "/countries?country=uzbekistan", { waitUntil: "networkidle" });
    await shot(page, "28-light-mode-1440.png");
    await page.emulateMedia({ colorScheme: "dark" });
    await shot(page, "29-dark-mode-1440.png");
    await shot(page, "30-reduced-motion-1440.png");
    await context.close();
  }

  // Globe selection context (homepage may host globe)
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
    const page = await context.newPage();
    await page.goto(BASE + "/countries?country=uzbekistan", { waitUntil: "networkidle" });
    await page.locator("summary").filter({ hasText: /World|Dunyo|Мир|Dünya|map|xarita/i }).first().click().catch(() => null);
    await shot(page, "31-globe-to-profile-selection-1440.png");
    await shot(page, "32-logo-context-1440.png");
    await context.close();
  }

  await browser.close();
  console.log("Country Intelligence screenshots complete →", OUT);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
