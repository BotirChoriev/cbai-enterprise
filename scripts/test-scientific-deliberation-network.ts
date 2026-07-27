import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import {
  assertIdempotentRoomMigration,
  buildContradictionLink,
  buildLivingSynthesis,
  canTransitionRoom,
  claimCannotAppearConfirmed,
  collaborationCapabilityNotice,
  consumeDebateToWorkIdempotency,
  createRoomBundleFromDraft,
  emptyRoomComposerDraft,
  isRespectfulNegativeResultLanguage,
  migrateDeliberationEvidence,
  migrateDeliberationRoom,
  moderatorIsNotAutomaticScientificAuthority,
  observerCannotApprove,
  previewDebateToWork,
  resetDebateToWorkIdempotencyForTests,
  resolveScientificDeliberationVoiceCommand,
  roleAllows,
  synthesisForbidsFinalTruthLanguage,
  toReplicationPassport,
  transitionRoom,
} from "@/lib/scientific-deliberation";
import { getSdnCopy, SDN_COPY_LOCALES } from "@/lib/i18n/platform-copy-scientific-deliberation";

const root = process.cwd();

test("SDN-1: migration idempotent; unknown fields preserved", () => {
  const raw = {
    id: "r1",
    title: "Water claim room",
    roomType: "claim_verification",
    scientificQuestion: "Q?",
    futureCustom: { nested: true },
    contentLocale: "uz",
    createdLocale: "uz",
  };
  assertIdempotentRoomMigration(raw);
  const migrated = migrateDeliberationRoom(raw);
  assert.equal(migrated.unknownFields?.futureCustom && typeof migrated.unknownFields.futureCustom, "object");
  const ev = migrateDeliberationEvidence({
    id: "e1",
    roomId: "r1",
    claimId: "c1",
    stance: "support",
    originalSourceText: "Source DOI:10.1000/xyz",
    extraLegacy: 42,
  });
  assert.equal(ev.unknownFields?.extraLegacy, 42);
  assert.equal(ev.cbaiInterpretation, null);
});

test("SDN-2: room lifecycle transitions; closure needs human decision", () => {
  assert.equal(canTransitionRoom("draft", "open"), true);
  assert.equal(canTransitionRoom("archived", "open"), false);
  const blocked = transitionRoom("awaiting_human_decision", "closed", { humanDecisionRecorded: false });
  assert.equal(blocked.ok, false);
  const ok = transitionRoom("awaiting_human_decision", "closed", { humanDecisionRecorded: true });
  assert.equal(ok.ok, true);
});

test("SDN-3: claim/evidence honesty — no auto-true; stance explicit; source vs CBAI", () => {
  assert.equal(claimCannotAppearConfirmed("supported"), true);
  assert.equal(claimCannotAppearConfirmed("human_confirmed"), false);
  const draft = emptyRoomComposerDraft("en");
  const bundle = createRoomBundleFromDraft(
    {
      ...draft,
      title: "Room",
      scientificQuestion: "Does filtration reduce turbidity?",
      mainClaim: "Filtration reduces turbidity under stated conditions",
      finalHumanApprover: "Dr Example",
    },
    { confirmed: true },
  );
  assert.ok(bundle);
  assert.equal(bundle!.claims[0]!.status, "proposed");
  const noSave = createRoomBundleFromDraft(draft, { confirmed: false });
  assert.equal(noSave, null);
});

test("SDN-4: roles — observer cannot approve; moderator not automatic authority; no impersonation", () => {
  assert.equal(roleAllows("student_observer", "approve_final"), false);
  assert.equal(observerCannotApprove("student_observer"), true);
  assert.equal(moderatorIsNotAutomaticScientificAuthority("scientific_moderator"), true);
  assert.equal(roleAllows("institution_representative", "impersonate_institution"), false);
  assert.equal(roleAllows("scientific_moderator", "hide_counter_evidence"), false);
  assert.equal(roleAllows("claim_author", "send_external_message"), false);
});

test("SDN-5: contradiction radar forbids unsupported causation", () => {
  const a = migrateDeliberationEvidence({
    id: "a",
    roomId: "r",
    claimId: "c",
    stance: "support",
    originalSourceText: "A",
  });
  const b = migrateDeliberationEvidence({
    id: "b",
    roomId: "r",
    claimId: "c",
    stance: "challenge",
    originalSourceText: "B",
  });
  const bad = buildContradictionLink({
    roomId: "r",
    evidenceA: a,
    evidenceB: b,
    reasonCategories: ["methodology_differences"],
    explanation: "This proves causation between samples",
  });
  assert.ok("error" in bad);
  const good = buildContradictionLink({
    roomId: "r",
    evidenceA: a,
    evidenceB: b,
    reasonCategories: ["sample_differences", "methodology_differences"],
    explanation: "Results differ; possible sample and method differences — causation not claimed",
  });
  assert.ok(!("error" in good));
  assert.equal(good.causationClaimed, false);
});

test("SDN-6: living synthesis requires cutoff/version; forbids final truth language", () => {
  const draft = emptyRoomComposerDraft("en");
  const bundle = createRoomBundleFromDraft(
    {
      ...draft,
      title: "Synth room",
      scientificQuestion: "Q",
      mainClaim: "Claim",
      finalHumanApprover: "Human",
    },
    { confirmed: true },
  )!;
  const synth = buildLivingSynthesis(bundle);
  assert.ok(synth.evidenceCutoff);
  assert.ok(synth.version >= 1);
  assert.equal(synth.finalTruthForbidden, true);
  assert.equal(synth.humanApprovalStatus, "not_reviewed");
  assert.equal(synthesisForbidsFinalTruthLanguage("Living synthesis options"), true);
  assert.equal(synthesisForbidsFinalTruthLanguage("This is the final truth"), false);
});

test("SDN-7: replication passport + respectful negative results", () => {
  const passport = toReplicationPassport({
    id: "rep1",
    roomId: "r",
    originalResultRef: "Study A",
    replicatingInstitution: null,
    location: null,
    method: null,
    deviations: null,
    sample: null,
    result: null,
    relation: "inconclusive",
    independentStatus: null,
    limitations: null,
    sources: [],
    verifiedDate: null,
    isNegativeOrInconclusive: true,
    contentLocale: "en",
    createdLocale: "en",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: 1,
  });
  assert.equal(passport.negativeOrInconclusive, true);
  assert.equal(passport.respectfulLanguage, true);
  assert.equal(isRespectfulNegativeResultLanguage("Inconclusive under stated conditions"), true);
  assert.equal(isRespectfulNegativeResultLanguage("failed scientist"), false);
});

test("SDN-8: debate-to-work confirmation + exactly-once", () => {
  resetDebateToWorkIdempotencyForTests();
  const draft = emptyRoomComposerDraft("uz");
  const bundle = createRoomBundleFromDraft(
    {
      ...draft,
      title: "OO room",
      scientificQuestion: "Q",
      mainClaim: "Claim",
      finalHumanApprover: "Approver",
    },
    { confirmed: true },
  )!;
  const preview = previewDebateToWork(bundle, "evidence_request", "uz");
  assert.equal(preview.confirmationRequired, true);
  assert.equal(preview.draft.humanApprovalRequired, true);
  assert.equal(preview.relations.roomId, bundle.room.id);
  assert.equal(consumeDebateToWorkIdempotency(preview.idempotencyKey, false), false);
  assert.equal(consumeDebateToWorkIdempotency(preview.idempotencyKey, true), true);
  assert.equal(consumeDebateToWorkIdempotency(preview.idempotencyKey, true), false);
});

test("SDN-9: EN/UZ/RU/TR copy parity; UZ primary not English", () => {
  const keys = Object.keys(getSdnCopy("en")).sort();
  for (const locale of SDN_COPY_LOCALES) {
    assert.deepEqual(Object.keys(getSdnCopy(locale)).sort(), keys);
  }
  assert.equal(getSdnCopy("uz").primaryAction, "Ilmiy munozarani boshlash");
  assert.ok(!/^Start scientific deliberation$/.test(getSdnCopy("uz").primaryAction));
  assert.ok(!/^Evidence and Scientific Deliberation$/.test(getSdnCopy("uz").title));
});

test("SDN-10: voice moderator boundary; confirmation for writes", () => {
  const deny = resolveScientificDeliberationVoiceCommand("Who won the debate?");
  assert.ok(deny && deny.kind === "draft_suggestion" && deny.confirmationRequired);
  const create = resolveScientificDeliberationVoiceCommand("Start scientific deliberation room");
  assert.ok(create && create.kind === "draft_suggestion" && create.confirmationRequired);
  const nav = resolveScientificDeliberationVoiceCommand("Open contradiction radar on evidence");
  assert.ok(nav && nav.kind === "navigate");
});

test("SDN-11: collaboration boundary + UI/docs exist", () => {
  const notice = collaborationCapabilityNotice();
  assert.equal(notice.status, "INFRASTRUCTURE_REQUIRED");
  assert.equal(notice.mode, "local_only");
  const files = [
    "components/evidence/ScientificDeliberationHome.tsx",
    "lib/scientific-deliberation/index.ts",
    "docs/verification/scientific-deliberation-network/baseline-audit.md",
    "docs/verification/scientific-deliberation-network/design-decisions.md",
  ];
  for (const f of files) {
    assert.ok(existsSync(join(root, f)), f);
  }
  const explorer = readFileSync(join(root, "components/evidence/EvidenceExplorer.tsx"), "utf8");
  assert.ok(explorer.includes("ScientificDeliberationHome"));
  assert.ok(explorer.includes("data-cbai-primary-action") || explorer.includes("getSdnCopy"));
});
