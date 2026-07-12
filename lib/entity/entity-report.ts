/**
 * Universal Entity Engine — report facade (Platform Core mission).
 *
 * "Any entity can generate a report using the same engine" — this is a dispatch facade, not a
 * new report system. For Country/Company/University it returns the exact same, already-real,
 * already-tested report objects `buildCountryReport`/`buildCompanyReport`/`buildUniversityReport`
 * produce (byte-identical output, safe to swap into existing "Generate report" buttons). For
 * Research topics — which never had a report — it compiles a minimal, honest one from the same
 * real data `ResearchIntelligenceOverview.tsx` already renders (`buildResearchMission`), never
 * inventing a methodology list or evidence total that doesn't exist for research topics today.
 */

import { countries } from "@/lib/countries";
import { companies } from "@/lib/companies";
import { universities } from "@/lib/universities";
import { getCountryRelationships } from "@/lib/countries.adapter";
import { getCompanyLinkedEntities } from "@/lib/companies.adapter";
import { getUniversityRelationships } from "@/lib/universities.adapter";
import { buildCountryUserJourney } from "@/lib/country-user-journey";
import { buildCompanyUserJourney } from "@/lib/company-user-journey";
import { buildUniversityUserJourney } from "@/lib/university-user-journey";
import { buildCountryReport, type CountryReport } from "@/lib/country-report";
import { buildCompanyReport, type CompanyReport } from "@/lib/company-report";
import { buildUniversityReport, type UniversityReport } from "@/lib/university-report";
import { buildResearchMission } from "@/lib/research-mission/research-mission-builder";
import { getResearchTopicById } from "@/lib/research/research-topics";
import { buildEntityRelationships } from "@/lib/entity/entity-relationships";
import type { EntityRelationship } from "@/lib/entity/entity.types";
import { resolveEntityDataStatus } from "@/components/shared/entity-profile-copy";
import type { ProductStatus } from "@/lib/product-status";

export type ResearchTopicReport = {
  topicId: string;
  topicName: string;
  domain: string;
  description: string;
  evidenceConnectedCount: number;
  relationships: EntityRelationship[];
  trustStatement: string;
  limitations: string[];
};

export type EntityReport =
  | ({ entityType: "country"; dataStatus: ProductStatus } & CountryReport)
  | ({ entityType: "company"; dataStatus: ProductStatus } & CompanyReport)
  | ({ entityType: "university"; dataStatus: ProductStatus } & UniversityReport)
  | ({ entityType: "research_topic"; dataStatus: ProductStatus } & ResearchTopicReport);

const RESEARCH_TRUST_STATEMENT =
  "CBAI provides evidence-based research intelligence. Findings, hypotheses, and connections are shown only when verified — never inferred or fabricated.";

function buildResearchTopicReport(topicId: string): ResearchTopicReport | null {
  const topic = getResearchTopicById(topicId);
  if (!topic) return null;

  const mission = buildResearchMission({ missionId: topicId });
  const contract = mission.workspaceContract;
  const evidenceConnectedCount = contract?.evidenceSummary.evidence.length ?? 0;

  const limitations: string[] = [
    "No verified link between this research topic and any country or university exists yet.",
    "Related companies are matched by industry keyword, not a confirmed institutional link.",
  ];
  if (evidenceConnectedCount === 0) {
    limitations.push("No evidence is connected to this research topic yet.");
  }

  return {
    topicId: topic.topicId,
    topicName: topic.topicName,
    domain: topic.domain,
    description: topic.description,
    evidenceConnectedCount,
    relationships: buildEntityRelationships("research_topic", topicId),
    trustStatement: RESEARCH_TRUST_STATEMENT,
    limitations,
  };
}

/**
 * Universal entry point: one function name for "generate a report for this entity," dispatching
 * to the real per-module builder. Returns null when the entity id doesn't resolve to a real
 * catalog record — never a fabricated report. Overloaded per literal entityType so call sites get
 * the exact report shape back (e.g. CountryReportView can take the "country" call's result
 * directly) without a manual narrowing check at every call site.
 */
export function buildEntityReport(entityType: "country", id: string): (EntityReport & { entityType: "country" }) | null;
export function buildEntityReport(entityType: "company", id: string): (EntityReport & { entityType: "company" }) | null;
export function buildEntityReport(entityType: "university", id: string): (EntityReport & { entityType: "university" }) | null;
export function buildEntityReport(entityType: "research_topic", id: string): (EntityReport & { entityType: "research_topic" }) | null;
export function buildEntityReport(
  entityType: "country" | "company" | "university" | "research_topic",
  id: string,
): EntityReport | null {
  switch (entityType) {
    case "country": {
      const country = countries.find((c) => c.id === id);
      if (!country) return null;
      const journey = buildCountryUserJourney(country, getCountryRelationships(country));
      const report = buildCountryReport(country, journey);
      return {
        entityType: "country",
        dataStatus: resolveEntityDataStatus(report.evidence.connectedSources, report.evidence.totalSources),
        ...report,
      };
    }
    case "company": {
      const company = companies.find((c) => c.id === id);
      if (!company) return null;
      const journey = buildCompanyUserJourney(company, getCompanyLinkedEntities(company));
      const report = buildCompanyReport(company, journey);
      return {
        entityType: "company",
        dataStatus: resolveEntityDataStatus(report.evidence.connectedSources, report.evidence.totalSources),
        ...report,
      };
    }
    case "university": {
      const university = universities.find((u) => u.id === id);
      if (!university) return null;
      const journey = buildUniversityUserJourney(university, getUniversityRelationships(university));
      const report = buildUniversityReport(university, journey);
      return {
        entityType: "university",
        dataStatus: resolveEntityDataStatus(report.evidence.connectedSources, report.evidence.totalSources),
        ...report,
      };
    }
    case "research_topic": {
      const report = buildResearchTopicReport(id);
      if (!report) return null;
      // No real "total possible sources" concept exists for research topics (unlike
      // Country/Company/University's coverage.sources.length), so this reports "live" only when
      // real evidence is connected and "waiting for verified data" otherwise — never a fabricated
      // ratio against a total that doesn't exist.
      return {
        entityType: "research_topic",
        dataStatus: report.evidenceConnectedCount > 0 ? "live" : "waiting_for_verified_data",
        ...report,
      };
    }
  }
}
