import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const outDir = "docs/verification/live-collaboration-rooms/after";
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on("pageerror", (e) => console.log("PAGEERROR", e.message));
page.on("console", (m) => {
  if (m.type() === "error") console.log("CONSOLE", m.text());
});

await page.goto("http://localhost:3000/rooms", { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(1500);
await page.screenshot({ path: path.join(outDir, "01-rooms-landing-1440.png"), fullPage: true });

const btn = page.locator("[data-cbai-lcr-primary]");
console.log("btn count", await btn.count());
await btn.click({ timeout: 10000 });
await page.waitForTimeout(800);
const wizard = await page.locator("[data-cbai-lcr-wizard]").count();
console.log("wizard", wizard);
await page.screenshot({ path: path.join(outDir, "02-wizard-step1-1440.png"), fullPage: true });

if (wizard) {
  await page.locator('[data-cbai-wizard-step="1"] input').first().fill("Evidence council");
  await page.locator('[data-cbai-wizard-step="1"] textarea').nth(0).fill("Review coverage gaps");
  await page.locator('[data-cbai-wizard-step="1"] textarea').nth(1).fill("Decision brief draft");
  await page.locator('[data-cbai-room-type="scientific_deliberation"]').click();
  await page.screenshot({ path: path.join(outDir, "03-room-type-selection-1440.png"), fullPage: true });
  await page.getByRole("button", { name: /Continue|Davom|Далее|Devam/i }).click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(outDir, "04-wizard-step2-people-1440.png"), fullPage: true });
  await page.locator('[data-cbai-wizard-step="2"] input').nth(0).fill("Host Botir");
  await page.locator('[data-cbai-wizard-step="2"] input').nth(3).fill("Approver");
  await page.getByRole("button", { name: /Continue|Davom|Далее|Devam/i }).click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(outDir, "05-wizard-step3-time-1440.png"), fullPage: true });
  await page.getByRole("button", { name: /Continue|Davom|Далее|Devam/i }).click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(outDir, "06-wizard-step4-materials-1440.png"), fullPage: true });
  await page.locator("[data-cbai-lcr-confirm-review]").check();
  await page.screenshot({ path: path.join(outDir, "07-final-review-1440.png"), fullPage: true });
  await page.locator("[data-cbai-lcr-confirm-create]").click();
  await page.waitForURL(/\/rooms\/session/, { timeout: 15000 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(outDir, "08-presenter-stage-1440.png"), fullPage: true });
  const consent = page.locator('section input[type="checkbox"]').first();
  if (await consent.count()) await consent.check();
  await page.getByRole("button", { name: /Files|Fayllar|Файлы|Dosyalar/i }).first().click().catch(() => {});
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(outDir, "09-device-preflight-1440.png"), fullPage: true });
  await page.getByRole("button", { name: /Evidence|Dalillar|Доказател|Kanıt/i }).first().click().catch(() => {});
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(outDir, "10-evidence-discussion-1440.png"), fullPage: true });
  await page.getByRole("button", { name: /Translation|Tarjima|Перевод|Çeviri/i }).first().click().catch(() => {});
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(outDir, "11-translation-view-1440.png"), fullPage: true });
  await page.getByRole("button", { name: /Decisions|Qaror|Решен|Karar/i }).first().click().catch(() => {});
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(outDir, "12-decisions-action-items-1440.png"), fullPage: true });
  await page.locator("[data-cbai-leave-room]").click();
  await page.waitForURL(/\/rooms$/, { timeout: 10000 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outDir, "13-after-leave-landing-1440.png"), fullPage: true });
}

await page.goto("http://localhost:3000/rooms", { waitUntil: "networkidle" });
await page.evaluate(() => localStorage.setItem("cbai-language", "uz"));
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(800);
await page.screenshot({ path: path.join(outDir, "14-uz-desktop-1440.png"), fullPage: true });

const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
await mobile.goto("http://localhost:3000/rooms", { waitUntil: "networkidle" });
await mobile.evaluate(() => localStorage.setItem("cbai-language", "ru"));
await mobile.reload({ waitUntil: "networkidle" });
await mobile.waitForTimeout(800);
await mobile.screenshot({ path: path.join(outDir, "15-ru-mobile-390.png"), fullPage: true });

await page.evaluate(() => {
  localStorage.setItem("cbai-theme", "light");
  document.documentElement.dataset.theme = "light";
});
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(800);
await page.screenshot({ path: path.join(outDir, "16-light-theme-1440.png"), fullPage: true });

await page.getByRole("button", { name: /Open voice operator|Ovoz|Голос|Ses/i }).click().catch(() => {});
await page.waitForTimeout(500);
await page.screenshot({ path: path.join(outDir, "17-voice-operator-open-1440.png"), fullPage: true });

await browser.close();
console.log("done", fs.readdirSync(outDir).length, fs.readdirSync(outDir).join(", "));
