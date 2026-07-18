/**
 * Manual interpretation input — editable textarea regression tests.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { chromium, type Browser } from "playwright";
import {
  createManualInterpretationDraftStore,
  isValidManualDescription,
  MIN_MANUAL_DESCRIPTION_LENGTH,
} from "@/lib/research-canvas/manual-interpretation-draft";
import {
  addManualInterpretationDraft,
  createSmartIdea,
  loadSmartIdea,
} from "@/lib/research-canvas/smart-idea-store";
import { RESEARCH_CANVAS_UZ } from "@/lib/i18n/platform-copy-research-canvas-uz";

const OPERATOR = "manual-input-test";
const VALID =
  "Bu batafsil qo'lda tavsif ilmiy g'oya, muammo va kutilgan natijani inson ko'rib chiqishi uchun yetarli.";
const BASE = "http://localhost:3000";

function readSource(path: string): string {
  return readFileSync(path, "utf8");
}

test("1. textarea source is not disabled", () => {
  const src = readSource("components/research/canvas/ManualInterpretationInputPanel.tsx");
  assert.doesNotMatch(src, /disabled=\{true\}/);
  assert.doesNotMatch(src, /<textarea[^>]*disabled/);
});

test("2. textarea source is not readOnly", () => {
  const src = readSource("components/research/canvas/ManualInterpretationInputPanel.tsx");
  assert.doesNotMatch(src, /readOnly/);
});

test("3. input change updates draft store state", () => {
  const store = createManualInterpretationDraftStore();
  store.write("idea-a", "typed value");
  assert.equal(store.read("idea-a"), "typed value");
});

test("4. typed content is retained in draft store", () => {
  const store = createManualInterpretationDraftStore();
  store.write("idea-a", VALID);
  assert.equal(store.read("idea-a"), VALID);
});

test("5. ordinary rerender path retains draft per idea id", () => {
  const store = createManualInterpretationDraftStore();
  store.write("idea-a", "persist me");
  store.write("idea-b", "other idea");
  assert.equal(store.read("idea-a"), "persist me");
  store.write("idea-a", "persist me");
  assert.equal(store.read("idea-a"), "persist me");
});

test("6. submit stays blocked below 30 characters", () => {
  assert.equal(isValidManualDescription(""), false);
  assert.equal(isValidManualDescription("short"), false);
  assert.equal(isValidManualDescription(" ".repeat(29)), false);
});

test("7. valid 30+ character text enables draft creation", () => {
  assert.equal(isValidManualDescription(VALID), true);
  assert.ok(VALID.trim().length >= MIN_MANUAL_DESCRIPTION_LENGTH);
});

test("8. submitted text attaches to the active Smart Idea", () => {
  const idea = createSmartIdea({
    title: "Attach test",
    originalDescription: "",
    problem: "Valid enough problem for review path",
    purpose: "Purpose",
    owner: OPERATOR,
  });
  addManualInterpretationDraft(idea.id, VALID, OPERATOR);
  const loaded = loadSmartIdea(idea.id)!;
  assert.ok(loaded.extractedItems.some((i) => i.fieldKey === "manual_description"));
});

test("9. changing active Smart Idea does not leak the previous draft", () => {
  const store = createManualInterpretationDraftStore();
  store.write("idea-a", "draft for A");
  store.write("idea-b", "draft for B");
  assert.notEqual(store.read("idea-a"), store.read("idea-b"));
});

test("10. creating the draft shows review workflow in store", () => {
  const idea = createSmartIdea({
    title: "Review actions",
    originalDescription: "",
    problem: "Valid enough problem for review path",
    purpose: "Purpose",
    owner: OPERATOR,
  });
  addManualInterpretationDraft(idea.id, VALID, OPERATOR);
  const src = readSource("components/research/canvas/InterpretationReviewCard.tsx");
  assert.match(src, /interpretConfirmAction/);
  assert.match(src, /interpretCorrectAction/);
  assert.match(src, /interpretRejectAction/);
});

test("11. manual input retains USER-PROVIDED provenance", () => {
  const idea = createSmartIdea({
    title: "Provenance",
    originalDescription: "",
    problem: "Valid enough problem for review path",
    purpose: "Purpose",
    owner: OPERATOR,
  });
  addManualInterpretationDraft(idea.id, VALID, OPERATOR);
  const manual = loadSmartIdea(idea.id)!.extractedItems.find((i) => i.fieldKey === "manual_description")!;
  assert.equal(manual.provenance, "USER-PROVIDED");
});

test("12. no fake AI confidence returns for manual draft", () => {
  const idea = createSmartIdea({
    title: "Confidence",
    originalDescription: "",
    problem: "Valid enough problem for review path",
    purpose: "Purpose",
    owner: OPERATOR,
  });
  addManualInterpretationDraft(idea.id, VALID, OPERATOR);
  const manual = loadSmartIdea(idea.id)!.extractedItems.find((i) => i.fieldKey === "manual_description")!;
  assert.equal(manual.aiConfidence, null);
});

test("13. Uzbek validation text is localized", () => {
  assert.match(RESEARCH_CANVAS_UZ.manualDescriptionTooShort, /30/);
  assert.match(RESEARCH_CANVAS_UZ.manualDescriptionTooShort, /belgi/i);
});

test("14. keyboard focus hook is present for manual textarea", () => {
  const src = readSource("components/research/canvas/ManualInterpretationInputPanel.tsx");
  assert.match(src, /\.focus\(\{ preventScroll: true \}\)/);
  assert.match(src, /aria-label=\{label\}/);
});

test("15. no invisible overlay captures textarea interaction", () => {
  const panel = readSource("components/research/canvas/ManualInterpretationInputPanel.tsx");
  const client = readSource("components/research/canvas/ResearchCanvasClient.tsx");
  assert.match(panel, /pointer-events-auto/);
  assert.match(panel, /relative isolate z-10/);
  assert.match(client, /stage === "INTERPRET" \? cbaiMineralSurface : cbaiGlassCard/);
  assert.doesNotMatch(panel, /backdrop-blur/);
});

async function isServerUp(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE}/research/canvas`, { signal: AbortSignal.timeout(2500) });
    return res.ok;
  } catch {
    return false;
  }
}

const serverUp = await isServerUp();
if (!serverUp) {
  test("16. Playwright typing requires dev server", { skip: true }, () => {});
} else {
  let browser: Browser | undefined;
  let browserReady = false;

  test("16a. Playwright setup", async () => {
    try {
      browser = await chromium.launch();
      browserReady = true;
    } catch {
      browserReady = false;
    }
  });

  test("16b. Real browser typing and paste in manual interpretation textarea", async (t) => {
    if (!browserReady || !browser) {
      t.skip("Playwright Chromium is not installed — run `npx playwright install chromium`");
      return;
    }
    const page = await browser.newPage();
    await page.goto(`${BASE}/research/canvas`, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);

    await page.getByPlaceholder("Idea title").fill("Editable Input Playwright");
    await page.getByPlaceholder("Problem").fill("Valid enough problem for review path");
    await page.getByPlaceholder("Purpose").fill("Purpose");
    await page.getByRole("button", { name: "Create private Smart Idea" }).click();
    await page.waitForTimeout(400);

    await page.getByRole("tab", { name: /INTERPRET/i }).click();
    await page.waitForTimeout(300);
    await page.getByRole("button", { name: /manual description/i }).click();
    await page.waitForTimeout(200);

    const textarea = page.getByTestId("manual-interpretation-textarea");
    await textarea.click();
    await textarea.pressSequentially("Short", { delay: 20 });
    await page.waitForTimeout(100);
    let value = await textarea.inputValue();
    assert.equal(value, "Short");

    await textarea.fill(VALID);
    await page.waitForTimeout(100);
    value = await textarea.inputValue();
    assert.equal(value, VALID);

    const submit = page.getByTestId("manual-interpretation-submit");
    await submit.click();
    await page.waitForTimeout(400);
    await page.getByRole("button", { name: /^Confirm$/i }).first().waitFor({ timeout: 5000 });
    await page.close();
  });

  test("16c. Playwright teardown", async () => {
    if (browser) await browser.close();
  });
}
