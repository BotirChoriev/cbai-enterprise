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

export type ConversationEngineResponse = {
  readonly assistantText: string;
  readonly dockState: "thinking" | "searching_sources" | "responding" | "action_confirmation" | "ready";
  readonly evidenceResults?: EvidenceResultsPayload;
  readonly openEvidencePanel?: boolean;
  readonly navigateHref?: string;
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
      "Salom. Men CBAI ovoz operatoriman. Faol kontekstingiz bo'yicha dalillarni izlash, mavjud manbalarni ko'rsatish va keyingi qadamni tushuntirishda yordam bera olaman.",
    ask_consent:
      "Sanitizatsiya qilingan so'rov bilan ochiq ilmiy provayderlarga qidiruv yuboriladi. Shaxsiy artefaktlar yuborilmaydi. Davom etaymi?",
    searching: "Qidiruv boshlandi. Ulangan provayderlardan natijalar yig'ilmoqda…",
    no_results: "Ulangan manbalarda hozircha natija topilmadi.",
    results: "Natijalarni ekranda ko'rsatdim. Metadata asosida mos kelishi mumkin — to'liq ilmiy tasdiq emas.",
    clarify: "Aniqroq ayting: qaysi mavzu yoki faol Smart Idea bo'yicha dalil kerak?",
    backend_required:
      "Jonli ovozli suhbat uchun xavfsiz backend ulanishi kerak. Matn rejimi va brauzer transkripti mavjud.",
    browser_note:
      "Brauzer transkripti noaniq bo'lishi mumkin. Matnni tahrirlang yoki qo'lda kiriting.",
  };
  if (language === "uz") return uz[key] ?? key;
  const en: Record<string, string> = {
    greet: "Hello. I can help search connected evidence, explain next steps, and show sourced results in your workspace.",
    ask_consent: "I will send a sanitized query to connected open-science providers. No private artifacts are transmitted. Continue?",
    searching: "Search started across connected providers…",
    no_results: "No results in connected sources yet.",
    results: "I showed the results on screen. Metadata match only — not full scientific verification.",
    clarify: "Please clarify which topic or active Smart Idea you mean.",
    backend_required: "Live voice conversation requires a secure backend connection.",
    browser_note: "Browser transcription may be unreliable. Edit text or type manually.",
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

export function resolveOperatorMode(language: string): {
  mode: "realtime" | "browser_fallback";
  backendRequired: boolean;
  notice: string;
} {
  const broker = evaluateVoiceBrokerStatus();
  if (broker.kind === "available") {
    return { mode: "realtime", backendRequired: false, notice: "" };
  }
  return {
    mode: "browser_fallback",
    backendRequired: true,
    notice: uzResponse("backend_required", language),
  };
}

export { CONSENT_PENDING_KEY };
