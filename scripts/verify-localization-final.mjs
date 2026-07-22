/**
 * Localization final verification screenshots.
 * Run: PLAYWRIGHT_BROWSERS_PATH=$HOME/Library/Caches/ms-playwright node scripts/verify-localization-final.mjs
 */
import { chromium, devices } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.CBAI_VERIFY_BASE ?? "http://localhost:3000";
const OUT = join(process.cwd(), "docs/verification/operational-object-system/localization-final");
mkdirSync(OUT, { recursive: true });

function profileInit(lang, themeMode) {
  return `(function(){
    const key = "cbai-assistant-profile:local";
    let p = {};
    try { p = JSON.parse(localStorage.getItem(key) || "{}"); } catch {}
    p.preferredLanguage = ${JSON.stringify(lang)};
    p.themeMode = ${JSON.stringify(themeMode)};
    p.name = p.name || "Verify";
    localStorage.setItem(key, JSON.stringify(p));
    try { localStorage.removeItem("cbai-living-memory-cleared"); } catch {}
    try { sessionStorage.removeItem("cbai-companion-thought"); } catch {}
  })();`;
}

async function shot(page, name) {
  await page.screenshot({ path: join(OUT, name), fullPage: false });
  console.log("saved", name);
}

async function waitLang(page, lang) {
  await page.waitForFunction(
    (code) => document.documentElement.lang === code,
    lang,
    { timeout: 8000 },
  );
}

async function main() {
  const browser = await chromium.launch({ args: ["--use-gl=angle", "--enable-webgl"] });
  const desktop = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const mobile = await browser.newContext({ ...devices["iPhone 12"] });
  const page = await desktop.newPage();
  const mobilePage = await mobile.newPage();

  await page.addInitScript(profileInit("uz", "dark"));
  await page.goto(`${BASE}/investor`, { waitUntil: "networkidle" });
  await waitLang(page, "uz");
  await shot(page, "01-investor-uz-1920.png");

  await page.goto(`${BASE}/governance`, { waitUntil: "networkidle" });
  await waitLang(page, "uz");
  await shot(page, "02-governance-uz-1920.png");

  await page.addInitScript(profileInit("ru", "dark"));
  await page.goto(`${BASE}/investor`, { waitUntil: "networkidle" });
  await waitLang(page, "ru");
  await shot(page, "03-investor-ru-1920.png");

  await page.addInitScript(profileInit("tr", "dark"));
  await page.goto(`${BASE}/governance`, { waitUntil: "networkidle" });
  await waitLang(page, "tr");
  await shot(page, "04-governance-tr-1920.png");

  await page.addInitScript(profileInit("en", "dark"));
  await page.goto(`${BASE}/research`, { waitUntil: "networkidle" });
  await waitLang(page, "en");
  await page.evaluate(() => {
    sessionStorage.setItem(
      "cbai-companion-thought",
      JSON.stringify({
        missionId: null,
        lastRoute: "/my-work",
        lastFocus: "Mission home — progress, next action, and latest evidence.",
        recordedAt: new Date().toISOString(),
        focusKind: "system",
        focusLocale: "en",
        purposeKey: "routeResearchPurpose",
      }),
    );
  });
  await page.addInitScript(profileInit("uz", "dark"));
  await page.goto(`${BASE}/research`, { waitUntil: "networkidle" });
  await waitLang(page, "uz");
  await shot(page, "05-mission-bar-en-to-uz-research-1920.png");

  await page.addInitScript(profileInit("ru", "dark"));
  await page.goto(`${BASE}/my-work`, { waitUntil: "networkidle" });
  await waitLang(page, "ru");
  await page.locator(".cbai-op-index__create").click();
  await page.waitForSelector(".cbai-op-composer");
  await shot(page, "06-composer-ru-1920.png");
  await page.keyboard.press("Escape");

  await page.addInitScript(profileInit("tr", "dark"));
  await page.goto(BASE, { waitUntil: "networkidle" });
  await waitLang(page, "tr");
  await page.getByRole("button", { name: /Voice|Ses|Ovoz/i }).first().click({ timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(500);
  await shot(page, "07-voice-dock-tr-1920.png");

  await mobilePage.addInitScript(profileInit("ru", "dark"));
  await mobilePage.goto(`${BASE}/investor`, { waitUntil: "networkidle" });
  await waitLang(mobilePage, "ru");
  await shot(mobilePage, "08-investor-ru-mobile-390.png");

  await browser.close();
  console.log(`Screenshots written to ${OUT}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
