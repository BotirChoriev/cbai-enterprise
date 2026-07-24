/** Resolve platform intents into validated action results — pure, no side effects. */

import type { OperationalObjectDraft } from "@/lib/operational-objects/operational-object.types";
import { localizedDomainTitle, resolvePlatformDomain } from "@/lib/platform-actions/domain-resolver";
import { guidanceForAction } from "@/lib/platform-actions/guidance";
import { resolvePlatformIntent } from "@/lib/platform-actions/intent-matcher";
import {
  getPlatformActionDefinition,
  hrefForAction,
  isAllowedNavigationHref,
} from "@/lib/platform-actions/registry";
import { engineIdFromAction } from "@/lib/forward-deployed-engines/engine-bridge";
import type {
  PlatformActionContext,
  PlatformActionIntent,
  PlatformActionParams,
  PlatformActionResult,
  PlatformActionId,
} from "@/lib/platform-actions/types";

const ENGINE_START_ACTIONS = new Set<PlatformActionId>([
  "engine.research.start",
  "engine.evidence.start",
  "engine.country.start",
  "engine.organization.start",
  "engine.mission.start",
  "engine.governance.start",
  "engine.meeting.start",
]);

const ENGINE_CONFIRM_ACTIONS = new Set<PlatformActionId>([
  "engine.research.confirm",
  "engine.evidence.confirm",
  "engine.country.confirm",
  "engine.organization.confirm",
  "engine.mission.confirm",
  "engine.governance.confirm",
  "engine.meeting.confirm",
]);

const MUTATION_ACTIONS = new Set<PlatformActionId>([
  "operational_object.compose",
  "operational_object.confirm_create",
  "project.compose",
  "mission.compose",
  "report.compose",
  "evidence_request.compose",
  "scientific_intake.compose",
  "team.compose",
  "team.invite",
  "object.share",
  "publication.prepare",
]);

const LOCAL_CONTROLS = new Set<PlatformActionId>([
  "voice.stop",
  "voice.close",
  "transcript.show",
  "transcript.hide",
  "navigate.back",
]);

const RESEARCH_DRAFT = /(tadqiqot|research|boshlamoq|yaratmoq|start|plan|create)/i;

/** Allowlisted workspace routes opened alongside engine start (never arbitrary). */
function workspaceHrefForEngineStart(
  actionId: PlatformActionId,
  params: { entityId?: string; topicId?: string; domainHref?: string },
): string | null {
  switch (actionId) {
    case "engine.research.start":
      return params.domainHref && isAllowedNavigationHref(params.domainHref)
        ? params.domainHref
        : hrefForAction("navigate.research", { topicId: params.topicId });
    case "engine.evidence.start":
      return hrefForAction("navigate.evidence", {});
    case "engine.country.start":
      return hrefForAction("navigate.countries", { entityId: params.entityId });
    case "engine.organization.start":
      return hrefForAction("navigate.companies", { entityId: params.entityId });
    case "engine.mission.start":
      return hrefForAction("navigate.my_work", {});
    case "engine.governance.start":
      return hrefForAction("navigate.governance", {});
    case "engine.meeting.start":
      return hrefForAction("navigate.my_work", {});
    default:
      return null;
  }
}

function buildDraftFromIntent(
  actionId: PlatformActionId,
  params: PlatformActionParams,
  context: PlatformActionContext,
): OperationalObjectDraft {
  const domainResolution = resolvePlatformDomain(context.originalText);
  const type =
    params.draftType ??
    (actionId === "report.compose"
      ? "work_plan"
      : actionId === "evidence_request.compose"
        ? "evidence_request"
        : actionId === "mission.compose"
          ? "mission"
          : domainResolution?.domain.recommendedType ?? "work_plan");

  const title =
    params.title ??
    (actionId === "report.compose"
      ? context.locale === "uz"
        ? "Hisobot"
        : "Report"
      : domainResolution
        ? localizedDomainTitle(domainResolution.domain, context.locale)
        : context.originalText.trim());

  return {
    type,
    title,
    summary: title,
    objective: title,
    rationale: "",
    expectedOutcome: "",
    domain: params.domain ?? domainResolution?.domain.defaultDomain ?? "general",
    status: "draft",
    priority: "normal",
    requiredInputs: [],
    evidenceRequirements: type === "evidence_request" ? ["Connected official sources"] : [],
    nextAction: context.locale === "uz" ? "Qoralamani ko'rib chiqing va tasdiqlang" : "Review draft and confirm",
    humanDecision: "",
    missionId: context.missionId ?? undefined,
    projectId: context.projectId ?? undefined,
    relatedObjectIds: [],
    sourceCommand: context.originalText,
    locale: context.locale,
    provenance: {
      source: "voice_command",
      originalText: context.originalText,
      routePath: context.pathname,
      locale: context.locale,
      inferredFields: ["title", "type", "domain"],
    },
  };
}

export function resolvePlatformActionFromIntent(
  intent: PlatformActionIntent,
  context: PlatformActionContext,
): PlatformActionResult {
  const def = getPlatformActionDefinition(intent.actionId);
  if (!def) {
    return { ok: false, code: "unknown_action", messageKey: "platformAction.unknownAction" };
  }

  if (intent.confidence === "low" && intent.clarifyOptions?.length) {
    return {
      ok: false,
      code: "ambiguous_intent",
      messageKey: intent.clarifyQuestionKey ?? "platformAction.clarifyIntent",
      clarifyOptions: intent.clarifyOptions,
    };
  }

  if (LOCAL_CONTROLS.has(intent.actionId)) {
    return {
      ok: true,
      actionId: intent.actionId,
      localControl: intent.actionId as "voice.stop" | "voice.close" | "transcript.show" | "transcript.hide" | "navigate.back",
      messageKey: def.successMessageKey,
    };
  }

  if (ENGINE_CONFIRM_ACTIONS.has(intent.actionId)) {
    return {
      ok: false,
      code: "confirmation_required",
      messageKey: "forwardDeployedEngineAction.confirmationRequired",
    };
  }

  if (ENGINE_START_ACTIONS.has(intent.actionId)) {
    const engineId = engineIdFromAction(intent.actionId);
    if (!engineId) {
      return { ok: false, code: "unknown_action", messageKey: "forwardDeployedEngineAction.failureEngine" };
    }
    const domainResolution = resolvePlatformDomain(context.originalText);
    const workspaceHref = workspaceHrefForEngineStart(intent.actionId, {
      entityId: intent.params.entityId,
      topicId: intent.params.topicId ?? domainResolution?.topicId ?? undefined,
      domainHref: domainResolution?.href,
    });
    return {
      ok: true,
      actionId: intent.actionId,
      engineStart: {
        engineId,
        statement: context.originalText,
        entityId: intent.params.entityId,
        entityName: intent.params.entityName,
        countryCode: intent.params.countryCode,
        domain: intent.params.domain ?? domainResolution?.domain.id,
      },
      navigation:
        workspaceHref && isAllowedNavigationHref(workspaceHref)
          ? { href: workspaceHref }
          : undefined,
      messageKey: def.successMessageKey,
    };
  }

  if (MUTATION_ACTIONS.has(intent.actionId)) {
    if (intent.actionId === "operational_object.confirm_create") {
      return {
        ok: false,
        code: "confirmation_required",
        messageKey: "platformAction.confirmationRequired",
      };
    }

    // Surface drafts navigate to dedicated review pages — no silent save.
    const SURFACE_ONLY = new Set<PlatformActionId>([
      "scientific_intake.compose",
      "team.compose",
      "team.invite",
      "object.share",
      "publication.prepare",
    ]);
    if (SURFACE_ONLY.has(intent.actionId)) {
      const surfaceHref = hrefForAction(intent.actionId, {
        entityId: intent.params.entityId,
        topicId: intent.params.topicId,
        query: intent.params.query,
      });
      const withPrepare =
        surfaceHref && isAllowedNavigationHref(surfaceHref)
          ? `${surfaceHref}${surfaceHref.includes("?") ? "&" : "?"}prepare=1`
          : null;
      if (!withPrepare) {
        return { ok: false, code: "route_unavailable", messageKey: def.failureMessageKey };
      }
      return {
        ok: true,
        actionId: intent.actionId,
        navigation: { href: withPrepare },
        guidance: guidanceForAction(intent.actionId, context.locale) ?? undefined,
        messageKey: def.successMessageKey,
      };
    }

    const draft = buildDraftFromIntent(intent.actionId, intent.params, context);
    const companionHref = hrefForAction(intent.actionId, {
      entityId: intent.params.entityId,
      topicId: intent.params.topicId,
      query: intent.params.query,
    });
    return {
      ok: true,
      actionId: intent.actionId,
      mutation: { actionId: intent.actionId, draft, inferredFields: draft.provenance.inferredFields ?? [] },
      navigation:
        companionHref && isAllowedNavigationHref(companionHref) ? { href: companionHref } : undefined,
      guidance: guidanceForAction(intent.actionId, context.locale) ?? undefined,
      messageKey: def.successMessageKey,
    };
  }

  const domainResolution = resolvePlatformDomain(context.originalText);

  if (intent.actionId.startsWith("entity.") && !intent.params.entityId) {
    return { ok: false, code: "entity_not_found", messageKey: "platformAction.entityNotFound" };
  }

  let href =
    hrefForAction(intent.actionId, {
      entityId: intent.params.entityId,
      topicId: intent.params.topicId ?? domainResolution?.topicId ?? undefined,
      query: intent.params.query,
    }) ?? null;

  if (!href && domainResolution) {
    href = domainResolution.href;
  }

  if (!href || !isAllowedNavigationHref(href)) {
    if (intent.confidence === "medium") {
      return {
        ok: false,
        code: "ambiguous_intent",
        messageKey: "platformAction.clarifyIntent",
        clarifyOptions: [
          { id: "research", labelKey: "platformAction.optionResearch" },
          { id: "evidence", labelKey: "platformAction.optionEvidence" },
          { id: "my_work", labelKey: "platformAction.optionMyWork" },
        ],
      };
    }
    return { ok: false, code: "route_unavailable", messageKey: def.failureMessageKey };
  }

  const guidance = guidanceForAction(intent.actionId, context.locale);
  const messageVars =
    intent.params.entityName ? { name: intent.params.entityName } : intent.params.title ? { name: intent.params.title } : undefined;

  const result: PlatformActionResult = {
    ok: true,
    actionId: intent.actionId,
    navigation: { href, labelVars: messageVars },
    guidance: guidance ?? undefined,
    messageKey: def.successMessageKey,
    messageVars,
  };

  if (domainResolution && RESEARCH_DRAFT.test(context.originalText)) {
    const draft = buildDraftFromIntent("operational_object.compose", intent.params, context);
    return {
      ...result,
      mutation: {
        actionId: "operational_object.compose",
        draft,
        inferredFields: draft.provenance.inferredFields ?? [],
      },
      guidance: guidanceForAction("research.open_topic", context.locale) ?? guidance ?? undefined,
    };
  }

  return result;
}

export function resolvePlatformAction(text: string, context: PlatformActionContext): PlatformActionResult {
  const intent = resolvePlatformIntent(text, context.locale);
  if (!intent) {
    return { ok: false, code: "ambiguous_intent", messageKey: "platformAction.clarifyIntent" };
  }
  return resolvePlatformActionFromIntent(intent, { ...context, originalText: text });
}
