/**
 * EPIC-13.4 — Universal Object Contract: one grammar, domain-specific meaning preserved.
 */

import { resolveEntityRef } from "@/lib/context/context-builder";
import type { ContextEntityRef, EntityKind } from "@/lib/context/context-types";
import { deriveEvidenceRuntime } from "@/lib/evidence-runtime/evidence-runtime";
import { deriveEvidencePulse } from "@/lib/intelligence-os/evidence-pulse";
import { deriveLegacyTrail } from "@/lib/intelligence-os/legacy-trail";
import { deriveReportReadiness } from "@/lib/intelligence-os/report-readiness";
import { getCurrentMission } from "@/lib/intelligence-os/mission-engine";
import type { Mission } from "@/lib/intelligence-os/mission.types";
import {
  loadProject,
  loadProjectEvidence,
  loadProjectQuestions,
  loadProjects,
} from "@/lib/project/project-store";
import { buildCapabilityPassport } from "@/lib/capability/capability-passport-builder";
import { CAPABILITY_DOMAIN_LABELS, type CapabilityDomainId } from "@/lib/capability/capability-passport.types";
import { deriveEvidenceValidationIssues } from "@/lib/intelligence-os/evidence-object-helpers";
import type { KnowledgeLayerContent } from "@/lib/intelligence-os/knowledge-layer-content";

export type UniversalObjectType =
  | "mission"
  | "project"
  | "research_topic"
  | "evidence"
  | "country"
  | "company"
  | "university"
  | "report"
  | "question"
  | "relationship"
  | "capability_signal";

export type UniversalObjectRef = {
  readonly type: UniversalObjectType;
  readonly id: string;
};

export type UniversalObjectAction = {
  readonly label: string;
  readonly href: string;
};

export type UniversalObjectContract = {
  readonly ref: UniversalObjectRef;
  readonly identity: string;
  readonly purpose: string | null;
  readonly state: string;
  readonly missionRelation: string | null;
  readonly evidenceSummary: string | null;
  readonly unknowns: readonly string[];
  readonly trustState: string | null;
  readonly actions: readonly UniversalObjectAction[];
  readonly limitations: string | null;
  readonly returnPath: string;
  readonly layers: KnowledgeLayerContent;
  readonly requiresHumanJudgment: boolean;
};

function entityHref(kind: EntityKind, id: string): string {
  const base = kind === "country" ? "/countries" : kind === "company" ? "/companies" : "/universities";
  return `${base}?${kind}=${encodeURIComponent(id)}`;
}

export function refFromContextEntity(entity: ContextEntityRef): UniversalObjectRef {
  const typeMap: Record<EntityKind, UniversalObjectType> = {
    country: "country",
    company: "company",
    university: "university",
    research_topic: "research_topic",
    project: "project",
    evidence: "evidence",
  };
  return { type: typeMap[entity.kind], id: entity.id };
}

export function resolveUniversalObject(
  ref: UniversalObjectRef,
  mission: Mission | null = getCurrentMission(),
): UniversalObjectContract | null {
  switch (ref.type) {
    case "mission": {
      const m = mission;
      if (!m) return null;
      const pulse = deriveEvidencePulse(m);
      return {
        ref,
        identity: m.problem,
        purpose: m.whyExists || null,
        state: m.status,
        missionRelation: "active-center",
        evidenceSummary: pulse.label,
        unknowns: m.evidenceMissing ? [m.evidenceMissing] : [],
        trustState: pulse.limitation,
        actions: [{ label: "Mission Space", href: "/" }],
        limitations: pulse.limitation,
        returnPath: "/",
        layers: {
          surface: m.problem,
          summary: m.whyExists,
          evidence: pulse.label,
          reasoning: m.successCriteria,
          validation: pulse.consensus,
          impact: m.whoBenefits,
          legacy: deriveLegacyTrail(m).summary,
        },
        requiresHumanJudgment: pulse.state === "conflicting" || !m.evidenceHave,
      };
    }
    case "project": {
      const project = loadProject(ref.id);
      if (!project) return null;
      const evidence = loadProjectEvidence(ref.id);
      const questions = loadProjectQuestions(ref.id).filter((q) => !q.resolved);
      return {
        ref,
        identity: project.title,
        purpose: project.researchQuestion || null,
        state: project.status,
        missionRelation: mission?.projectId === ref.id ? "linked-to-mission" : "standalone",
        evidenceSummary: `${evidence.length} evidence link(s)`,
        unknowns: questions.map((q) => q.question),
        trustState: evidence.length > 0 ? "user-authored refs" : "no evidence linked",
        actions: [
          { label: "Open project", href: `/my-work?project=${ref.id}` },
          { label: "Evidence", href: `/my-work?project=${ref.id}#project-evidence` },
        ],
        limitations: "Project evidence is user-authored — not machine-verified unless connected.",
        returnPath: `/my-work?project=${ref.id}`,
        layers: {
          surface: project.title,
          summary: project.researchQuestion,
          evidence: `${evidence.length} linked reference(s)`,
          reasoning: `${loadProjectQuestions(ref.id).length} question(s)`,
          validation: null,
          history: project.updatedAt,
          impact: null,
          legacy: project.reportGeneratedAt ? "Report timestamp recorded" : null,
        },
        requiresHumanJudgment: questions.length > 0,
      };
    }
    case "country":
    case "company":
    case "university": {
      const entity = resolveEntityRef(ref.type, ref.id);
      if (!entity) return null;
      return buildEntityContract(ref, entity, mission);
    }
    case "research_topic":
      return {
        ref,
        identity: ref.id,
        purpose: "Research catalog topic",
        state: "catalog",
        missionRelation: null,
        evidenceSummary: null,
        unknowns: [],
        trustState: "catalog reference",
        actions: [{ label: "Open topic", href: `/research/${ref.id}` }],
        limitations: "Topic detail depends on catalog coverage.",
        returnPath: `/research/${ref.id}`,
        layers: { surface: ref.id },
        requiresHumanJudgment: false,
      };
    case "evidence": {
      const runtime = deriveEvidenceRuntime(mission);
      const record = runtime.records.find((r) => r.evidence.evidenceId === ref.id);
      if (!record) return null;
      const issues = deriveEvidenceValidationIssues(record);
      return {
        ref,
        identity: record.evidence.label,
        purpose: "Evidence reference",
        state: record.freshness,
        missionRelation: mission ? "mission-scoped" : null,
        evidenceSummary: record.evidence.originalSource ?? "No source URL",
        unknowns: issues,
        trustState: record.evidence.reliability ?? "unknown",
        actions: [{ label: "Evidence explorer", href: "/knowledge" }],
        limitations: "Human validation required for conclusions.",
        returnPath: "/knowledge",
        layers: {
          surface: record.evidence.label,
          summary: record.evidence.note ?? null,
          evidence: record.evidence.originalSource,
          validation: issues.join("; ") || null,
        },
        requiresHumanJudgment: issues.length > 0,
      };
    }
    case "question": {
      for (const project of loadProjects()) {
        const match = loadProjectQuestions(project.id).find((q) => q.questionId === ref.id);
        if (!match) continue;
        return {
          ref,
          identity: match.question,
          purpose: "Open research question",
          state: match.resolved ? "resolved" : "open",
          missionRelation: mission?.projectId === project.id ? "mission-project" : "project-scoped",
          evidenceSummary: null,
          unknowns: match.resolved ? [] : ["Answer not yet documented"],
          trustState: match.resolved ? "resolved-by-user" : "unresolved",
          actions: [{ label: "Project questions", href: `/my-work?project=${project.id}#project-questions` }],
          limitations: "Question resolution is user-declared — not machine-verified.",
          returnPath: `/my-work?project=${project.id}`,
          layers: {
            surface: match.question,
            summary: project.title,
            validation: match.resolved ? "Marked resolved" : "Open",
          },
          requiresHumanJudgment: !match.resolved,
        };
      }
      return null;
    }
    case "report": {
      const project = loadProject(ref.id) ?? loadProjects().find((p) => p.id === ref.id);
      if (!project) return null;
      const readiness = deriveReportReadiness(project.id);
      return {
        ref,
        identity: project.title,
        purpose: "Report artifact",
        state: readiness?.canClaimReadiness ? "ready" : "draft",
        missionRelation: mission?.projectId === project.id ? "mission-report" : "project-report",
        evidenceSummary: `${loadProjectEvidence(project.id).length} evidence link(s)`,
        unknowns: readiness.canClaimReadiness ? [] : [readiness.limitation],
        trustState: readiness?.canClaimReadiness ? "readiness-met" : "readiness-pending",
        actions: [{ label: "Reports", href: `/reports?project=${project.id}` }],
        limitations: readiness?.limitation ?? "Report readiness is criteria-based — not automated publishing.",
        returnPath: `/reports?project=${project.id}`,
        layers: {
          surface: project.title,
          summary: project.researchQuestion,
          validation: readiness?.limitation ?? null,
          legacy: project.reportGeneratedAt ? `Generated ${project.reportGeneratedAt}` : null,
        },
        requiresHumanJudgment: !readiness?.canClaimReadiness,
      };
    }
    case "relationship":
      return {
        ref,
        identity: ref.id,
        purpose: "Entity relationship",
        state: "graph-derived",
        missionRelation: mission ? "may-support-mission" : null,
        evidenceSummary: "See Knowledge Universe connections",
        unknowns: ["Relationship strength not scored"],
        trustState: "catalog-backed",
        actions: [{ label: "Knowledge Universe", href: "/graph" }],
        limitations: "Relationships are catalog-derived — not live external feeds.",
        returnPath: "/graph",
        layers: { surface: ref.id, evidence: "Graph edge inspection" },
        requiresHumanJudgment: false,
      };
    case "capability_signal": {
      const passport = buildCapabilityPassport("Operator");
      const domain = passport.domains.find((d) => d.domainId === ref.id);
      if (!domain || domain.signalCount === 0) return null;
      const label = CAPABILITY_DOMAIN_LABELS[domain.domainId as CapabilityDomainId];
      return {
        ref,
        identity: label,
        purpose: "Demonstrated capability signal",
        state: domain.maturity,
        missionRelation: mission ? "may-inform-mission" : null,
        evidenceSummary: `${domain.signalCount} recorded signal(s)`,
        unknowns: domain.maturity === "none" ? ["No signals yet"] : [],
        trustState: "user-demonstrated",
        actions: [{ label: "Capability", href: "/trust" }],
        limitations: "Signals reflect recorded activity — not credentials or titles.",
        returnPath: "/trust",
        layers: {
          surface: label,
          summary: `${domain.signalCount} signal(s) — ${domain.maturity}`,
          evidence: domain.lastActivityAt ? `Last activity ${domain.lastActivityAt}` : null,
        },
        requiresHumanJudgment: false,
      };
    }
    default:
      return null;
  }
}

function buildEntityContract(
  ref: UniversalObjectRef,
  entity: ContextEntityRef,
  mission: Mission | null,
): UniversalObjectContract {
  const href = entityHref(entity.kind, entity.id);
  return {
    ref,
    identity: entity.name,
    purpose: entity.countryName ?? entity.code ?? null,
    state: "registry",
    missionRelation: mission ? "may-support-mission" : null,
    evidenceSummary: "See entity evidence panel",
    unknowns: [],
    trustState: "registry-backed",
    actions: [
      { label: "Open entity", href },
      { label: "Knowledge Universe", href: "/graph" },
    ],
    limitations: "Entity intelligence depends on connected catalog sources.",
    returnPath: href,
    layers: {
      surface: entity.name,
      summary: entity.countryName ?? null,
      evidence: "See entity module",
    },
    requiresHumanJudgment: false,
  };
}

export const UNIVERSAL_OBJECT_TYPES: readonly UniversalObjectType[] = [
  "mission",
  "project",
  "research_topic",
  "evidence",
  "country",
  "company",
  "university",
  "report",
  "question",
  "relationship",
  "capability_signal",
];
