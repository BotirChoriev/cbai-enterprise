"use client";

import { useTranslation } from "@/lib/i18n/use-translation";
import { cbaiMineralSurface, cbaiSectionEyebrow } from "@/components/brand/brand-classes";
import { deriveEvidencePulse } from "@/lib/intelligence-os/evidence-pulse";
import type { Mission } from "@/lib/intelligence-os/mission.types";
import type { EvidencePulseState } from "@/lib/intelligence-os/evidence-pulse";

const STATE_KEYS: Record<EvidencePulseState, keyof typeof import("@/lib/i18n/platform-copy-build011-en").EVIDENCE_PULSE_EN> = {
  available: "available",
  partial: "partial",
  missing: "missing",
  conflicting: "conflicting",
  outdated: "outdated",
  unverified: "unverified",
};

const STATE_RING: Record<EvidencePulseState, string> = {
  available: "border-emerald-500/50 shadow-[0_0_24px_-8px_rgba(16,185,129,0.35)]",
  partial: "border-amber-500/40",
  missing: "border-zinc-700/80",
  conflicting: "border-[var(--gold)]/50",
  outdated: "border-zinc-600/60",
  unverified: "border-teal-500/30",
};

export default function EvidencePulsePanel({ mission }: { mission: Mission | null }) {
  const { t } = useTranslation();
  const pulse = deriveEvidencePulse(mission);

  return (
    <section className={`${cbaiMineralSurface} flex gap-4 p-5`} aria-labelledby="evidence-pulse-heading">
      <div
        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 ${STATE_RING[pulse.state]}`}
        aria-hidden="true"
      >
        <span className="h-2 w-2 rounded-full bg-teal-400/80" />
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <p className={cbaiSectionEyebrow}>{t("evidencePulse.eyebrow")}</p>
        <h2 id="evidence-pulse-heading" className="text-sm font-medium text-zinc-200">
          {t(`evidencePulse.${STATE_KEYS[pulse.state]}`)} · {pulse.label}
        </h2>
        <p className="text-xs text-zinc-500">
          {t("evidencePulse.limitation")}: {pulse.limitation}
        </p>
      </div>
    </section>
  );
}
