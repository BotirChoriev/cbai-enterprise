/**
 * Deterministic translation routing for Live Intelligence Rooms.
 * Never silently invents meaning for uncertain technical terms.
 */

import type {
  LiveGlossaryTerm,
  LiveRoomLocale,
  LiveTranscriptTurn,
  TranslationStatus,
} from "@/lib/live-intelligence-rooms/types";

/** Small deterministic phrase map for demo/tests — not a production MT engine. */
const PHRASE_MAP: Record<string, Partial<Record<LiveRoomLocale, string>>> = {
  "open the evidence panel": {
    uz: "Dalillar panelini oching",
    ru: "Откройте панель доказательств",
    tr: "Kanıt panelini açın",
    en: "Open the evidence panel",
  },
  "dalillar panelini oching": {
    en: "Open the evidence panel",
    uz: "Dalillar panelini oching",
    ru: "Откройте панель доказательств",
    tr: "Kanıt panelini açın",
  },
  "we need human confirmation before creating a work plan": {
    uz: "Ish rejasini yaratishdan oldin inson tasdiqi kerak",
    ru: "Перед созданием плана работы нужно подтверждение человека",
    tr: "Bir iş planı oluşturmadan önce insan onayı gerekir",
    en: "We need human confirmation before creating a work plan",
  },
};

export type RouteTranslationInput = {
  readonly originalText: string;
  readonly originalLocale: string;
  readonly targetLocale: string;
  readonly glossary: readonly LiveGlossaryTerm[];
};

export type RouteTranslationResult = {
  readonly translatedText: string | null;
  readonly status: TranslationStatus;
  readonly uncertainty: string | null;
  readonly glossaryTermIds: readonly string[];
  readonly preservedTerms: readonly string[];
};

function normalize(text: string): string {
  return text.trim().replace(/\s+/g, " ").toLowerCase();
}

function findGlossaryHits(text: string, glossary: readonly LiveGlossaryTerm[]): LiveGlossaryTerm[] {
  const lower = text.toLowerCase();
  return glossary.filter((term) => term.term && lower.includes(term.term.toLowerCase()));
}

/**
 * Route one utterance into a target listening locale.
 * Do-not-translate glossary terms stay in the original form and may force clarification.
 */
export function routeTranslation(input: RouteTranslationInput): RouteTranslationResult {
  const hits = findGlossaryHits(input.originalText, input.glossary);
  const preserved = hits.filter((h) => h.doNotTranslate).map((h) => h.term);

  if (input.originalLocale === input.targetLocale) {
    return {
      translatedText: input.originalText,
      status: "original_only",
      uncertainty: null,
      glossaryTermIds: hits.map((h) => h.id),
      preservedTerms: preserved,
    };
  }

  if (preserved.length > 0) {
    // Keep original sentence; mark uncertain rather than inventing a technical rendering.
    return {
      translatedText: input.originalText,
      status: "clarification_needed",
      uncertainty: `Preserve technical term(s): ${preserved.join(", ")} — approve glossary translation before synthetic audio.`,
      glossaryTermIds: hits.map((h) => h.id),
      preservedTerms: preserved,
    };
  }

  const mapped = PHRASE_MAP[normalize(input.originalText)]?.[input.targetLocale as LiveRoomLocale];
  if (mapped) {
    let text = mapped;
    for (const hit of hits) {
      const preferred = hit.preferredTranslations[input.targetLocale as LiveRoomLocale];
      if (preferred) {
        text = text.replace(new RegExp(hit.term, "ig"), preferred);
      }
    }
    return {
      translatedText: text,
      status: "translated",
      uncertainty: null,
      glossaryTermIds: hits.map((h) => h.id),
      preservedTerms: [],
    };
  }

  // Honest fallback: keep original, flag uncertainty — never fabricate fluent prose.
  return {
    translatedText: input.originalText,
    status: "uncertain",
    uncertainty: "No verified translation available for this utterance in the deterministic router.",
    glossaryTermIds: hits.map((h) => h.id),
    preservedTerms: [],
  };
}

export function buildTranscriptTurn(options: {
  readonly id: string;
  readonly speakerParticipantId: string;
  readonly originalText: string;
  readonly originalLocale: string;
  readonly listenerLocales: readonly string[];
  readonly glossary: readonly LiveGlossaryTerm[];
  readonly createdAt?: string;
}): LiveTranscriptTurn {
  const translatedVariants: Record<string, string> = {};
  let status: TranslationStatus = "original_only";
  let uncertainty: string | null = null;
  const glossaryTermIds = new Set<string>();

  for (const locale of options.listenerLocales) {
    const routed = routeTranslation({
      originalText: options.originalText,
      originalLocale: options.originalLocale,
      targetLocale: locale,
      glossary: options.glossary,
    });
    routed.glossaryTermIds.forEach((id) => glossaryTermIds.add(id));
    if (routed.translatedText && locale !== options.originalLocale) {
      translatedVariants[locale] = routed.translatedText;
    }
    if (routed.status === "clarification_needed") {
      status = "clarification_needed";
      uncertainty = routed.uncertainty;
    } else if (routed.status === "uncertain" && status !== "clarification_needed") {
      status = "uncertain";
      uncertainty = routed.uncertainty;
    } else if (routed.status === "translated" && status === "original_only") {
      status = "translated";
    }
  }

  return {
    id: options.id,
    speakerParticipantId: options.speakerParticipantId,
    originalText: options.originalText,
    originalLocale: options.originalLocale,
    translatedVariants,
    translationStatus: status,
    translationUncertainty: uncertainty,
    glossaryTermIds: [...glossaryTermIds],
    createdAt: options.createdAt ?? new Date().toISOString(),
    isSyntheticAudio: false,
  };
}
