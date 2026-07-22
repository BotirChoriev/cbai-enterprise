/**
 * Complete Operational Object System verification — 25 screenshots.
 * Run: PLAYWRIGHT_BROWSERS_PATH=$HOME/Library/Caches/ms-playwright node scripts/verify-operational-object-system.mjs
 */
import { chromium, devices } from "playwright";
import { mkdirSync, readdirSync, unlinkSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.CBAI_VERIFY_BASE ?? "http://localhost:3000";
const OUT = join(process.cwd(), "docs/verification/operational-object-system");
mkdirSync(OUT, { recursive: true });

const CANONICAL = new Set([
  "01-home-default-1920.png",
  "02-home-command-entered-1920.png",
  "03-draft-work-card-simple-1920.png",
  "04-draft-work-card-advanced-1920.png",
  "05-draft-work-card-missing-1920.png",
  "06-draft-work-card-mobile-390.png",
  "07-my-work-index-1920.png",
  "08-my-work-filtered-1920.png",
  "09-research-catalog-uz-1920.png",
  "10-research-topic-detail-uz-1920.png",
  "11-evidence-1920.png",
  "12-country-selected-1920.png",
  "13-country-linked-work-composer-1920.png",
  "14-knowledge-graph-1920.png",
  "15-graph-linked-work-composer-1920.png",
  "16-investor-1920.png",
  "17-governance-1920.png",
  "18-voice-dock-ready-1920.png",
  "19-voice-stt-unavailable-1920.png",
  "20-voice-plus-draft-work-card-1920.png",
  "21-light-theme-internal-1440.png",
  "22-dark-theme-internal-1440.png",
  "23-full-approved-logo-1920.png",
  "24-mobile-navigation-voice-390.png",
  "25-mobile-operational-card-390.png",
]);

function profileInit(lang, themeMode) {
  return `(function(){
    const key = "cbai-assistant-profile:local";
    let p = {};
    try { p = JSON.parse(localStorage.getItem(key) || "{}"); } catch {}
    p.preferredLanguage = ${JSON.stringify(lang)};
    p.themeMode = ${JSON.stringify(themeMode)};
    p.name = p.name || "Verify";
    localStorage.setItem(key, JSON.stringify(p));
    try { localStorage.removeItem("cbai-living-memory:companion-thought"); } catch {}
  })();`;
}

async function waitForTheme(page, mode) {
  if (mode === "light") {
    await page.waitForFunction(() => document.documentElement.classList.contains("theme-light"), {
      timeout: 8000,
    });
  } else {
    await page.waitForFunction(() => !document.documentElement.classList.contains("theme-light"), {
      timeout: 8000,
    });
  }
}

async function shot(page, name) {
  const path = join(OUT, name);
  await page.screenshot({ path, fullPage: false });
  console.log("saved", name);
}

function purgeLegacyScreenshots() {
  for (const file of readdirSync(OUT)) {
    if (file.endsWith(".png") && !CANONICAL.has(file)) {
      unlinkSync(join(OUT, file));
      console.log("removed legacy", file);
    }
  }
}

async function main() {
  const browser = await chromium.launch({
    args: ["--use-gl=angle", "--enable-webgl"],
  });

  const desktop = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const desktop1440 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const mobile = await browser.newContext({ ...devices["iPhone 12"] });

  const page = await desktop.newPage();
  const page1440 = await desktop1440.newPage();
  const mobilePage = await mobile.newPage();

  await page.addInitScript(profileInit("en", "dark"));
  await page.goto(BASE, { waitUntil: "networkidle" });
  await shot(page, "01-home-default-1920.png");

  await page.goto(`${BASE}/my-work`, { waitUntil: "networkidle" });
  await page.waitForSelector("form[role='search'] input", { timeout: 10000 }).catch(() => {});
  const cmd = page.locator("form[role='search'] input").first();
  if (await cmd.count()) {
    await cmd.fill("Create a plan to evaluate water infrastructure evidence in Uzbekistan");
    await shot(page, "02-home-command-entered-1920.png");
    await cmd.press("Enter");
    await page.waitForSelector(".cbai-op-composer", { timeout: 8000 });
    await shot(page, "03-draft-work-card-simple-1920.png");
    await page.locator(".cbai-op-composer__advanced-summary").click();
    await page.waitForTimeout(300);
    await shot(page, "04-draft-work-card-advanced-1920.png");
    await page.locator("#op-human").fill("");
    await shot(page, "05-draft-work-card-missing-1920.png");
    await page.keyboard.press("Escape");
  }

  await mobilePage.addInitScript(profileInit("en", "dark"));
  await mobilePage.goto(`${BASE}/my-work`, { waitUntil: "networkidle" });
  await mobilePage.locator(".cbai-op-index__create").click();
  await mobilePage.waitForSelector(".cbai-op-composer");
  await shot(mobilePage, "06-draft-work-card-mobile-390.png");
  await mobilePage.keyboard.press("Escape");

  await page.goto(`${BASE}/my-work`, { waitUntil: "networkidle" });
  await shot(page, "07-my-work-index-1920.png");
  await page.locator(".cbai-op-filter").nth(2).click();
  await shot(page, "08-my-work-filtered-1920.png");

  await page.addInitScript(profileInit("uz", "dark"));
  await page.goto(`${BASE}/research`, { waitUntil: "networkidle" });
  await shot(page, "09-research-catalog-uz-1920.png");

  await page.goto(`${BASE}/research/microbiology`, { waitUntil: "networkidle" });
  await shot(page, "10-research-topic-detail-uz-1920.png");

  await page.goto(`${BASE}/knowledge`, { waitUntil: "networkidle" });
  await shot(page, "11-evidence-1920.png");

  await page.goto(`${BASE}/countries`, { waitUntil: "networkidle" });
  await page
    .locator("button, [role='button']")
    .filter({ hasText: /Uzbekistan|O'zbekiston|United States/i })
    .first()
    .click({ timeout: 8000 })
    .catch(() => {});
  await page.waitForTimeout(500);
  await shot(page, "12-country-selected-1920.png");

  const linkedBtn = page.getByRole("button", { name: /Bog.langan ish yaratish|Create linked work/i }).first();
  if (await linkedBtn.count()) {
    await linkedBtn.click();
    await page.getByRole("menuitem").first().click({ timeout: 5000 });
    await page.waitForSelector(".cbai-op-composer");
    await shot(page, "13-country-linked-work-composer-1920.png");
    await page.keyboard.press("Escape");
  }

  await page.goto(`${BASE}/graph`, { waitUntil: "networkidle" });
  await shot(page, "14-knowledge-graph-1920.png");
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(500);
  const graphLinked = page.getByRole("button", { name: /Bog.langan ish yaratish|Create linked work/i }).first();
  if (await graphLinked.count()) {
    await graphLinked.click();
    await page.getByRole("menuitem").first().click({ timeout: 5000 });
    await page.waitForSelector(".cbai-op-composer");
    await shot(page, "15-graph-linked-work-composer-1920.png");
    await page.keyboard.press("Escape");
  }

  await page.goto(`${BASE}/investor`, { waitUntil: "networkidle" });
  await shot(page, "16-investor-1920.png");
  await page.goto(`${BASE}/governance`, { waitUntil: "networkidle" });
  await shot(page, "17-governance-1920.png");

  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /Voice|Ovoz/i }).first().click({ timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(600);
  await shot(page, "18-voice-dock-ready-1920.png");

  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /Voice|Ovoz/i }).first().click({ timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(400);
  await shot(page, "19-voice-stt-unavailable-1920.png");

  await page.goto(`${BASE}/my-work`, { waitUntil: "networkidle" });
  await page.locator(".cbai-op-index__create").click();
  await page.waitForSelector(".cbai-op-composer");
  await page.getByRole("button", { name: /Voice|Ovoz/i }).first().click({ timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(500);
  await shot(page, "20-voice-plus-draft-work-card-1920.png");
  await page.keyboard.press("Escape");

  await page1440.addInitScript(profileInit("en", "light"));
  await page1440.goto(`${BASE}/my-work`, { waitUntil: "networkidle" });
  await waitForTheme(page1440, "light");
  await page1440.waitForTimeout(300);
  await shot(page1440, "21-light-theme-internal-1440.png");

  await page1440.addInitScript(profileInit("en", "dark"));
  await page1440.goto(`${BASE}/my-work`, { waitUntil: "networkidle" });
  await waitForTheme(page1440, "dark");
  await shot(page1440, "22-dark-theme-internal-1440.png");

  await page.goto(BASE, { waitUntil: "networkidle" });
  await shot(page, "23-full-approved-logo-1920.png");

  await mobilePage.addInitScript(profileInit("en", "dark"));
  await mobilePage.goto(BASE, { waitUntil: "networkidle" });
  await mobilePage.getByRole("button", { name: /menu|Menyu|☰/i }).first().click({ timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(300);
  await shot(mobilePage, "24-mobile-navigation-voice-390.png");

  await mobilePage.goto(`${BASE}/my-work`, { waitUntil: "networkidle" });
  await shot(mobilePage, "25-mobile-operational-card-390.png");

  await browser.close();
  purgeLegacyScreenshots();
  console.log(`Screenshots written to ${OUT}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
