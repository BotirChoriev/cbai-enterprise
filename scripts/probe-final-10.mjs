/**
 * Focused DOM probes for the Final 10/10 pass: heading structure and the real
 * Voice Operator state after a microphone attempt with a fake capture device.
 */
import { chromium } from "playwright";

const base = process.env.CBAI_VERIFY_BASE ?? "http://127.0.0.1:3100";
const browser = await chromium.launch({
  args: ["--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream"],
});

const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await context.grantPermissions(["microphone"], { origin: base });

for (const route of ["/research", "/about", "/", "/notifications"]) {
  const page = await context.newPage();
  await page.goto(`${base}${route}`, { waitUntil: "load" });
  await page.waitForTimeout(1200);
  const headings = await page.evaluate(() =>
    Array.from(document.querySelectorAll("h1")).map((node) => ({
      text: node.textContent?.trim().slice(0, 60) ?? "",
      className: node.className.slice(0, 60),
      hidden: node.offsetParent === null,
    })),
  );
  console.log(route, JSON.stringify(headings));
  await page.close();
}

const page = await context.newPage();
const consoleErrors = [];
page.on("console", (message) => {
  if (message.type() === "error") consoleErrors.push(message.text().split("\n")[0].slice(0, 140));
});
await page.goto(`${base}/research`, { waitUntil: "load" });
await page.waitForTimeout(1200);
const openButton = page.locator(".cbai-spatial-voice-cta, .cbai-voice-dock-closed button").first();
await openButton.click();
await page.waitForTimeout(600);
console.log("after open:", await page.getAttribute("[data-voice-state]", "data-voice-state"));

const mic = page.locator('[data-voice-state] button[aria-pressed]').first();
if (await mic.count()) {
  await mic.click();
  for (const wait of [1000, 2000, 4000]) {
    await page.waitForTimeout(wait);
    console.log(
      `after mic +${wait}ms:`,
      await page.getAttribute("[data-voice-state]", "data-voice-state"),
      "micLive=",
      await page.getAttribute("[data-voice-state]", "data-mic-live"),
    );
  }
  const notice = await page.evaluate(() => {
    const dock = document.querySelector(".cbai-voice-dock-open");
    return dock?.textContent?.replace(/\s+/g, " ").slice(0, 400) ?? null;
  });
  console.log("dock text:", notice);
} else {
  console.log("mic button not found");
}
console.log("console errors:", JSON.stringify(consoleErrors));

const tracks = await page.evaluate(async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => null);
  if (!stream) return "no-stream";
  const state = stream.getAudioTracks().map((track) => track.readyState).join(",");
  stream.getTracks().forEach((track) => track.stop());
  return state;
});
console.log("probe capture track state:", tracks);

await page.close();
await context.close();
await browser.close();
