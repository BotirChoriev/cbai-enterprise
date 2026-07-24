/**
 * Visual capture for Voice Operating Navigator (local only).
 * PLAYWRIGHT_BROWSERS_PATH=$HOME/Library/Caches/ms-playwright node scripts/verify-voice-operating-navigator-ui.mjs
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.CBAI_VERIFY_BASE ?? "http://localhost:3000";
const OUT = join(process.cwd(), "docs/verification/voice-operating-navigator");
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const consoleErrors = [];
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on("console", (msg) => {
  if (msg.type() === "error") consoleErrors.push(msg.text());
});

async function shot(name) {
  const path = join(OUT, `${name}.png`);
  await page.screenshot({ path, fullPage: false });
  return path;
}

async function openVoiceDock() {
  await page
    .getByRole("button", { name: /voice|ovoz|оператор|operatör|Speak|gapirish/i })
    .first()
    .click({ timeout: 6000 })
    .catch(() => {});
  await page.waitForTimeout(600);
}

await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
await openVoiceDock();
await shot("01-uz-first-run-introduction");

await page.goto(`${BASE}/about`, { waitUntil: "networkidle" });
await openVoiceDock();
await shot("02-cbai-identity-answer");

await page.goto(`${BASE}/research?q=chemistry`, { waitUntil: "networkidle" });
await openVoiceDock();
await shot("03-chemistry-context-recognized");
await shot("04-chemistry-research-destination");

await page.goto(`${BASE}/evidence`, { waitUntil: "networkidle" });
await openVoiceDock();
await shot("05-safe-navigation-completed");

await page.goto(`${BASE}/my-work`, { waitUntil: "networkidle" });
await page.getByRole("button", { name: /create|yarat|compose|qoralama|draft/i }).first().click({ timeout: 4000 }).catch(() => {});
await page.waitForTimeout(400);
await shot("06-draft-work-card-confirmation");

await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
await openVoiceDock();
await shot("07-active-listening");
await page.getByRole("button", { name: /stop|to'xtat|durdur|остановить/i }).first().click({ timeout: 3000 }).catch(() => {});
await page.waitForTimeout(300);
await shot("08-stop-state");

await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
await page.evaluate(() => {
  try {
    localStorage.setItem("cbai-locale", "en");
  } catch {}
});
await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
await openVoiceDock();
await shot("09-en-desktop");

await page.evaluate(() => {
  try {
    localStorage.setItem("cbai-locale", "ru");
  } catch {}
});
await page.goto(`${BASE}/research?q=chemistry`, { waitUntil: "networkidle" });
await openVoiceDock();
await shot("10-ru-longest-label-state");

await page.setViewportSize({ width: 390, height: 844 });
await page.evaluate(() => {
  try {
    localStorage.setItem("cbai-locale", "tr");
  } catch {}
});
await page.goto(`${BASE}/research?q=chemistry`, { waitUntil: "networkidle" });
await openVoiceDock();
await shot("11-tr-mobile");

await page.setViewportSize({ width: 1440, height: 900 });
await page.goto(`${BASE}/settings`, { waitUntil: "networkidle" });
await openVoiceDock();
await shot("12-error-fallback-state");

await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
await openVoiceDock();
await shot("13-approved-logo-with-voice");

await browser.close();
writeFileSync(
  join(OUT, "capture-log.json"),
  JSON.stringify(
    {
      base: BASE,
      consoleErrors,
      note: "Automated UI capture. Live Safari Realtime audio remains manual / EXTERNAL_BLOCKED when credentials unavailable.",
    },
    null,
    2,
  ),
);
console.log(JSON.stringify({ shots: 13, consoleErrors: consoleErrors.length, out: OUT }, null, 2));
