/**
 * Visual and behavioural verification for the CBAI Final 10/10 consolidation pass.
 *
 * Runs against a served build (`scripts/serve-static-export.mjs`, default
 * http://127.0.0.1:3100). For every capture it records page errors, console
 * errors, horizontal overflow and the rendered <h1>, so the manifest can be
 * reviewed alongside the screenshots instead of trusting the images alone.
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const base = process.env.CBAI_VERIFY_BASE ?? "http://127.0.0.1:3100";
const outDir = process.env.CBAI_VERIFY_OUT ?? "docs/verification/cbai-final-10";
const root = join(process.cwd(), outDir);
for (const folder of ["final", "mobile", "locales", "voice", "provenance", "pdf", "rooms", "zoom"]) {
  mkdirSync(join(root, folder), { recursive: true });
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
  await page.waitForTimeout(900);
}

async function capture(context, folder, name, route, options = {}) {
  const page = await context.newPage();
  const pageErrors = [];
  const consoleErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message.split("\n")[0]));
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text().split("\n")[0]);
  });
  await page.goto(`${base}${route}`, { waitUntil: "load", timeout: 60_000 });
  if (options.locale) await setLocale(page, options.locale);
  if (options.light) {
    await page.evaluate(() => {
      document.documentElement.classList.add("theme-light");
      localStorage.setItem("cbai-theme", "light");
    });
  }
  if (options.zoom) {
    await page.evaluate((factor) => {
      document.documentElement.style.zoom = String(factor);
    }, options.zoom);
  }
  if (options.openVoice) {
    const button = page
      .getByRole("button", {
        name: /speak to cbai|open voice|ovozli operator|голосовой оператор|sesli operatör/i,
      })
      .first();
    if (await button.count()) await button.click();
    else await page.locator(".cbai-spatial-voice-cta, .cbai-voice-dock-closed button").first().click();
  }
  if (options.openMobileNav) {
    const button = page
      .getByRole("button", { name: /open navigation|navigation|navigatsiya|навигац|gezinti/i })
      .first();
    if (await button.count()) await button.click();
  }
  if (options.click) {
    const target = page.locator(options.click).first();
    if (await target.count()) await target.click();
  }
  await page.waitForTimeout(options.wait ?? 900);

  const audit = await page.evaluate(() => {
    const doc = document.documentElement;
    const heading = document.querySelector("h1");
    const headings = Array.from(document.querySelectorAll("h1")).length;
    const voice = document.querySelector("[data-voice-state]");
    const rawKey = /(^|\s)[a-z]+(\.[a-zA-Z]+){1,}(\s|$)/.test(heading?.textContent ?? "");
    return {
      overflow: doc.scrollWidth > doc.clientWidth + 1,
      h1: heading?.textContent?.trim().slice(0, 120) ?? null,
      h1Count: headings,
      voiceState: voice?.getAttribute("data-voice-state") ?? null,
      micLive: voice?.getAttribute("data-mic-live") ?? null,
      updateCapability:
        document.querySelector("[data-update-capability]")?.getAttribute("data-update-capability") ?? null,
      feedState: document.querySelector("[data-updates-feed]")?.getAttribute("data-updates-feed") ?? null,
      suspiciousHeadingKey: rawKey,
    };
  });

  const path = join(root, folder, `${name}.png`);
  await page.screenshot({ path, fullPage: false });
  results.push({
    folder,
    name,
    route,
    locale: options.locale ?? "en",
    ...audit,
    pageErrors,
    consoleErrors,
  });
  await page.close();
}

const desktopRoutes = [
  ["home-dark", "/"],
  ["my-work", "/my-work"],
  ["search", "/search"],
  ["countries", "/countries?country=uzbekistan"],
  ["companies", "/companies?company=apple"],
  ["universities", "/universities?university=harvard-university"],
  ["research", "/research"],
  ["research-topic", "/research/microbiology"],
  ["evidence", "/evidence"],
  ["knowledge-graph", "/graph"],
  ["reports", "/reports"],
  ["investor", "/investor"],
  ["government", "/government"],
  ["governance", "/governance"],
  ["trust", "/trust"],
  ["settings", "/settings"],
  ["about", "/about"],
  ["global-updates", "/notifications"],
  ["composer", "/my-work?compose=1"],
];

const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
for (const [name, route] of desktopRoutes) {
  await capture(desktop, "final", name, route);
}
await capture(desktop, "final", "home-light", "/", { light: true });
await capture(desktop, "final", "home-1920", "/");
await capture(desktop, "voice", "voice-open", "/research", { openVoice: true });
await capture(desktop, "provenance", "country-source-freshness", "/countries?country=uzbekistan", {
  wait: 1400,
});
await capture(desktop, "provenance", "updates-capability", "/notifications", { wait: 1400 });
await capture(desktop, "rooms", "rooms-home", "/rooms");
await capture(desktop, "rooms", "room-session-empty", "/rooms/session");

const wide = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
await capture(wide, "final", "home-1920-wide", "/");
await capture(wide, "final", "country-1920", "/countries?country=uzbekistan");
await wide.close();

const compact = await browser.newContext({ viewport: { width: 1280, height: 800 } });
await capture(compact, "final", "home-1280", "/");
await capture(compact, "final", "updates-1280", "/notifications");
await compact.close();

for (const zoom of [0.8, 1.25, 1.5, 2]) {
  await capture(desktop, "zoom", `home-zoom-${String(zoom).replace(".", "_")}`, "/", { zoom });
  await capture(desktop, "zoom", `updates-zoom-${String(zoom).replace(".", "_")}`, "/notifications", {
    zoom,
  });
}

const signedIn = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await signedIn.addInitScript(() => {
  const id = "visual-local-user";
  localStorage.setItem(
    "cbai-auth-users",
    JSON.stringify([
      {
        id,
        email: "visual@example.invalid",
        displayName: "Visual QA",
        organization: "",
        passwordHash: "not-used",
        passwordSalt: "not-used",
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    ]),
  );
  localStorage.setItem(
    "cbai-auth-session",
    JSON.stringify({ userId: id, createdAt: "2026-01-01T00:00:00.000Z" }),
  );
});
await capture(signedIn, "pdf", "pdf-local-only", "/scientific-documents", { wait: 1400 });
await signedIn.close();
await capture(desktop, "pdf", "pdf-signed-out", "/scientific-documents");

for (const locale of ["en", "uz", "ru", "tr"]) {
  await capture(desktop, "locales", `${locale}-home`, "/", { locale });
  await capture(desktop, "locales", `${locale}-updates`, "/notifications", { locale });
  await capture(desktop, "locales", `${locale}-country`, "/countries?country=uzbekistan", { locale });
  await capture(desktop, "locales", `${locale}-my-work`, "/my-work", { locale });
}

for (const viewport of [
  { width: 390, height: 844, suffix: "390" },
  { width: 430, height: 932, suffix: "430" },
]) {
  const mobile = await browser.newContext({ viewport });
  await capture(mobile, "mobile", `home-${viewport.suffix}`, "/");
  await capture(mobile, "mobile", `navigation-${viewport.suffix}`, "/", { openMobileNav: true });
  await capture(mobile, "mobile", `composer-${viewport.suffix}`, "/my-work?compose=1");
  await capture(mobile, "mobile", `country-${viewport.suffix}`, "/countries?country=uzbekistan");
  await capture(mobile, "mobile", `updates-${viewport.suffix}`, "/notifications");
  await mobile.close();
}

await desktop.close();
await browser.close();

const overflowFailures = results.filter((item) => item.overflow);
const errorFailures = results.filter((item) => item.pageErrors.length || item.consoleErrors.length);
const headingKeyLeaks = results.filter((item) => item.suspiciousHeadingKey);

writeFileSync(
  join(root, "manifest.json"),
  JSON.stringify(
    {
      base,
      capturedAt: new Date().toISOString(),
      count: results.length,
      overflowFailures: overflowFailures.map((item) => `${item.folder}/${item.name}`),
      errorFailures: errorFailures.map((item) => ({
        capture: `${item.folder}/${item.name}`,
        pageErrors: item.pageErrors,
        consoleErrors: item.consoleErrors,
      })),
      headingKeyLeaks: headingKeyLeaks.map((item) => `${item.folder}/${item.name}`),
      results,
    },
    null,
    2,
  ),
);

console.log(
  `Captured ${results.length} screenshots. overflow=${overflowFailures.length} errors=${errorFailures.length} headingKeyLeaks=${headingKeyLeaks.length}`,
);
if (overflowFailures.length || errorFailures.length || headingKeyLeaks.length) process.exitCode = 1;
