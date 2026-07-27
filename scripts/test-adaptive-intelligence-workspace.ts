/**
 * Adaptive Intelligence Workspace — first-five-minutes activation +
 * evidence-to-action tests.
 *
 * Covers: frictionless entry, the three first-screen choices, voice/text
 * parity, role detection without silos, adaptive clarification, the Starter
 * Work Card, unknown-vs-inferred honesty, confirmation-before-create,
 * exactly-once + idempotent duplicate delivery, comparison safety, source
 * capability honesty, monitoring without fabricated data, account-after-
 * value, locale provenance, and EN/UZ/RU/TR parity.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import {
  ACTIVATION_ROLES,
  adaptiveClarifications,
  allBlueprintFieldIds,
  buildWorkspaceBlueprint,
  detectActivationRole,
} from "@/lib/activation/role-workspace-engine";
import {
  buildStarterWorkCard,
  starterCardDraftId,
  starterCardToOperationalDraft,
  STARTER_PATHWAY_IDS,
  WORK_CARD_SECTIONS,
} from "@/lib/activation/starter-work-card";
import {
  allMonitoringIndicatorIds,
  buildInitialMonitoring,
  MONITORING_DATA_STATUSES,
} from "@/lib/activation/monitoring";
import {
  COMPARISON_CLASSIFICATIONS,
  COMPARISON_CONTENT_ORIGINS,
  containsPersonalJudgment,
  validateComparisonOutcome,
  type ComparisonOutcome,
} from "@/lib/activation/comparison-safety";
import { SOURCE_CAPABILITY_MAP, SOURCE_CAPABILITY_STATUSES } from "@/lib/activation/source-capability";
import { buildManufacturingExample, manufacturingExampleIntent } from "@/lib/activation/manufacturing-example";
import {
  ACTIVATION_COPY_LOCALES,
  ACTIVATION_FIELD_LABEL_IDS,
  getActivationCopy,
} from "@/lib/i18n/platform-copy-activation";
import {
  confirmOperationalObject,
  loadOperationalObjects,
} from "@/lib/operational-objects/operational-object-store";

function readSource(path: string): string {
  return readFileSync(path, "utf8");
}

const LOCALES = ["en", "uz", "ru", "tr"] as const;

/* ---------------- Phase 1: frictionless entry ---------------- */

test("1. frictionless entry: value statement + exactly three first-screen choices in every locale", () => {
  for (const locale of LOCALES) {
    const copy = getActivationCopy(locale);
    assert.ok(copy.valueStatement.length > 40);
    const choices = [copy.chooseVoice, copy.chooseType, copy.chooseExample];
    assert.equal(new Set(choices).size, 3);
    for (const choice of choices) assert.ok(choice.trim().length > 0);
  }
});

test("2. entry surface renders exactly three choices, no registration gate, obvious language selector", () => {
  const src = readSource("components/activation/ActivationExperience.tsx");
  const choiceCount = (src.match(/data-activation-choice=/g) ?? []).length;
  assert.equal(choiceCount, 3);
  assert.match(src, /LanguageSelector/);
  // No mandatory identity/payment collection on the first screen.
  assert.doesNotMatch(src, /password|creditCard|card number|billing/i);
  // Existing users can resume.
  assert.match(src, /data-activation-resume/);
  assert.match(src, /\/my-work/);
});

test("3. home integrates activation as the dominant first section without duplicate voice CTAs", () => {
  const home = readSource("components/spatial-world/SpatialWorldIntelligenceHome.tsx");
  assert.match(home, /ActivationExperience/);
  assert.match(home, /activationVariant/);
  // The old separate hero voice launcher was superseded by the activation entry.
  assert.doesNotMatch(home, /data-voice-entry="launcher"/);
  const entry = readSource("components/activation/ActivationExperience.tsx");
  assert.match(entry, /vo\.openDock\(\)/);
});

/* ---------------- Phase 2: operator introduction ---------------- */

test("4. canonical operator introduction — short, natural, no generic AI opener, typed fallback stays available", () => {
  const uz = getActivationCopy("uz");
  assert.equal(
    uz.operatorIntro,
    "Assalomu alaykum. Men CBAI Ovoz Operatoriman. Siz qanday ish bilan shug‘ullanasiz va bugun nimani hal qilmoqchisiz?",
  );
  for (const locale of LOCALES) {
    const copy = getActivationCopy(locale);
    assert.doesNotMatch(copy.operatorIntro, /artificial intelligence|sun'iy intellekt|искусственный интеллект|yapay zek/i);
    assert.ok(copy.voiceFallbackNote.length > 0);
  }
  // Voice entry reuses the one global dock — no parallel voice surface.
  const entry = readSource("components/activation/ActivationExperience.tsx");
  assert.match(entry, /useVoiceOperator/);
  assert.doesNotMatch(entry, /new RTCPeerConnection|getUserMedia/);
});

/* ---------------- Phases 3–4: roles and workspace engine ---------------- */

test("5. role detection works for the approved roles across EN/UZ/RU/TR", () => {
  assert.equal(detectActivationRole("I am a scientist studying polymers").role, "scientist");
  assert.equal(detectActivationRole("Men tadbirkorman, do'kon ochmoqchiman").role, "entrepreneur");
  assert.equal(detectActivationRole("Я инженер и проектирую мосты").role, "engineer");
  assert.equal(detectActivationRole("Ben öğretmenim ve ders planı hazırlıyorum").role, "teacher");
  assert.equal(detectActivationRole("I run a factory production line").role, "manufacturer");
  assert.equal(detectActivationRole("Men agronomman, paxta yetishtiraman").role, "agronomist");
  assert.equal(detectActivationRole("Я работаю в лаборатории").role, "laboratory");
  assert.equal(detectActivationRole("Davlat xizmatchisiman, hokimiyatda ishlayman").role, "public_servant");
  assert.equal(detectActivationRole("PhD student writing a dissertation").role, "student");
  assert.equal(detectActivationRole("").role, "other");
  assert.equal(detectActivationRole("").confidence, "unsure");
});

test("6. every approved role has a typed blueprint mapped to canonical OO types", () => {
  assert.deepEqual(
    [...ACTIVATION_ROLES],
    ["scientist", "student", "entrepreneur", "manufacturer", "engineer", "laboratory", "teacher", "agronomist", "public_servant", "other"],
  );
  for (const role of ACTIVATION_ROLES) {
    const blueprint = buildWorkspaceBlueprint(role);
    assert.equal(blueprint.role, role);
    assert.ok(blueprint.sections.length >= 1);
    assert.ok(blueprint.sections.every((s) => s.fieldIds.length > 0));
    assert.ok(blueprint.objectType.length > 0);
    assert.ok(blueprint.domain.length > 0);
    assert.ok(blueprint.workspaceRole.length > 0);
  }
});

test("7. role is not a silo: user override beats detection and is marked known", () => {
  const detectedCard = buildStarterWorkCard({
    text: "I am a scientist working on batteries",
    locale: "en",
    source: "typed_command",
    route: "/",
  });
  assert.equal(detectedCard.role, "scientist");
  assert.equal(detectedCard.roleState, "inferred");

  const overriddenCard = buildStarterWorkCard({
    text: "I am a scientist working on batteries",
    locale: "en",
    source: "typed_command",
    route: "/",
    roleOverride: "entrepreneur",
  });
  assert.equal(overriddenCard.role, "entrepreneur");
  assert.equal(overriddenCard.roleState, "known");
  // The UI exposes all roles as switchable chips.
  const entry = readSource("components/activation/ActivationExperience.tsx");
  assert.match(entry, /ACTIVATION_ROLES\.map/);
  assert.match(entry, /aria-pressed/);
});

test("8. adaptive clarification asks at most three questions and shrinks with provided info", () => {
  const allOpen = adaptiveClarifications({
    text: "x",
    role: "other",
    outcome: null,
    problem: null,
    materialsCount: 0,
    constraints: null,
  });
  assert.ok(allOpen.length <= 3);
  const fewer = adaptiveClarifications({
    text: "x",
    role: "other",
    outcome: "profit",
    problem: "downtime",
    materialsCount: 2,
    constraints: null,
  });
  assert.deepEqual([...fewer], ["constraints"]);
});

/* ---------------- Phase 5: Starter Work Card ---------------- */

test("9. starter card carries every required transparency element", () => {
  const card = buildStarterWorkCard({
    text: "Men ishlab chiqaruvchiman. Liniya 24 soat ishlashini xohlayman.",
    locale: "uz",
    source: "typed_command",
    route: "/",
  });
  assert.ok(card.workingTitle.length > 0);
  assert.equal(card.role, "manufacturer");
  assert.ok(card.blueprint.domain.length > 0);
  assert.ok(card.problemInterpretation.length > 0);
  assert.equal(card.pathways.length, 3);
  assert.deepEqual(card.pathways.map((p) => p.id), [...STARTER_PATHWAY_IDS]);
  assert.equal(card.sevenDayPlan.length, 5);
  const days = card.sevenDayPlan.flatMap((s) => s.days);
  assert.equal(Math.min(...days), 1);
  assert.equal(Math.max(...days), 7);
  assert.ok(card.monitoring.length > 0);
  assert.ok(card.humanDecisions.length >= 3);
  assert.equal(card.contentLocale, "uz");
  assert.equal(card.sourceRoute, "/");
  assert.equal(card.createdVia, "activation");
  assert.ok(card.assumptions.length > 0);
});

test("10. unknown vs inferred: missing answers stay unknown, derived values stay inferred, edits become known", () => {
  const bare = buildStarterWorkCard({
    text: "I am an engineer",
    locale: "en",
    source: "typed_command",
    route: "/",
  });
  assert.equal(bare.outcomeState, "unknown");
  assert.equal(bare.constraintsState, "unknown");
  assert.equal(bare.problemState, "inferred");
  assert.equal(bare.titleState, "inferred");
  assert.ok(bare.unknowns.length > 0);

  const edited = buildStarterWorkCard({
    text: "I am an engineer",
    locale: "en",
    source: "typed_command",
    route: "/",
    outcome: "Pass the load test",
    problem: "Bridge joint fatigue",
    constraints: "Deadline in March",
  });
  assert.equal(edited.outcomeState, "known");
  assert.equal(edited.problemState, "known");
  assert.equal(edited.constraintsState, "known");
  assert.ok(!edited.unknowns.includes("outcome"));
});

test("11. user text and materials preserved verbatim — never rewritten or translated", () => {
  const original = "Mening tajriba ma'lumotlarim ЦЕХ-7 да сақланади";
  const card = buildStarterWorkCard({
    text: original,
    locale: "uz",
    source: "typed_command",
    route: "/",
    materials: [
      { origin: "user_note", value: "3 yillik hisobot — internal only" },
      { origin: "user_link", value: "https://example.org/paper?id=42" },
    ],
  });
  assert.equal(card.originalText, original);
  assert.equal(card.materials[0]!.value, "3 yillik hisobot — internal only");
  assert.equal(card.materials[1]!.value, "https://example.org/paper?id=42");
  const draft = starterCardToOperationalDraft(card);
  assert.equal(draft.sourceCommand, original);
  assert.equal(draft.provenance.originalText, original);
});

/* ---------------- Phase 14: confirmation, exactly-once, idempotency ---------------- */

test("12. confirmation before create: card maps to a draft that requires the canonical composer", () => {
  const card = buildStarterWorkCard({
    text: "I am a teacher preparing a chemistry course",
    locale: "en",
    source: "typed_command",
    route: "/",
  });
  const draft = starterCardToOperationalDraft(card);
  assert.equal(draft.status, "draft");
  assert.equal(draft.humanApprovalRequired, true);
  assert.ok(draft.humanDecision.length > 0);
  // The activation UI opens the composer — it never calls confirm directly.
  const entry = readSource("components/activation/ActivationExperience.tsx");
  assert.match(entry, /objects\.openComposer/);
  assert.doesNotMatch(entry, /confirmOperationalObject|confirmDraft\(/);
  // The provider's exactly-once guards remain in place.
  const provider = readSource("components/operational-objects/OperationalObjectProvider.tsx");
  assert.match(provider, /confirmInFlightRef/);
  assert.match(provider, /lastConfirmKeyRef/);
});

test("13. duplicate delivery is idempotent: same command → same draft id → one stored object", () => {
  const build = () =>
    buildStarterWorkCard({
      text: "I am a manufacturer. Run line continuously.",
      locale: "en",
      source: "voice_command",
      route: "/",
    });
  const first = build();
  const second = build();
  assert.equal(starterCardDraftId(first), starterCardDraftId(second));

  const before = loadOperationalObjects().length;
  const confirmedA = confirmOperationalObject(starterCardToOperationalDraft(first));
  const confirmedB = confirmOperationalObject(starterCardToOperationalDraft(second));
  assert.ok(confirmedA);
  assert.ok(confirmedB);
  assert.equal(confirmedA!.id, confirmedB!.id);
  const after = loadOperationalObjects().length;
  assert.equal(after, before + 1);
});

test("14. voice and text produce the same canonical draft — only provenance source differs", () => {
  const typed = buildStarterWorkCard({
    text: "I am a scientist comparing catalysts",
    locale: "en",
    source: "typed_command",
    route: "/",
  });
  const voiced = buildStarterWorkCard({
    text: "I am a scientist comparing catalysts",
    locale: "en",
    source: "voice_command",
    route: "/",
  });
  const typedDraft = starterCardToOperationalDraft(typed);
  const voicedDraft = starterCardToOperationalDraft(voiced);
  assert.equal(typedDraft.provenance.source, "typed_command");
  assert.equal(voicedDraft.provenance.source, "voice_command");
  const strip = (draft: Record<string, unknown>) => {
    const clone = JSON.parse(JSON.stringify(draft)) as Record<string, unknown>;
    delete clone.provenance;
    delete clone.activation;
    return clone;
  };
  assert.deepEqual(strip(typedDraft as never), strip(voicedDraft as never));
});

/* ---------------- Phase 7: comparison safety ---------------- */

test("15. comparison classifications are the eight precise kinds — no vague weakness labels", () => {
  assert.deepEqual(
    [...COMPARISON_CLASSIFICATIONS],
    [
      "evidence_unavailable",
      "method_limitation",
      "dataset_limitation",
      "scope_mismatch",
      "not_independently_verified",
      "conflicting_result",
      "insufficient_information",
      "author_declared_limitation",
    ],
  );
  assert.deepEqual(
    [...COMPARISON_CONTENT_ORIGINS],
    ["official_source", "user_provided", "cbai_summary", "cbai_inference", "uncertainty", "recommendation"],
  );
});

function validOutcome(): ComparisonOutcome {
  return {
    commonGround: [{ origin: "cbai_summary", text: "Both studies address catalyst stability." }],
    differences: [{ origin: "cbai_summary", text: "Sample sizes differ." }],
    strengths: [{ origin: "cbai_summary", text: "Dataset A includes replication runs.", evidenceRef: "dataset-a-methods" }],
    limitations: [{ classification: "dataset_limitation", text: "Dataset B covers one region only.", origin: "cbai_inference" }],
    contradictions: [{ origin: "uncertainty", text: "Reported yields conflict at high temperature." }],
    missingEvidence: [{ origin: "uncertainty", text: "No independent verification located." }],
    combinationOpportunities: [{ origin: "cbai_inference", text: "Combine dataset A protocol with B's materials." }],
    newResearchOptions: [
      { origin: "recommendation", text: "Replicate under shared protocol." },
      { origin: "recommendation", text: "Extend geographic scope." },
      { origin: "recommendation", text: "Add independent verification round." },
    ],
    synthesis: {
      text: "A combined protocol is the most promising direction.",
      reasoning: "Both evidence bases overlap on method but not scope.",
      remainingUncertainty: "No independent replication yet.",
      origin: "recommendation",
    },
    humanCheckpoint: true,
  };
}

test("16. comparison validation: 3–5 options, evidence-backed strengths, human checkpoint", () => {
  assert.equal(validateComparisonOutcome(validOutcome()).ok, true);

  const tooFew = { ...validOutcome(), newResearchOptions: validOutcome().newResearchOptions.slice(0, 2) };
  assert.equal(validateComparisonOutcome(tooFew).ok, false);

  const sixOptions = {
    ...validOutcome(),
    newResearchOptions: Array.from({ length: 6 }, (_, i) => ({
      origin: "recommendation" as const,
      text: `Option ${i}`,
    })),
  };
  assert.equal(validateComparisonOutcome(sixOptions).ok, false);

  const bareStrength = {
    ...validOutcome(),
    strengths: [{ origin: "cbai_summary" as const, text: "Strong work.", evidenceRef: "" }],
  };
  const bareResult = validateComparisonOutcome(bareStrength);
  assert.ok(bareResult.problems.includes("strength_without_evidence"));
});

test("17. no personal intelligence or competence scoring — personal judgments are rejected", () => {
  assert.equal(containsPersonalJudgment("This scientist is incompetent"), true);
  assert.equal(containsPersonalJudgment("He is a bad researcher"), true);
  assert.equal(containsPersonalJudgment("The author is smarter than the reviewer"), true);
  assert.equal(containsPersonalJudgment("Учёный глуп"), true);
  // Legitimate methodological critique passes.
  assert.equal(containsPersonalJudgment("The study has a dataset limitation in region coverage"), false);
  assert.equal(containsPersonalJudgment("Result not independently verified"), false);

  const judged = {
    ...validOutcome(),
    limitations: [
      { classification: "method_limitation" as const, text: "The author is a bad scientist", origin: "cbai_inference" as const },
    ],
  };
  const result = validateComparisonOutcome(judged);
  assert.ok(result.problems.includes("personal_judgment_rejected"));
});

/* ---------------- Phase 8: source honesty ---------------- */

test("18. source capability map is honest: no fabricated connections, statuses from the closed set", () => {
  assert.ok(SOURCE_CAPABILITY_MAP.length >= 6);
  for (const entry of SOURCE_CAPABILITY_MAP) {
    assert.ok(SOURCE_CAPABILITY_STATUSES.includes(entry.status));
  }
  // Nothing is claimed as live-connected in this build.
  assert.equal(SOURCE_CAPABILITY_MAP.some((e) => e.status === "connected"), false);
  // No marketing claims about "world's best databases" anywhere in activation copy.
  for (const locale of LOCALES) {
    const copyJson = JSON.stringify(getActivationCopy(locale));
    assert.doesNotMatch(copyJson, /world'?s best|dunyodagi eng yaxshi|лучшие базы|dünyanın en iyi/i);
  }
});

/* ---------------- Phase 10: manufacturing acceptance example ---------------- */

test("19. manufacturing example follows the approved 24/7 structure with honest unknowns", () => {
  const card = buildManufacturingExample("uz");
  assert.equal(card.role, "manufacturer");
  assert.equal(card.contentLocale, "uz");
  assert.equal(card.originalText, manufacturingExampleIntent("uz"));
  const sectionIds = card.blueprint.sections.map((s) => s.id);
  assert.deepEqual(sectionIds, [
    "technicalCondition",
    "continuousOperation",
    "productionQuality",
    "marketFinance",
    "monitoring",
  ]);
  const monitoringIds = card.monitoring.map((m) => m.id);
  for (const required of ["uptime", "downtime", "maintenanceDue", "outputIndicator", "costIndicator", "qualityIndicator", "deliveryIndicator", "riskIndicator"]) {
    assert.ok(monitoringIds.includes(required), `missing indicator ${required}`);
  }
  // Nothing fabricated: no measurement values exist before a human enters them.
  for (const indicator of card.monitoring) {
    assert.equal(indicator.baseline, null);
    assert.equal(indicator.target, null);
    assert.equal(indicator.lastMeasurement, null);
    assert.notEqual(indicator.status, "measured");
  }
});

/* ---------------- Phase 11: monitoring honesty ---------------- */

test("20. monitoring never fabricates data for any role and always has a human owner", () => {
  for (const role of ACTIVATION_ROLES) {
    const indicators = buildInitialMonitoring(role);
    assert.ok(indicators.length > 0);
    for (const indicator of indicators) {
      assert.ok(MONITORING_DATA_STATUSES.includes(indicator.status));
      assert.notEqual(indicator.status, "measured");
      assert.equal(indicator.baseline, null);
      assert.equal(indicator.lastMeasurement, null);
      assert.equal(indicator.owner, "human_owner");
      assert.equal(indicator.escalation, "human_review");
    }
  }
});

/* ---------------- Phase 12: account after value ---------------- */

test("21. account prompt appears only with the ready card, is dismissible, and uses calm wording", () => {
  const preview = readSource("components/activation/StarterWorkCardPreview.tsx");
  assert.match(preview, /AccountAfterValue/);
  assert.match(preview, /data-activation-account-prompt/);
  assert.match(preview, /setDismissed\(true\)/);
  assert.match(preview, /href="\/account"/);
  // The prompt lives inside the card preview only — not on the entry screen.
  const entry = readSource("components/activation/ActivationExperience.tsx");
  assert.doesNotMatch(entry, /data-activation-account-prompt/);
  for (const locale of LOCALES) {
    const copy = getActivationCopy(locale);
    assert.ok(copy.accountTitle.length > 0);
    assert.doesNotMatch(
      `${copy.accountTitle} ${copy.accountBody} ${copy.accountCta}`,
      /hurry|urgent|only today|expires|shoshiling|срочно|acele/i,
    );
    assert.ok(copy.accountLater.length > 0);
  }
});

/* ---------------- Phase 15: localization + provenance ---------------- */

test("22. locale provenance: contentLocale travels from card to Operational Object draft", () => {
  for (const locale of LOCALES) {
    const card = buildStarterWorkCard({
      text: "test intent",
      locale,
      source: "typed_command",
      route: "/",
    });
    assert.equal(card.contentLocale, locale);
    const draft = starterCardToOperationalDraft(card);
    assert.equal(draft.locale, locale);
    assert.equal(draft.provenance.locale, locale);
    assert.ok(draft.activation);
  }
});

function collectStrings(value: unknown, path: string, out: { path: string; text: string }[]): void {
  if (typeof value === "string") {
    out.push({ path, text: value });
    return;
  }
  if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      collectStrings(child, `${path}.${key}`, out);
    }
  }
}

test("23. EN/UZ/RU/TR copy parity: identical key structure, no empty strings, all field labels present", () => {
  const collect = (locale: string) => {
    const out: { path: string; text: string }[] = [];
    collectStrings(getActivationCopy(locale), locale, out);
    return out;
  };
  const en = collect("en");
  assert.equal(ACTIVATION_COPY_LOCALES.length, 4);
  for (const locale of LOCALES) {
    const entries = collect(locale);
    assert.equal(entries.length, en.length, `key count mismatch for ${locale}`);
    for (const entry of entries) {
      assert.ok(entry.text.trim().length > 0, `empty copy at ${entry.path}`);
    }
  }
  // Every blueprint field and monitoring indicator id has a label.
  const labelIds = new Set<string>(ACTIVATION_FIELD_LABEL_IDS);
  for (const id of allBlueprintFieldIds()) assert.ok(labelIds.has(id), `unlabeled field ${id}`);
  for (const id of allMonitoringIndicatorIds()) assert.ok(labelIds.has(id), `unlabeled indicator ${id}`);
});

test("24. UZ copy has no English UI leakage", () => {
  const out: { path: string; text: string }[] = [];
  collectStrings(getActivationCopy("uz"), "uz", out);
  const englishLeak =
    /\b(the|and|your|with|what|start|create|review|unknown|available|required|evidence|decision|please|click)\b/i;
  for (const entry of out) {
    assert.doesNotMatch(entry.text, englishLeak, `english leakage at ${entry.path}: ${entry.text}`);
  }
});

test("25. RU/TR long strings get wrap-safe rendering and mobile-safe layout primitives", () => {
  const preview = readSource("components/activation/StarterWorkCardPreview.tsx");
  const entry = readSource("components/activation/ActivationExperience.tsx");
  assert.match(preview, /break-words/);
  assert.match(preview, /flex-wrap/);
  assert.match(entry, /flex-wrap/);
  assert.match(entry, /min-w-0/);
});

/* ---------------- Phase 13: interface + accessibility ---------------- */

test("26. progressive disclosure: the seven card sections exist and render as an accessible tablist", () => {
  assert.deepEqual(
    [...WORK_CARD_SECTIONS],
    ["essentials", "evidence", "options", "plan", "monitoring", "review", "history"],
  );
  const preview = readSource("components/activation/StarterWorkCardPreview.tsx");
  assert.match(preview, /role="tablist"/);
  assert.match(preview, /role="tab"/);
  assert.match(preview, /role="tabpanel"/);
  assert.match(preview, /aria-selected/);
  assert.match(preview, /aria-controls/);
});

test("27. keyboard and reduced-motion safety: typed buttons, visible focus, no decorative animation", () => {
  for (const file of [
    "components/activation/ActivationExperience.tsx",
    "components/activation/StarterWorkCardPreview.tsx",
  ]) {
    const src = readSource(file);
    assert.doesNotMatch(src, /<button(?![^>]*type=)/, `untyped button in ${file}`);
    assert.match(src, /focus-visible:outline/);
    assert.doesNotMatch(src, /animate-/);
    assert.doesNotMatch(src, /autoFocus/);
  }
  const entry = readSource("components/activation/ActivationExperience.tsx");
  assert.match(entry, /htmlFor="activation-statement"/);
  assert.match(entry, /aria-label/);
});

/* ---------------- Phase 14 + regressions ---------------- */

test("28. no parallel store: activation flows only through the canonical Operational Object pipeline", () => {
  const entry = readSource("components/activation/ActivationExperience.tsx");
  assert.doesNotMatch(entry, /localStorage|sessionStorage/);
  assert.match(entry, /useOperationalObjects/);
  const starter = readSource("lib/activation/starter-work-card.ts");
  assert.doesNotMatch(starter, /localStorage|window\./);
  // Additive schema: activation payload is optional on the canonical types.
  const types = readSource("lib/operational-objects/operational-object.types.ts");
  assert.match(types, /activation\?: OperationalObjectActivationPayload/);
});

test("29. voice stop/close cleanup remains intact in the global provider", () => {
  const provider = readSource("components/voice-operator/VoiceOperatorProvider.tsx");
  assert.match(provider, /releaseLiveAudioResources/);
  assert.match(provider, /stopLiveAudioCapture/);
});

test("30. read-only vs mutation: activation never mutates before confirmation; secrets never rendered", () => {
  const files = [
    "components/activation/ActivationExperience.tsx",
    "components/activation/StarterWorkCardPreview.tsx",
    "lib/activation/starter-work-card.ts",
    "lib/activation/role-workspace-engine.ts",
    "lib/activation/monitoring.ts",
    "lib/activation/manufacturing-example.ts",
  ];
  for (const file of files) {
    const src = readSource(file);
    assert.doesNotMatch(src, /OPENAI_API_KEY|SUPABASE_SERVICE|process\.env/, `env access in ${file}`);
    assert.doesNotMatch(src, /saveOperationalDraft|confirmOperationalObject/, `direct mutation in ${file}`);
  }
});
