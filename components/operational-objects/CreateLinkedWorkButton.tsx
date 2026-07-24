"use client";

import { useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useOperationalObjectsOptional } from "@/components/operational-objects/OperationalObjectProvider";
import {
  buildCountryLinkedWorkDraft,
  buildGraphLinkedWorkDraft,
  COUNTRY_LINKED_PRESETS,
  GRAPH_LINKED_PRESETS,
  type CountryLinkedWorkContext,
  type GraphLinkedWorkContext,
  type LinkedWorkPreset,
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
    };

function presetLabelKey(preset: LinkedWorkPreset): string {
  if (preset === "report_draft") return "operationalObject.typeReportDraft";
  if (preset === "research_question") return "operationalObject.typeResearchQuestion";
  if (preset === "evidence_request") return "operationalObject.typeEvidenceRequest";
  return "operationalObject.typeWorkPlan";
}

export default function CreateLinkedWorkButton(props: CreateLinkedWorkButtonProps) {
  const { t, language } = useTranslation();
  const pathname = usePathname();
  const operationalObjects = useOperationalObjectsOptional();
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  if (!operationalObjects) return null;

  const presets = props.variant === "country" ? COUNTRY_LINKED_PRESETS : GRAPH_LINKED_PRESETS;

  function openPreset(preset: LinkedWorkPreset) {
    setOpen(false);
    const routePath = pathname || (props.variant === "country" ? "/countries" : "/graph");
    if (props.variant === "country") {
      const { draft, inferredFields } = buildCountryLinkedWorkDraft(
        { ...props.country, routePath },
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
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        className={`${props.compact ? cbaiBtnSecondarySm : cbaiBtnSecondarySm} ${cbaiFocusRing}`}
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
