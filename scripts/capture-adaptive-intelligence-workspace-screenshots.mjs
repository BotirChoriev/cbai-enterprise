/**
 * Adaptive Intelligence Workspace — browser screenshot capture.
 * Reuses localhost:3000. Does NOT confirm mutations (no My Work writes).
 * Does NOT claim live microphone / Realtime success.
 */
import { chromium, devices } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const OUT = "docs/verification/adaptive-intelligence-workspace/after";
const BASE = process.env.CBAI_BASE_URL || "http://localhost:3000";

mkdirSync(OUT, { recursive: true });

async function shot(page, name) {
  await page.screenshot({
    path: join(OUT, name),
    fullPage: false,
  });
  console.log("saved", name);
}

async function desktopFlow() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: "dark",
  });
  const page = await context.newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.waitForSelector("[data-activation-experience]", { timeout: 15000 });
  await shot(page, "desktop-entry-dark-1440.png");

  // Voice choice — opens dock + shows intro text. No Realtime claim.
  await page.click('[data-activation-choice="voice"]');
  await page.waitForSelector("[data-activation-voice-intro]", { timeout: 5000 });
  await shot(page, "desktop-voice-intro-1440.png");

  // Example path
  await page.click("text=Orqaga").catch(() => page.click("text=Back").catch(() => null));
  await page.waitForSelector('[data-activation-choice="example"]', { timeout: 5000 }).catch(() => null);
  // Navigate fresh for reliable example
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.waitForSelector('[data-activation-choice="example"]');
  await page.click('[data-activation-choice="example"]');
  await page.waitForSelector("[data-activation-card]", { timeout: 8000 });
  await shot(page, "desktop-example-card-1440.png");
  await page.click('button[role="tab"]:has-text("Monitoring"), button[role="tab"]:has-text("Мониторинг"), button[role="tab"]:has-text("İzleme")').catch(async () => {
    const tabs = page.locator('button[role="tab"]');
    const count = await tabs.count();
    if (count >= 5) await tabs.nth(4).click();
  });
  await shot(page, "desktop-example-monitoring-1440.png");
  await page.click('[data-activation-account-prompt]').catch(() => null);
  await shot(page, "desktop-account-after-value-1440.png");

  // Light theme
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.getByRole("radio", { name: /Yorug|Light|Светл|Açık/i }).click().catch(() => null);
  await page.waitForTimeout(400);
  await shot(page, "desktop-entry-light-1440.png");

  await browser.close();
}

async function mobileFlow() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    ...devices["iPhone 13"],
    colorScheme: "dark",
  });
  const page = await context.newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.waitForSelector("[data-activation-experience]", { timeout: 15000 });
  await shot(page, "mobile-entry-390.png");
  await page.click('[data-activation-choice="type"]');
  await page.waitForSelector("#activation-statement", { timeout: 5000 });
  await shot(page, "mobile-typed-start-390.png");
  await page.fill("#activation-statement", "Men olimman. Tadqiqot savolini taqqoslashni xohlayman.");
  await page.click("[data-activation-interpret]");
  await page.waitForSelector("[data-activation-refine]", { timeout: 5000 });
  await shot(page, "mobile-role-selection-390.png");
  await page.click("[data-activation-build-card]");
  await page.waitForSelector("[data-activation-card]", { timeout: 8000 });
  await shot(page, "mobile-starter-card-390.png");
  await browser.close();
}

async function localeSpotChecks() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
  const page = await context.newPage();

  for (const [locale, label] of [
    ["en", "en"],
    ["ru", "ru"],
    ["tr", "tr"],
  ]) {
    await page.goto(BASE + "/", { waitUntil: "networkidle" });
    // Use the activation LanguageSelector compact control: open details and click locale button
    const compact = page.locator("[data-activation-experience]").locator("details").first();
    await compact.locator("summary").click().catch(() => null);
    await page.waitForTimeout(200);
    await page
      .locator("[data-activation-experience]")
      .getByRole("button", { name: new RegExp(`\\b${locale}\\b`, "i") })
      .first()
      .click()
      .catch(() => null);
    await page.waitForTimeout(500);
    await shot(page, `desktop-entry-${label}-1440.png`);
  }

  await page.goto(BASE + "/my-work", { waitUntil: "networkidle" });
  await shot(page, "desktop-my-work-1440.png");
  await page.goto(BASE + "/countries?country=uzbekistan", { waitUntil: "networkidle" });
  await shot(page, "desktop-country-linked-1440.png");

  await browser.close();
}

async function main() {
  console.log("capturing against", BASE);
  await desktopFlow();
  await mobileFlow();
  await localeSpotChecks();
  console.log("done");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
