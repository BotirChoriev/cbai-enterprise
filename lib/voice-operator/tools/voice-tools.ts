/** Typed Voice Operator tool layer — reuses existing stores, no unrestricted access. */

import type { VoiceToolName } from "@/lib/voice-operator/tool-policy";
import type { EvidenceResultItem, EvidenceResultsPayload } from "@/lib/voice-operator/types";
import { getCurrentMission } from "@/lib/intelligence-os/mission-engine";
import { loadSmartIdeas, loadSmartIdea } from "@/lib/research-canvas/smart-idea-store";
import { loadDiscoveryResults, searchAllOpenScienceForIdea } from "@/lib/research-canvas/research-discovery";
import { deriveActiveStageNextAction, deriveCanvasStageStatuses } from "@/lib/research-canvas/canvas-stage-status";
import { buildSanitizedSearchQuery, assertNoPrivateArtifactInQuery } from "@/lib/research-canvas/privacy-boundary";
import { getSanitizedSearchConcepts } from "@/lib/research-canvas/smart-idea-store";
import { evaluateMeasurementPlanReadiness } from "@/lib/research-canvas/measurement-truth";
import { measurementDraftStore } from "@/lib/research-canvas/measurement-draft-store";
import { compareIdeaToRecord } from "@/lib/research-canvas/research-discovery";
import { getResearchCanvasRuntimeCopy } from "@/lib/i18n/research-canvas-runtime-copy";
import { recordVoiceToolAudit } from "@/lib/voice-operator/tool-audit";
import {
  readVoiceSessionMemory,
  patchVoiceSessionMemory,
  setExternalSearchConsent,
} from "@/lib/voice-operator/session-memory";

export type VoiceToolContext = {
  readonly sessionId: string;
  readonly language: string;
  readonly smartIdeaId?: string | null;
  readonly externalConsentGranted?: boolean;
};

export type VoiceToolResult =
  | { readonly ok: true; readonly data: unknown; readonly spokenSummary?: string }
  | { readonly ok: false; readonly code: string; readonly message: string; readonly consentRequired?: boolean };

function activeIdea(smartIdeaId?: string | null) {
  if (smartIdeaId) return loadSmartIdea(smartIdeaId);
  const ideas = loadSmartIdeas();
  return ideas[ideas.length - 1] ?? null;
}

function audit(
  ctx: VoiceToolContext,
  tool: VoiceToolName,
  summary: string,
  result: VoiceToolResult,
  consent: "granted" | "pending" | "revoked" | "not_applicable",
) {
  recordVoiceToolAudit({
    sessionId: ctx.sessionId,
    tool,
    scope: ctx.smartIdeaId ?? "global",
    parametersSummary: summary,
    resultState: result.ok ? "success" : result.consentRequired ? "consent_required" : "blocked",
    consentState: consent,
  });
}

export async function executeVoiceTool(
  tool: VoiceToolName,
  params: Record<string, string | undefined>,
  ctx: VoiceToolContext,
): Promise<VoiceToolResult> {
  switch (tool) {
    case "get_active_context": {
      const mission = getCurrentMission();
      const idea = activeIdea(ctx.smartIdeaId);
      const data = {
        mission: mission ? { id: mission.id, problem: mission.problem.slice(0, 120) } : null,
        smartIdea: idea ? { id: idea.id, title: idea.title, stage: idea.stage } : null,
      };
      patchVoiceSessionMemory({
        activeContextSummary: idea ? `${idea.title} (${idea.stage})` : mission?.problem.slice(0, 80) ?? null,
      });
      audit(ctx, tool, "context", { ok: true, data }, "not_applicable");
      return { ok: true, data };
    }
    case "get_next_action": {
      const idea = activeIdea(ctx.smartIdeaId);
      const next = deriveActiveStageNextAction(idea);
      const blocked = deriveCanvasStageStatuses(idea).filter((s) => s.blockedReason);
      audit(ctx, tool, "next", { ok: true, data: { next, blocked } }, "not_applicable");
      return { ok: true, data: { next, blocked } };
    }
    case "list_existing_evidence": {
      const idea = activeIdea(ctx.smartIdeaId);
      if (!idea) return { ok: false, code: "NO_IDEA", message: "No active Smart Idea." };
      const records = loadDiscoveryResults(idea.id);
      audit(ctx, tool, idea.id, { ok: true, data: records }, "not_applicable");
      return { ok: true, data: records, spokenSummary: `${records.length} local records` };
    }
    case "prepare_external_evidence_search": {
      const idea = activeIdea(ctx.smartIdeaId);
      if (!idea) return { ok: false, code: "NO_IDEA", message: "No active Smart Idea." };
      const query = params.query?.trim() || buildSanitizedSearchQuery(idea);
      const check = assertNoPrivateArtifactInQuery(query, idea);
      if (!check.ok) return { ok: false, code: "BLOCKED", message: check.reason ?? "Invalid query." };
      audit(ctx, tool, query, { ok: true, data: { query } }, "pending");
      return {
        ok: true,
        data: {
          sanitizedQuery: query,
          providers: ["crossref", "openalex", "europepmc", "datacite"],
          concepts: getSanitizedSearchConcepts(idea),
        },
      };
    }
    case "run_external_evidence_search": {
      const idea = activeIdea(ctx.smartIdeaId);
      if (!idea) return { ok: false, code: "NO_IDEA", message: "No active Smart Idea." };
      const session = readVoiceSessionMemory();
      const consent = session?.externalSearchConsent;
      if (!ctx.externalConsentGranted && !consent?.active) {
        audit(ctx, tool, "search", { ok: false, code: "CONSENT", message: "Consent required.", consentRequired: true }, "pending");
        return { ok: false, code: "CONSENT", message: "Consent required.", consentRequired: true };
      }
      const query = params.query?.trim() || consent?.sanitizedQuery || buildSanitizedSearchQuery(idea);
      const result = await searchAllOpenScienceForIdea({
        idea: { ...idea, externalSearchConfirmed: true, externalSearchRevoked: false },
        keyword: query,
        externalSearchConfirmed: true,
        limit: 5,
      });
      const items: EvidenceResultItem[] = result.records.map((r) => ({
        id: r.id,
        provider: r.provider,
        title: r.title,
        authors: r.authors,
        year: r.date?.slice(0, 4) ?? null,
        doi: r.doi ?? null,
        sourceUrl: r.doi ? `https://doi.org/${r.doi}` : null,
        abstractAvailable: Boolean(r.abstract),
        relevanceNote: "Matched sanitized search concepts in connected metadata.",
        limitations: result.limitations.slice(0, 2),
      }));
      const payload: EvidenceResultsPayload = {
        query,
        items,
        providerFailures: result.providerStates.filter((p) => p.count === 0).map((p) => p.provider),
        limitations: result.limitations,
      };
      patchVoiceSessionMemory({
        lastConfirmedQuery: query,
        presentedEvidenceIds: items.map((i) => i.id),
      });
      audit(ctx, tool, query, { ok: true, data: payload }, "granted");
      return { ok: true, data: payload };
    }
    case "show_evidence_results": {
      audit(ctx, tool, "show", { ok: true, data: { panel: "evidence" } }, "not_applicable");
      return { ok: true, data: { panel: "evidence" } };
    }
    case "compare_sources_to_idea": {
      const idea = activeIdea(ctx.smartIdeaId);
      if (!idea) return { ok: false, code: "NO_IDEA", message: "No active Smart Idea." };
      const copy = getResearchCanvasRuntimeCopy(ctx.language);
      const records = loadDiscoveryResults(idea.id).slice(0, 2);
      const comparisons = records.map((r) => compareIdeaToRecord(idea, r, copy));
      audit(ctx, tool, idea.id, { ok: true, data: comparisons }, "not_applicable");
      return { ok: true, data: comparisons };
    }
    case "explain_measurement_readiness": {
      const idea = activeIdea(ctx.smartIdeaId);
      if (!idea) return { ok: false, code: "NO_IDEA", message: "No active Smart Idea." };
      const draft = measurementDraftStore.read(idea.id);
      const readiness = evaluateMeasurementPlanReadiness(draft);
      audit(ctx, tool, idea.id, { ok: true, data: readiness }, "not_applicable");
      return { ok: true, data: readiness };
    }
    case "draft_mission":
    case "draft_task":
    case "prepare_decision_package": {
      audit(ctx, tool, "draft", { ok: true, data: { draftOnly: true } }, "pending");
      return { ok: true, data: { draftOnly: true, requiresConfirmation: true } };
    }
    case "navigate_internal": {
      const href = params.href;
      if (!href?.startsWith("/")) return { ok: false, code: "BLOCKED", message: "Invalid navigation target." };
      audit(ctx, tool, href, { ok: true, data: { href } }, "not_applicable");
      return { ok: true, data: { href, preserveContext: true } };
    }
    default:
      return { ok: false, code: "UNKNOWN", message: "Unknown tool." };
  }
}

export function grantExternalSearchConsent(query: string, providers: readonly string[]): void {
  setExternalSearchConsent({
    active: true,
    sanitizedQuery: query,
    providers,
    grantedAt: new Date().toISOString(),
  });
}

export function revokeExternalSearchConsent(): void {
  setExternalSearchConsent({
    active: false,
    sanitizedQuery: "",
    providers: [],
    grantedAt: null,
  });
}
