/**
 * A–Z Intelligence OS completion — evidence ledger, research pipeline, voice outcomes, page contract.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  clearPlatformActionResults,
  emitPlatformActionResult,
  listPlatformActionResults,
} from "@/lib/platform-actions/action-result-events";
import {
  confirmLocalEvidence,
  emptyEvidenceDraft,
  evidenceRecordToOperationalDraft,
} from "@/lib/evidence/local-evidence-store";
import { RESEARCH_PIPELINE_STAGES } from "@/lib/research/research-pipeline";
import { listCanonicalActionContracts } from "@/lib/platform-actions/canonical-action-contract";

function readSource(path: string): string {
  return readFileSync(path, "utf8");
}

test("page composition contract component exists and is wired", () => {
  assert.match(readSource("components/shared/IntelligencePageFrame.tsx"), /data-cbai-page-contract/);
  assert.match(readSource("components/evidence/EvidenceExplorer.tsx"), /IntelligencePageFrame/);
  assert.match(readSource("components/my-work/MyWorkPageClient.tsx"), /IntelligencePageFrame/);
  assert.match(readSource("components/my-work/MyWorkPageClient.tsx"), /data-cbai-mywork-primary/);
});

test("local evidence confirm requires fields and bridges to OO draft", () => {
  const incomplete = emptyEvidenceDraft({ locale: "en", routePath: "/evidence" });
  assert.equal(confirmLocalEvidence(incomplete), null);

  const confirmed = confirmLocalEvidence({
    ...incomplete,
    title: "Soil salinity sample",
    sourceLabel: "Field notebook 2026-07",
    provenance: "User observation during field visit",
    claim: "Surface crust observed",
    reviewStatus: "needs_review",
  });
  assert.ok(confirmed);
  assert.equal(confirmed!.confirmed, true);
  const bridged = evidenceRecordToOperationalDraft(confirmed!);
  assert.equal(bridged.draft.domain, "evidence");
  assert.ok(bridged.draft.relatedObjectIds.some((id) => id.startsWith("evidence:")));
});

test("evidence creation composer is confirmation-gated", () => {
  const src = readSource("components/evidence/EvidenceCreationComposer.tsx");
  assert.match(src, /data-cbai-evidence-confirm/);
  assert.match(src, /confirmLocalEvidence/);
  assert.doesNotMatch(src, /auto.?verif/i);
});

test("research pipeline stages open drafts only", () => {
  assert.ok(RESEARCH_PIPELINE_STAGES.length >= 8);
  assert.ok(RESEARCH_PIPELINE_STAGES.some((s) => s.id === "evidence_requirements"));
  assert.match(readSource("components/research/topic/ResearchPipelineBoard.tsx"), /data-cbai-research-pipeline/);
  assert.match(readSource("components/research/topic/ResearchTopicDetail.tsx"), /ResearchPipelineBoard/);
});

test("platform action result events record honest outcomes", () => {
  clearPlatformActionResults();
  emitPlatformActionResult({ kind: "route_opened", actionId: "navigate.my_work", message: "/my-work", href: "/my-work" });
  emitPlatformActionResult({ kind: "confirmation_required", actionId: "operational_object.compose", message: "draft_opened" });
  const list = listPlatformActionResults();
  assert.equal(list.length, 2);
  assert.equal(list[0]?.kind, "confirmation_required");
  assert.match(readSource("lib/platform-actions/apply-platform-action.ts"), /emitPlatformActionResult/);
});

test("voice protected baseline — single dock provider and overlay geometry", () => {
  const layout = readSource("app/(dashboard)/layout.tsx");
  assert.match(layout, /VoiceOperatorProvider/);
  assert.match(layout, /VoiceOperatorDock/);
  const dock = readSource("components/voice-operator/VoiceOperatorDock.tsx");
  assert.match(dock, /data-voice-dock/);
  const css = readSource("app/globals.css");
  assert.match(css, /cbai-voice-dock-open/);
  assert.doesNotMatch(css, /padding-right:\s*var\(--cbai-voice-dock-width\)/);
  const contracts = listCanonicalActionContracts();
  assert.ok(contracts.some((c) => c.platformActionId === "voice.stop"));
});

test("investor and government analysis drafts are non-advisory", () => {
  const eco = readSource("components/workspaces/EcosystemWorkspacePage.tsx");
  assert.match(eco, /RoleAnalysisDraftButton/);
  assert.match(eco, /governmentVsGovernance/);
  const btn = readSource("components/operational-objects/RoleAnalysisDraftButton.tsx");
  assert.match(btn, /roleAnalysisNonAdvisory/);
});

test("graph typed deep links and rooms VO ownership remain intact", () => {
  assert.match(
    readSource("components/graph/GraphEntityPanel.tsx"),
    /\$\{route\}\?\$\{node\.type\}=\$\{encodeURIComponent\(node\.entityId\)\}/,
  );
  const rooms = readSource("components/live-intelligence-rooms/RoomShell.tsx");
  assert.match(rooms, /voice\.startListening/);
  assert.match(rooms, /voice\.stopListening/);
  assert.doesNotMatch(rooms, /getUserMedia/);
});
