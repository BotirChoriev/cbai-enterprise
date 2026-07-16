"use client";

import Link from "next/link";
import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useMissionContext } from "@/components/mission/MissionContextProvider";
import { buildCapabilityPassport } from "@/lib/capability/capability-passport-builder";
import { resolveOperatorName } from "@/lib/assistant/assistant-profile";
import { useAssistantProfile } from "@/components/platform/context/AssistantProfileProvider";
import { useHydrated } from "@/lib/hooks/use-hydrated";
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
import { deriveOperatorInterventions } from "@/lib/intelligence-os/operator-awareness";
import { cbaiSectionEyebrow } from "@/components/brand/brand-classes";

export function OperatorAwarenessStrip() {
  const { t } = useTranslation();
  const hydrated = useHydrated();
  const interventions = useMemo(
    () => (hydrated ? deriveOperatorInterventions().slice(0, 1) : []),
    [hydrated],
  );

  if (!hydrated || interventions.length === 0) return null;

  const item = interventions[0];
  return (
    <div className="space-y-2" role="status" aria-live="polite">
      <div className="rounded-md border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-xs leading-relaxed text-zinc-400">
        {item.href ? (
          <Link href={item.href} className="hover:text-teal-300">
            {t(`operatorAwareness.${item.messageKey}`)}
          </Link>
        ) : (
          t(`operatorAwareness.${item.messageKey}`)
        )}
      </div>
    </div>
  );
}

type LivingContextRailProps = {
  className?: string;
};

/** Ambient context — memory, focused flow, discovery explanation — not noisy. */
export default function LivingContextRail({ className = "" }: LivingContextRailProps) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const hydrated = useHydrated();
  const { profile } = useAssistantProfile();
  const { mission, adaptive } = useMissionContext();
  const passport = useMemo(
    () => (hydrated ? buildCapabilityPassport(resolveOperatorName(profile)) : null),
    [hydrated, profile],
  );
  const memory = useMemo(
    () => (hydrated ? deriveLivingContextMemory(mission) : null),
    [hydrated, mission],
  );
  const flow = useMemo(
    () => (hydrated ? deriveFocusedFlow(mission) : []),
    [hydrated, mission],
  );

  const nextHref = adaptive?.suggestedRoutes[0] ?? (mission?.projectId ? `/my-work?project=${mission.projectId}` : "/my-work");
  const currentSpace = resolveIntelligenceSpace(pathname);

  return (
    <aside
      className={`cbai-living-context cbai-space-enter flex h-full flex-col gap-3 border-l border-zinc-800/80 px-3 py-4 ${className}`}
      aria-label={t("intelligenceSpaces.livingContext")}
    >
      <p className={cbaiSectionEyebrow}>{t("intelligenceSpaces.livingContext")}</p>

      {memory?.hasContinuity ? (
        <section className="space-y-2">
          <p className="text-[10px] uppercase tracking-wider text-zinc-600">{t("livingIntelligence.contextMemory")}</p>
          {memory.lastVisit && memory.lastVisit.spaceId !== currentSpace ? (
            <p className="text-xs text-zinc-500">
              {t("livingIntelligence.returnContinuity")}{" "}
              <Link href={memory.lastVisit.pathname} className="text-teal-400 hover:text-teal-300">
                {t(`intelligenceSpaces.${intelligenceSpaceI18nKey(memory.lastVisit.spaceId)}`)} →
              </Link>
            </p>
          ) : null}
          {memory.recentStudy.length > 0 ? (
            <ul className="space-y-1">
              {memory.recentStudy.slice(0, 3).map((entity) => (
                <li key={`${entity.kind}-${entity.id}`}>
                  <Link href={entityStudyHref(entity)} className="text-xs text-zinc-400 hover:text-teal-300">
                    {entity.name}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}

      {memory?.currentFlowStage ? (
        <section className="space-y-1">
          <p className="text-[10px] uppercase tracking-wider text-zinc-600">{t("livingIntelligence.unfinishedFlow")}</p>
          <Link href={memory.currentFlowStage.href} className="text-xs text-teal-400 hover:text-teal-300">
            {memory.currentFlowStage.label} →
          </Link>
        </section>
      ) : null}

      {mission?.evidenceMissing ? (
        <section className="space-y-1">
          <p className="text-[10px] uppercase tracking-wider text-zinc-600">{t("intelligenceCanvas.missingKnowledge")}</p>
          <p className="text-xs text-zinc-500">{mission.evidenceMissing}</p>
        </section>
      ) : null}

      {passport && passport.totalSignals > 0 ? (
        <section className="space-y-1">
          <p className="text-[10px] uppercase tracking-wider text-zinc-600">{t("intelligenceSpaces.capabilityGalaxy")}</p>
          <p className="text-xs text-zinc-500">
            {passport.totalSignals} {t("intelligenceSpaces.domainSignals")}
          </p>
        </section>
      ) : null}

      {flow.length > 0 ? (
        <section className="space-y-1.5">
          <p className="text-[10px] uppercase tracking-wider text-zinc-600">{t("livingIntelligence.flowEyebrow")}</p>
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
                  title={stage.detail}
                >
                  {stage.label}
                </Link>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <section className="mt-auto space-y-1.5 border-t border-zinc-800/80 pt-3">
        {adaptive ? (
          <p className="text-[10px] text-zinc-600">{adaptive.explanation}</p>
        ) : null}
        <Link href={nextHref} className="text-sm text-teal-400 hover:text-teal-300">
          {t("experienceEngineering.whatNext")} →
        </Link>
        <HumanDecisionBoundary variant="compact" />
      </section>
    </aside>
  );
}
