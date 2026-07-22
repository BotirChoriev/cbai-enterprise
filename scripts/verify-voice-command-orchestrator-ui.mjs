/**
 * Visual capture for Voice Command Orchestrator (local only).
 * PLAYWRIGHT_BROWSERS_PATH=$HOME/Library/Caches/ms-playwright node scripts/verify-voice-command-orchestrator-ui.mjs
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.CBAI_VERIFY_BASE ?? "http://localhost:3000";
const OUT = join(process.cwd(), "docs/verification/voice-command-orchestrator");
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

await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
await page.getByRole("button", { name: /voice|ovoz|оператор|operatör/i }).first().click({ timeout: 5000 }).catch(() => {});
await page.waitForTimeout(500);
await shot("01-initial-greeting-dock");

await page.goto(`${BASE}/research?q=chemistry`, { waitUntil: "networkidle" });
await shot("02-chemistry-research-selected");

await page.goto(`${BASE}/knowledge`, { waitUntil: "networkidle" });
await shot("03-evidence-navigation");

await page.goto(`${BASE}/my-work`, { waitUntil: "networkidle" });
await shot("04-my-work-navigation");

await page.setViewportSize({ width: 390, height: 844 });
await page.goto(`${BASE}/research?q=chemistry`, { waitUntil: "networkidle" });
await page.getByRole("button", { name: /voice|ovoz|Open voice/i }).first().click({ timeout: 5000 }).catch(() => {});
await page.waitForTimeout(400);
await shot("05-mobile-voice-command-state");

await page.setViewportSize({ width: 1440, height: 900 });
await page.goto(`${BASE}/research`, { waitUntil: "networkidle" });
await shot("06-research-workspace");

await page.goto(`${BASE}/reports`, { waitUntil: "networkidle" });
await shot("07-reports-after-command-target");

await page.evaluate(() => {
  document.documentElement.lang = "ru";
});
await page.goto(`${BASE}/research?q=chemistry`, { waitUntil: "networkidle" });
await shot("08-ru-or-tr-command-example");

await browser.close();
writeFileSync(
  join(OUT, "capture-log.json"),
  JSON.stringify({ base: BASE, consoleErrors, note: "Automated route/UI capture. Full spoken Safari Realtime verification remains manual." }, null, 2),
);
console.log(JSON.stringify({ shots: 8, consoleErrors: consoleErrors.length }, null, 2));
