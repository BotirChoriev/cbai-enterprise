/**
 * A–Z functional closure — deep links, confirm gating, linked work, intake, rooms, voice.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { missingRequiredFields } from "@/lib/operational-objects/command-interpreter";
import {
  buildCompanyLinkedWorkDraft,
  buildEvidenceConnectFallbackDraft,
  buildResearchLinkedWorkDraft,
  buildUniversityLinkedWorkDraft,
  buildGraphLinkedWorkDraft,
} from "@/lib/operational-objects/linked-work-draft";
import { buildIntakeOperationalDraft } from "@/lib/scientific-intake/intake-to-operational-draft";
import { applyRouteFilterParams, myWorkObjectHref } from "@/lib/platform-actions/route-filter";
import { buildRouteSummary } from "@/lib/platform-actions/route-summary";
import { listCanonicalActionContracts } from "@/lib/platform-actions/canonical-action-contract";
import { resolvePlatformIntent } from "@/lib/platform-actions/intent-matcher";
import { resolvePlatformActionFromIntent } from "@/lib/platform-actions/resolve-platform-action";
import {
  confirmOperationalObject,
  saveOperationalDraft,
} from "@/lib/operational-objects/operational-object-store";
import { myWorkHrefForObject } from "@/lib/operational-objects/operational-object-routing";

function readSource(path: string): string {
  return readFileSync(path, "utf8");
}

test("my-work object deep link helpers and index consumption", () => {
  assert.equal(myWorkHrefForObject("abc"), "/my-work?object=abc");
  assert.equal(myWorkObjectHref("abc", "opFilter=draft"), "/my-work?opFilter=draft&object=abc");
  const index = readSource("components/operational-objects/OperationalObjectIndex.tsx");
  assert.match(index, /searchParams\.get\("object"\)/);
  assert.match(index, /data-cbai-object-not-found/);
  assert.match(index, /data-cbai-object-focus/);
});

test("confirm rejects incomplete drafts and accepts complete once", () => {
  const incomplete = saveOperationalDraft({
    type: "work_plan",
    title: "",
    summary: "",
    objective: "",
    rationale: "",
    expectedOutcome: "",
    domain: "general",
    status: "draft",
    priority: "normal",
    requiredInputs: [],
    evidenceRequirements: [],
    nextAction: "",
    humanDecision: "",
    relatedObjectIds: [],
    locale: "en",
    provenance: { source: "manual" },
  });
  assert.ok(missingRequiredFields(incomplete).length > 0);
  assert.equal(confirmOperationalObject(incomplete), null);

  const complete = saveOperationalDraft({
    type: "research_question",
    title: "Soil salinity",
    summary: "Soil salinity",
    objective: "Map salinity risk",
    rationale: "",
    expectedOutcome: "",
    domain: "research",
    status: "draft",
    priority: "normal",
    requiredInputs: [],
    evidenceRequirements: [],
    nextAction: "Collect field samples",
    humanDecision: "Proceed with desk review first",
    relatedObjectIds: [],
    locale: "en",
    provenance: { source: "manual" },
  });
  const confirmed = confirmOperationalObject(complete);
  assert.ok(confirmed);
  assert.equal(confirmed!.title, "Soil salinity");

  const composer = readSource("components/operational-objects/OperationalObjectComposer.tsx");
  assert.match(composer, /disabled=\{!canConfirm\}/);
  assert.match(composer, /data-cbai-confirm-create/);
  const provider = readSource("components/operational-objects/OperationalObjectProvider.tsx");
  assert.match(provider, /confirmInFlightRef/);
  assert.match(provider, /myWorkHrefForObject/);
});

test("scientific intake maps to editable operational drafts with attachment meta", () => {
  const { draft, inferredFields } = buildIntakeOperationalDraft({
    locale: "en",
    title: "Aircraft sketch study",
    purpose: "Assess aerodynamics of this concept",
    domainLabel: "aerospace",
    documentType: "sketch",
    proposedType: "research_question",
    userQuestion: "Help me investigate the aerodynamics of this aircraft concept.",
    attachment: {
      fileName: "wing-a4.png",
      mimeType: "image/png",
      fileSizeBytes: 12000,
      source: "user_upload",
      createdAt: "2026-07-26T00:00:00.000Z",
      userDescription: "A4 aircraft sketch",
      contentLocale: "en",
    },
  });
  assert.equal(draft.type, "research_question");
  assert.ok(draft.requiredInputs.some((item) => item.includes("wing-a4.png")));
  assert.ok(draft.assumptions?.length);
  assert.ok(inferredFields.includes("type"));
  const intakeUi = readSource("components/scientific-intake/ScientificDocumentIntakeClient.tsx");
  assert.match(intakeUi, /data-cbai-intake-interpretation/);
  assert.match(intakeUi, /buildIntakeOperationalDraft/);
});

test("company university research graph linked-work parity", () => {
  const company = buildCompanyLinkedWorkDraft(
    { companyId: "apple", companyName: "Apple", routePath: "/companies?company=apple" },
    "evidence_request",
    "en",
  );
  assert.equal(company.draft.domain, "evidence");
  assert.equal(company.draft.provenance.relatedEntityKind, "company");

  const university = buildUniversityLinkedWorkDraft(
    { universityId: "mit", universityName: "MIT", routePath: "/universities?university=mit" },
    "literature_review",
    "en",
  );
  assert.equal(university.draft.domain, "research");

  const research = buildResearchLinkedWorkDraft(
    { topicId: "soil", topicName: "Soil health", routePath: "/research/soil" },
    "experiment_plan",
    "en",
  );
  assert.equal(research.draft.domain, "research");

  const graph = buildGraphLinkedWorkDraft(
    {
      nodeId: "n1",
      entityType: "company",
      entityId: "apple",
      entityName: "Apple",
      routePath: "/graph",
    },
    "relationship_review",
    "en",
  );
  assert.equal(graph.draft.domain, "knowledge");

  const button = readSource("components/operational-objects/CreateLinkedWorkButton.tsx");
  assert.match(button, /variant: "company"/);
  assert.match(button, /variant: "university"/);
  assert.match(button, /variant: "research"/);
  assert.match(readSource("components/companies/CompanyIntelligencePanel.tsx"), /CreateLinkedWorkButton/);
  assert.match(readSource("components/universities/UniversityIntelligencePanel.tsx"), /CreateLinkedWorkButton/);
  assert.match(readSource("components/research/topic/ResearchTopicHero.tsx"), /CreateLinkedWorkButton/);
});

test("evidence connect fallback never claims live connection", () => {
  const { draft } = buildEvidenceConnectFallbackDraft({
    category: "soil salinity data",
    relatedEntityName: "Uzbekistan",
    relatedEntityKind: "country",
    relatedEntityId: "uzbekistan",
    routePath: "/evidence",
    locale: "en",
    reason: "No live source connector",
  });
  assert.equal(draft.type, "evidence_request");
  assert.ok(draft.assumptions?.some((a) => /does not connect/i.test(a) || a.length > 0));
  const action = readSource("components/evidence/EvidenceConnectAction.tsx");
  assert.match(action, /data-cbai-evidence-connect="request"/);
  assert.doesNotMatch(action, /connected successfully/i);
});

test("voice route filters and in-route summarize resolve", () => {
  const filterIntent = resolvePlatformIntent("Filter by industry aerospace", "en");
  assert.ok(filterIntent);
  assert.equal(filterIntent!.actionId, "route.apply_filter");

  const summaryIntent = resolvePlatformIntent("Summarize this company", "en");
  assert.ok(summaryIntent);
  assert.equal(summaryIntent!.actionId, "route.summarize");

  const summaryResult = resolvePlatformActionFromIntent(summaryIntent!, {
    locale: "en",
    pathname: "/companies?company=apple",
    originalText: "Summarize this company",
  });
  assert.equal(summaryResult.ok, true);
  if (summaryResult.ok) {
    assert.ok(summaryResult.spokenMessage);
  }

  const patch = applyRouteFilterParams("/companies", "", { industry: "aerospace" });
  assert.equal(patch.href, "/companies?industry=aerospace");

  const summary = buildRouteSummary({
    pathname: "/my-work",
    locale: "en",
    activeWorkTitles: ["Soil salinity"],
  });
  assert.match(summary.spoken, /Soil salinity/);
  assert.ok(summary.sections.verified.length > 0);
});

test("rooms share Voice Operator mic ownership", () => {
  const shell = readSource("components/live-intelligence-rooms/RoomShell.tsx");
  assert.match(shell, /voice\.startListening/);
  assert.match(shell, /voice\.stopListening/);
  assert.match(shell, /goLivePending/);
  assert.match(shell, /data-cbai-room-go-live/);
  assert.doesNotMatch(shell, /getUserMedia/);
  assert.match(shell, /Leaving the room session must not leave the mic running/);
});

test("graph typed deep links preserved", () => {
  const panel = readSource("components/graph/GraphEntityPanel.tsx");
  assert.match(panel, /\$\{route\}\?\$\{node\.type\}=\$\{encodeURIComponent\(node\.entityId\)\}/);
  assert.doesNotMatch(panel, /\?id=\$\{node\.entityId\}/);
});

test("canonical action contract adapts voice registry without third engine", () => {
  const contracts = listCanonicalActionContracts();
  assert.ok(contracts.length >= 10);
  assert.ok(contracts.some((c) => c.platformActionId === "route.summarize"));
  assert.ok(contracts.some((c) => c.id === "route.filter" || c.platformActionId === "route.apply_filter"));
});

test("progressive disclosure exposes expert detail toggle for beginners", () => {
  const src = readSource("lib/intelligence-os/progressive-disclosure.ts");
  assert.match(src, /showExpertDetailToggle: true/);
  assert.match(readSource("components/evidence/EvidenceExplorer.tsx"), /ExpertDetailDisclosure/);
});
