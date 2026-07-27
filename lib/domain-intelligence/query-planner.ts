/**
 * Intelligence query planner — structured, sourced responses.
 * Never presents unsourced AI answers as fact.
 */

import { countries } from "@/lib/countries";
import { universities } from "@/lib/universities";
import { RESEARCH_TOPICS } from "@/lib/research/research-topics";
import { namesMatch } from "@/lib/name-match";
import { buildCountryIntelligenceWorkspace } from "@/lib/domain-intelligence/country-workspace";
import { buildAcademicIntelligenceWorkspace } from "@/lib/domain-intelligence/academic-workspace";
import type { CountryIntelligenceWorkspace } from "@/lib/domain-intelligence/country-workspace";
import type { AcademicIntelligenceWorkspace } from "@/lib/domain-intelligence/academic-workspace";

export type IntelligenceQueryIntent =
  | "country_overview"
  | "country_indicator_change"
  | "academic_discipline"
  | "university_comparison"
  | "evidence_request"
  | "unknown";

export type DetectedEntities = {
  readonly countryIds: readonly string[];
  readonly universityIds: readonly string[];
  readonly topicIds: readonly string[];
  readonly domainHints: readonly string[];
  readonly timeHints: readonly ("five_years" | "current" | "unknown")[];
};

export type RecommendedWorkCard = {
  readonly preset: "evidence_request" | "research_question" | "work_plan" | "report_draft";
  readonly titleHint: string;
  readonly requiresConfirmation: true;
};

export type IntelligenceAnswer = {
  readonly intent: IntelligenceQueryIntent;
  readonly orientation: string;
  readonly entities: DetectedEntities;
  readonly findings: readonly {
    readonly text: string;
    readonly materialClass: "official_source" | "cbai_synthesis" | "unknown";
    readonly sourceLabels: readonly string[];
  }[];
  readonly timelineNotice: string;
  readonly keyActors: readonly string[];
  readonly methods: readonly string[];
  readonly sources: readonly string[];
  readonly contradictions: readonly string[];
  readonly limitations: readonly string[];
  readonly knowledgeGaps: readonly string[];
  readonly recommendedWorkCard: RecommendedWorkCard | null;
  readonly countryWorkspace: CountryIntelligenceWorkspace | null;
  readonly academicWorkspace: AcademicIntelligenceWorkspace | null;
  /** True only when the answer is fully backed by registry/catalog facts. */
  readonly unsourcedAiAnswerForbidden: true;
};

function detectEntities(question: string): DetectedEntities {
  const lower = question.toLowerCase();
  const countryIds = countries
    .filter(
      (c) =>
        lower.includes(c.name.toLowerCase()) ||
        lower.includes(c.code.toLowerCase()) ||
        (c.id === "uzbekistan" && (lower.includes("uzbek") || lower.includes("oʻzbek") || lower.includes("ozbek"))),
    )
    .map((c) => c.id);

  const universityIds = universities
    .filter(
      (u) =>
        lower.includes(u.name.toLowerCase()) ||
        (u.aliases ?? []).some((a) => lower.includes(a.toLowerCase())),
    )
    .map((u) => u.id);

  const topicIds = RESEARCH_TOPICS.filter((t) => {
    if (lower.includes(t.topicName.toLowerCase())) return true;
    return (t.keywords ?? []).some((k) => lower.includes(k.toLowerCase()));
  }).map((t) => t.topicId);

  const domainHints: string[] = [];
  for (const t of RESEARCH_TOPICS) {
    if (lower.includes(t.domain.toLowerCase()) && !domainHints.includes(t.domainId)) {
      domainHints.push(t.domainId);
    }
  }

  const timeHints: Array<"five_years" | "current" | "unknown"> = [];
  if (/five years|5 years|o‘tgan besh|за пять|beş yıl/i.test(question)) timeHints.push("five_years");
  if (/current|latest|now|hozir|текущ|güncel/i.test(question)) timeHints.push("current");
  if (timeHints.length === 0) timeHints.push("unknown");

  return { countryIds, universityIds, topicIds, domainHints, timeHints };
}

function detectIntent(question: string, entities: DetectedEntities): IntelligenceQueryIntent {
  const lower = question.toLowerCase();
  if (/evidence request|missing methodology|request evidence|dalil so‘rov/i.test(question)) {
    return "evidence_request";
  }
  if (
    /compar(e|ison)|vs\.?|versus|department|university.*university|fakultet|кафедр/i.test(question) &&
    (entities.universityIds.length >= 1 || /university|universitet|университет/i.test(question))
  ) {
    return "university_comparison";
  }
  if (
    /why.*(change|changed)|five years|indicator|trend|o‘zgar|изменил|neden değiş/i.test(question) &&
    entities.countryIds.length > 0
  ) {
    return "country_indicator_change";
  }
  if (
    /research|discipline|method|dataset|publication|tadqiqot|исследован|araştırma|field/i.test(question) ||
    entities.topicIds.length > 0 ||
    entities.domainHints.length > 0
  ) {
    return "academic_discipline";
  }
  if (entities.countryIds.length > 0 || /country|davlat|страна|ülke/i.test(lower)) {
    return "country_overview";
  }
  return "unknown";
}

/**
 * Plan a structured intelligence answer from a natural-language question.
 * Mutations are never executed — only a Draft Work Card recommendation is returned.
 */
export function planIntelligenceAnswer(question: string): IntelligenceAnswer {
  const trimmed = question.trim();
  const entities = detectEntities(trimmed);
  const intent = detectIntent(trimmed, entities);

  const countryId = entities.countryIds[0] ?? null;
  const countryWorkspace =
    countryId && (intent === "country_overview" || intent === "country_indicator_change")
      ? buildCountryIntelligenceWorkspace(countryId)
      : countryId && intent === "academic_discipline"
        ? buildCountryIntelligenceWorkspace(countryId)
        : null;

  const academicWorkspace =
    intent === "academic_discipline" || intent === "university_comparison"
      ? buildAcademicIntelligenceWorkspace({
          topicId: entities.topicIds[0] ?? null,
          domainId: (entities.domainHints[0] as never) ?? null,
          countryId,
          universityIds: entities.universityIds,
        })
      : intent === "country_overview" && countryId
        ? buildAcademicIntelligenceWorkspace({ countryId })
        : null;

  const keyActors: string[] = [];
  if (countryWorkspace) {
    keyActors.push(...countryWorkspace.institutions.universities.map((u) => u.name));
    keyActors.push(...countryWorkspace.institutions.companies.map((c) => c.name));
  }
  if (academicWorkspace) {
    for (const u of academicWorkspace.geography.localUniversities) {
      if (!keyActors.includes(u.name)) keyActors.push(u.name);
    }
  }

  const findings: Array<{
    text: string;
    materialClass: "official_source" | "cbai_synthesis" | "unknown";
    sourceLabels: readonly string[];
  }> = [];
  const limitations: string[] = [];
  const knowledgeGaps: string[] = [];
  const contradictions: string[] = [];
  const methods: string[] = [];
  const sources: string[] = [];

  if (countryWorkspace) {
    findings.push({
      text: `${countryWorkspace.executive.identity.name} is in the local country registry (code ${countryWorkspace.executive.identity.code}, capital ${countryWorkspace.executive.identity.capital}).`,
      materialClass: "official_source",
      sourceLabels: ["CBAI local country registry"],
    });
    findings.push({
      text: `${countryWorkspace.executive.dataAvailability.relatedUniversities} universities and ${countryWorkspace.executive.dataAvailability.relatedCompanies} companies in the local catalogs name-match this country.`,
      materialClass: "official_source",
      sourceLabels: ["CBAI local university registry", "CBAI local company registry"],
    });
    findings.push({
      text: `${countryWorkspace.executive.dataAvailability.indicatorsDefined} indicator definitions are declared; ${countryWorkspace.executive.dataAvailability.indicatorsConnected} sources report connected status. Live values are not fabricated.`,
      materialClass: "cbai_synthesis",
      sourceLabels: ["CBAI indicator framework + evidence source catalog"],
    });
    sources.push("CBAI local country registry");
    if (countryWorkspace.executive.identity.officialWebsite) {
      sources.push(countryWorkspace.executive.identity.officialWebsite);
    }
    knowledgeGaps.push(...countryWorkspace.executive.activeQuestions);
    limitations.push(countryWorkspace.executive.dataAvailability.honestyNotice);
  }

  if (academicWorkspace) {
    if (academicWorkspace.discipline.topic) {
      findings.push({
        text: `Research catalog topic “${academicWorkspace.discipline.topic.topicName}” (${academicWorkspace.discipline.topic.domain}) is available with status “${academicWorkspace.discipline.catalogStatus}”.`,
        materialClass: "official_source",
        sourceLabels: ["CBAI research topic catalog"],
      });
      methods.push(...academicWorkspace.discipline.relatedMethods);
      sources.push("CBAI research topic catalog");
    }
    limitations.push(...academicWorkspace.hierarchy.limitations);
    knowledgeGaps.push(...academicWorkspace.hierarchy.openQuestions);
    contradictions.push(
      "No conflicting finding records are connected — contradiction panel remains empty.",
    );
  }

  if (intent === "unknown") {
    limitations.push(
      "The question could not be resolved to a country, university, or research topic in local registries.",
    );
    knowledgeGaps.push("Clarify the country, discipline, university, or indicator of interest.");
  }

  if (findings.length === 0) {
    findings.push({
      text: "No registry-backed findings could be assembled for this question.",
      materialClass: "unknown",
      sourceLabels: [],
    });
  }

  let recommendedWorkCard: RecommendedWorkCard | null = null;
  if (intent === "evidence_request" || intent === "country_indicator_change") {
    recommendedWorkCard = {
      preset: "evidence_request",
      titleHint: countryId
        ? `Evidence request — ${countries.find((c) => c.id === countryId)?.name ?? countryId} indicator methodology`
        : "Evidence request — missing methodology",
      requiresConfirmation: true,
    };
  } else if (intent === "academic_discipline" || intent === "university_comparison") {
    recommendedWorkCard = {
      preset: "research_question",
      titleHint: academicWorkspace?.discipline.topic
        ? `Research question — ${academicWorkspace.discipline.topic.topicName}`
        : "Research question — academic intelligence",
      requiresConfirmation: true,
    };
  } else if (intent === "country_overview" && countryWorkspace) {
    recommendedWorkCard = {
      preset: countryWorkspace.executive.primaryNextAction.kind === "create_evidence_request"
        ? "evidence_request"
        : "work_plan",
      titleHint: `${countryWorkspace.country.name} — ${countryWorkspace.executive.primaryNextAction.label}`,
      requiresConfirmation: true,
    };
  }

  const orientation =
    intent === "country_overview" && countryWorkspace
      ? `Country intelligence for ${countryWorkspace.country.name} — registry facts and honest coverage gaps.`
      : intent === "country_indicator_change" && countryWorkspace
        ? `Five-year indicator change for ${countryWorkspace.country.name} — verified observations are not connected; gaps are listed explicitly.`
        : intent === "academic_discipline"
          ? "Academic intelligence — catalog topics and registry universities only; no fabricated papers or results."
          : intent === "university_comparison"
            ? "University comparison requested — research-output comparison unavailable without connected publications."
            : intent === "evidence_request"
              ? "Evidence request intent detected — a Draft Work Card can be prepared; nothing is saved until confirmation."
              : "Intelligence query could not be fully resolved against local registries.";

  return {
    intent,
    orientation,
    entities,
    findings,
    timelineNotice:
      entities.timeHints.includes("five_years")
        ? "Five-year comparison window requested — no verified time-series values are connected."
        : "No dated event timeline is connected for this query.",
    keyActors,
    methods,
    sources,
    contradictions,
    limitations,
    knowledgeGaps,
    recommendedWorkCard,
    countryWorkspace,
    academicWorkspace,
    unsourcedAiAnswerForbidden: true,
  };
}

/** Resolve university by id or name for comparison helpers. */
export function resolveUniversityLabel(idOrName: string): string | null {
  const u = universities.find(
    (x) => x.id === idOrName || namesMatch(x.name, idOrName),
  );
  return u?.name ?? null;
}
