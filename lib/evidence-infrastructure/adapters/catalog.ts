import type { AdapterContract } from "@/lib/evidence-infrastructure/types";

function defineAdapter(input: AdapterContract): AdapterContract {
  return input;
}

/**
 * Adapter catalog — declarative contracts mapping external formats to CBAI Evidence Model.
 * No transformation logic implemented.
 */
export const ADAPTER_CATALOG: readonly AdapterContract[] = [
  defineAdapter({
    adapterId: "adapter-cbai-local-registry",
    sourceSlug: "cbai-local-registry",
    title: "CBAI Local Registry Adapter",
    description: "Maps on-platform entity catalog fields to CbaiEvidenceItem v1.",
    inputFormat: "CBAI domain module records (Country, Company, University)",
    outputSchema: "v1",
    version: "1.0.0",
    normalizersRequired: ["country-code", "classification"],
  }),
  defineAdapter({
    adapterId: "adapter-world-bank-wdi",
    sourceSlug: "world-bank",
    title: "World Bank WDI Adapter",
    description: "Maps WDI indicator series to national-accounts evidence items — planned.",
    inputFormat: "WDI API/CSV indicator series (future)",
    outputSchema: "v1",
    version: "0.0.0-planned",
    normalizersRequired: ["date", "unit", "country-code", "currency"],
  }),
  defineAdapter({
    adapterId: "adapter-un-comtrade",
    sourceSlug: "united-nations",
    title: "UN Comtrade Adapter",
    description: "Maps trade flow statistics to trade-flow-disclosure evidence — planned.",
    inputFormat: "UN Comtrade dataset exports (future)",
    outputSchema: "v1",
    version: "0.0.0-planned",
    normalizersRequired: ["date", "unit", "country-code", "currency"],
  }),
  defineAdapter({
    adapterId: "adapter-ocds-json",
    sourceSlug: "open-contracting-partnership",
    title: "OCDS JSON Adapter",
    description: "Maps OCDS releases to procurement-disclosure evidence — planned.",
    inputFormat: "OCDS 1.1 JSON release packages (future)",
    outputSchema: "v1",
    version: "0.0.0-planned",
    normalizersRequired: ["date", "country-code", "currency", "language"],
  }),
  defineAdapter({
    adapterId: "adapter-unesco-uis",
    sourceSlug: "unesco",
    title: "UNESCO UIS Adapter",
    description: "Maps UIS education statistics to enrollment evidence — planned.",
    inputFormat: "UIS Data Centre exports (future)",
    outputSchema: "v1",
    version: "0.0.0-planned",
    normalizersRequired: ["date", "unit", "country-code", "classification"],
  }),
  defineAdapter({
    adapterId: "adapter-ilo-ilostat",
    sourceSlug: "ilo",
    title: "ILO ILOSTAT Adapter",
    description: "Maps labour statistics to labour-market-statistics evidence — planned.",
    inputFormat: "ILOSTAT bulk downloads (future)",
    outputSchema: "v1",
    version: "0.0.0-planned",
    normalizersRequired: ["date", "unit", "country-code"],
  }),
  defineAdapter({
    adapterId: "adapter-who-gho",
    sourceSlug: "who",
    title: "WHO GHO Adapter",
    description: "Maps Global Health Observatory indicators to health evidence — planned.",
    inputFormat: "GHO API/CSV indicators (future)",
    outputSchema: "v1",
    version: "0.0.0-planned",
    normalizersRequired: ["date", "unit", "country-code"],
  }),
  defineAdapter({
    adapterId: "adapter-open-budget",
    sourceSlug: "national-open-budget-portals",
    title: "Open Budget Document Adapter",
    description: "Maps budget document metadata to budget-transparency evidence — planned.",
    inputFormat: "Open Budget Survey / portal document catalogs (future)",
    outputSchema: "v1",
    version: "0.0.0-planned",
    normalizersRequired: ["date", "country-code", "language"],
  }),
] as const;

export function getAdapterById(adapterId: string): AdapterContract | undefined {
  return ADAPTER_CATALOG.find((a) => a.adapterId === adapterId);
}

export function getAdaptersBySourceSlug(
  sourceSlug: string,
): AdapterContract[] {
  return ADAPTER_CATALOG.filter((a) => a.sourceSlug === sourceSlug);
}

export function getAdaptersByOutputSchema(
  schema: AdapterContract["outputSchema"],
): AdapterContract[] {
  return ADAPTER_CATALOG.filter((a) => a.outputSchema === schema);
}
