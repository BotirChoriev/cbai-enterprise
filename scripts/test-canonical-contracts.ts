/**
 * Canonical contracts unit tests (Stage 1 slices 2–7).
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  ACTION_LEVEL_MEANING,
  ADAPTER_NOT_WIRED,
  assertMissionProjectLink,
  classifyCanonicalActionLevel,
  collaborationToOrgOsAdapter,
  EVIDENCE_OWNERSHIP,
  genesisToProjectAdapter,
  GRAPH_OWNERSHIP,
  hasCompleteLocaleProvenance,
  IDENTITY_PRESERVATION_RULES,
  levelRequiresConfirmation,
  LOCALE_PRESERVATION_RULES,
  NAVIGATION_CONTRACT,
  researchEvidenceToPlatformEvidenceAdapter,
  SECURITY_FREEZE_BLOCKERS,
  WORK_RELATIONSHIP_RULES,
} from "@/lib/canonical-contracts";

test("locale provenance: incomplete records remain valid", () => {
  assert.equal(hasCompleteLocaleProvenance({}), false);
  assert.equal(hasCompleteLocaleProvenance({ contentLocale: "uz", createdLocale: "uz" }), true);
  assert.equal(LOCALE_PRESERVATION_RULES.neverSilentlyTranslateUserContent, true);
  assert.equal(IDENTITY_PRESERVATION_RULES.preserveUnknownFields, true);
});

test("action levels 0–3 meanings and confirmation gate", () => {
  assert.equal(ACTION_LEVEL_MEANING[0].includes("answer"), true);
  assert.equal(ACTION_LEVEL_MEANING[3].includes("publish"), true);
  assert.equal(levelRequiresConfirmation(0), false);
  assert.equal(levelRequiresConfirmation(1), false);
  assert.equal(levelRequiresConfirmation(2), true);
  assert.equal(levelRequiresConfirmation(3), true);
  assert.equal(classifyCanonicalActionLevel("navigate.home", "open home"), 1);
  assert.equal(NAVIGATION_CONTRACT.rejectArbitraryModelUrls, true);
});

test("work relationship fixtures preserve link rules without store access", () => {
  assert.equal(WORK_RELATIONSHIP_RULES.doNotMergeSchemas, true);
  assert.deepEqual(assertMissionProjectLink({ missionId: "m1", projectId: "p1" }), []);
  assert.ok(assertMissionProjectLink({ missionId: "m1", projectId: "  " }).length > 0);
});

test("evidence and graph ownership point at canonical routes", () => {
  assert.equal(EVIDENCE_OWNERSHIP.canonicalRoute, "/knowledge");
  assert.equal(GRAPH_OWNERSHIP.canonicalRoute, "/graph");
  assert.equal(EVIDENCE_OWNERSHIP.quarantineDuplicate, "lib/intelligence/evidence");
  assert.equal(GRAPH_OWNERSHIP.quarantineDuplicate, "lib/intelligence/graph");
});

test("SF-1…SF-5 remain explicit production blockers", () => {
  assert.equal(SECURITY_FREEZE_BLOCKERS.length, 5);
  for (const row of SECURITY_FREEZE_BLOCKERS) {
    assert.equal(row.productionBlocker, true);
    assert.equal(row.mustNotBypassInStage1, true);
  }
});

test("compatibility adapters exist and are not wired", () => {
  assert.equal(ADAPTER_NOT_WIRED.wired, false);
  const a = researchEvidenceToPlatformEvidenceAdapter({ researchEvidenceId: "x" });
  const b = collaborationToOrgOsAdapter({});
  const c = genesisToProjectAdapter({});
  assert.equal(a.wired, false);
  assert.equal(b.wired, false);
  assert.equal(c.wired, false);
  assert.equal(a.canonicalRoute, "/knowledge");
  assert.equal(b.provisionalOwner, "lib/organization-os");
  assert.equal(c.canonicalOwner, "lib/project");
});
