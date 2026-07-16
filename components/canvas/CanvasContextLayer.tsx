"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useMissionContext } from "@/components/mission/MissionContextProvider";
import { deriveOperatorInterventions } from "@/lib/intelligence-os/operator-awareness";
import { buildCapabilityPassport } from "@/lib/capability/capability-passport-builder";
import { resolveOperatorName } from "@/lib/assistant/assistant-profile";
import { useAssistantProfile } from "@/components/platform/context/AssistantProfileProvider";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { cbaiSectionEyebrow } from "@/components/brand/brand-classes";

export default function OperatorAwarenessStrip() {
  const { t } = useTranslation();
  const hydrated = useHydrated();
  const interventions = useMemo(
    () => (hydrated ? deriveOperatorInterventions() : []),
    [hydrated],
  );

  if (!hydrated || interventions.length === 0) return null;

  return (
    <div className="space-y-2" role="status" aria-live="polite">
      {interventions.map((item) => (
        <div
          key={item.id}
          className={`cbai-thought-enter rounded-md border px-3 py-2 text-xs leading-relaxed ${
            item.priority === "critical"
              ? "border-[var(--gold)]/30 bg-[var(--gold)]/5 text-[var(--gold-soft)]"
              : item.priority === "attention"
                ? "border-amber-500/20 bg-amber-500/5 text-amber-200/90"
                : "border-zinc-800 bg-zinc-950/40 text-zinc-400"
          }`}
        >
          {item.href ? (
            <Link href={item.href} className="hover:text-teal-300">
              {t(`operatorAwareness.${item.messageKey}`)}
            </Link>
          ) : (
            t(`operatorAwareness.${item.messageKey}`)
          )}
        </div>
      ))}
    </div>
  );
}

export function CanvasContextLayer() {
  const { t } = useTranslation();
  const hydrated = useHydrated();
  const { profile } = useAssistantProfile();
  const { mission, evidencePulse, adaptive, humanImpact } = useMissionContext();
  const passport = useMemo(
    () => (hydrated ? buildCapabilityPassport(resolveOperatorName(profile)) : null),
    [hydrated, profile],
  );

  const nextHref = adaptive?.suggestedRoutes[0] ?? (mission?.projectId ? `/my-work?project=${mission.projectId}` : "/my-work");

  return (
    <aside
      className="cbai-context-layer flex h-full flex-col gap-4 border-l border-zinc-800/80 bg-[#050810]/80 px-4 py-4"
      aria-label={t("intelligenceCanvas.contextLayer")}
    >
      <p className={cbaiSectionEyebrow}>{t("intelligenceCanvas.contextLayer")}</p>

      <OperatorAwarenessStrip />

      <section className="space-y-1.5">
        <p className="text-[10px] uppercase tracking-wider text-zinc-600">{t("intelligenceCanvas.missionContext")}</p>
        <p className="text-sm text-zinc-200">{mission?.problem ?? t("intelligenceCanvas.noMissionPrompt")}</p>
      </section>

      {evidencePulse ? (
        <section className="space-y-1.5">
          <p className="text-[10px] uppercase tracking-wider text-zinc-600">{t("intelligenceCanvas.evidenceStatus")}</p>
          <p className="text-xs text-zinc-400">{evidencePulse.label}</p>
        </section>
      ) : null}

      {mission?.evidenceMissing ? (
        <section className="space-y-1.5">
          <p className="text-[10px] uppercase tracking-wider text-zinc-600">{t("intelligenceCanvas.missingKnowledge")}</p>
          <p className="text-xs text-zinc-500">{mission.evidenceMissing}</p>
          <Link href="/graph" className="text-xs text-teal-400 hover:text-teal-300">
            {t("intelligenceCanvas.viewGraph")} →
          </Link>
        </section>
      ) : null}

      {passport && passport.totalSignals > 0 ? (
        <section className="space-y-1.5">
          <p className="text-[10px] uppercase tracking-wider text-zinc-600">{t("intelligenceCanvas.capabilitySignals")}</p>
          <p className="text-xs text-zinc-500">
            {passport.totalSignals} {t("capabilityPassport.signalCount", { count: String(passport.totalSignals), plural: passport.totalSignals === 1 ? "" : "s" })}
          </p>
        </section>
      ) : null}

      <section className="space-y-1.5">
        <p className="text-[10px] uppercase tracking-wider text-zinc-600">{t("intelligenceCanvas.impactStatus")}</p>
        <p className="text-xs text-zinc-400">
          {humanImpact?.isComplete ? t("missionCenter.impactComplete") : t("missionCenter.impactIncomplete")}
        </p>
      </section>

      <section className="mt-auto space-y-1.5 border-t border-zinc-800/80 pt-3">
        <p className="text-[10px] uppercase tracking-wider text-zinc-600">{t("intelligenceCanvas.suggestedNext")}</p>
        <Link href={nextHref} className="text-sm text-teal-400 hover:text-teal-300">
          {adaptive?.explanation ?? t("missionCenter.nextAction")} →
        </Link>
      </section>
    </aside>
  );
}
