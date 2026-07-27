/**
 * Ready-made work example (Adaptive Intelligence Workspace, Phase 10).
 *
 * The manufacturing 24/7 continuous-operation acceptance example, generated
 * by the same Role-to-Workspace Engine as every real workspace. Every
 * unmeasured value is honestly "unknown" / "data required" — the example
 * fabricates no equipment models, no output numbers, no market figures.
 */

import { buildStarterWorkCard, type StarterWorkCard } from "@/lib/activation/starter-work-card";

const EXAMPLE_INTENT: Record<string, string> = {
  en: "I want this production technology to operate continuously for 24 hours.",
  uz: "Men ushbu ishlab chiqarish texnologiyasi kuniga 24 soat uzluksiz ishlashini xohlayman.",
  ru: "Я хочу, чтобы эта производственная технология работала непрерывно 24 часа в сутки.",
  tr: "Bu üretim teknolojisinin günde 24 saat kesintisiz çalışmasını istiyorum.",
};

export function manufacturingExampleIntent(locale: string): string {
  return EXAMPLE_INTENT[locale] ?? EXAMPLE_INTENT.en!;
}

/**
 * Builds the example Starter Work Card in memory. Nothing is persisted —
 * the example follows the same confirm-before-create rule as real work.
 */
export function buildManufacturingExample(locale: string): StarterWorkCard {
  return buildStarterWorkCard({
    text: manufacturingExampleIntent(locale),
    locale,
    source: "manual",
    route: "/",
    roleOverride: "manufacturer",
  });
}
