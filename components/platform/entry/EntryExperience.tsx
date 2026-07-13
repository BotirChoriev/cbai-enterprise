"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import CBAILogo, { CBAIMark } from "@/components/brand/CBAILogo";
import OperatorOrb from "@/components/shared/OperatorOrb";
import { useAssistantProfile } from "@/components/platform/context/AssistantProfileProvider";
import { useTranslation } from "@/lib/i18n/use-translation";

const SESSION_KEY = "cbai-entry-experience-shown";
const AUTO_DISMISS_MS = 1600;

function isReducedMotion(): boolean {
  return (
    document.documentElement.classList.contains("cbai-reduced-motion") ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

// Mirrors the useSyncExternalStore + cached-snapshot pattern already proven by
// AssistantProfileProvider — a real, browser-only, read-once decision ("has this session already
// shown the entry cinematic, and is reduced motion active right now"), computed on first read and
// cached, never a setState call inside a raw effect body.
let cachedShouldShow: boolean | null = null;

function computeShouldShow(): boolean {
  if (window.sessionStorage.getItem(SESSION_KEY)) return false;
  return !isReducedMotion();
}

function getSnapshot(): boolean {
  if (cachedShouldShow === null) {
    cachedShouldShow = computeShouldShow();
  }
  return cachedShouldShow;
}

function getServerSnapshot(): boolean {
  return false;
}

function subscribe(): () => void {
  return () => {};
}

/**
 * CBAI Entry Cinematic (Platform Activation mission, Mission 3) — a short, skippable, once-per-
 * session moment (logo → network glow → Operator → ready), never a blocker. Reduced-motion (either
 * the OS preference or the real saved accessibility setting) skips it entirely — no animation, no
 * delay, the homepage underneath renders immediately either way since this is an overlay, not a
 * gate. sessionStorage (not localStorage) is deliberate: a real "just entered this session" moment,
 * not a permanent flag that would need its own settings-page reset control.
 */
export default function EntryExperience() {
  const { isActive } = useAssistantProfile();
  const { t } = useTranslation();
  const shouldShow = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [dismissed, setDismissed] = useState(false);
  const visible = shouldShow && !dismissed;

  useEffect(() => {
    if (!visible) return;
    window.sessionStorage.setItem(SESSION_KEY, "1");

    const timer = window.setTimeout(() => setDismissed(true), AUTO_DISMISS_MS);
    function dismissOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setDismissed(true);
    }
    document.addEventListener("keydown", dismissOnEscape);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("keydown", dismissOnEscape);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => setDismissed(true)}
      aria-label="Skip entry animation"
      className="cbai-entry-backdrop fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 text-left"
    >
      <span className="cbai-entry-stage cbai-entry-stage-1">
        <CBAIMark size={64} standalone />
      </span>
      <span className="cbai-entry-stage cbai-entry-stage-2">
        <CBAILogo size="lg" showTagline />
      </span>
      <span className="cbai-entry-stage cbai-entry-stage-3">
        <OperatorOrb state="idle" size={56} />
      </span>
      <span className="cbai-entry-stage cbai-entry-stage-4 text-sm text-zinc-400">
        {isActive ? t("home.commandPlaceholder") : t("assistant.greetingSignedOut")}
      </span>
      <span className="cbai-entry-stage cbai-entry-stage-4 text-xs text-zinc-600">
        Tap anywhere or press Escape to skip
      </span>
    </button>
  );
}
