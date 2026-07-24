import type { TranslationDictionary } from "@/lib/i18n/dictionary-types";
import type { InvestorWorkspaceModel } from "@/lib/workspaces/investor";
import type {
  WorkspaceCoverageItem,
  WorkspaceEntityLink,
  WorkspaceReadinessLabel,
  WorkspaceSourceItem,
} from "@/lib/workspaces";
import type { CoverageStatusLabel } from "@/lib/countries.coverage";

export function translateWorkspaceStatusLabel(
  dictionary: TranslationDictionary,
  label: WorkspaceReadinessLabel | CoverageStatusLabel,
): string {
  const copy = dictionary.workspaceShared;
  switch (label) {
    case "Not connected":
    case "Evidence Source Not Connected":
      return copy.statusNoSourceConnected;
    case "Planned":
      return copy.statusNotYetAvailable;
    case "Verification pending":
      return copy.statusReviewPending;
    case "Connected":
      return copy.statusAvailableNow;
    case "Insufficient Evidence":
      return copy.statusLimitedEvidence;
    case "Available Information":
      return copy.statusAvailableInformation;
    default:
      return label;
  }
}

function translateDomainRow(
  dictionary: TranslationDictionary,
  item: WorkspaceCoverageItem,
): WorkspaceCoverageItem {
  const domainCopy =
    dictionary.investorWorkspace.domains[
      item.id as keyof typeof dictionary.investorWorkspace.domains
    ];
  return {
    ...item,
    title: domainCopy?.title ?? item.title,
    description: domainCopy?.purpose ?? dictionary.workspaceShared.registeredDomainFallback,
    statusLabel: item.statusLabel,
  };
}

function translateEntityLink(
  dictionary: TranslationDictionary,
  link: WorkspaceEntityLink,
): WorkspaceEntityLink {
  const cardCopy =
    dictionary.investorWorkspace.entityLinks[
      link.id as keyof typeof dictionary.investorWorkspace.entityLinks
    ];
  if (!cardCopy) return link;
  return {
    ...link,
    label: cardCopy.label,
    description: cardCopy.description,
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

export function translateInvestorWorkspace(
  dictionary: TranslationDictionary,
  model: InvestorWorkspaceModel,
): InvestorWorkspaceModel {
  const copy = dictionary.investorWorkspace;
  return {
    ...model,
    hero: {
      title: copy.heroTitle,
      subtitle: copy.heroSubtitle,
      description: copy.heroDescription,
    },
    investmentEvidenceMap: model.investmentEvidenceMap.map((row) => translateDomainRow(dictionary, row)),
    opportunityReadiness: model.opportunityReadiness.map((row) => translateDomainRow(dictionary, row)),
    entityLinks: model.entityLinks.map((link) => translateEntityLink(dictionary, link)),
    sources: model.sources.map((source) => translateSourceRow(dictionary, source)),
  };
}

export function translateEvidencePulseLimitation(
  dictionary: TranslationDictionary,
  key: string,
): string {
  const map: Record<string, keyof TranslationDictionary["evidencePulse"]> = {
    noProject: "limitationNoProject",
    noRefs: "limitationNoRefs",
    conflicting: "limitationConflicting",
    outdated: "limitationOutdated",
    unverified: "limitationUnverified",
    deviceLocal: "limitationDeviceLocal",
  };
  const copyKey = map[key];
  return copyKey ? dictionary.evidencePulse[copyKey] : dictionary.evidencePulse.limitation;
}

export function translateEvidencePulseStateLabel(
  dictionary: TranslationDictionary,
  state: string,
): string {
  const map: Record<string, keyof TranslationDictionary["evidencePulse"]> = {
    available: "available",
    partial: "partial",
    missing: "missing",
    conflicting: "conflicting",
    outdated: "outdated",
    unverified: "unverified",
  };
  const copyKey = map[state];
  return copyKey ? dictionary.evidencePulse[copyKey] : state;
}
