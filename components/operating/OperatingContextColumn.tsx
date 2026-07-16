"use client";

import Link from "next/link";
import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useMissionContext } from "@/components/mission/MissionContextProvider";
import { useUniversalWorkspace } from "@/components/platform/context/UniversalWorkspaceProvider";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import UniversalInspector from "@/components/operating/UniversalInspector";
import KnowledgeRiver from "@/components/operating/KnowledgeRiver";
import HumanDecisionBoundary from "@/components/intelligence-os/HumanDecisionBoundary";
import {
  deriveLivingContextMemory,
  entityStudyHref,
} from "@/lib/intelligence-os/living-context-memory";
import { deriveFocusedFlow } from "@/lib/intelligence-os/intelligence-flow";
import {
  intelligenceSpaceI18nKey,
  resolveIntelligenceSpace,
} from "@/lib/intelligence-os/intelligence-spaces";
import { cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type OperatingContextColumnProps = {
  className?: string;
};

/** Single right context rail — Inspector, Knowledge River, slim living context. */
export default function OperatingContextColumn({ className = "" }: OperatingContextColumnProps) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const hydrated = useHydrated();
  const { mission, adaptive } = useMissionContext();
  const { workspace } = useUniversalWorkspace();

  const memory = useMemo(
    () => (hydrated ? deriveLivingContextMemory(mission) : null),
    [hydrated, mission],
  );
  const flow = useMemo(() => (hydrated ? deriveFocusedFlow(mission) : []), [hydrated, mission]);

  const currentSpace = resolveIntelligenceSpace(pathname);
  const nextHref = adaptive?.suggestedRoutes[0] ?? (mission?.projectId ? `/my-work?project=${mission.projectId}` : "/my-work");

  return (
    <aside
      className={`cbai-operating-context cbai-space-enter flex h-full flex-col gap-3 overflow-y-auto border-l border-zinc-800/80 px-3 py-4 ${className}`}
      aria-label={t("universalWorkspace.workspaceEyebrow")}
      data-cbai-context-rail="primary"
    >
      <UniversalInspector />

      <KnowledgeRiver compact />

      {hydrated ? (
      <section className="space-y-1 border-t border-zinc-800/80 pt-3">
        <p className={cbaiSectionEyebrow}>{t("universalWorkspace.livingContext")}</p>
        <InspectorMeta
          label={t("universalWorkspace.activeScope")}
          value={t(`intelligenceSpaces.${intelligenceSpaceI18nKey(workspace.activeScope)}`)}
        />
        {workspace.activeObject ? (
          <InspectorMeta label={t("universalWorkspace.activeObject")} value={workspace.lastMeaningfulAction} />
        ) : null}
        <InspectorMeta
          label={t("universalWorkspace.evidenceCount")}
          value={String(workspace.evidenceCount)}
        />
        <InspectorMeta
          label={t("universalWorkspace.impactStatus")}
          value={workspace.impactComplete ? t("universalWorkspace.impactComplete") : t("universalWorkspace.impactIncomplete")}
        />
        <InspectorMeta
          label={t("universalWorkspace.reportReadiness")}
          value={workspace.reportReady ? t("universalWorkspace.reportReady") : t("universalWorkspace.reportNotReady")}
        />
      </section>
      ) : null}

      {memory?.hasContinuity && memory.lastVisit && memory.lastVisit.spaceId !== currentSpace ? (
        <p className="text-xs text-zinc-500">
          {t("livingIntelligence.returnContinuity")}{" "}
          <Link href={memory.lastVisit.pathname} className="text-teal-400 hover:text-teal-300">
            {t(`intelligenceSpaces.${intelligenceSpaceI18nKey(memory.lastVisit.spaceId)}`)} →
          </Link>
        </p>
      ) : null}

      {memory?.recentStudy && memory.recentStudy.length > 0 ? (
        <ul className="space-y-1">
          {memory.recentStudy.slice(0, 2).map((entity) => (
            <li key={`${entity.kind}-${entity.id}`}>
              <Link href={entityStudyHref(entity)} className="text-xs text-zinc-400 hover:text-teal-300">
                {entity.name}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}

      {flow.length > 0 ? (
        <ol className="flex flex-col gap-1">
          {flow.map((stage) => (
            <li key={stage.id}>
              <Link
                href={stage.href}
                className={`block rounded px-2 py-1 text-xs ${
                  stage.status === "complete"
                    ? "text-emerald-400/80"
                    : stage.status === "attention"
                      ? "text-[var(--gold-soft)]"
                      : "text-zinc-400 hover:text-teal-300"
                }`}
              >
                {stage.label}
              </Link>
            </li>
          ))}
        </ol>
      ) : null}

      <section className="mt-auto space-y-1.5 border-t border-zinc-800/80 pt-3">
        <Link href={nextHref} className="text-sm text-teal-400 hover:text-teal-300">
          {t("experienceEngineering.whatNext")} →
        </Link>
        <HumanDecisionBoundary variant="compact" />
      </section>
    </aside>
  );
}

function InspectorMeta({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value?.trim()) return null;
  return (
    <div className="flex justify-between gap-2 text-[11px]">
      <span className="text-zinc-600">{label}</span>
      <span className="truncate text-zinc-400">{value}</span>
    </div>
  );
}
