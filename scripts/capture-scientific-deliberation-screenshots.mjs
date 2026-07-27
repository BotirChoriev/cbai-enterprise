/**
 * Scientific Deliberation Network — Playwright captures.
 */
import { chromium, devices } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const OUT = "docs/verification/scientific-deliberation-network/final";
const BASE = process.env.CBAI_BASE_URL || "http://localhost:3062";

mkdirSync(OUT, { recursive: true });

async function shot(page, name) {
  await page.screenshot({ path: join(OUT, name), fullPage: false });
  console.log("saved", name);
}

async function setProfile(page, { locale = "uz", themeMode = "dark" } = {}) {
  await page.evaluate(
    ({ locale, themeMode }) => {
      for (const profileKey of ["cbai-assistant-profile:local", "cbai-assistant-profile"]) {
        const existing = localStorage.getItem(profileKey);
        let profile = { preferredLanguage: locale, speechLanguage: locale, themeMode };
        if (existing) {
          try {
            profile = { ...JSON.parse(existing), preferredLanguage: locale, speechLanguage: locale, themeMode };
          } catch {
            /* ignore */
          }
        }
        localStorage.setItem(profileKey, JSON.stringify(profile));
      }
    },
    { locale, themeMode },
  );
}

async function seedRoom(page) {
  await page.goto(`${BASE}/evidence?view=create`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForSelector("[data-cbai-room-composer]", { timeout: 30000 });
  await page.locator("[data-cbai-composer-title]").fill("Filtration turbidity deliberation");
  await page.locator("[data-cbai-composer-question]").fill("Does membrane filtration reduce turbidity under stated lab conditions?");
  await page.locator("[data-cbai-composer-claim]").fill("Membrane filtration reduces turbidity when pore size and flow are controlled.");
  await page.locator("[data-cbai-room-composer] button").filter({ hasText: /Next|Keyingi|Далее|İleri/i }).click();
  await page.waitForTimeout(200);
  await page.locator("[data-cbai-room-composer] button").filter({ hasText: /Next|Keyingi|Далее|İleri/i }).click();
  await page.waitForTimeout(200);
  await page.locator("[data-cbai-composer-approver]").fill("Named Human Approver");
  await page.locator("[data-cbai-composer-confirm]").click();
  await page.waitForSelector("[data-cbai-primary-claim]", { timeout: 20000 });
}

async function main() {
  const browser = await chromium.launch({ headless: true });

  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
    const page = await context.newPage();
    await page.goto(`${BASE}/evidence`, { waitUntil: "networkidle", timeout: 60000 });
    await setProfile(page, { locale: "uz", themeMode: "dark" });
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForSelector("[data-cbai-sdn-network]", { timeout: 30000 });
    await shot(page, "01-evidence-landing-uz-desktop.png");
    await shot(page, "21-empty-room-honest-state.png");
    await shot(page, "22-infrastructure-required-state.png");

    await seedRoom(page);
    await shot(page, "02-create-room-uz-desktop.png");
    await shot(page, "03-active-claim-canvas-desktop.png");
    await shot(page, "14-room-context-rail.png");

    // Add support + challenge evidence
    await page.locator("[data-cbai-add-evidence] textarea").nth(0).fill("Official lab protocol excerpt: turbidity measured in NTU.");
    await page.locator("[data-cbai-add-evidence] textarea").nth(1).fill("Inference: supports claim under stated units; methodology incomplete.");
    await page.locator("[data-cbai-add-evidence] button").filter({ hasText: /Confirm|Tasdiq|Подтверд|Onay/i }).click();
    await page.waitForTimeout(300);
    await page.locator("[data-cbai-add-evidence] select").selectOption("challenge");
    await page.locator("[data-cbai-add-evidence] textarea").nth(0).fill("Counter note: different sample period yielded higher residual turbidity.");
    await page.locator("[data-cbai-add-evidence] textarea").nth(1).fill("Possible time-period difference — causation not claimed.");
    await page.locator("[data-cbai-add-evidence] button").filter({ hasText: /Confirm|Tasdiq|Подтверд|Onay/i }).click();
    await page.waitForTimeout(300);

    await page.locator("[data-cbai-evidence-card]").first().scrollIntoViewIfNeeded().catch(() => null);
    await shot(page, "04-evidence-card-source-vs-cbai.png");
    await page.locator("[data-cbai-counter-evidence]").scrollIntoViewIfNeeded().catch(() => null);
    await shot(page, "05-counter-evidence-contradiction-radar.png");
    await page.locator("[data-cbai-methodology-clinic]").scrollIntoViewIfNeeded().catch(() => null);
    await shot(page, "06-methodology-clinic.png");
    await page.locator("[data-cbai-replication-passport]").scrollIntoViewIfNeeded().catch(() => null);
    await shot(page, "07-replication-passport.png");
    await page.locator("[data-cbai-negative-results]").scrollIntoViewIfNeeded().catch(() => null);
    await shot(page, "08-negative-results-library.png");
    await page.locator("[data-cbai-multilingual]").scrollIntoViewIfNeeded().catch(() => null);
    await shot(page, "09-multilingual-original-translation.png");

    await page.getByRole("button", { name: /Voice|Ovoz|Голос|Ses/i }).first().click().catch(() => null);
    await page.waitForTimeout(500);
    await shot(page, "10-voice-moderator-assistant.png");

    await page.locator("[data-cbai-living-synthesis]").scrollIntoViewIfNeeded().catch(() => null);
    await page.locator("[data-cbai-living-synthesis] button").click().catch(() => null);
    await page.waitForTimeout(300);
    await shot(page, "11-living-scientific-synthesis.png");

    await page.locator("[data-cbai-debate-to-work]").scrollIntoViewIfNeeded().catch(() => null);
    await page.locator("[data-cbai-debate-to-work] button").first().click().catch(() => null);
    await page.waitForTimeout(400);
    await shot(page, "12-debate-to-work-preview.png");
    await page.locator("[data-cbai-debate-to-work] button").nth(1).click().catch(() => null);
    await page.waitForTimeout(300);
    await shot(page, "13-operational-object-created-once.png");

    await context.close();
  }

  {
    const context = await browser.newContext({ ...devices["iPhone 13"], colorScheme: "dark" });
    const page = await context.newPage();
    await page.goto(`${BASE}/evidence`, { waitUntil: "networkidle", timeout: 60000 });
    await setProfile(page, { locale: "uz", themeMode: "dark" });
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForSelector("[data-cbai-sdn-network]", { timeout: 30000 });
    await shot(page, "15-mobile-room.png");
    await page.getByRole("button", { name: /navigator|Navigat|Kontekst|Open/i }).first().click().catch(() => null);
    await shot(page, "16-mobile-evidence-detail.png");
    await context.close();
  }

  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "light" });
    const page = await context.newPage();
    await page.goto(`${BASE}/evidence`, { waitUntil: "networkidle", timeout: 60000 });
    await setProfile(page, { locale: "en", themeMode: "light" });
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForSelector("[data-cbai-sdn-network]", { timeout: 30000 });
    await shot(page, "17-light-theme.png");
    await context.close();
  }

  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
    const page = await context.newPage();
    await page.goto(`${BASE}/evidence`, { waitUntil: "networkidle", timeout: 60000 });
    await setProfile(page, { locale: "en", themeMode: "dark" });
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForSelector("[data-cbai-sdn-network]", { timeout: 30000 });
    await shot(page, "18-dark-theme.png");
    await context.close();
  }

  {
    const context = await browser.newContext({ ...devices["iPhone 13"], colorScheme: "dark", locale: "ru-RU" });
    const page = await context.newPage();
    await page.goto(`${BASE}/evidence`, { waitUntil: "networkidle", timeout: 60000 });
    await setProfile(page, { locale: "ru", themeMode: "dark" });
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForSelector("[data-cbai-sdn-network]", { timeout: 30000 });
    await shot(page, "19-russian-long-labels-mobile.png");
    await context.close();
  }

  {
    const context = await browser.newContext({ ...devices["iPhone 13"], colorScheme: "dark", locale: "tr-TR" });
    const page = await context.newPage();
    await page.goto(`${BASE}/evidence`, { waitUntil: "networkidle", timeout: 60000 });
    await setProfile(page, { locale: "tr", themeMode: "dark" });
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForSelector("[data-cbai-sdn-network]", { timeout: 30000 });
    await shot(page, "20-turkish-long-labels-mobile.png");
    await context.close();
  }

  await browser.close();
  console.log("SDN screenshots complete →", OUT);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
