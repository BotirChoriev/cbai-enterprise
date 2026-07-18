// Flagship consolidation — constitution, measurement, privacy, connectors, workflow.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  PRODUCT_CONSTITUTION_PRINCIPLES,
  assertNoFabricatedVerifiedLabel,
  assertNoUniversalHumanRanking,
  assertMeasurementNotPresentedAsPhysical,
  HUMAN_DECISION_BOUNDARY,
} from "@/lib/product/product-constitution";
import { isAllowedPublicStatus } from "@/lib/product/status-vocabulary";
import { resolvePersistenceMode, persistenceModeDisclaimer } from "@/lib/product/persistence-mode";
import {
  canTransitionToValidated,
  assertPhotoNotChemicalClaim,
  assertScaleRequiredForRealWorldLength,
} from "@/lib/research-canvas/measurement-provenance";
import {
  buildExternalSearchConsent,
  assertNoPrivateArtifactInQuery,
  IP_BOUNDARY_NOTICE,
} from "@/lib/research-canvas/privacy-boundary";
import { deriveCanvasStageStatuses, normalizeCanvasStage } from "@/lib/research-canvas/canvas-stage-status";
import { assertNoSuccessFromTitleOnly } from "@/lib/research-canvas/research-result-integrity";
import { parseOpenAlexSearchResponse } from "@/lib/knowledge-connectors/openalex/openalex-adapter";
import { parseEuropePmcSearchResponse } from "@/lib/knowledge-connectors/europepmc/europepmc-adapter";
import { parseDataCiteSearchResponse } from "@/lib/knowledge-connectors/datacite/datacite-adapter";
import { deduplicateByDoi } from "@/lib/research-canvas/research-discovery";
import { RESEARCH_CANVAS_STAGES } from "@/lib/research-canvas/research-canvas-types";
import {
  createSmartIdea,
  confirmExternalSearch,
  revokeExternalSearch,
  loadSmartIdea,
} from "@/lib/research-canvas/smart-idea-store";
import { resolveFlagshipOperatorCommand } from "@/lib/product/flagship-operator-commands";
import { parseGenesisOperatingParams, serializeGenesisOperatingParams } from "@/lib/genesis/genesis-operating-context";
import { explainOpportunityMatch } from "@/lib/genesis/opportunity-store";
import { assertNoUniversalHumanScore } from "@/lib/genesis/capability-records-store";
import { PRIORITY_OPEN_SCIENCE_PROVIDERS } from "@/lib/knowledge-connectors/connector-registry";

const OPERATOR = "Flagship Tester";

const OPENALEX_FIXTURE = {
  meta: { count: 1 },
  results: [
    {
      id: "https://openalex.org/W123",
      doi: "https://doi.org/10.5555/openalex-test",
      title: "Fixture Paper",
      publication_date: "2020-01-01",
      authorships: [{ author: { display_name: "A. Author" } }],
      type: "article",
    },
  ],
};

const EPMC_FIXTURE = {
  hitCount: 1,
  resultList: {
    result: [
      {
        id: "PMC123",
        title: "Biomedical fixture",
        authorString: "B Author",
        pubYear: "2019",
        doi: "10.5555/epmc-test",
      },
    ],
  },
};

const DATACITE_FIXTURE = {
  meta: { total: 1 },
  data: [
    {
      id: "10.5555/datacite-test",
      type: "dois",
      attributes: {
        titles: [{ title: "Dataset fixture" }],
        creators: [{ name: "C Creator" }],
        publicationYear: 2021,
      },
    },
  ],
};

test("1. Product Constitution — principles registered", () => {
  assert.ok(PRODUCT_CONSTITUTION_PRINCIPLES.includes("evidence-first"));
  assert.ok(PRODUCT_CONSTITUTION_PRINCIPLES.includes("no-fabrication"));
  assert.ok(HUMAN_DECISION_BOUNDARY.includes("human"));
});

test("2. Constitution — forbidden Verified label without evidence", () => {
  assert.ok(assertNoFabricatedVerifiedLabel("Verified"));
  assert.equal(assertNoFabricatedVerifiedLabel("Draft"), null);
});

test("3. Constitution — no universal human ranking", () => {
  assert.ok(assertNoUniversalHumanRanking({ overallScore: 99 }));
  assert.equal(assertNoUniversalHumanRanking({ readiness: "partial" }), null);
});

test("4. Measurement — calculated not displayed as measured", () => {
  assert.ok(
    assertMeasurementNotPresentedAsPhysical({ provenanceKind: "CALCULATED", displayLabel: "measured length" }),
  );
});

test("5. Measurement validation gate", () => {
  const gate = canTransitionToValidated({
    result: "1.2",
    unit: "m",
    methodId: "manual-entry",
    rawDataReference: "log",
    reviewer: OPERATOR,
    uncertainty: "±1 mm",
    uncertaintyLimitation: "",
  });
  assert.equal(gate.ok, true);
});

test("6. Photo not chemical claim", () => {
  assert.equal(assertPhotoNotChemicalClaim("photo").allowed, false);
});

test("7. Scale required for real-world length", () => {
  assert.equal(assertScaleRequiredForRealWorldLength(false).ok, false);
});

test("8. Status vocabulary — Verified excluded", () => {
  assert.equal(isAllowedPublicStatus("Supported"), true);
  assert.equal(isAllowedPublicStatus("Verified"), false);
});

test("9. Persistence mode honesty", () => {
  assert.equal(resolvePersistenceMode(), "device-local");
  assert.match(persistenceModeDisclaimer("device-local"), /device/i);
});

test("10. Privacy — external search consent and revocation", () => {
  const idea = createSmartIdea({
    title: "Privacy",
    originalDescription: "",
    problem: "Energy storage research topic",
    purpose: "Test",
    owner: OPERATOR,
  });
  confirmExternalSearch(idea.id, OPERATOR);
  let consent = buildExternalSearchConsent(loadSmartIdea(idea.id)!);
  assert.equal(consent.confirmed, true);
  assert.equal(consent.transmitsPrivateArtifact, false);
  revokeExternalSearch(idea.id, OPERATOR);
  consent = buildExternalSearchConsent(loadSmartIdea(idea.id)!);
  assert.equal(consent.confirmed, false);
});

test("11. Privacy — no base64 in query", () => {
  const idea = createSmartIdea({
    title: "Q",
    originalDescription: "",
    problem: "x",
    purpose: "y",
    owner: OPERATOR,
  });
  assert.equal(assertNoPrivateArtifactInQuery("data:image/png;base64,abc", idea).ok, false);
});

test("12. OpenAlex normalization fixture", () => {
  const parsed = parseOpenAlexSearchResponse(OPENALEX_FIXTURE, { query: "fixture" }, "2024-01-01T00:00:00.000Z");
  assert.equal(parsed.records.length, 1);
  assert.equal(parsed.records[0]!.provider, "openalex");
  assert.match(parsed.limitations.join(" "), /metadata/i);
});

test("13. Europe PMC normalization fixture", () => {
  const parsed = parseEuropePmcSearchResponse(EPMC_FIXTURE, { query: "fixture" }, "2024-01-01T00:00:00.000Z");
  assert.equal(parsed.records[0]!.title, "Biomedical fixture");
});

test("14. DataCite normalization fixture", () => {
  const parsed = parseDataCiteSearchResponse(DATACITE_FIXTURE, { query: "fixture" }, "2024-01-01T00:00:00.000Z");
  assert.equal(parsed.records[0]!.provider, "datacite");
});

test("15. DOI deduplication across providers", () => {
  const deduped = deduplicateByDoi([
    {
      id: "a",
      smartIdeaId: "s",
      provider: "crossref",
      title: "A",
      authors: [],
      date: "2020",
      doi: "10.5555/x",
      sourceUrl: null,
      openAccessStatus: "unknown",
      abstract: null,
      publicationType: "article",
      license: null,
      retrievedAt: "2024",
      projectStatus: "Status Unknown",
      statusEvidence: "metadata",
      statusLimitation: "limit",
    },
    {
      id: "b",
      smartIdeaId: "s",
      provider: "openalex",
      title: "A dup",
      authors: [],
      date: "2020",
      doi: "10.5555/x",
      sourceUrl: null,
      openAccessStatus: "unknown",
      abstract: null,
      publicationType: "article",
      license: null,
      retrievedAt: "2024",
      projectStatus: "Status Unknown",
      statusEvidence: "metadata",
      statusLimitation: "limit",
    },
  ]);
  assert.equal(deduped.length, 1);
});

test("16. Research result — no success from title alone", () => {
  const r = assertNoSuccessFromTitleOnly({ title: "Success story", statusEvidence: "" });
  assert.equal(r.ok, false);
});

test("17. Canvas stages include EXECUTE not PLAN", () => {
  assert.ok(RESEARCH_CANVAS_STAGES.includes("EXECUTE"));
  assert.ok(!RESEARCH_CANVAS_STAGES.includes("PLAN" as never));
  assert.equal(normalizeCanvasStage("PLAN"), "EXECUTE");
});

test("18. Canvas stage statuses — blocked discover without consent", () => {
  const idea = createSmartIdea({
    title: "Stages",
    originalDescription: "",
    problem: "Test problem definition",
    purpose: "Test",
    owner: OPERATOR,
  });
  const discover = deriveCanvasStageStatuses(idea).find((s) => s.stage === "DISCOVER")!;
  assert.equal(discover.status, "Needs confirmation");
});

test("19. Context continuity — smartIdea param", () => {
  const params = new URLSearchParams("mission=m1&smartIdea=si1");
  const parsed = parseGenesisOperatingParams(params);
  assert.equal(parsed.smartIdeaId, "si1");
  const serialized = serializeGenesisOperatingParams({ smartIdeaId: "si1", missionId: "m1" });
  assert.equal(serialized.smartIdea, "si1");
});

test("20. Flagship operator — next action", () => {
  const cmd = resolveFlagshipOperatorCommand("What should I do next?");
  assert.ok(cmd);
  assert.match(cmd!.message, /Next:/);
});

test("21. Opportunity match explainability", () => {
  const explanation = explainOpportunityMatch(
    {
      id: "opp1",
      type: "Laboratory Access",
      title: "Lab access",
      problem: "Need microscopy facility",
      desiredOutcome: "Shared instrument time",
      requiredEvidence: "Measurement plan",
      requiredCapability: "Microscopy",
      eligibility: "Researchers",
      scope: "local",
      humanDecisionOwner: OPERATOR,
      visibility: "private",
      status: "Draft",
      createdAt: "2024",
      updatedAt: "2024",
    },
    { missionProblem: "microscopy imaging validation", capabilitySummary: "Microscopy" },
  );
  assert.ok(explanation.reasons.length > 0 || explanation.uncertainties.length > 0);
});

test("22. Capability passport — no universal score", () => {
  assert.equal(assertNoUniversalHumanScore({ overallScore: 1 }), false);
});

test("23. Priority open-science providers configured", () => {
  assert.deepEqual(PRIORITY_OPEN_SCIENCE_PROVIDERS, ["crossref", "openalex", "europepmc", "datacite"]);
});

test("24. UI wiring — Research Canvas operational stage navigation", () => {
  const src = readFileSync(join(process.cwd(), "components/research/canvas/ResearchCanvasClient.tsx"), "utf-8");
  assert.match(src, /deriveCanvasStageStatuses/);
  assert.match(src, /role="tablist"/);
  assert.match(src, /stagePanelId/);
  assert.match(src, /interpretRequiresEvidence/);
  assert.match(src, /revokeConsent/);
});

test("25. IP boundary notice present", () => {
  assert.match(IP_BOUNDARY_NOTICE, /legal/i);
});

test("26. Human decision boundary in operator", () => {
  const cmd = resolveFlagshipOperatorCommand("Which decision requires a human?");
  assert.ok(cmd?.message.includes("Human decision"));
});

test("27. Release readiness doc exists", () => {
  const doc = readFileSync(join(process.cwd(), "docs/quality/CBAI-RELEASE-READINESS.md"), "utf-8");
  assert.match(doc, /research\/canvas/);
});

test("28. Supabase readiness proposal — no secrets", () => {
  const doc = readFileSync(join(process.cwd(), "docs/architecture/CBAI-SUPABASE-READINESS-PROPOSAL.md"), "utf-8");
  assert.match(doc, /Not Applied/);
  assert.ok(!doc.includes("SUPABASE_SERVICE_ROLE"));
});
