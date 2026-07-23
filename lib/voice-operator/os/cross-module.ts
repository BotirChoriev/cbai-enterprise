/**
 * Cross-module reasoning — reuse platform relationships + catalog links, no duplicate engines.
 */

import { countries } from "@/lib/countries";
import { companies } from "@/lib/companies";
import { universities } from "@/lib/universities";
import { getCountryRelationships } from "@/lib/countries.adapter";
import { getCompanyLinkedEntities } from "@/lib/companies.adapter";
import { getUniversityLinkedEntities } from "@/lib/universities.adapter";
import { buildRelatedModules, getPrimaryEntity, type PlatformContextSnapshot } from "@/lib/context";
import type { AssistantOsContext } from "@/lib/voice-operator/os/session-context";

export type CrossModuleResult = {
  readonly assistantText: string;
  readonly href: string;
};

export function detectCrossModuleIntent(
  raw: string,
  platform: PlatformContextSnapshot | null,
  os: AssistantOsContext,
): CrossModuleResult | null {
  const lower = raw.toLowerCase();
  const isCross =
    /\b(related (companies|universities|countries|research|evidence|reports|missions?)|show (companies|universities) (in|for|linked)|companies in|universities in|country to (company|universit)|research to evidence|evidence to reports?|mission to research|trust to evidence|cross[- ]?module|link(ed)? modules?)\b/i.test(
      raw,
    ) || /\b(connect|relate)\b.+\b(to|with)\b/i.test(raw);

  if (!isCross) return null;

  const primary = platform ? getPrimaryEntity(platform) : null;
  const related = platform ? buildRelatedModules(platform) : [];

  if (/\bresearch.*evidence|evidence.*research/i.test(raw)) {
    return {
      href: "/knowledge",
      assistantText:
        "Research → Evidence: opening Evidence so you can review connected vs missing sources for this work.",
    };
  }
  if (/\bevidence.*report|report.*evidence/i.test(raw)) {
    return {
      href: "/reports",
      assistantText:
        "Evidence → Reports: opening Reports. Summaries stay honest about missing official sources.",
    };
  }
  if (/\bmission.*research|research.*mission/i.test(raw)) {
    return {
      href: os.missionProblem ? "/my-work" : "/research",
      assistantText: os.missionProblem
        ? "Mission → Research: opening My Work so research stays attached to the active mission."
        : "Mission → Research: opening Research. Start a mission when you want structured follow-through.",
    };
  }
  if (/\btrust.*evidence|evidence.*trust/i.test(raw)) {
    return {
      href: "/trust",
      assistantText:
        "Trust → Evidence: opening Trust for official source health. Use Evidence next for gap review.",
    };
  }

  if (primary?.kind === "country" || os.countryName) {
    const country =
      countries.find((c) => c.id === primary?.id) ??
      countries.find((c) => c.name === os.countryName);
    if (country) {
      const rel = getCountryRelationships(country);
      const companyNames = rel.relatedCompanies.slice(0, 4);
      const uniNames = rel.universities.slice(0, 4);
      if (/\bcompan/i.test(lower)) {
        return {
          href: "/companies",
          assistantText: companyNames.length
            ? `${country.name} → Companies: ${companyNames.join(", ")}. Opening Companies.`
            : `${country.name} has no linked companies in the local registry yet. Opening Companies.`,
        };
      }
      if (/\buniversit/i.test(lower)) {
        return {
          href: "/universities",
          assistantText: uniNames.length
            ? `${country.name} → Universities: ${uniNames.join(", ")}. Opening Universities.`
            : `${country.name} has no linked universities in the local registry yet. Opening Universities.`,
        };
      }
      return {
        href: `/countries?country=${country.id}`,
        assistantText: [
          `${country.name} cross-module links from the registry:`,
          companyNames.length ? `Companies: ${companyNames.join(", ")}.` : "Companies: none linked yet.",
          uniNames.length ? `Universities: ${uniNames.join(", ")}.` : "Universities: none linked yet.",
          "Say “show companies” or “show universities” to navigate.",
        ].join(" "),
      };
    }
  }

  if (primary?.kind === "company" || os.companyName) {
    const company =
      companies.find((c) => c.id === primary?.id) ??
      companies.find((c) => c.name === os.companyName);
    if (company) {
      const linked = getCompanyLinkedEntities(company);
      return {
        href: linked.relatedCountry
          ? `/countries?q=${encodeURIComponent(linked.relatedCountry)}`
          : "/research",
        assistantText: [
          `Company → Country: ${linked.relatedCountry ?? "not linked in registry"}.`,
          linked.universities.length
            ? `Universities: ${linked.universities.slice(0, 4).join(", ")}.`
            : "Universities: none linked yet.",
          "Opening the related country or Research for the next step.",
        ].join(" "),
      };
    }
  }

  if (primary?.kind === "university" || os.universityName) {
    const university =
      universities.find((u) => u.id === primary?.id) ??
      universities.find((u) => u.name === os.universityName);
    if (university) {
      const linked = getUniversityLinkedEntities(university);
      const countryHint = linked.country ? ` Country: ${linked.country}.` : "";
      return {
        href: "/research",
        assistantText: `University → Research / Evidence:${countryHint} Opening Research to continue cross-module work.`,
      };
    }
  }

  if (related.length > 0) {
    return {
      href: related[0].href,
      assistantText: `Related modules: ${related
        .slice(0, 4)
        .map((m) => m.label)
        .join(", ")}. Opening ${related[0].label}.`,
    };
  }

  return {
    href: "/search",
    assistantText:
      "Select a country, company, or university first — then I can connect related modules from the registry.",
  };
}
