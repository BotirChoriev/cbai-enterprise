/**
 * CBAI World Bank Connector Readiness — indicator area definitions.
 * Public WDI code references only — no observation values.
 */

import type {
  WorldBankIndicatorArea,
  WorldBankIndicatorCodeRef,
  WorldBankIndicatorFamily,
} from "@/lib/connectors/world-bank/world-bank.types";
import { getIndicatorBySlug } from "@/lib/indicator-framework";

function wbCode(code: string): WorldBankIndicatorCodeRef {
  return code as WorldBankIndicatorCodeRef;
}

function resolveCbaiIndicator(slug: string): {
  id: string;
  slug: string;
} | null {
  const indicator = getIndicatorBySlug(slug);
  if (!indicator) return null;
  return { id: indicator.id, slug: indicator.slug };
}

type FamilyInput = {
  familyId: string;
  area: WorldBankIndicatorArea;
  title: string;
  description: string;
  referenceIndicatorCodes: readonly string[];
  cbaiIndicatorSlug: string | null;
  mappingStatus: WorldBankIndicatorFamily["mappingStatus"];
  mappingNotes: string;
};

function defineFamily(input: FamilyInput): WorldBankIndicatorFamily {
  const cbai = input.cbaiIndicatorSlug
    ? resolveCbaiIndicator(input.cbaiIndicatorSlug)
    : null;

  const effectiveStatus =
    input.mappingStatus === "mapped" && !cbai ? "requires_review" : input.mappingStatus;

  return {
    familyId: input.familyId,
    area: input.area,
    title: input.title,
    description: input.description,
    referenceIndicatorCodes: input.referenceIndicatorCodes.map(wbCode),
    cbaiIndicatorId: cbai?.id ?? null,
    cbaiIndicatorSlug: cbai?.slug ?? input.cbaiIndicatorSlug,
    mappingStatus: effectiveStatus,
    mappingNotes: input.mappingNotes,
  };
}

/**
 * World Bank indicator families by policy area.
 * Reference codes are public WDI taxonomy identifiers — not data values.
 */
export const WORLD_BANK_INDICATOR_FAMILIES: readonly WorldBankIndicatorFamily[] = [
  defineFamily({
    familyId: "wb-family-economy-national-accounts",
    area: "economy",
    title: "National Accounts",
    description:
      "GDP, GNI, and national accounts series from World Development Indicators.",
    referenceIndicatorCodes: ["NY.GDP.MKTP.CD", "NY.GDP.MKTP.KD.ZG", "NY.GNP.MKTP.CD"],
    cbaiIndicatorSlug: "national-accounts",
    mappingStatus: "mapped",
    mappingNotes: "Direct alignment with CBAI national accounts indicator.",
  }),
  defineFamily({
    familyId: "wb-family-trade-flows",
    area: "trade",
    title: "Trade Flows",
    description: "Merchandise and services trade statistics from WDI.",
    referenceIndicatorCodes: ["NE.EXP.GNFS.CD", "NE.IMP.GNFS.CD", "TX.VAL.MRCH.CD.WT"],
    cbaiIndicatorSlug: "trade-flow-disclosure",
    mappingStatus: "mapped",
    mappingNotes: "Trade volume series support trade-flow-disclosure evidence slots.",
  }),
  defineFamily({
    familyId: "wb-family-employment-labour",
    area: "employment",
    title: "Labour Market",
    description: "Employment, unemployment, and labour force participation from WDI.",
    referenceIndicatorCodes: ["SL.UEM.TOTL.ZS", "SL.EMP.TOTL.SP.ZS", "SL.TLF.TOTL.IN"],
    cbaiIndicatorSlug: "labour-market-statistics",
    mappingStatus: "mapped",
    mappingNotes: "Labour market series align with CBAI employment indicator.",
  }),
  defineFamily({
    familyId: "wb-family-infrastructure-access",
    area: "infrastructure",
    title: "Infrastructure Access",
    description: "Transport, water, and sanitation access indicators from WDI.",
    referenceIndicatorCodes: ["IS.RRS.TOTL.KN", "SH.H2O.SAFE.ZS", "IS.ROD.DNST.K2"],
    cbaiIndicatorSlug: "infrastructure-asset-registry",
    mappingStatus: "requires_review",
    mappingNotes:
      "WDI access metrics differ from asset registry disclosure — adapter review required.",
  }),
  defineFamily({
    familyId: "wb-family-energy-mix",
    area: "energy",
    title: "Energy Mix and Access",
    description: "Energy production, consumption, and access indicators from WDI.",
    referenceIndicatorCodes: ["EG.ELC.RNEW.ZS", "EG.USE.COMM.GD.PP.KD", "EG.IMP.CONS.ZS"],
    cbaiIndicatorSlug: "energy-mix-disclosure",
    mappingStatus: "mapped",
    mappingNotes: "Renewable share and consumption series support energy-mix disclosure.",
  }),
  defineFamily({
    familyId: "wb-family-health-coverage",
    area: "health",
    title: "Health System Indicators",
    description: "Health expenditure, mortality, and coverage statistics from WDI.",
    referenceIndicatorCodes: ["SH.XPD.CHEX.GD.ZS", "SH.DYN.MORT", "SH.MED.BEDS.ZS"],
    cbaiIndicatorSlug: "health-system-coverage",
    mappingStatus: "mapped",
    mappingNotes: "Health expenditure and facility indicators support coverage evidence.",
  }),
  defineFamily({
    familyId: "wb-family-education-enrollment",
    area: "education",
    title: "Education Enrollment",
    description: "School enrollment and completion rates from WDI.",
    referenceIndicatorCodes: ["SE.PRM.ENRR", "SE.SEC.ENRR", "SE.TER.ENRR"],
    cbaiIndicatorSlug: "education-enrollment-statistics",
    mappingStatus: "mapped",
    mappingNotes: "Enrollment rate series align with CBAI education indicator.",
  }),
  defineFamily({
    familyId: "wb-family-digital-development",
    area: "digital-development",
    title: "Digital Development",
    description: "Internet, mobile, and ICT access indicators from WDI.",
    referenceIndicatorCodes: ["IT.NET.USER.ZS", "IT.CEL.SETS.P2", "GB.XPD.RSDV.GD.ZS"],
    cbaiIndicatorSlug: "digital-connectivity",
    mappingStatus: "mapped",
    mappingNotes: "ICT penetration series support digital-connectivity evidence.",
  }),
  defineFamily({
    familyId: "wb-family-investment-fdi",
    area: "investment",
    title: "Foreign Direct Investment",
    description: "FDI inflows and related investment statistics from WDI.",
    referenceIndicatorCodes: ["BX.KLT.DINV.CD.WD", "NE.GDI.FTOT.ZS"],
    cbaiIndicatorSlug: "fdi-registration",
    mappingStatus: "requires_review",
    mappingNotes:
      "FDI flow series differ from registration disclosure — mapping requires governance review.",
  }),
  defineFamily({
    familyId: "wb-family-industry-structure",
    area: "industry",
    title: "Industry Structure",
    description: "Value added by industry and manufacturing statistics from WDI.",
    referenceIndicatorCodes: ["NV.IND.TOTL.ZS", "NV.IND.MANF.ZS"],
    cbaiIndicatorSlug: "industry-classification",
    mappingStatus: "requires_review",
    mappingNotes:
      "WDI industry value-added differs from ISIC classification disclosure requirements.",
  }),
  defineFamily({
    familyId: "wb-family-agriculture-production",
    area: "agriculture",
    title: "Agriculture Production",
    description: "Agricultural land, output, and employment indicators from WDI.",
    referenceIndicatorCodes: ["AG.LND.AGRI.ZS", "AG.PRD.CROP.XD", "SL.AGR.EMPL.ZS"],
    cbaiIndicatorSlug: "agriculture-production",
    mappingStatus: "mapped",
    mappingNotes: "Agricultural land and production indices support agriculture indicator.",
  }),
  defineFamily({
    familyId: "wb-family-climate-emissions",
    area: "climate",
    title: "Climate and Emissions",
    description: "CO₂ emissions and climate-related indicators from WDI.",
    referenceIndicatorCodes: ["EN.ATM.CO2E.PC", "EN.ATM.CO2E.KT", "EN.ATM.GHGO.KT.CE"],
    cbaiIndicatorSlug: "emissions-inventory",
    mappingStatus: "mapped",
    mappingNotes: "Emissions series align with CBAI emissions inventory indicator.",
  }),
  defineFamily({
    familyId: "wb-family-budget-transparency",
    area: "economy",
    title: "Fiscal Transparency Proxies",
    description: "Government finance and expenditure indicators from WDI.",
    referenceIndicatorCodes: ["GC.DOD.TOTL.GD.ZS", "GC.REV.XGRT.GD.ZS"],
    cbaiIndicatorSlug: "budget-document-publication",
    mappingStatus: "planned",
    mappingNotes:
      "WDI fiscal aggregates do not substitute for open budget document publication evidence.",
  }),
] as const;

export function getWorldBankIndicatorFamilyById(
  familyId: string,
): WorldBankIndicatorFamily | undefined {
  return WORLD_BANK_INDICATOR_FAMILIES.find((family) => family.familyId === familyId);
}

export function getWorldBankFamiliesByArea(
  area: WorldBankIndicatorArea,
): readonly WorldBankIndicatorFamily[] {
  return WORLD_BANK_INDICATOR_FAMILIES.filter((family) => family.area === area);
}
