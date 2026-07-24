/** Engine intent matching — deterministic patterns for voice/text engine invocation. */

import { countries } from "@/lib/countries";
import { companies } from "@/lib/companies";
import { allNameFormsForCountry } from "@/lib/i18n/country-names";
import { normalizePlatformText } from "@/lib/platform-actions/normalize-text";
import type { PlatformActionIntent, PlatformActionParams } from "@/lib/platform-actions/types";

function findCountryInText(text: string): { id: string; name: string } | null {
  const haystack = normalizePlatformText(text);
  for (const country of countries) {
    const forms = allNameFormsForCountry(country.id, country.name);
    if (forms.some((form) => haystack.includes(normalizePlatformText(form)))) {
      return { id: country.id, name: country.name };
    }
  }
  return null;
}

function findCompanyInText(text: string): { id: string; name: string } | null {
  const haystack = normalizePlatformText(text);
  for (const company of companies) {
    if (haystack.includes(normalizePlatformText(company.name))) {
      return { id: company.id, name: company.name };
    }
  }
  return null;
}

export function matchEngineIntent(text: string): PlatformActionIntent | null {
  const normalized = normalizePlatformText(text);

  if (
    /(tadqiqot|research|ilmiy).*(boshla|start|yarat|create)/i.test(text) ||
    /(kimyo|kimyo|biology|chemistry|physics).*(tadqiqot|research)/i.test(text)
  ) {
    const params: PlatformActionParams = { userStatement: text };
    if (/kimyo|chemistry/i.test(text)) {
      return {
        actionId: "engine.research.start",
        confidence: "high",
        params: { ...params, domain: "research" },
        originalText: text,
      };
    }
    return { actionId: "engine.research.start", confidence: "high", params, originalText: text };
  }

  if (
    /(dalil|evidence|kanıt|доказател).*(ko'rsat|show|map|xarit)/i.test(text) ||
    /(mavjud|existing).*(dalil|evidence)/i.test(text)
  ) {
    const country = findCountryInText(text);
    return {
      actionId: "engine.evidence.start",
      confidence: "high",
      params: {
        userStatement: text,
        entityId: country?.id,
        entityName: country?.name,
        countryCode: country?.id,
      },
      originalText: text,
    };
  }

  if (/(dalil|evidence).*(yetishmayotgan|missing|gap|bo'shliq)/i.test(text)) {
    const company = findCompanyInText(text);
    if (company) {
      return {
        actionId: "engine.organization.start",
        confidence: "high",
        params: { userStatement: text, entityId: company.id, entityName: company.name },
        originalText: text,
      };
    }
  }

  if (/(governance|boshqaruv).*(tekshir|review|o'tkaz)/i.test(text)) {
    return {
      actionId: "engine.governance.start",
      confidence: "high",
      params: { userStatement: text },
      originalText: text,
    };
  }

  const country = findCountryInText(text);
  if (country && /(mamlakat|country|davlat).*(razvedka|intelligence|ko'rsatkich)/i.test(text)) {
    return {
      actionId: "engine.country.start",
      confidence: "high",
      params: { userStatement: text, entityId: country.id, entityName: country.name, countryCode: country.id },
      originalText: text,
    };
  }

  if (normalized.includes("apple") || findCompanyInText(text)) {
    if (/(haqida|about|organization|kompaniya|company)/i.test(text)) {
      const company = findCompanyInText(text) ?? { id: "apple", name: "Apple" };
      return {
        actionId: "engine.organization.start",
        confidence: "medium",
        params: { userStatement: text, entityId: company.id, entityName: company.name },
        originalText: text,
      };
    }
  }

  return null;
}
