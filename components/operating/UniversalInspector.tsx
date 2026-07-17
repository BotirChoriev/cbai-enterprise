"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useMissionContext } from "@/components/mission/MissionContextProvider";
import { useUniversalWorkspace } from "@/components/platform/context/UniversalWorkspaceProvider";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import KnowledgeLayersDisclosure from "@/components/knowledge/KnowledgeLayersDisclosure";
import KnowledgeBrainPanel from "@/components/knowledge/KnowledgeBrainPanel";
import {
  resolveUniversalObject,
  type UniversalObjectType,
} from "@/lib/intelligence-os/universal-object";
import { deriveCollaborationGuidance } from "@/lib/intelligence-os/ambient-collaboration";
import { cbaiSectionEyebrow } from "@/components/brand/brand-classes";

const OBJECT_TYPE_I18N: Record<UniversalObjectType, string> = {
  mission: "objectTypeMission",
  project: "objectTypeProject",
  research_topic: "objectTypeResearchTopic",
  evidence: "objectTypeEvidence",
  country: "objectTypeCountry",
  company: "objectTypeCompany",
  university: "objectTypeUniversity",
  report: "objectTypeReport",
  question: "objectTypeQuestion",
  relationship: "objectTypeRelationship",
  capability_signal: "objectTypeCapabilitySignal",
};

function InspectorRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value?.trim()) return null;
  return (
    <div className="space-y-0.5">
      <p className="text-[10px] uppercase tracking-wider text-zinc-600">{label}</p>
      <p className="text-xs leading-relaxed text-zinc-400">{value}</p>
    </div>
  );
}

/** Universal Inspector — one grammar for all primary object types. */
export default function UniversalInspector({ className = "" }: { className?: string }) {
  const { t } = useTranslation();
  const hydrated = useHydrated();
  const { mission } = useMissionContext();
  const { focusedObject } = useUniversalWorkspace();

  const contract = useMemo(() => {
    if (!hydrated || !focusedObject) return null;
    return resolveUniversalObject(focusedObject, mission);
  }, [hydrated, focusedObject, mission]);

  const collaboration = useMemo(
    () => (hydrated && mission ? deriveCollaborationGuidance(mission) : null),
    [hydrated, mission],
  );

  if (!hydrated) return null;

  if (!contract) {
    return (
      <section className={`space-y-2 ${className}`} aria-labelledby="universal-inspector-heading">
        <p className={cbaiSectionEyebrow} id="universal-inspector-heading">
          {t("universalWorkspace.inspectorEyebrow")}
        </p>
        <p className="text-xs text-zinc-500">{t("universalWorkspace.noObjectSelected")}</p>
      </section>
    );
  }

  const typeLabel = t(`universalWorkspace.${OBJECT_TYPE_I18N[contract.ref.type]}`);

  return (
    <section className={`space-y-3 ${className}`} aria-labelledby="universal-inspector-heading">
      <div className="space-y-1">
        <p className={cbaiSectionEyebrow} id="universal-inspector-heading">
          {t("universalWorkspace.inspectorEyebrow")}
        </p>
        <p className="text-[10px] uppercase tracking-wider text-teal-500/70">{typeLabel}</p>
        <p className="text-sm font-medium text-zinc-200">{contract.identity}</p>
      </div>

      <InspectorRow label={t("universalWorkspace.whatIsThis")} value={contract.purpose ?? contract.identity} />
      <InspectorRow
        label={t("universalWorkspace.whyRelevantNow")}
        value={contract.state ? `${t("universalWorkspace.currentState")}: ${contract.state}` : null}
      />
      <InspectorRow label={t("universalWorkspace.missionConnection")} value={contract.missionRelation} />
      <InspectorRow label={t("universalWorkspace.evidenceSupports")} value={contract.evidenceSummary} />
      <InspectorRow
        label={t("universalWorkspace.contradicts")}
        value={contract.unknowns.length > 0 ? contract.unknowns.join("; ") : t("universalWorkspace.none")}
      />
      <InspectorRow
        label={t("universalWorkspace.whatIsMissing")}
        value={contract.unknowns.length > 0 ? contract.unknowns.join("; ") : t("universalWorkspace.none")}
      />
      <InspectorRow label={t("universalWorkspace.trustState")} value={contract.trustState} />
      <InspectorRow label={t("universalWorkspace.limitations")} value={contract.limitations} />

      {contract.actions.length > 0 ? (
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-wider text-zinc-600">
            {t("universalWorkspace.availableActions")}
          </p>
          <ul className="space-y-1">
            {contract.actions.map((action) => (
              <li key={action.href}>
                <Link href={action.href} className="text-xs text-teal-400 hover:text-teal-300">
                  {action.label} →
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <InspectorRow
        label={t("universalWorkspace.humanJudgment")}
        value={contract.requiresHumanJudgment ? t("universalWorkspace.yes") : t("universalWorkspace.no")}
      />

      <KnowledgeBrainPanel objectRef={contract.ref} compact />

      <KnowledgeLayersDisclosure layers={contract.layers} />

      {collaboration && contract.ref.type === "mission" ? (
        <section className="space-y-1 rounded-md border border-zinc-800/80 bg-zinc-950/40 px-3 py-2">
          <p className="text-[10px] uppercase tracking-wider text-zinc-600">
            {t("universalWorkspace.collaborationEyebrow")}
          </p>
          {collaboration.expertiseNeeded ? (
            <InspectorRow label={t("universalWorkspace.expertiseNeeded")} value={collaboration.expertiseNeeded} />
          ) : null}
          {collaboration.evidenceGap ? (
            <InspectorRow label={t("universalWorkspace.evidenceGap")} value={collaboration.evidenceGap} />
          ) : null}
          <InspectorRow label={t("universalWorkspace.roleDescription")} value={collaboration.roleDescription} />
          <p className="text-[10px] text-zinc-600">{collaboration.unknown}</p>
          <p className="text-[10px] text-amber-500/70">{t("universalWorkspace.externalMatchingOff")}</p>
        </section>
      ) : null}
    </section>
  );
}
