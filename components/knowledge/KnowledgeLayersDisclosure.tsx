"use client";

import { useTranslation } from "@/lib/i18n/use-translation";
import { cbaiSectionEyebrow } from "@/components/brand/brand-classes";

export type KnowledgeLayerContent = {
  surface?: string | null;
  summary?: string | null;
  evidence?: string | null;
  reasoning?: string | null;
  history?: string | null;
  impact?: string | null;
  legacy?: string | null;
};

type KnowledgeLayersDisclosureProps = {
  layers: KnowledgeLayerContent;
  className?: string;
};

const LAYER_KEYS = [
  ["layerSurface", "surface"],
  ["layerSummary", "summary"],
  ["layerEvidence", "evidence"],
  ["layerReasoning", "reasoning"],
  ["layerHistory", "history"],
  ["layerImpact", "impact"],
  ["layerLegacy", "legacy"],
] as const;

/** Progressive knowledge depth — native disclosure, no modal explosion. */
export default function KnowledgeLayersDisclosure({ layers, className = "" }: KnowledgeLayersDisclosureProps) {
  const { t } = useTranslation();

  return (
    <section className={`space-y-1 ${className}`} aria-labelledby="knowledge-layers-heading">
      <p className={cbaiSectionEyebrow} id="knowledge-layers-heading">
        {t("livingIntelligence.knowledgeLayers")}
      </p>
      <div className="space-y-1">
        {LAYER_KEYS.map(([labelKey, field]) => {
          const value = layers[field];
          return (
            <details
              key={field}
              className="rounded-md border border-zinc-800/80 bg-zinc-950/40 px-3 py-1.5"
              open={field === "surface" && Boolean(value)}
            >
              <summary className="cursor-pointer text-xs font-medium text-zinc-400">
                {t(`livingIntelligence.${labelKey}`)}
              </summary>
              <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">
                {value?.trim() ? value : t("livingIntelligence.layerEmpty")}
              </p>
            </details>
          );
        })}
      </div>
    </section>
  );
}
