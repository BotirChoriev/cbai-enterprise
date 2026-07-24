import type { TranslationDictionary } from "@/lib/i18n/dictionary-types";
import type { GovernmentWorkspaceModel } from "@/lib/workspaces/government";
import type { WorkspaceCoverageItem, WorkspaceSourceItem } from "@/lib/workspaces";
import { translateWorkspaceStatusLabel } from "@/lib/i18n/investor-translation";

function translateDomainRow(
  dictionary: TranslationDictionary,
  item: WorkspaceCoverageItem,
): WorkspaceCoverageItem {
  const domainCopy =
    dictionary.governmentWorkspace.domains[
      item.id as keyof typeof dictionary.governmentWorkspace.domains
    ];
  return {
    ...item,
    title: domainCopy?.title ?? item.title,
    description: domainCopy?.purpose ?? dictionary.workspaceShared.registeredDomainFallback,
    statusLabel: item.statusLabel,
  };
}

function translateServiceRow(
  dictionary: TranslationDictionary,
  item: WorkspaceCoverageItem,
): WorkspaceCoverageItem {
  const serviceCopy =
    dictionary.governmentWorkspace.serviceAreas[
      item.id as keyof typeof dictionary.governmentWorkspace.serviceAreas
    ];
  return {
    ...item,
    title: serviceCopy?.title ?? item.title,
    description: serviceCopy?.purpose ?? dictionary.workspaceShared.registeredDomainFallback,
    statusLabel: item.statusLabel,
  };
}

function translateSourceRow(
  dictionary: TranslationDictionary,
  source: WorkspaceSourceItem,
): WorkspaceSourceItem {
  const coverageCopy =
    dictionary.investorWorkspace.sourceCoverage[
      source.slug as keyof typeof dictionary.investorWorkspace.sourceCoverage
    ];
  return coverageCopy ? { ...source, coverage: coverageCopy } : source;
}

export function translateGovernmentWorkspace(
  dictionary: TranslationDictionary,
  model: GovernmentWorkspaceModel,
): GovernmentWorkspaceModel {
  const copy = dictionary.governmentWorkspace;
  return {
    ...model,
    hero: {
      title: copy.heroTitle,
      subtitle: copy.heroSubtitle,
      description: copy.heroDescription,
    },
    governanceCoverage: model.governanceCoverage.map((row) => translateDomainRow(dictionary, row)),
    publicServiceAreas: model.publicServiceAreas.map((row) => translateServiceRow(dictionary, row)),
    sources: model.sources.map((source) => translateSourceRow(dictionary, source)),
  };
}

export { translateWorkspaceStatusLabel };
