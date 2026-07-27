/**
 * My Work cockpit query helpers — search, domain, sort, next-action queue.
 * Pure functions over OperationalObject records (no I/O).
 */

import type {
  OperationalObject,
  OperationalObjectDomain,
  OperationalObjectFilter,
  OperationalObjectPriority,
} from "@/lib/operational-objects/operational-object.types";
import { filterOperationalObjects } from "@/lib/operational-objects/operational-object-store";

export type CockpitSort = "updated_desc" | "priority_desc" | "next_action" | "title_asc";

export type CockpitQuery = {
  readonly filter: OperationalObjectFilter;
  readonly domain: OperationalObjectDomain | "all";
  readonly search: string;
  readonly sort: CockpitSort;
};

const PRIORITY_RANK: Record<OperationalObjectPriority, number> = {
  high: 0,
  normal: 1,
  low: 2,
};

/** Statuses that belong in the “needs attention” next-action queue. */
const ATTENTION_STATUSES = new Set([
  "draft",
  "ready",
  "waiting_for_input",
  "waiting_for_evidence",
  "needs_review",
  "blocked",
  "active",
]);

export function matchesCockpitSearch(object: OperationalObject, search: string): boolean {
  const q = search.trim().toLowerCase();
  if (!q) return true;
  const haystack = [
    object.title,
    object.summary,
    object.objective,
    object.nextAction,
    object.domain,
    object.type,
    object.status,
    object.locale,
    object.provenance.relatedEntityName ?? "",
    object.sourceCommand ?? "",
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
}

export function sortOperationalObjects(
  objects: readonly OperationalObject[],
  sort: CockpitSort,
): OperationalObject[] {
  const copy = [...objects];
  switch (sort) {
    case "priority_desc":
      return copy.sort((a, b) => {
        const pr = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
        if (pr !== 0) return pr;
        return b.updatedAt.localeCompare(a.updatedAt);
      });
    case "next_action":
      return copy.sort((a, b) => {
        const an = (a.nextAction || "").localeCompare(b.nextAction || "");
        if (an !== 0) return an;
        return b.updatedAt.localeCompare(a.updatedAt);
      });
    case "title_asc":
      return copy.sort((a, b) => a.title.localeCompare(b.title));
    case "updated_desc":
    default:
      return copy.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }
}

export function queryOperationalCockpit(
  objects: readonly OperationalObject[],
  query: CockpitQuery,
): OperationalObject[] {
  let list = filterOperationalObjects(objects, query.filter);
  if (query.domain !== "all") {
    list = list.filter((o) => o.domain === query.domain);
  }
  list = list.filter((o) => matchesCockpitSearch(o, query.search));
  return sortOperationalObjects(list, query.sort);
}

/** Next-action queue: attention-worthy items sorted by priority then recency. */
export function nextActionQueue(
  objects: readonly OperationalObject[],
  limit = 8,
): OperationalObject[] {
  const attention = objects.filter(
    (o) => ATTENTION_STATUSES.has(o.status) && o.status !== "completed" && o.status !== "archived",
  );
  return sortOperationalObjects(attention, "priority_desc").slice(0, limit);
}

export function cockpitCounts(objects: readonly OperationalObject[]): Record<OperationalObjectFilter, number> {
  return {
    all: objects.length,
    draft: filterOperationalObjects(objects, "draft").length,
    active: filterOperationalObjects(objects, "active").length,
    waiting: filterOperationalObjects(objects, "waiting").length,
    review: filterOperationalObjects(objects, "review").length,
    completed: filterOperationalObjects(objects, "completed").length,
  };
}

/** Template seeds for empty-state / create shortcuts — never auto-saved. */
export type CockpitTemplateId =
  | "research_question"
  | "evidence_request"
  | "work_plan"
  | "literature_style"
  | "experiment_style"
  | "report_draft";

export function cockpitTemplateDraftSeed(
  templateId: CockpitTemplateId,
  locale: string,
): {
  type: OperationalObject["type"];
  domain: OperationalObjectDomain;
  title: string;
  nextAction: string;
} {
  switch (templateId) {
    case "research_question":
      return {
        type: "research_question",
        domain: "research",
        title: "",
        nextAction: locale === "uz" ? "Tadqiqot savolini aniqlashtiring" : "Clarify the research question",
      };
    case "evidence_request":
      return {
        type: "evidence_request",
        domain: "evidence",
        title: "",
        nextAction: locale === "uz" ? "Kerakli manbalarni belgilang" : "Specify required sources",
      };
    case "literature_style":
      return {
        type: "work_plan",
        domain: "research",
        title: locale === "uz" ? "Adabiyot sharhi (qoralama)" : "Literature review (draft)",
        nextAction: locale === "uz" ? "Qidiruv mezonlarini yozing" : "Write search criteria",
      };
    case "experiment_style":
      return {
        type: "work_plan",
        domain: "research",
        title: locale === "uz" ? "Eksperiment rejasi (qoralama)" : "Experiment plan (draft)",
        nextAction: locale === "uz" ? "O‘zgaruvchilar va xavfsizlikni belgilang" : "Define variables and safety",
      };
    case "report_draft":
      return {
        type: "report_draft",
        domain: "reports",
        title: "",
        nextAction: locale === "uz" ? "Faqat mavjud dalillar bilan yozing" : "Draft only from existing evidence",
      };
    case "work_plan":
    default:
      return {
        type: "work_plan",
        domain: "general",
        title: "",
        nextAction: locale === "uz" ? "Maqsad va keyingi qadamni tekshiring" : "Review objective and next action",
      };
  }
}
