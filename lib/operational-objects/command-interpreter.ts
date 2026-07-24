/**
 * Central command interpretation — typed and voice intents share this pipeline.
 * Deterministic first; never auto-creates records.
 */

import { resolvePlatformAction } from "@/lib/platform-actions/resolve-platform-action";
import { resolveVoiceAction, type VoiceResolverContext } from "@/lib/voice/voice-action-resolver";
import type { VoiceActionProposal } from "@/lib/voice/voice-control-types";
import type {
  OperationalObjectDomain,
  OperationalObjectDraft,
  OperationalObjectType,
} from "@/lib/operational-objects/operational-object.types";

export type CommandContext = {
  readonly locale: string;
  readonly pathname: string;
  readonly missionId?: string | null;
  readonly projectId?: string | null;
};

export type CommandIntent =
  | { readonly kind: "navigate"; readonly proposal: VoiceActionProposal }
  | { readonly kind: "search"; readonly query: string }
  | { readonly kind: "open_composer"; readonly draft: OperationalObjectDraft; readonly inferredFields: readonly string[] }
  | { readonly kind: "clarify"; readonly questionKey: string; readonly options: readonly { id: string; labelKey: string }[] }
  | { readonly kind: "ambiguous"; readonly messageKey: string }
  | { readonly kind: "informational"; readonly messageKey: string };

const CREATE_VERBS =
  /^(create|make|start|draft|plan|prepare|evaluate|analyze|analyse|build|set up|setup|yarat|tuz|reja|bahola|tahlil)/i;

const EVIDENCE_MARKERS = /(evidence|dalil|manba|source|proof|verify)/i;
const RESEARCH_MARKERS = /(research|tadqiqot|study|topic|savol|question)/i;
const COUNTRY_MARKERS = /(country|countries|mamlakat|uzbekistan|germany|usa|china)/i;
const GOVERNANCE_MARKERS = /(governance|policy|standard|review|nazorat)/i;
const INVESTOR_MARKERS = /(investor|investment|due diligence|iqtisod)/i;
const TASK_MARKERS = /(task|vazifa|step|action item)/i;
const MISSION_MARKERS = /(mission|missiya|problem statement)/i;

function inferDomain(text: string, pathname: string): OperationalObjectDomain {
  const lower = text.toLowerCase();
  if (EVIDENCE_MARKERS.test(lower) || pathname.startsWith("/knowledge")) return "evidence";
  if (RESEARCH_MARKERS.test(lower) || pathname.startsWith("/research")) return "research";
  if (COUNTRY_MARKERS.test(lower) || pathname.startsWith("/countries")) return "countries";
  if (GOVERNANCE_MARKERS.test(lower) || pathname.startsWith("/governance")) return "governance";
  if (INVESTOR_MARKERS.test(lower) || pathname.startsWith("/investor")) return "investor";
  if (pathname.startsWith("/companies")) return "companies";
  if (pathname.startsWith("/universities")) return "universities";
  if (pathname.startsWith("/graph")) return "knowledge";
  if (pathname.startsWith("/reports")) return "reports";
  return "general";
}

function inferType(text: string, domain: OperationalObjectDomain): OperationalObjectType {
  const lower = text.toLowerCase();
  if (EVIDENCE_MARKERS.test(lower)) return "evidence_request";
  if (RESEARCH_MARKERS.test(lower)) return "research_question";
  if (MISSION_MARKERS.test(lower)) return "mission";
  if (TASK_MARKERS.test(lower)) return "task";
  if (domain === "investor") return "work_plan";
  if (domain === "governance") return "review";
  if (CREATE_VERBS.test(lower)) return "work_plan";
  return "work_plan";
}

function titleFromCommand(text: string): string {
  const cleaned = text
    .replace(CREATE_VERBS, "")
    .replace(/^(a|an|the|bir|bitta)\s+/i, "")
    .trim();
  if (!cleaned) return text.trim();
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

function buildDraftFromCommand(text: string, context: CommandContext): { draft: OperationalObjectDraft; inferred: string[] } {
  const inferred: string[] = [];
  const domain = inferDomain(text, context.pathname);
  inferred.push("domain");
  const type = inferType(text, domain);
  inferred.push("type");
  const title = titleFromCommand(text);
  inferred.push("title");

  const draft: OperationalObjectDraft = {
    type,
    title,
    summary: title,
    objective: title,
    rationale: "",
    expectedOutcome: "",
    domain,
    status: "draft",
    priority: "normal",
    requiredInputs: [],
    evidenceRequirements: EVIDENCE_MARKERS.test(text) ? ["Connected official sources"] : [],
    nextAction: "",
    humanDecision: "",
    missionId: context.missionId ?? undefined,
    projectId: context.projectId ?? undefined,
    relatedObjectIds: [],
    sourceCommand: text,
    locale: context.locale,
    provenance: {
      source: "typed_command",
      originalText: text,
      routePath: context.pathname,
      locale: context.locale,
      inferredFields: inferred,
    },
  };

  if (!draft.nextAction) {
    draft.nextAction = "Review draft and confirm scope";
    inferred.push("nextAction");
  }

  return { draft, inferred };
}

function looksLikeCreation(text: string): boolean {
  if (CREATE_VERBS.test(text.trim())) return true;
  if (EVIDENCE_MARKERS.test(text) && /(request|need|gather|collect|so'ra|top)/i.test(text)) return true;
  if (RESEARCH_MARKERS.test(text) && CREATE_VERBS.test(text)) return true;
  return false;
}

function looksLikeSearch(text: string): boolean {
  return /^(search|find|qidir|izla|look for)\b/i.test(text.trim());
}

export function interpretCommand(
  rawInput: string,
  voiceContext: VoiceResolverContext,
  context: CommandContext,
): CommandIntent {
  const text = rawInput.trim();
  if (!text) {
    return { kind: "ambiguous", messageKey: "operationalObject.clarifyEmpty" };
  }

  if (looksLikeSearch(text)) {
    const query = text.replace(/^(search|find|qidir|izla|look for)\s+/i, "").trim();
    return { kind: "search", query: query || text };
  }

  if (looksLikeCreation(text)) {
    const { draft, inferred } = buildDraftFromCommand(text, context);
    return { kind: "open_composer", draft, inferredFields: inferred };
  }

  const platformResult = resolvePlatformAction(text, {
    locale: context.locale,
    pathname: context.pathname,
    missionId: context.missionId,
    projectId: context.projectId,
    originalText: text,
  });

  if (platformResult.ok && platformResult.mutation) {
    return {
      kind: "open_composer",
      draft: platformResult.mutation.draft,
      inferredFields: platformResult.mutation.inferredFields,
    };
  }

  if (platformResult.ok && platformResult.navigation?.href) {
    const proposal = resolveVoiceAction(text, voiceContext);
    if (proposal.status === "known" && proposal.href) {
      return { kind: "navigate", proposal: { ...proposal, href: platformResult.navigation.href } };
    }
    return {
      kind: "navigate",
      proposal: {
        status: "known",
        understoodText: text,
        actionLabel: "voiceControl.actionNavigate",
        actionDescription: platformResult.messageKey ?? "voiceControl.actionNavigateDescription",
        kind: "navigate",
        href: platformResult.navigation.href,
        actionVars: platformResult.messageVars,
      },
    };
  }

  if (!platformResult.ok && platformResult.code === "ambiguous_intent" && platformResult.clarifyOptions?.length) {
    return {
      kind: "clarify",
      questionKey: platformResult.messageKey,
      options: platformResult.clarifyOptions,
    };
  }

  const proposal = resolveVoiceAction(text, voiceContext);
  if (proposal.status === "known" && proposal.href) {
    return { kind: "navigate", proposal };
  }

  if (proposal.status === "known" && proposal.message && !proposal.href) {
    return { kind: "informational", messageKey: proposal.actionDescription };
  }

  if (/^(what|how|why|nima|qanday|nega)\b/i.test(text)) {
    return { kind: "informational", messageKey: "operationalObject.informationalHint" };
  }

  if (text.split(/\s+/).length <= 2) {
    return {
      kind: "clarify",
      questionKey: "operationalObject.clarifyIntent",
      options: [
        { id: "create", labelKey: "operationalObject.optionCreate" },
        { id: "search", labelKey: "operationalObject.optionSearch" },
        { id: "navigate", labelKey: "operationalObject.optionNavigate" },
      ],
    };
  }

  const { draft, inferred } = buildDraftFromCommand(text, context);
  return { kind: "open_composer", draft, inferredFields: inferred };
}

export function missingRequiredFields(draft: OperationalObjectDraft): readonly string[] {
  const missing: string[] = [];
  if (!draft.title?.trim()) missing.push("title");
  if (!draft.objective?.trim()) missing.push("objective");
  if (!draft.domain) missing.push("domain");
  if (!draft.nextAction?.trim()) missing.push("nextAction");
  if (!draft.humanDecision?.trim()) missing.push("humanDecision");
  return missing;
}
