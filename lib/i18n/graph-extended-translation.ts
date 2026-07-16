import type { TranslationDictionary } from "@/lib/i18n/dictionary-types";
import { GRAPH_PERSONAS, GRAPH_TRUST_PILLARS } from "@/lib/graph/graph-platform";

export function translateGraphPersonas(dictionary: TranslationDictionary) {
  return GRAPH_PERSONAS.map((persona) => {
    const copy = dictionary.graphExtended.personas[persona.id as keyof typeof dictionary.graphExtended.personas];
    return {
      id: persona.id,
      title: copy?.title ?? persona.title,
      whatCanILearn: copy?.whatCanILearn ?? persona.whatCanILearn,
    };
  });
}

export function translateGraphTrustPillars(dictionary: TranslationDictionary) {
  return GRAPH_TRUST_PILLARS.map((pillar) => {
    const copy =
      dictionary.graphExtended.trustPillars[pillar.id as keyof typeof dictionary.graphExtended.trustPillars];
    return {
      id: pillar.id,
      title: copy?.title ?? pillar.title,
      description: copy?.description ?? pillar.description,
    };
  });
}
