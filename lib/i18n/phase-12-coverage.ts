/**
 * Phase 12 — Coverage status for i18n / mobile polish on new phase surfaces.
 */

export type Phase12CoverageStatus = "complete_stub" | "partial" | "planned";

export type Phase12CoverageEntry = {
  readonly id: string;
  readonly surface: string;
  readonly locales: readonly ("en" | "ru" | "uz" | "tr")[];
  readonly status: Phase12CoverageStatus;
  readonly notes: string;
};

export const PHASE_12_COVERAGE: readonly Phase12CoverageEntry[] = [
  {
    id: "modes-labels",
    surface: "User modes",
    locales: ["en", "ru", "uz", "tr"],
    status: "complete_stub",
    notes: "Stub labels in lib/i18n/phase-12-labels.ts; locale persistence already exists.",
  },
  {
    id: "evidence-labels",
    surface: "Evidence workspace",
    locales: ["en", "ru", "uz", "tr"],
    status: "complete_stub",
    notes: "Title/description stubs for EN/RU/UZ/TR.",
  },
  {
    id: "mission-labels",
    surface: "Mission engine",
    locales: ["en", "ru", "uz", "tr"],
    status: "complete_stub",
    notes: "Stage surface label stubs; full mission UI copy remains in existing dictionaries.",
  },
  {
    id: "billing-labels",
    surface: "Billing test mode",
    locales: ["en", "ru", "uz", "tr"],
    status: "complete_stub",
    notes: "Billing title + test-mode banner stubs.",
  },
  {
    id: "digital-twin-labels",
    surface: "Enterprise Digital Twin",
    locales: ["en", "ru", "uz", "tr"],
    status: "complete_stub",
    notes: "Digital twin title, description, and modules label stubs.",
  },
  {
    id: "mobile-nav",
    surface: "Mobile navigation",
    locales: ["en", "ru", "uz", "tr"],
    status: "complete_stub",
    notes: "MobileNavDrawer already exists; new pages use responsive classes + mobileNavNote stub.",
  },
  {
    id: "dictionary-wire-up",
    surface: "Full TranslationDictionary namespaces",
    locales: ["en", "ru", "uz", "tr"],
    status: "partial",
    notes: "Phase stubs live in phase-12-labels.ts; deep dictionary merge remains optional/planned.",
  },
] as const;

export function phase12LocalesCovered(): readonly ("en" | "ru" | "uz" | "tr")[] {
  return ["en", "ru", "uz", "tr"];
}

export function phase12CoverageSummary(): {
  readonly completeStub: number;
  readonly partial: number;
  readonly planned: number;
} {
  return {
    completeStub: PHASE_12_COVERAGE.filter((e) => e.status === "complete_stub").length,
    partial: PHASE_12_COVERAGE.filter((e) => e.status === "partial").length,
    planned: PHASE_12_COVERAGE.filter((e) => e.status === "planned").length,
  };
}
