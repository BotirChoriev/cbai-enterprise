/**
 * Interpretation truth integrity — focused regression tests.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  assessInputQuality,
  buildManualDescriptionItem,
  displayInterpretationValue,
  evaluateIdeaModelGate,
  hasDocumentedModelConfidence,
  migrateExtractedItem,
} from "@/lib/research-canvas/interpretation-integrity";
import {
  addManualInterpretationDraft,
  buildIdeaModel,
  canBuildIdeaModel,
  confirmExtractedItem,
  correctExtractedItem,
  createSmartIdea,
  loadSmartIdea,
  migrateExtractedItem as storeMigrate,
  rejectExtractedItem,
} from "@/lib/research-canvas/smart-idea-store";
import { RESEARCH_CANVAS_UZ } from "@/lib/i18n/platform-copy-research-canvas-uz";
import { loadGenesisAudit } from "@/lib/genesis/genesis-audit-store";

const OPERATOR = "interpret-integrity-test";
const MANUAL =
  "Bu batafsil qo'lda tavsif ilmiy g'oya, muammo va kutilgan natijani inson ko'rib chiqishi uchun yetarli.";

test("1. Manual input provenance is USER-PROVIDED", () => {
  const item = buildManualDescriptionItem(MANUAL);
  assert.equal(item.provenance, "USER-PROVIDED");
  assert.equal(item.method, "manual_description");
});

test("2. Manual input has confidence null", () => {
  const item = buildManualDescriptionItem(MANUAL);
  assert.equal(item.aiConfidence, null);
  assert.equal(hasDocumentedModelConfidence(item), false);
});

test("3. Deterministic mapping is not labeled AI", () => {
  const idea = createSmartIdea({
    title: "Map test",
    originalDescription: "mohiyat va ma'no",
    problem: "hudbunlik",
    purpose: "tarbiya",
    owner: OPERATOR,
  });
  addManualInterpretationDraft(idea.id, MANUAL, OPERATOR);
  const mapped = loadSmartIdea(idea.id)!.extractedItems.find((i) => i.fieldKey === "problem_statement")!;
  assert.equal(mapped.provenance, "EXTRACTED_FROM_USER_INPUT");
  assert.equal(mapped.method, "deterministic_field_mapping");
  assert.equal(mapped.aiConfidence, null);
});

test("4. Empty input cannot create a confirmed interpretation", () => {
  const idea = createSmartIdea({
    title: "Empty",
    originalDescription: "",
    problem: "Valid enough problem statement here",
    purpose: "Purpose text",
    owner: OPERATOR,
  });
  assert.equal(addManualInterpretationDraft(idea.id, "   ", OPERATOR), null);
  const gate = canBuildIdeaModel(loadSmartIdea(idea.id)!);
  assert.equal(gate.ok, false);
});

test("5. Low-information intake fields are flagged for review", () => {
  const idea = createSmartIdea({
    title: "Low info",
    originalDescription: "x",
    problem: "y",
    purpose: "z",
    owner: OPERATOR,
  });
  addManualInterpretationDraft(idea.id, MANUAL, OPERATOR);
  const purpose = loadSmartIdea(idea.id)!.extractedItems.find((i) => i.fieldKey === "purpose")!;
  assert.equal(purpose.confirmationStatus, "Insufficient Quality");
});

test("6. Original text is preserved after correction", () => {
  const idea = createSmartIdea({
    title: "Correct",
    originalDescription: "",
    problem: "Valid enough problem for review path",
    purpose: "Purpose",
    owner: OPERATOR,
  });
  addManualInterpretationDraft(idea.id, MANUAL, OPERATOR);
  const manual = loadSmartIdea(idea.id)!.extractedItems.find((i) => i.fieldKey === "manual_description")!;
  correctExtractedItem(idea.id, manual.id, { correctedValue: "Corrected manual description with enough detail.", actor: OPERATOR });
  const updated = loadSmartIdea(idea.id)!.extractedItems.find((i) => i.id === manual.id)!;
  assert.equal(updated.originalText, MANUAL);
  assert.equal(updated.userCorrection, "Corrected manual description with enough detail.");
});

test("7. Correction requires a separate confirmation", () => {
  const idea = createSmartIdea({
    title: "Confirm after correct",
    originalDescription: "",
    problem: "Valid enough problem for review path",
    purpose: "Purpose",
    owner: OPERATOR,
  });
  addManualInterpretationDraft(idea.id, MANUAL, OPERATOR);
  const manual = loadSmartIdea(idea.id)!.extractedItems.find((i) => i.fieldKey === "manual_description")!;
  correctExtractedItem(idea.id, manual.id, { correctedValue: "Updated manual description with sufficient detail.", actor: OPERATOR });
  const corrected = loadSmartIdea(idea.id)!.extractedItems.find((i) => i.id === manual.id)!;
  assert.equal(corrected.confirmationStatus, "Human-Corrected");
  assert.equal(canBuildIdeaModel(loadSmartIdea(idea.id)!).ok, false);
  confirmExtractedItem(idea.id, manual.id, { status: "Confirmed", actor: OPERATOR });
  assert.equal(loadSmartIdea(idea.id)!.extractedItems.find((i) => i.id === manual.id)!.confirmationStatus, "Confirmed");
});

test("8. Rejection does not count as supporting evidence", () => {
  const idea = createSmartIdea({
    title: "Reject optional",
    originalDescription: "Some original",
    problem: "Valid enough problem for review path",
    purpose: "Purpose",
    owner: OPERATOR,
  });
  addManualInterpretationDraft(idea.id, MANUAL, OPERATOR);
  const optional = loadSmartIdea(idea.id)!.extractedItems.find((i) => i.fieldKey === "original_description")!;
  rejectExtractedItem(idea.id, optional.id, { reason: "Not needed", actor: OPERATOR });
  const rejected = loadSmartIdea(idea.id)!.extractedItems.find((i) => i.id === optional.id)!;
  assert.equal(rejected.confirmationStatus, "Rejected");
  assert.ok(!evaluateIdeaModelGate(loadSmartIdea(idea.id)!).ok);
});

test("9. Required rejected field blocks Idea Model", () => {
  const idea = createSmartIdea({
    title: "Reject required",
    originalDescription: "",
    problem: "Valid enough problem for review path",
    purpose: "Purpose",
    owner: OPERATOR,
  });
  addManualInterpretationDraft(idea.id, MANUAL, OPERATOR);
  const manual = loadSmartIdea(idea.id)!.extractedItems.find((i) => i.fieldKey === "manual_description")!;
  rejectExtractedItem(idea.id, manual.id, { reason: "Wrong draft", actor: OPERATOR });
  const gate = canBuildIdeaModel(loadSmartIdea(idea.id)!);
  assert.equal(gate.ok, false);
  assert.ok(gate.reasonKeys.includes("required_rejected"));
});

test("10. Optional rejected field does not block when required confirmed", () => {
  const idea = createSmartIdea({
    title: "Optional reject ok",
    originalDescription: "Some original description text",
    problem: "Valid enough problem for review path",
    purpose: "Purpose",
    owner: OPERATOR,
  });
  addManualInterpretationDraft(idea.id, MANUAL, OPERATOR);
  const loaded = loadSmartIdea(idea.id)!;
  const manual = loaded.extractedItems.find((i) => i.fieldKey === "manual_description")!;
  const optional = loaded.extractedItems.find((i) => i.fieldKey === "purpose" && !i.required);
  confirmExtractedItem(idea.id, manual.id, { status: "Confirmed", actor: OPERATOR });
  if (optional) rejectExtractedItem(idea.id, optional.id, { reason: "Skip", actor: OPERATOR });
  for (const item of loadSmartIdea(idea.id)!.extractedItems.filter((i) => !i.required && i.confirmationStatus !== "Rejected" && i.confirmationStatus !== "Confirmed")) {
    if (item.confirmationStatus === "Insufficient Quality") {
      rejectExtractedItem(idea.id, item.id, { reason: "Skip", actor: OPERATOR });
    } else {
      confirmExtractedItem(idea.id, item.id, { status: "Confirmed", actor: OPERATOR });
    }
  }
  assert.equal(canBuildIdeaModel(loadSmartIdea(idea.id)!).ok, true);
});

test("11. All required meaningful confirmed fields unlock Idea Model", () => {
  const idea = createSmartIdea({
    title: "Unlock",
    originalDescription: "Some original description text",
    problem: "Valid enough problem for review path",
    purpose: "Purpose",
    owner: OPERATOR,
  });
  addManualInterpretationDraft(idea.id, MANUAL, OPERATOR);
  const loaded = loadSmartIdea(idea.id)!;
  for (const item of loaded.extractedItems) {
    if (item.fieldKey === "manual_description") {
      confirmExtractedItem(idea.id, item.id, { status: "Confirmed", actor: OPERATOR });
    } else if (item.confirmationStatus === "Insufficient Quality") {
      rejectExtractedItem(idea.id, item.id, { reason: "Skip", actor: OPERATOR });
    } else if (!item.required) {
      rejectExtractedItem(idea.id, item.id, { reason: "Optional skip", actor: OPERATOR });
    }
  }
  assert.equal(canBuildIdeaModel(loadSmartIdea(idea.id)!).ok, true);
  assert.ok(buildIdeaModel(idea.id, {}));
});

test("12. Audit history records draft/correction/confirmation/rejection", () => {
  const idea = createSmartIdea({
    title: "Audit",
    originalDescription: "",
    problem: "Valid enough problem for review path",
    purpose: "Purpose",
    owner: OPERATOR,
  });
  addManualInterpretationDraft(idea.id, MANUAL, OPERATOR);
  const manual = loadSmartIdea(idea.id)!.extractedItems.find((i) => i.fieldKey === "manual_description")!;
  correctExtractedItem(idea.id, manual.id, { correctedValue: "Audit corrected manual description with detail.", actor: OPERATOR });
  confirmExtractedItem(idea.id, manual.id, { status: "Confirmed", actor: OPERATOR });
  const events = loadGenesisAudit().map((e) => e.action);
  assert.ok(events.includes("interpretation_draft_created"));
  assert.ok(events.includes("interpretation_corrected"));
  assert.ok(events.includes("interpretation_confirmed"));
});

test("13. Uzbek view contains no hardcoded English interpretation warning", () => {
  assert.match(RESEARCH_CANVAS_UZ.interpretManualDraftNotice, /qo'lda kiritilgan/i);
  assert.doesNotMatch(RESEARCH_CANVAS_UZ.interpretManualDraftNotice, /Draft interpretation from manual description/i);
  const src = readFileSync("components/research/canvas/InterpretationReviewCard.tsx", "utf8");
  assert.doesNotMatch(src, /Draft interpretation from manual description/);
});

test("14. No confidence score appears when no model produced it", () => {
  const item = buildManualDescriptionItem(MANUAL);
  assert.equal(item.aiConfidence, null);
  const migrated = migrateExtractedItem({
    ...item,
    id: "legacy",
    aiConfidence: 1,
    sourceLocation: "user-manual",
    limitation: "legacy",
  });
  assert.equal(migrated.aiConfidence, null);
});

test("15. Existing saved records migrate safely without data loss", () => {
  const legacy = migrateExtractedItem({
    id: "legacy1",
    field: "manual description",
    extractedValue: "Legacy manual text preserved in migration path.",
    aiConfidence: 1,
    sourceLocation: "user-manual",
    confirmationStatus: "Awaiting Human Confirmation",
    limitation: "Draft interpretation from manual description — requires human confirmation before scientific claims.",
  });
  assert.equal(displayInterpretationValue(legacy), "Legacy manual text preserved in migration path.");
  assert.equal(legacy.aiConfidence, null);
  assert.equal(legacy.provenance, "USER-PROVIDED");
  assert.equal(storeMigrate(legacy).originalText, legacy.extractedValue);
});

test("16. Uncertain Uzbek words are not auto-invalid", () => {
  assert.equal(assessInputQuality("hudbunlik"), "uncertain");
  assert.equal(assessInputQuality("tarbiya"), "uncertain");
});
