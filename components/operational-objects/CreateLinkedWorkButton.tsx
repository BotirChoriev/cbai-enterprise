"use client";

import { useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useOperationalObjectsOptional } from "@/components/operational-objects/OperationalObjectProvider";
import {
  buildCompanyLinkedWorkDraft,
  buildCountryLinkedWorkDraft,
  buildGraphLinkedWorkDraft,
  buildResearchLinkedWorkDraft,
  buildUniversityLinkedWorkDraft,
  COMPANY_LINKED_PRESETS,
  COUNTRY_LINKED_PRESETS,
  GRAPH_LINKED_PRESETS,
  RESEARCH_LINKED_PRESETS,
  UNIVERSITY_LINKED_PRESETS,
  type CompanyLinkedWorkContext,
  type CountryLinkedWorkContext,
  type GraphLinkedWorkContext,
  type LinkedWorkPreset,
  type ResearchLinkedWorkContext,
  type UniversityLinkedWorkContext,
} from "@/lib/operational-objects/linked-work-draft";
import { useTranslation } from "@/lib/i18n/use-translation";
import { cbaiBtnSecondarySm, cbaiFocusRing } from "@/components/brand/brand-classes";

type CreateLinkedWorkButtonProps =
  | {
      readonly variant: "country";
      readonly country: CountryLinkedWorkContext;
      readonly compact?: boolean;
    }
  | {
      readonly variant: "graph";
      readonly graph: GraphLinkedWorkContext;
      readonly compact?: boolean;
    }
  | {
      readonly variant: "company";
      readonly company: CompanyLinkedWorkContext;
      readonly compact?: boolean;
    }
  | {
      readonly variant: "university";
      readonly university: UniversityLinkedWorkContext;
      readonly compact?: boolean;
    }
  | {
      readonly variant: "research";
      readonly research: ResearchLinkedWorkContext;
      readonly compact?: boolean;
    };

function presetLabelKey(preset: LinkedWorkPreset): string {
  if (preset === "report_draft") return "operationalObject.typeReportDraft";
  if (preset === "research_question" || preset === "comparative_study") {
    return "operationalObject.typeResearchQuestion";
  }
  if (preset === "evidence_request") return "operationalObject.typeEvidenceRequest";
  if (preset === "literature_review") return "operationalObject.templateLiterature";
  if (preset === "experiment_plan") return "operationalObject.templateExperiment";
  if (
    preset === "relationship_review" ||
    preset === "risk_review" ||
    preset === "policy_review"
  ) {
    return "operationalObject.typeReview";
  }
  if (preset === "source_verification") return "operationalObject.typeSourceReview";
  if (preset === "decision_brief") return "operationalObject.typeDecisionBrief";
  if (preset === "monitoring_plan") return "operationalObject.typeCountryWatch";
  return "operationalObject.typeWorkPlan";
}

function presetsFor(variant: CreateLinkedWorkButtonProps["variant"]): readonly LinkedWorkPreset[] {
  if (variant === "country") return COUNTRY_LINKED_PRESETS;
  if (variant === "company") return COMPANY_LINKED_PRESETS;
  if (variant === "university") return UNIVERSITY_LINKED_PRESETS;
  if (variant === "research") return RESEARCH_LINKED_PRESETS;
  return GRAPH_LINKED_PRESETS;
}

export default function CreateLinkedWorkButton(props: CreateLinkedWorkButtonProps) {
  const { t, language } = useTranslation();
  const pathname = usePathname();
  const operationalObjects = useOperationalObjectsOptional();
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  if (!operationalObjects) return null;

  const presets = presetsFor(props.variant);

  function openPreset(preset: LinkedWorkPreset) {
    setOpen(false);
    const fallbackRoute =
      props.variant === "country"
        ? "/countries"
        : props.variant === "company"
          ? "/companies"
          : props.variant === "university"
            ? "/universities"
            : props.variant === "research"
              ? "/research"
              : "/graph";
    const routePath = pathname || fallbackRoute;

    if (props.variant === "country") {
      const { draft, inferredFields } = buildCountryLinkedWorkDraft(
        { ...props.country, routePath },
        preset,
        language,
      );
      operationalObjects!.openComposer(draft, inferredFields, "existing_object");
      return;
    }
    if (props.variant === "company") {
      const { draft, inferredFields } = buildCompanyLinkedWorkDraft(
        { ...props.company, routePath },
        preset,
        language,
      );
      operationalObjects!.openComposer(draft, inferredFields, "existing_object");
      return;
    }
    if (props.variant === "university") {
      const { draft, inferredFields } = buildUniversityLinkedWorkDraft(
        { ...props.university, routePath },
        preset,
        language,
      );
      operationalObjects!.openComposer(draft, inferredFields, "existing_object");
      return;
    }
    if (props.variant === "research") {
      const { draft, inferredFields } = buildResearchLinkedWorkDraft(
        { ...props.research, routePath },
        preset,
        language,
      );
      operationalObjects!.openComposer(draft, inferredFields, "existing_object");
      return;
    }
    const { draft, inferredFields } = buildGraphLinkedWorkDraft(
      { ...props.graph, routePath },
      preset,
      language,
    );
    operationalObjects!.openComposer(draft, inferredFields, "existing_object");
  }

  return (
    <div ref={rootRef} className="relative" data-cbai-linked-work={props.variant}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        className={`${cbaiBtnSecondarySm} ${cbaiFocusRing}`}
        onClick={() => setOpen((value) => !value)}
        onBlur={(event) => {
          if (!rootRef.current?.contains(event.relatedTarget as Node)) {
            setOpen(false);
          }
        }}
      >
        {t("operationalObject.createLinkedWork")}
      </button>
      {open ? (
        <ul
          id={menuId}
          role="menu"
          className="cbai-linked-work-menu absolute right-0 z-20 mt-1 min-w-[12rem] rounded-lg p-1 backdrop-blur-md"
        >
          {presets.map((preset) => (
            <li key={preset} role="none">
              <button
                type="button"
                role="menuitem"
                className={`cbai-linked-work-menu__item ${cbaiFocusRing}`}
                onClick={() => openPreset(preset)}
              >
                {t(presetLabelKey(preset))}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
