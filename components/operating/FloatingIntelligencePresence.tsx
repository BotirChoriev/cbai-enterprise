"use client";

import Link from "next/link";
import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useMissionContext } from "@/components/mission/MissionContextProvider";
import { useAssistantProfile } from "@/components/platform/context/AssistantProfileProvider";
import { useUniversalWorkspace } from "@/components/platform/context/UniversalWorkspaceProvider";
import { resolveOperatorName } from "@/lib/assistant/assistant-profile";
import { deriveFloatingIntelligence } from "@/lib/intelligence-os/floating-intelligence";
import { deriveOperatorPresenceMode } from "@/lib/intelligence-os/ambient-intelligence";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { useProgressiveDisclosure } from "@/lib/hooks/use-progressive-disclosure";

/** One intervention strip — only when uncertainty requires attention, never on home canvas duplicate. */
export default function FloatingIntelligencePresence() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const hydrated = useHydrated();
  const disclosure = useProgressiveDisclosure();
  const { profile } = useAssistantProfile();
  const { mission } = useMissionContext();
  const { focusedObject } = useUniversalWorkspace();

  const operatorName = resolveOperatorName(profile);
  const presence = useMemo(
    () =>
      hydrated
        ? deriveOperatorPresenceMode(mission, operatorName, profile.workspaceRole ?? null)
        : { mode: "silent" as const, insight: null },
    [hydrated, mission, operatorName, profile.workspaceRole],
  );

  const intervention = useMemo(
    () =>
      hydrated && presence.mode === "intervention"
        ? deriveFloatingIntelligence(
            mission,
            operatorName,
            profile.workspaceRole,
            focusedObject,
          )
        : null,
    [hydrated, presence.mode, mission, operatorName, profile.workspaceRole, focusedObject],
  );

  if (
    !hydrated ||
    !intervention ||
    !disclosure.showFloatingIntelligence ||
    presence.mode !== "intervention" ||
    pathname === "/"
  ) {
    return null;
  }

  const body = (
    <div className="space-y-0.5">
      <p>
        <span className="text-zinc-400">{t(`experienceEngineering.${intervention.observationKey}`)}</span>
        <span className="text-zinc-700"> · </span>
        <span className="text-zinc-500">
          {t("experienceEngineering.ambientReason")}: {t(`experienceEngineering.${intervention.reasonKey}`)}
        </span>
      </p>
      {intervention.requiresHumanJudgment ? (
        <p className="text-amber-500/80">{t("universalWorkspace.humanDecisionRequired")}</p>
      ) : null}
    </div>
  );

  return (
    <aside
      className="cbai-floating-intelligence shrink-0 border-b border-zinc-800/40 px-4 py-2 text-[11px] leading-relaxed sm:px-5"
      role="status"
      aria-live="polite"
      aria-label={t("universalWorkspace.floatingIntelligence")}
      data-cbai-operator-intervention="primary"
    >
      {intervention.suggestedActionHref ? (
        <Link href={intervention.suggestedActionHref} className="block hover:text-teal-300">
          {body}
          <span className="mt-1 inline-block text-teal-400/90">{t("universalWorkspace.suggestedAction")} →</span>
        </Link>
      ) : (
        body
      )}
    </aside>
  );
}
