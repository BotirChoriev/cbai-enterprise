/**
 * Visual verification for adaptive workspace + brand identity surfaces.
 * Requires a served app: CBAI_VERIFY_BASE=http://127.0.0.1:PORT
 */
import { chromium, devices } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const base = process.env.CBAI_VERIFY_BASE ?? "http://127.0.0.1:3000";
const outDir = join(process.cwd(), "docs/verification/adaptive-workspace");
for (const folder of ["desktop", "mobile", "voice", "modes"]) {
  mkdirSync(join(outDir, folder), { recursive: true });
}

const browser = await chromium.launch();
const results = [];

async function setLocale(page, locale) {
  await page.evaluate((value) => {
    const raw = localStorage.getItem("cbai-assistant-profile:local");
    const profile = raw ? JSON.parse(raw) : {};
    localStorage.setItem(
      "cbai-assistant-profile:local",
      JSON.stringify({
        ...profile,
        preferredLanguage: value,
        translationLanguage: value,
        speechLanguage: value,
        timezone: "UTC",
        accessibility: profile.accessibility ?? {
          reducedMotion: false,
          highContrast: false,
          largerText: false,
        },
      }),
    );
  }, locale);
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(700);
}

async function capture(context, folder, name, route, options = {}) {
  const page = await context.newPage();
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message.split("\n")[0]));
  await page.goto(`${base}${route}`, { waitUntil: "load", timeout: 60_000 });
  if (options.locale) await setLocale(page, options.locale);
  if (options.light) {
    await page.evaluate(() => {
      document.documentElement.classList.add("theme-light");
      localStorage.setItem("cbai-theme", "light");
    });
  }
  if (options.dark) {
    await page.evaluate(() => {
      document.documentElement.classList.remove("theme-light");
      localStorage.setItem("cbai-theme", "dark");
    });
  }
  if (options.fillRole) {
    const area = page.locator("#role-statement");
    if (await area.count()) {
      await area.fill(options.fillRole);
      const interpret = page.getByRole("button").filter({ hasText: /interpret|talqin|интерпрет|yorum/i }).first();
      if (await interpret.count()) await interpret.click();
      else await page.locator("button").nth(0).click();
      await page.waitForTimeout(600);
    }
  }
  if (options.openVoice) {
    const button = page
      .getByRole("button", {
        name: /speak to cbai|open voice|ovozli operator|голосовой оператор|sesli operatör/i,
      })
      .first();
    if (await button.count()) await button.click();
    else await page.locator(".cbai-spatial-voice-cta, .cbai-voice-dock-closed button").first().click().catch(() => {});
    await page.waitForTimeout(700);
  }
  if (options.openMobileNav) {
    const button = page.getByRole("button", { name: /open navigation|navigation|navigatsiya|навигац|gezinti/i }).first();
    if (await button.count()) await button.click();
  }
  await page.waitForTimeout(options.wait ?? 800);
  const path = join(outDir, folder, `${name}.png`);
  await page.screenshot({ path, fullPage: false });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  results.push({ name: `${folder}/${name}`, route, overflow, pageErrors, path });
  await page.close();
}

const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await capture(desktop, "desktop", "my-workspace", "/my-work");
await capture(desktop, "desktop", "role-onboarding-student", "/my-work", {
  fillRole: "I am a student studying economics. I need to finish an assignment on inflation.",
});
await capture(desktop, "desktop", "role-draft-economist", "/my-work", {
  fillRole: "Men iqtisodchiman. O‘zbekiston inflyatsiyasi bo‘yicha tahlil qilmoqchiman.",
  locale: "uz",
});
await capture(desktop, "desktop", "researcher-templates", "/my-work", {
  fillRole: "I am a researcher working on climate evidence.",
});
await capture(desktop, "desktop", "government-draft", "/my-work", {
  fillRole: "I work in government public administration on education policy.",
});
await capture(desktop, "desktop", "general-draft", "/my-work", {
  fillRole: "I am not sure yet. I want to explore the platform.",
});
await capture(desktop, "desktop", "global-activity", "/discover");
await capture(desktop, "desktop", "about-platform-identity", "/about");
await capture(desktop, "desktop", "rooms-groups", "/rooms");
await capture(desktop, "desktop", "pdf-scientific", "/scientific-documents");
await capture(desktop, "desktop", "privacy-settings", "/settings");
await capture(desktop, "desktop", "source-evidence", "/evidence");
await capture(desktop, "voice", "voice-operator-open", "/my-work", { openVoice: true });
await capture(desktop, "modes", "home-dark", "/", { dark: true });
await capture(desktop, "modes", "home-light", "/", { light: true });
await desktop.close();

const mobile = await browser.newContext({ ...devices["iPhone 13"] });
await capture(mobile, "mobile", "my-workspace", "/my-work");
await capture(mobile, "mobile", "global-activity", "/discover");
await capture(mobile, "mobile", "about-identity", "/about");
await capture(mobile, "mobile", "navigation", "/my-work", { openMobileNav: true });
await capture(mobile, "mobile", "economist-draft", "/my-work", {
  fillRole: "Men iqtisodchiman. O‘zbekiston inflyatsiyasi bo‘yicha tahlil qilmoqchiman.",
  locale: "uz",
});
await mobile.close();

await browser.close();
writeFileSync(join(outDir, "screenshot-manifest.json"), JSON.stringify({ base, results }, null, 2));
const overflows = results.filter((item) => item.overflow);
console.log(`Captured ${results.length} screenshots. overflow=${overflows.length}`);
if (overflows.length) {
  console.log(overflows.map((item) => item.name).join(", "));
  process.exitCode = 1;
}
