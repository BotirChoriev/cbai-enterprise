"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useOperationalObjects } from "@/components/operational-objects/OperationalObjectProvider";
import OperationalWorkCard from "@/components/operational-objects/OperationalWorkCard";
import type {
  OperationalObjectDomain,
  OperationalObjectFilter,
} from "@/lib/operational-objects/operational-object.types";
import {
  cockpitCounts,
  cockpitTemplateDraftSeed,
  nextActionQueue,
  queryOperationalCockpit,
  type CockpitSort,
  type CockpitTemplateId,
} from "@/lib/operational-objects/cockpit-query";
import { useTranslation } from "@/lib/i18n/use-translation";
import { cbaiFocusRing, cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";
import { useHydrated } from "@/lib/hooks/use-hydrated";

const FILTERS: readonly { id: OperationalObjectFilter; labelKey: string }[] = [
  { id: "all", labelKey: "operationalObject.filterAll" },
  { id: "draft", labelKey: "operationalObject.filterDraft" },
  { id: "active", labelKey: "operationalObject.filterActive" },
  { id: "waiting", labelKey: "operationalObject.filterWaiting" },
  { id: "review", labelKey: "operationalObject.filterReview" },
  { id: "completed", labelKey: "operationalObject.filterCompleted" },
];

const DOMAINS: readonly { id: OperationalObjectDomain | "all"; labelKey: string }[] = [
  { id: "all", labelKey: "operationalObject.filterAll" },
  { id: "research", labelKey: "operationalObject.domainResearch" },
  { id: "evidence", labelKey: "operationalObject.domainEvidence" },
  { id: "countries", labelKey: "operationalObject.domainCountries" },
  { id: "companies", labelKey: "operationalObject.domainCompanies" },
  { id: "universities", labelKey: "operationalObject.domainUniversities" },
  { id: "reports", labelKey: "operationalObject.domainReports" },
  { id: "investor", labelKey: "operationalObject.domainInvestor" },
  { id: "governance", labelKey: "operationalObject.domainGovernance" },
  { id: "general", labelKey: "operationalObject.domainGeneral" },
];

const SORTS: readonly { id: CockpitSort; labelKey: string }[] = [
  { id: "updated_desc", labelKey: "operationalObject.sortUpdated" },
  { id: "priority_desc", labelKey: "operationalObject.sortPriority" },
  { id: "next_action", labelKey: "operationalObject.sortNextAction" },
  { id: "title_asc", labelKey: "operationalObject.sortTitle" },
];

const TEMPLATES: readonly { id: CockpitTemplateId; labelKey: string }[] = [
  { id: "research_question", labelKey: "operationalObject.templateResearchQuestion" },
  { id: "evidence_request", labelKey: "operationalObject.templateEvidenceRequest" },
  { id: "literature_style", labelKey: "operationalObject.templateLiterature" },
  { id: "experiment_style", labelKey: "operationalObject.templateExperiment" },
  { id: "work_plan", labelKey: "operationalObject.templateWorkPlan" },
  { id: "report_draft", labelKey: "operationalObject.templateReport" },
];

function parseFilter(raw: string | null): OperationalObjectFilter {
  if (
    raw === "draft" ||
    raw === "active" ||
    raw === "waiting" ||
    raw === "review" ||
    raw === "completed" ||
    raw === "all"
  ) {
    return raw;
  }
  return "all";
}

export default function OperationalObjectIndex() {
  const { t, language } = useTranslation();
  const hydrated = useHydrated();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { objects, openComposer, successMessage } = useOperationalObjects();
  const filter = parseFilter(searchParams.get("opFilter") ?? searchParams.get("filter"));
  const objectId = searchParams.get("object");
  const [domain, setDomain] = useState<OperationalObjectDomain | "all">("all");
  const [search, setSearch] = useState(() => searchParams.get("q") ?? "");
  const [sort, setSort] = useState<CockpitSort>("updated_desc");
  const focusedRef = useRef<HTMLLIElement | null>(null);
  const lastFocusedId = useRef<string | null>(null);

  const focusedObject = useMemo(
    () => (objectId ? objects.find((item) => item.id === objectId) ?? null : null),
    [objects, objectId],
  );
  const objectNotFound = Boolean(objectId && hydrated && !focusedObject);

  const counts = useMemo(() => cockpitCounts(objects), [objects]);
  const queue = useMemo(() => nextActionQueue(objects, 6), [objects]);
  const filtered = useMemo(
    () => queryOperationalCockpit(objects, { filter, domain, search, sort }),
    [objects, filter, domain, search, sort],
  );

  useEffect(() => {
    if (!focusedObject || lastFocusedId.current === focusedObject.id) return;
    lastFocusedId.current = focusedObject.id;
    const node = focusedRef.current;
    if (!node) return;
    node.scrollIntoView({ behavior: "smooth", block: "nearest" });
    const focusTarget = node.querySelector<HTMLElement>("[data-op-focus-target]");
    focusTarget?.focus({ preventScroll: true });
  }, [focusedObject]);

  function setFilter(next: OperationalObjectFilter) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "all") params.delete("opFilter");
    else params.set("opFilter", next);
    params.delete("filter");
    const query = params.toString();
    router.replace(query ? `/my-work?${query}` : "/my-work", { scroll: false });
  }

  function clearObjectParam() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("object");
    const query = params.toString();
    router.replace(query ? `/my-work?${query}` : "/my-work", { scroll: false });
  }

  function openBlankComposer() {
    openComposer(
      {
        type: "work_plan",
        title: "",
        summary: "",
        objective: "",
        rationale: "",
        expectedOutcome: "",
        domain: "general",
        status: "draft",
        priority: "normal",
        requiredInputs: [],
        evidenceRequirements: [],
        nextAction: "",
        humanDecision: "",
        relatedObjectIds: [],
        locale: language,
        provenance: { source: "manual" },
      },
      [],
      "manual",
    );
  }

  function openTemplate(templateId: CockpitTemplateId) {
    const seed = cockpitTemplateDraftSeed(templateId, language);
    openComposer(
      {
        type: seed.type,
        title: seed.title,
        summary: seed.title,
        objective: seed.title,
        rationale: "",
        expectedOutcome: "",
        domain: seed.domain,
        status: "draft",
        priority: "normal",
        requiredInputs: [],
        evidenceRequirements: seed.type === "evidence_request" ? ["Connected official sources"] : [],
        nextAction: seed.nextAction,
        humanDecision: "",
        relatedObjectIds: [],
        locale: language,
        provenance: {
          source: "manual",
          locale: language,
          inferredFields: seed.title ? ["title", "type", "domain", "nextAction"] : ["type", "domain", "nextAction"],
        },
      },
      seed.title ? ["title", "type", "domain", "nextAction"] : ["type", "domain", "nextAction"],
      "manual",
    );
  }

  if (!hydrated) return null;

  return (
    <section className={`${cbaiGlassCard} cbai-op-index space-y-5 p-5`} data-cbai-cockpit="my-work">
      <div aria-live="polite" className="sr-only">
        {successMessage}
      </div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className={cbaiSectionEyebrow}>{t("operationalObject.cockpitEyebrow")}</p>
          <h2 className="text-base font-semibold text-[var(--cbai-text-primary)]">
            {t("operationalObject.cockpitTitle")}
          </h2>
          <p className="mt-1 max-w-2xl text-xs text-[var(--cbai-text-secondary)]">
            {t("operationalObject.cockpitIntro")}
          </p>
        </div>
        <button type="button" className={`cbai-op-index__create ${cbaiFocusRing}`} onClick={openBlankComposer}>
          {t("operationalObject.createFromMyWork")}
        </button>
      </div>

      {objectNotFound ? (
        <div
          role="status"
          data-cbai-object-not-found=""
          className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-3 text-sm text-[var(--cbai-text-primary)]"
        >
          <p>{t("operationalObject.objectNotFound")}</p>
          <button type="button" className={`mt-2 text-xs underline ${cbaiFocusRing}`} onClick={clearObjectParam}>
            {t("operationalObject.clearObjectFocus")}
          </button>
        </div>
      ) : null}

      {focusedObject ? (
        <div
          className="rounded-lg border border-[var(--cbai-border-active)] bg-[var(--cbai-surface-hover)] p-3"
          data-cbai-object-focus={focusedObject.id}
        >
          <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-[var(--cbai-text-muted)]">
            {t("operationalObject.focusedObject")}
          </p>
          <ul>
            <li ref={focusedRef}>
              <OperationalWorkCard object={focusedObject} mode="standard" focused />
            </li>
          </ul>
        </div>
      ) : null}

      {queue.length > 0 ? (
        <div className="rounded-lg border border-[var(--cbai-border-default)] bg-[var(--cbai-surface-hover)] p-3">
          <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-[var(--cbai-text-muted)]">
            {t("operationalObject.nextActionQueue")} ({queue.length})
          </p>
          <ul className="space-y-2">
            {queue.map((object) => (
              <li key={`queue-${object.id}`}>
                <OperationalWorkCard object={object} mode="compact" />
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <label className="block min-w-0">
          <span className="sr-only">{t("operationalObject.searchLabel")}</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("operationalObject.searchPlaceholder")}
            className="w-full rounded-lg border border-[var(--cbai-border-default)] bg-[var(--cbai-glass-surface)] px-3 py-2 text-sm text-[var(--cbai-text-primary)] outline-none focus:border-[var(--cbai-border-active)]"
            data-cbai-cockpit-search=""
          />
        </label>
        <label className="flex items-center gap-2 text-xs text-[var(--cbai-text-muted)]">
          <span>{t("operationalObject.domainLabel")}</span>
          <select
            value={domain}
            onChange={(event) => setDomain(event.target.value as OperationalObjectDomain | "all")}
            className="rounded-md border border-[var(--cbai-border-default)] bg-[var(--cbai-glass-surface)] px-2 py-2 text-xs text-[var(--cbai-text-primary)]"
          >
            {DOMAINS.map((item) => (
              <option key={item.id} value={item.id}>
                {t(item.labelKey)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-xs text-[var(--cbai-text-muted)]">
          <span>{t("operationalObject.sortLabel")}</span>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as CockpitSort)}
            className="rounded-md border border-[var(--cbai-border-default)] bg-[var(--cbai-glass-surface)] px-2 py-2 text-xs text-[var(--cbai-text-primary)]"
          >
            {SORTS.map((item) => (
              <option key={item.id} value={item.id}>
                {t(item.labelKey)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label={t("operationalObject.filterAll")}>
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={filter === item.id}
            className={`cbai-op-filter ${filter === item.id ? "cbai-op-filter--active" : ""} ${cbaiFocusRing}`}
            onClick={() => setFilter(item.id)}
          >
            {t(item.labelKey)} ({counts[item.id]})
          </button>
        ))}
      </div>

      {objects.length === 0 ? (
        <div className="space-y-3 rounded-lg border border-dashed border-[var(--cbai-border-default)] p-4">
          <p className="text-sm text-[var(--cbai-text-secondary)]">{t("operationalObject.emptyIndex")}</p>
          <p className="text-xs text-[var(--cbai-text-muted)]">{t("operationalObject.emptyTemplatesHint")}</p>
          <div className="flex flex-wrap gap-2">
            {TEMPLATES.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`rounded-md border border-[var(--cbai-border-default)] px-3 py-2 text-xs text-[var(--cbai-text-primary)] hover:border-[var(--cbai-border-active)] ${cbaiFocusRing}`}
                onClick={() => openTemplate(item.id)}
              >
                {t(item.labelKey)}
              </button>
            ))}
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-[var(--cbai-text-secondary)]">{t("operationalObject.noMatches")}</p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((object) => (
            <li
              key={object.id}
              data-cbai-object-row={object.id}
              className={focusedObject?.id === object.id ? "rounded-lg ring-1 ring-[var(--cbai-border-active)]" : undefined}
            >
              <OperationalWorkCard object={object} mode="standard" focused={focusedObject?.id === object.id} />
            </li>
          ))}
        </ul>
      )}

      {objects.length > 0 ? (
        <div className="border-t border-[var(--cbai-border-default)] pt-3">
          <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-[var(--cbai-text-muted)]">
            {t("operationalObject.templatesHeading")}
          </p>
          <div className="flex flex-wrap gap-2">
            {TEMPLATES.map((item) => (
              <button
                key={`footer-${item.id}`}
                type="button"
                className={`rounded-md border border-[var(--cbai-border-default)] px-2.5 py-1.5 text-[11px] text-[var(--cbai-text-secondary)] hover:text-[var(--cbai-text-primary)] ${cbaiFocusRing}`}
                onClick={() => openTemplate(item.id)}
              >
                {t(item.labelKey)}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
