/**
 * Deterministic conversation engine — browser fallback and Realtime orchestration stub.
 * Parses natural Uzbek/English evidence requests without claiming perfect STT.
 */

import type { EvidenceResultsPayload } from "@/lib/voice-operator/types";
import {
  appendConversationTurn,
  readVoiceSessionMemory,
  createVoiceSessionMemory,
} from "@/lib/voice-operator/session-memory";
import {
  executeVoiceTool,
  grantExternalSearchConsent,
  type VoiceToolContext,
} from "@/lib/voice-operator/tools/voice-tools";
import { evaluateVoiceBrokerStatus } from "@/lib/voice-operator/session-broker/client";
import { createAgentRunFromConversation, isAgenticBuildRequest } from "@/lib/agentic-workspace/agent-run-store";
import { answerAgentRunNextQuestion, getAgentRun } from "@/lib/agentic-workspace/agent-run-store";
import { getCurrentUserId } from "@/lib/auth/auth-store";
import { getSyncedCloudUserId } from "@/lib/supabase/cloud-session-sync";
import { buildOperationalHumanContext } from "@/lib/human-centered-workspace/operational-context-adapter";
import { OPERATIONAL_REFERENCE_CAPABILITIES } from "@/lib/human-centered-workspace/operational-capabilities";
import { createOrResumePersonalWorkspace } from "@/lib/human-centered-workspace/personal-workspace-lifecycle";
import { deviceLocalWorkspaceLifecycleRepository } from "@/lib/human-centered-workspace/device-local-workspace-lifecycle-repository";
import { generateExecutionBlueprint } from "@/lib/human-centered-workspace/execution-blueprint";
import { patchVoiceSessionMemory } from "@/lib/voice-operator/session-memory";

export type ConversationEngineResponse = {
  readonly assistantText: string;
  readonly dockState: "thinking" | "searching_sources" | "responding" | "action_confirmation" | "ready";
  readonly evidenceResults?: EvidenceResultsPayload;
  readonly openEvidencePanel?: boolean;
  readonly navigateHref?: string;
  readonly navigationAnnouncement?: string;
  readonly awaitingConsent?: boolean;
};

const AFFIRMATIVE = new Set(["ha", "yes", "ok", "okay", "davom", "davom et", "tasdiqlayman", "roziman"]);
const EVIDENCE_INTENT =
  /(dalil|manba|izla|qidir|top|evidence|search|crossref|openalex|publication|ilmiy)/i;
const CONSENT_PENDING_KEY = "__pending_search_query__";

let pendingSearchQuery: string | null = null;

export function clearConversationPendingState(): void {
  pendingSearchQuery = null;
}

export function detectEvidenceSearchIntent(text: string): boolean {
  return EVIDENCE_INTENT.test(text.trim());
}

export function isAffirmativeReply(text: string): boolean {
  return AFFIRMATIVE.has(text.trim().toLowerCase());
}

function uzResponse(key: string, language: string): string {
  const uz: Record<string, string> = {
    greet:
      "Salom. Men CBAI Ovoz Operatoriman. Sizga tadqiqot, dalillar va platformadagi ishlaringiz bo‘yicha yordam beraman.",
    ask_consent:
      "Sanitizatsiya qilingan so'rov bilan ochiq ilmiy provayderlarga qidiruv yuboriladi. Shaxsiy artefaktlar yuborilmaydi. Davom etaymi?",
    searching: "Qidiruv boshlandi. Ulangan provayderlardan natijalar yig'ilmoqda…",
    no_results: "Ulangan manbalarda hozircha natija topilmadi.",
    results: "Natijalarni ekranda ko'rsatdim. Metadata asosida mos kelishi mumkin — to'liq ilmiy tasdiq emas.",
    clarify: "Aniqroq ayting: qaysi mavzu yoki faol Smart Idea bo'yicha dalil kerak?",
    backend_required:
      "Jonli Realtime ovoz preview muhitidagi xavfsiz broker orqali ishlaydi. Matn rejimi doim mavjud; brauzer transkripti Safari'da cheklangan bo'lishi mumkin.",
    browser_note:
      "Brauzer transkripti noaniq bo'lishi mumkin. Matnni tahrirlang yoki qo'lda kiriting.",
    local_capability:
      "Mahalliy ishlab chiqish: matnli chat mavjud. Jonli Realtime ovoz preview brokerini talab qiladi; Safari brauzerida nutq tanish cheklangan bo'lishi mumkin.",
  };
  if (language === "uz") return uz[key] ?? key;
  const en: Record<string, string> = {
    greet: "Hello. I can help search connected evidence, explain next steps, and show sourced results in your workspace.",
    ask_consent: "I will send a sanitized query to connected open-science providers. No private artifacts are transmitted. Continue?",
    searching: "Search started across connected providers…",
    no_results: "No results in connected sources yet.",
    results: "I showed the results on screen. Metadata match only — not full scientific verification.",
    clarify: "Please clarify which topic or active Smart Idea you mean.",
    backend_required: "Live Realtime voice runs through the secure preview broker. Text chat is always available; browser speech may be limited in Safari.",
    browser_note: "Browser transcription may be unreliable. Edit text or type manually.",
    local_capability:
      "Local development: text chat is available. Live Realtime voice requires the preview broker; browser speech may be limited in Safari.",
  };
  return en[key] ?? key;
}

export async function processConversationInput(
  userText: string,
  ctx: VoiceToolContext,
): Promise<ConversationEngineResponse> {
  const session = readVoiceSessionMemory() ?? createVoiceSessionMemory(ctx.language, "browser_fallback");
  appendConversationTurn({ role: "user", text: userText });

  const trimmed = userText.trim();
  if (!trimmed) {
    return { assistantText: uzResponse("clarify", ctx.language), dockState: "ready" };
  }

  if (isAgenticBuildRequest(trimmed)) {
    const run = createAgentRunFromConversation(trimmed);
    patchVoiceSessionMemory({ pendingDraftId: run.id });
    const text = ctx.language === "uz"
      ? `So‘rovingizdan real draft agent workspace yaratdim. ${run.knownFacts.length} ta ma’lum fakt va ${run.missingInformation.length} ta yetishmayotgan ma’lumot ajratildi. Birinchi savol: ${run.nextQuestion}`
      : `I created a real draft agent workspace with ${run.knownFacts.length} known facts and ${run.missingInformation.length} missing inputs. First question: ${run.nextQuestion}`;
    appendConversationTurn({ role: "assistant", text, toolActivity: "create_agent_run" });
    return {
      assistantText: text,
      dockState: "responding",
      navigateHref: `/my-work?agentRun=${encodeURIComponent(run.id)}`,
      navigationAnnouncement: ctx.language === "uz" ? "Agent workspace ekranda ochildi." : "The agent workspace is open.",
    };
  }

  if (session.pendingDraftId && !isAffirmativeReply(trimmed)) {
    const updated = answerAgentRunNextQuestion(session.pendingDraftId, trimmed);
    if (!updated) {
      patchVoiceSessionMemory({ pendingDraftId: null });
      const text = ctx.language === "uz"
        ? "Draft topilmadi. Oldingi kontekstni taxmin qilmayman; yangi ish maydoni so‘rovini boshlang."
        : "The draft could not be found. I will not guess prior context; start a new workspace request.";
      appendConversationTurn({ role: "assistant", text });
      return { assistantText: text, dockState: "ready" };
    }
    const complete = updated.missingInformation.length === 0;
    const text = complete
      ? ctx.language === "uz"
        ? "Minimal kontekst to‘plandi. Workspace yaratishdan oldin inson tasdig‘i kerak. “Tasdiqlayman” deng."
        : "The minimum context is complete. Human confirmation is required before creating the workspace. Say “confirm”."
      : ctx.language === "uz"
        ? `Javob saqlandi. Keyingi yetishmayotgan ma’lumot: ${updated.nextQuestion}`
        : `Answer saved. Next missing item: ${updated.nextQuestion}`;
    appendConversationTurn({ role: "assistant", text, toolActivity: "create_agent_run" });
    return {
      assistantText: text,
      dockState: complete ? "action_confirmation" : "responding",
      awaitingConsent: complete,
      navigateHref: `/my-work?agentRun=${encodeURIComponent(updated.id)}`,
      navigationAnnouncement: ctx.language === "uz" ? "Agent workspace yangilandi." : "The agent workspace was updated.",
    };
  }

  if (session.pendingDraftId && isAffirmativeReply(trimmed)) {
    const agentRun = getAgentRun(session.pendingDraftId);
    if (!agentRun) {
      patchVoiceSessionMemory({ pendingDraftId: null });
      const text = ctx.language === "uz"
        ? "Tasdiqlangan draft topilmadi. Oldingi ma’lumotni taxmin qilmayman; ish rejasini qayta oching."
        : "The confirmed draft could not be found. I will not guess the missing context; reopen the work plan.";
      appendConversationTurn({ role: "assistant", text });
      return { assistantText: text, dockState: "ready" };
    }

    if (agentRun.missingInformation.length > 0) {
      const text = ctx.language === "uz"
        ? `Hali ${agentRun.missingInformation.length} ta zarur ma’lumot ochiq. Taxmin qilmayman. Keyingi savol: ${agentRun.nextQuestion}`
        : `${agentRun.missingInformation.length} required items are still open. I will not guess. Next question: ${agentRun.nextQuestion}`;
      appendConversationTurn({ role: "assistant", text });
      return {
        assistantText: text,
        dockState: "responding",
        navigateHref: `/my-work?agentRun=${encodeURIComponent(agentRun.id)}`,
        navigationAnnouncement: ctx.language === "uz" ? "Yetishmayotgan ma’lumotlar ochiq qoldi." : "Missing information remains open.",
      };
    }

    const ownerId = getSyncedCloudUserId() ?? getCurrentUserId() ?? "device-guest";
    const humanContext = buildOperationalHumanContext({
      contextId: `agent-context:${agentRun.id}`,
      workspaceId: `agent-discovery:${agentRun.id}`,
      outcome: agentRun.goal,
      knownFacts: agentRun.knownFacts,
      missingInformation: agentRun.missingInformation,
    });
    const processItems = agentRun.artifacts.find((artifact) => artifact.type === "process_map")?.items ?? [];
    const executionBlueprint = generateExecutionBlueprint({
      goal: agentRun.goal,
      processItems,
      originalRequest: agentRun.originalRequest,
      unresolvedInputs: agentRun.missingInformation,
    });
    const creation = createOrResumePersonalWorkspace(
      {
        ownerId,
        context: humanContext,
        capabilities: OPERATIONAL_REFERENCE_CAPABILITIES,
        title: agentRun.goal,
        idempotencyKey: `${agentRun.id}:human-confirmed-v1`,
        executionBlueprint,
      },
      deviceLocalWorkspaceLifecycleRepository,
    );

    if (!creation.ok) {
      const text = ctx.language === "uz"
        ? `Workspace yaratish ${creation.run.lastSuccessfulCheckpoint} bosqichidan keyin to‘xtadi: ${creation.run.errorCode}. Ma’lumotlar saqlandi; qayta “davom et” desangiz shu joydan davom etadi.`
        : `Workspace creation stopped after ${creation.run.lastSuccessfulCheckpoint}: ${creation.run.errorCode}. Your information is preserved; say “continue” to resume here.`;
      appendConversationTurn({ role: "assistant", text });
      return { assistantText: text, dockState: "ready" };
    }

    patchVoiceSessionMemory({ pendingDraftId: null });
    const href = `/workspace?workspace=${encodeURIComponent(creation.workspace.workspaceId)}&run=${encodeURIComponent(creation.run.runId)}`;
    const text = ctx.language === "uz"
      ? "Tasdiq qabul qilindi. Personal Workspace saqlandi; ekranda ochyapman."
      : "Confirmation received. The Personal Workspace is saved; opening it now.";
    appendConversationTurn({ role: "assistant", text, toolActivity: "create_personal_workspace" });
    return {
      assistantText: text,
      dockState: "responding",
      navigateHref: href,
      navigationAnnouncement: ctx.language === "uz"
        ? "Personal Workspace ekranda muvaffaqiyatli ochildi."
        : "The Personal Workspace opened successfully.",
    };
  }

  if (pendingSearchQuery && isAffirmativeReply(trimmed)) {
    grantExternalSearchConsent(pendingSearchQuery, ["crossref", "openalex", "europepmc", "datacite"]);
    const search = await executeVoiceTool(
      "run_external_evidence_search",
      { query: pendingSearchQuery },
      { ...ctx, sessionId: session.sessionId, externalConsentGranted: true },
    );
    pendingSearchQuery = null;
    if (!search.ok || !search.data) {
      appendConversationTurn({ role: "assistant", text: uzResponse("no_results", ctx.language) });
      return { assistantText: uzResponse("no_results", ctx.language), dockState: "ready" };
    }
    const payload = search.data as EvidenceResultsPayload;
    const text =
      payload.items.length > 0
        ? `${uzResponse("results", ctx.language)} (${payload.items.length})`
        : uzResponse("no_results", ctx.language);
    appendConversationTurn({ role: "assistant", text, toolActivity: "run_external_evidence_search" });
    return {
      assistantText: text,
      dockState: "responding",
      evidenceResults: payload,
      openEvidencePanel: true,
    };
  }

  if (detectEvidenceSearchIntent(trimmed)) {
    const prep = await executeVoiceTool("prepare_external_evidence_search", { query: trimmed }, {
      ...ctx,
      sessionId: session.sessionId,
    });
    if (!prep.ok || !prep.data) {
      const msg = !prep.ok ? prep.message : uzResponse("clarify", ctx.language);
      appendConversationTurn({ role: "assistant", text: msg });
      return { assistantText: msg, dockState: "ready" };
    }
    const query = (prep.data as { sanitizedQuery: string }).sanitizedQuery;
    pendingSearchQuery = query;
    const consentText = uzResponse("ask_consent", ctx.language);
    appendConversationTurn({ role: "assistant", text: consentText });
    return {
      assistantText: `${consentText}\n\n${uzResponse("searching", ctx.language).replace("boshlandi", "uchun tayyor")}: "${query}"`,
      dockState: "action_confirmation",
      awaitingConsent: true,
    };
  }

  if (/keyingi qadam|what next|next step/i.test(trimmed)) {
    const next = await executeVoiceTool("get_next_action", {}, { ...ctx, sessionId: session.sessionId });
    const text = next.ok ? JSON.stringify(next.data) : uzResponse("clarify", ctx.language);
    appendConversationTurn({ role: "assistant", text });
    return { assistantText: text, dockState: "responding" };
  }

  if (/mavjud dalil|existing evidence|list evidence/i.test(trimmed)) {
    const list = await executeVoiceTool("list_existing_evidence", {}, { ...ctx, sessionId: session.sessionId });
    if (list.ok && list.data && Array.isArray(list.data) && (list.data as unknown[]).length > 0) {
      const payload: EvidenceResultsPayload = {
        query: "local",
        items: (list.data as Array<{ id: string; title: string; provider: string; authors: string[]; date?: string; doi?: string | null; abstract?: string | null }>).map(
          (r) => ({
            id: r.id,
            provider: r.provider,
            title: r.title,
            authors: r.authors,
            year: r.date?.slice(0, 4) ?? null,
            doi: r.doi ?? null,
            sourceUrl: r.doi ? `https://doi.org/${r.doi}` : null,
            abstractAvailable: Boolean(r.abstract),
            relevanceNote: "Connected local record.",
            limitations: ["Device-local or imported metadata only."],
          }),
        ),
        providerFailures: [],
        limitations: ["Local connected records only."],
      };
      appendConversationTurn({ role: "assistant", text: uzResponse("results", ctx.language) });
      return { assistantText: uzResponse("results", ctx.language), dockState: "responding", evidenceResults: payload, openEvidencePanel: true };
    }
    appendConversationTurn({ role: "assistant", text: uzResponse("no_results", ctx.language) });
    return { assistantText: uzResponse("no_results", ctx.language), dockState: "ready" };
  }

  appendConversationTurn({ role: "assistant", text: uzResponse("clarify", ctx.language) });
  return { assistantText: uzResponse("clarify", ctx.language), dockState: "ready" };
}

export function resolveOperatorMode(language: string, pageOrigin?: string | null): {
  mode: "realtime" | "browser_fallback";
  backendRequired: boolean;
  realtimeConfigured: boolean;
  notice: string;
} {
  const resolvedOrigin =
    pageOrigin === undefined
      ? typeof window !== "undefined"
        ? window.location.origin
        : null
      : pageOrigin;
  const broker = evaluateVoiceBrokerStatus(resolvedOrigin);
  if (broker.kind === "available") {
    return { mode: "realtime", backendRequired: false, realtimeConfigured: true, notice: "" };
  }
  return {
    mode: "browser_fallback",
    backendRequired: true,
    realtimeConfigured: false,
    notice: uzResponse("local_capability", language),
  };
}

export { CONSENT_PENDING_KEY };
