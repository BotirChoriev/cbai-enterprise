"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import CBAILogo from "@/components/brand/CBAILogo";
import OperatorOrb from "@/components/shared/OperatorOrb";
import { useTranslation } from "@/lib/i18n/use-translation";

const SESSION_KEY = "cbai-system-awakening-shown";
const STAGE_MS = 280;
const TOTAL_MS = 1400;

const STAGES = ["stageIdentity", "stageContext", "stageMission", "stageEvidence", "stageOperator", "stageReady"] as const;

function isReducedMotion(): boolean {
  return (
    document.documentElement.classList.contains("cbai-reduced-motion") ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

let cachedShouldShow: boolean | null = null;

function getSnapshot(): boolean {
  if (cachedShouldShow === null) {
    cachedShouldShow = !window.sessionStorage.getItem(SESSION_KEY) && !isReducedMotion();
  }
  return cachedShouldShow;
}

function getServerSnapshot(): boolean {
  return false;
}

function subscribe(): () => void {
  return () => {};
}

type SystemAwakeningSequenceProps = {
  hasMission: boolean;
};

/**
 * Fast, meaningful startup — system awakening without fake percentages or AI theater.
 */
export default function SystemAwakeningSequence({ hasMission }: SystemAwakeningSequenceProps) {
  const { t } = useTranslation();
  const shouldShow = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [dismissed, setDismissed] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);
  const visible = shouldShow && !dismissed && !hasMission;

  useEffect(() => {
    if (!visible) return;
    window.sessionStorage.setItem(SESSION_KEY, "1");

    const timers: number[] = [];
    for (let i = 1; i < STAGES.length; i++) {
      timers.push(window.setTimeout(() => setStageIndex(i), STAGE_MS * i));
    }
    timers.push(window.setTimeout(() => setDismissed(true), TOTAL_MS));

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setDismissed(true);
    }
    document.addEventListener("keydown", onKey);

    return () => {
      timers.forEach((id) => window.clearTimeout(id));
      document.removeEventListener("keydown", onKey);
    };
  }, [visible]);

  if (!visible) return null;

  const stageKey = STAGES[stageIndex];
  const missionStage = stageKey === "stageMission" && hasMission;

  return (
    <button
      type="button"
      onClick={() => setDismissed(true)}
      aria-label={t("systemAwakening.skipAria")}
      className="cbai-entry-backdrop fixed inset-0 z-[100] flex flex-col items-center justify-center gap-5"
    >
      {stageIndex <= 1 ? (
        <CBAILogo size="md" showTagline />
      ) : (
        <OperatorOrb state="idle" size={48} />
      )}
      <p className="text-sm text-zinc-400">
        {missionStage ? t("systemAwakening.stageMission") : t(`systemAwakening.${stageKey}`)}
      </p>
      <p className="text-xs text-zinc-600">{t("systemAwakening.skipHint")}</p>
    </button>
  );
}
