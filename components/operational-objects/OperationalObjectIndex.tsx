"use client";

import { useMemo, useState } from "react";
import { useOperationalObjects } from "@/components/operational-objects/OperationalObjectProvider";
import OperationalWorkCard from "@/components/operational-objects/OperationalWorkCard";
import { filterOperationalObjects } from "@/lib/operational-objects/operational-object-store";
import type { OperationalObjectFilter } from "@/lib/operational-objects/operational-object.types";
import { useTranslation } from "@/lib/i18n/use-translation";
import { cbaiGlassCard, cbaiSectionEyebrow, cbaiFocusRing } from "@/components/brand/brand-classes";
import { useHydrated } from "@/lib/hooks/use-hydrated";

const FILTERS: readonly { id: OperationalObjectFilter; labelKey: string }[] = [
  { id: "all", labelKey: "operationalObject.filterAll" },
  { id: "draft", labelKey: "operationalObject.filterDraft" },
  { id: "active", labelKey: "operationalObject.filterActive" },
  { id: "waiting", labelKey: "operationalObject.filterWaiting" },
  { id: "review", labelKey: "operationalObject.filterReview" },
  { id: "completed", labelKey: "operationalObject.filterCompleted" },
];

export default function OperationalObjectIndex() {
  const { t, language } = useTranslation();
  const hydrated = useHydrated();
  const { objects, openComposer } = useOperationalObjects();
  const [filter, setFilter] = useState<OperationalObjectFilter>("all");

  const filtered = useMemo(
    () => filterOperationalObjects(objects, filter),
    [objects, filter],
  );

  function handleCreateClick() {
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

  if (!hydrated) return null;

  return (
    <section className={`${cbaiGlassCard} cbai-op-index p-5`}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className={cbaiSectionEyebrow}>CBAI</p>
          <h2 className="text-base font-semibold text-zinc-100">{t("navigation.myWork")}</h2>
        </div>
        <button type="button" className={`cbai-op-index__create ${cbaiFocusRing}`} onClick={handleCreateClick}>
          {t("operationalObject.createFromMyWork")}
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label={t("operationalObject.filterAll")}>
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={filter === item.id}
            className={`cbai-op-filter ${filter === item.id ? "cbai-op-filter--active" : ""} ${cbaiFocusRing}`}
            onClick={() => setFilter(item.id)}
          >
            {t(item.labelKey)} ({filterOperationalObjects(objects, item.id).length})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-zinc-400">{t("operationalObject.emptyIndex")}</p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((object) => (
            <li key={object.id}>
              <OperationalWorkCard object={object} mode="standard" />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
