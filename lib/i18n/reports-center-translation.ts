import type { TranslationDictionary } from "@/lib/i18n/dictionary-types";
import type { ReportsCenterModel, ReportTypeDefinition } from "@/lib/reports-center";
import { explorerStatusClass } from "@/lib/evidence-explorer";
import { getIndicatorsForEntity } from "@/lib/indicator-framework";

type ReportsModelCopy = TranslationDictionary["reportsModel"];

export function translateReportStatus(
  copy: ReportsModelCopy,
  label: string,
): string {
  const map: Record<string, string> = {
    "Not available": copy.statuses.notAvailable,
    "Registry facts only": copy.statuses.registryFactsOnly,
    "Methodology definitions only": copy.statuses.methodologyDefinitionsOnly,
    "Insufficient Evidence": copy.statuses.insufficientEvidence,
    "Evidence Source Not Connected": copy.statuses.evidenceSourceNotConnected,
    "Partial — local registry": copy.statuses.partialLocalRegistry,
    "Defined in framework": copy.statuses.definedInFramework,
    "Not applicable": copy.statuses.notApplicable,
    Planned: copy.statuses.planned,
  };
  return map[label] ?? label;
}

export function translatedReportStatusClass(
  dictionary: TranslationDictionary,
  label: string,
): string {
  const s = dictionary.reportsModel.statuses;
  if (
    label === s.notAvailable ||
    label === s.insufficientEvidence ||
    label === s.evidenceSourceNotConnected
  ) {
    return "text-zinc-400 bg-zinc-800/50 border-zinc-700/50";
  }
  if (label === s.planned || label === s.partialLocalRegistry) {
    return "text-violet-400 bg-violet-500/10 border-violet-500/20";
  }
  if (
    label === s.registryFactsOnly ||
    label === s.methodologyDefinitionsOnly ||
    label === s.definedInFramework
  ) {
    return "text-amber-400 bg-amber-500/10 border-amber-500/20";
  }
  return explorerStatusClass(label);
}

export function translateReportType(
  dictionary: TranslationDictionary,
  report: ReportTypeDefinition,
): ReportTypeDefinition {
  const copy = dictionary.reportsModel;
  const typeCopy = copy.reportTypes[report.id as keyof typeof copy.reportTypes];
  if (!typeCopy) return report;

  let evidenceRequired = report.evidenceRequired;
  if (report.entityScope === "country") {
    evidenceRequired = copy.evidenceRequired.country.replace(
      "{count}",
      String(getIndicatorsForEntity("country").length),
    );
  } else if (report.entityScope === "company") {
    evidenceRequired = copy.evidenceRequired.company.replace(
      "{count}",
      String(getIndicatorsForEntity("company").length),
    );
  } else if (report.entityScope === "university") {
    evidenceRequired = copy.evidenceRequired.university.replace(
      "{count}",
      String(getIndicatorsForEntity("university").length),
    );
  } else if (report.id === "investor-brief") {
    evidenceRequired = copy.evidenceRequired.investor;
  } else if (report.id === "government-brief") {
    evidenceRequired = copy.evidenceRequired.government;
  } else if (report.id === "research-brief") {
    evidenceRequired = copy.evidenceRequired.research;
  } else if (report.id === "academic-methodology") {
    evidenceRequired = copy.evidenceRequired.academic;
  }

  return {
    ...report,
    title: typeCopy.title,
    description: typeCopy.description,
    audience: typeCopy.audience,
    evidenceRequired,
    availableToday: translateReportStatus(copy, report.availableToday) as ReportTypeDefinition["availableToday"],
    evidenceStatus: translateReportStatus(copy, report.evidenceStatus) as ReportTypeDefinition["evidenceStatus"],
    methodologyStatus: translateReportStatus(copy, report.methodologyStatus) as ReportTypeDefinition["methodologyStatus"],
    exportStatus: translateReportStatus(copy, report.exportStatus) as ReportTypeDefinition["exportStatus"],
  };
}

export function translateReportsCenterModel(
  dictionary: TranslationDictionary,
  model: ReportsCenterModel,
): ReportsCenterModel {
  const copy = dictionary.reportsModel;
  return {
    ...model,
    reportTypes: model.reportTypes.map((report) => translateReportType(dictionary, report)),
    exportFuture: model.exportFuture.map((item) => {
      const itemCopy = copy.exportFuture[item.id as keyof typeof copy.exportFuture];
      return itemCopy
        ? { ...item, format: itemCopy.format, description: itemCopy.description }
        : item;
    }),
    personas: model.personas.map((persona) => {
      const personaCopy = copy.reportPersonas[persona.id as keyof typeof copy.reportPersonas];
      if (!personaCopy) return persona;
      return {
        ...persona,
        title: personaCopy.title,
        usefulReports: personaCopy.usefulReports.map((title) => {
          const match = model.reportTypes.find((r) => r.title === title);
          if (!match) return title;
          return copy.reportTypes[match.id as keyof typeof copy.reportTypes]?.title ?? title;
        }),
      };
    }),
    trustPillars: model.trustPillars.map((pillar) => {
      const pillarCopy = copy.trustPillars[pillar.id as keyof typeof copy.trustPillars];
      return pillarCopy ? { ...pillar, title: pillarCopy.title, description: pillarCopy.description } : pillar;
    }),
  };
}
