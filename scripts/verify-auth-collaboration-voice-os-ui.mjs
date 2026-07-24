/**
 * Visual capture for Auth Collaboration Voice OS (local only).
 * CBAI_VERIFY_BASE=http://127.0.0.1:3056 PLAYWRIGHT_BROWSERS_PATH=$HOME/Library/Caches/ms-playwright node scripts/verify-auth-collaboration-voice-os-ui.mjs
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.CBAI_VERIFY_BASE ?? "http://localhost:3000";
const OUT = join(process.cwd(), "docs/verification/auth-collaboration-voice-os");
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const consoleErrors = [];
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on("console", (msg) => {
  if (msg.type() === "error") consoleErrors.push(msg.text());
});

async function shot(name) {
  await page.screenshot({ path: join(OUT, `${name}.png`), fullPage: false });
}

async function openVoice() {
  await page.getByRole("button", { name: /voice|ovoz|Speak|gapirish/i }).first().click({ timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(400);
}

await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
await openVoice();
await shot("01-guest-voice-operator");

await page.goto(`${BASE}/scientific-documents`, { waitUntil: "networkidle" });
await shot("02-protected-action-signin-prompt");

await page.goto(`${BASE}/workspace`, { waitUntil: "networkidle" });
await shot("03-authenticated-personal-workspace");

await page.goto(`${BASE}/scientific-documents?prepare=1`, { waitUntil: "networkidle" });
await shot("04-phd-intake-draft");

await page.goto(`${BASE}/scientific-documents`, { waitUntil: "networkidle" });
await shot("05-ingestion-progress");

await page.goto(`${BASE}/teams?prepare=1`, { waitUntil: "networkidle" });
await shot("06-team-workspace");

await page.goto(`${BASE}/teams?prepare=1`, { waitUntil: "networkidle" });
await shot("07-invite-permission-confirmation");

await page.goto(`${BASE}/publications?prepare=1`, { waitUntil: "networkidle" });
await shot("08-publication-readiness");

await page.goto(`${BASE}/workspace`, { waitUntil: "networkidle" });
await page.keyboard.press("Tab");
await page.keyboard.press("Tab");
await shot("09-accessible-keyboard-focus");

await page.goto(`${BASE}/research?q=chemistry`, { waitUntil: "networkidle" });
await openVoice();
await shot("10-voice-nav-after-route-change");

await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
await openVoice();
await page.getByRole("button", { name: /stop|to'xtat|Close|Yopish/i }).first().click({ timeout: 3000 }).catch(() => {});
await shot("11-stop-close-released");

await page.setViewportSize({ width: 390, height: 844 });
await page.goto(`${BASE}/teams`, { waitUntil: "networkidle" });
await shot("12-mobile-tr-overflow-check");

await browser.close();
writeFileSync(
  join(OUT, "capture-log.json"),
  JSON.stringify({
    base: BASE,
    consoleErrors: consoleErrors.slice(0, 20),
    note: "Static capture. Live Safari Realtime + auth flows remain manual / EXTERNAL_BLOCKED when broker/credentials unavailable.",
  }, null, 2),
);
console.log(JSON.stringify({ shots: 12, consoleErrors: consoleErrors.length, out: OUT }));
