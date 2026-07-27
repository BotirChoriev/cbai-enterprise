/**
 * Voice / typed command bridge for Domain Intelligence — read-only by default.
 * Mutations are never executed here; callers may open a Draft Work Card separately.
 */

import { planIntelligenceAnswer, type IntelligenceAnswer } from "@/lib/domain-intelligence/query-planner";
import { countries } from "@/lib/countries";
import { resolveCountryIntelligenceVoiceCommand } from "@/lib/country-intelligence/voice-commands";
import { resolveUniversityIntelligenceVoiceCommand } from "@/lib/university-intelligence/voice-commands";
import { resolveGlobalResearchIntelligenceVoiceCommand } from "@/lib/global-research-intelligence/voice-commands";
import { resolveWorldAndMeVoiceCommand } from "@/lib/world-and-me-intelligence/voice-commands";
import { resolveScientificDeliberationVoiceCommand } from "@/lib/scientific-deliberation/voice-commands";

export type DomainIntelligenceCommandResult =
  | {
      readonly type: "navigate";
      readonly href: string;
      readonly message: string;
      readonly answer: IntelligenceAnswer;
    }
  | {
      readonly type: "message";
      readonly message: string;
      readonly answer: IntelligenceAnswer;
      readonly suggestsWorkCard: boolean;
    };

const DOMAIN_QUERY_HINT =
  /research on|show research|compare.*(department|university)|why did|five years|indicator|evidence request|work plan|water infrastructure|academic|discipline|tadqiqot|ko‘rsatkich|показател|araştırma/i;

/**
 * Resolve a domain-intelligence voice/typed command.
 * Read-only navigation executes via returned href; create intents only suggest a Work Card.
 */
export function resolveDomainIntelligenceCommand(
  rawInput: string,
): DomainIntelligenceCommandResult | null {
  const trimmed = rawInput.trim();
  if (!trimmed) return null;

  // University Intelligence commands — read-only navigate or draft suggestion.
  const uis = resolveUniversityIntelligenceVoiceCommand(trimmed);
  if (uis) {
    const answer: IntelligenceAnswer = planIntelligenceAnswer(trimmed);
    if (uis.type === "navigate") {
      return {
        type: "navigate",
        href: uis.href,
        message: uis.message,
        answer,
      };
    }
    if (uis.type === "suggest_draft") {
      return {
        type: "message",
        message: uis.message,
        answer,
        suggestsWorkCard: true,
      };
    }
    return {
      type: "message",
      message: uis.message,
      answer,
      suggestsWorkCard: false,
    };
  }

  // Country Intelligence System commands (UZ/EN/RU/TR) — read-only navigate or draft suggestion.
  const cis = resolveCountryIntelligenceVoiceCommand(trimmed);
  if (cis) {
    const emptyAnswer: IntelligenceAnswer = planIntelligenceAnswer(trimmed);
    if (cis.type === "navigate") {
      return {
        type: "navigate",
        href: cis.href,
        message: cis.message,
        answer: emptyAnswer,
      };
    }
    if (cis.type === "suggest_draft") {
      return {
        type: "message",
        message: cis.message,
        answer: emptyAnswer,
        suggestsWorkCard: true,
      };
    }
    return {
      type: "message",
      message: cis.message,
      answer: emptyAnswer,
      suggestsWorkCard: false,
    };
  }

  // Global Research Intelligence — after university/country-specific handlers.
  const gri = resolveGlobalResearchIntelligenceVoiceCommand(trimmed);
  if (gri) {
    const answer: IntelligenceAnswer = planIntelligenceAnswer(trimmed);
    if (gri.type === "navigate") {
      return {
        type: "navigate",
        href: gri.href,
        message: gri.message,
        answer,
      };
    }
    if (gri.type === "suggest_draft") {
      return {
        type: "message",
        message: gri.message,
        answer,
        suggestsWorkCard: true,
      };
    }
    return {
      type: "message",
      message: gri.message,
      answer,
      suggestsWorkCard: false,
    };
  }

  // Scientific Deliberation Network — moderator assistant only.
  const sdn = resolveScientificDeliberationVoiceCommand(trimmed);
  if (sdn) {
    const answer: IntelligenceAnswer = planIntelligenceAnswer(trimmed);
    if (sdn.kind === "navigate") {
      return {
        type: "navigate",
        href: sdn.href,
        message: sdn.message,
        answer,
      };
    }
    return {
      type: "message",
      message: sdn.message,
      answer,
      suggestsWorkCard: true,
    };
  }

  // World and Me Intelligence Map.
  const wim = resolveWorldAndMeVoiceCommand(trimmed);
  if (wim) {
    const answer: IntelligenceAnswer = planIntelligenceAnswer(trimmed);
    if (wim.kind === "navigate") {
      return {
        type: "navigate",
        href: wim.href,
        message: wim.message,
        answer,
      };
    }
    return {
      type: "message",
      message: wim.message,
      answer,
      suggestsWorkCard: true,
    };
  }

  // Do not intercept plain navigation ("Open Uzbekistan") — only domain-intelligence intents.
  const isDomainIntent =
    DOMAIN_QUERY_HINT.test(trimmed) ||
    /country intelligence|academic intelligence|intelligence workspace|davlat intellekt|akademik intellekt|странов|академическ/i.test(
      trimmed,
    );
  if (!isDomainIntent) return null;

  const answer = planIntelligenceAnswer(trimmed);
  const countryId = answer.entities.countryIds[0];
  const country = countryId ? countries.find((c) => c.id === countryId) : null;

  if (answer.intent === "evidence_request" || answer.recommendedWorkCard?.preset === "evidence_request") {
    return {
      type: "message",
      message: country
        ? `Prepared an evidence-request Draft Work Card for ${country.name}. Nothing is saved until you confirm.`
        : "Prepared an evidence-request Draft Work Card. Nothing is saved until you confirm.",
      answer,
      suggestsWorkCard: true,
    };
  }

  if (answer.intent === "country_overview" || answer.intent === "country_indicator_change") {
    if (country) {
      return {
        type: "navigate",
        href: `/countries?country=${country.id}&view=intelligence`,
        message: `Opening Country Intelligence Workspace for ${country.name}.`,
        answer,
      };
    }
  }

  if (answer.intent === "academic_discipline" || answer.intent === "university_comparison") {
    const topicId = answer.entities.topicIds[0];
    const params = new URLSearchParams();
    if (countryId) params.set("country", countryId);
    if (topicId) params.set("topic", topicId);
    params.set("view", "academic");
    return {
      type: "navigate",
      href: countryId ? `/countries?${params.toString()}` : `/research?${params.toString()}`,
      message: "Opening Academic Intelligence Workspace — registry and catalog facts only.",
      answer,
    };
  }

  if (answer.intent !== "unknown") {
    return {
      type: "message",
      message: answer.orientation,
      answer,
      suggestsWorkCard: Boolean(answer.recommendedWorkCard),
    };
  }

  return null;
}
