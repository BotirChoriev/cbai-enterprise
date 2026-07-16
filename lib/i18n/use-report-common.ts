"use client";

import { useTranslation } from "@/lib/i18n/use-translation";

/** Shared report view labels from reportsCommon namespace. */
export function useReportCommon() {
  const { t } = useTranslation();

  return {
    countryEyebrow: t("reportsCommon.countryReportEyebrow"),
    companyEyebrow: t("reportsCommon.companyReportEyebrow"),
    universityEyebrow: t("reportsCommon.universityReportEyebrow"),
    projectEyebrow: t("reportsCommon.projectReportEyebrow"),
    researchEyebrow: t("reportsCommon.researchReportEyebrow"),
    generated: (date: string) => t("reportsCommon.generated", { date }),
    overview: t("reportsCommon.overview"),
    region: t("reportsCommon.region"),
    capital: t("reportsCommon.capital"),
    government: t("reportsCommon.government"),
    officialWebsite: t("reportsCommon.officialWebsite"),
    noVerifiedInfo: t("reportsCommon.noVerifiedInfo"),
    evidence: t("reportsCommon.evidence"),
    evidenceSummary: (vars: { connected: string; total: string; indicators: string; questions: string }) =>
      t("reportsCommon.evidenceSummary", vars),
    connectedEvidence: t("reportsCommon.connectedEvidence"),
    missingEvidence: t("reportsCommon.missingEvidence"),
    noSourcesConnected: t("reportsCommon.noSourcesConnected"),
    noMissingSources: t("reportsCommon.noMissingSources"),
    research: t("reportsCommon.research"),
    organizations: t("reportsCommon.organizations"),
    relatedCompanies: t("reportsCommon.relatedCompanies"),
    relatedUniversities: t("reportsCommon.relatedUniversities"),
    projects: t("reportsCommon.projects"),
    noRelatedCompanies: t("reportsCommon.noRelatedCompanies"),
    noRelatedUniversities: t("reportsCommon.noRelatedUniversities"),
    noProjectsLinked: t("reportsCommon.noProjectsLinked"),
    createProjectFor: (name: string) => t("reportsCommon.createProjectFor", { name }),
    methodology: t("reportsCommon.methodology"),
    trustStatement: t("reportsCommon.trustStatement"),
    limitations: t("reportsCommon.limitations"),
  };
}
