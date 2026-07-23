/**
 * Phase 12 — Locale stubs for new phase surfaces (EN / RU / UZ / TR).
 * Additive labels; locale persistence already exists elsewhere.
 */

export type Phase12Locale = "en" | "ru" | "uz" | "tr";

export type Phase12LabelBundle = {
  readonly modesTitle: string;
  readonly modesDescription: string;
  readonly evidenceWorkspaceTitle: string;
  readonly evidenceWorkspaceDescription: string;
  readonly missionEngineTitle: string;
  readonly missionEngineDescription: string;
  readonly billingTitle: string;
  readonly billingTestModeBanner: string;
  readonly digitalTwinTitle: string;
  readonly digitalTwinDescription: string;
  readonly digitalTwinModules: string;
  readonly mobileNavNote: string;
};

export const PHASE_12_LABELS: Record<Phase12Locale, Phase12LabelBundle> = {
  en: {
    modesTitle: "User modes",
    modesDescription: "Personal preference for default surfaces — not organization RBAC.",
    evidenceWorkspaceTitle: "Evidence workspace",
    evidenceWorkspaceDescription: "Device-local evidence lifecycle — no fabricated live data.",
    missionEngineTitle: "Mission engine",
    missionEngineDescription: "Stage foundations for define through complete.",
    billingTitle: "Billing (test mode)",
    billingTestModeBanner: "TEST MODE ONLY — never charges a real payment method.",
    digitalTwinTitle: "Enterprise Digital Twin",
    digitalTwinDescription: "Organization registry — Not Connected / Planned until real sources exist.",
    digitalTwinModules: "Modules",
    mobileNavNote: "On small screens, use the mobile navigation drawer to reach this page.",
  },
  ru: {
    modesTitle: "Режимы пользователя",
    modesDescription: "Личные предпочтения интерфейса — не заменяют RBAC организации.",
    evidenceWorkspaceTitle: "Рабочее пространство доказательств",
    evidenceWorkspaceDescription: "Локальный жизненный цикл доказательств — без выдуманных данных.",
    missionEngineTitle: "Движок миссий",
    missionEngineDescription: "Основа этапов от определения до завершения.",
    billingTitle: "Биллинг (тестовый режим)",
    billingTestModeBanner: "ТОЛЬКО ТЕСТОВЫЙ РЕЖИМ — реальные платежи не списываются.",
    digitalTwinTitle: "Корпоративный цифровой двойник",
    digitalTwinDescription: "Реестр организации — Не подключено / Запланировано до реальных источников.",
    digitalTwinModules: "Модули",
    mobileNavNote: "На малых экранах откройте мобильную навигацию, чтобы перейти на эту страницу.",
  },
  uz: {
    modesTitle: "Foydalanuvchi rejimlari",
    modesDescription: "Interfeys uchun shaxsiy tanlov — tashkilot RBAC o‘rnini bosmaydi.",
    evidenceWorkspaceTitle: "Dalillar ish maydoni",
    evidenceWorkspaceDescription: "Qurilmada saqlanadigan dalil hayot sikli — uydirma jonli ma’lumot yo‘q.",
    missionEngineTitle: "Missiya mexanizmi",
    missionEngineDescription: "Aniqlashdan yakunlashgacha bosqich asoslari.",
    billingTitle: "Billing (test rejimi)",
    billingTestModeBanner: "FAQAT TEST REJIMI — haqiqiy to‘lovlar yechilmaydi.",
    digitalTwinTitle: "Korxona raqamli egizagi",
    digitalTwinDescription: "Tashkilot reyestri — haqiqiy manbalar bo‘lguncha Ulanmagan / Rejalashtirilgan.",
    digitalTwinModules: "Modullar",
    mobileNavNote: "Kichik ekranlarda bu sahifaga mobil navigatsiya orqali o‘ting.",
  },
  tr: {
    modesTitle: "Kullanıcı modları",
    modesDescription: "Varsayılan yüzeyler için kişisel tercih — kurum RBAC yerine geçmez.",
    evidenceWorkspaceTitle: "Kanıt çalışma alanı",
    evidenceWorkspaceDescription: "Cihaza yerel kanıt yaşam döngüsü — uydurma canlı veri yok.",
    missionEngineTitle: "Görev motoru",
    missionEngineDescription: "Tanımdan tamamlamaya aşama temelleri.",
    billingTitle: "Faturalama (test modu)",
    billingTestModeBanner: "YALNIZCA TEST MODU — gerçek ödeme alınmaz.",
    digitalTwinTitle: "Kurumsal dijital ikiz",
    digitalTwinDescription: "Kurum kaydı — gerçek kaynaklar bağlanana kadar Bağlı değil / Planlandı.",
    digitalTwinModules: "Modüller",
    mobileNavNote: "Küçük ekranlarda bu sayfaya mobil gezinme çekmecesinden ulaşın.",
  },
};

export function resolvePhase12Locale(languageCode: string): Phase12Locale {
  if (languageCode === "ru" || languageCode === "uz" || languageCode === "tr") {
    return languageCode;
  }
  return "en";
}

export function getPhase12Labels(locale: Phase12Locale): Phase12LabelBundle {
  return PHASE_12_LABELS[locale] ?? PHASE_12_LABELS.en;
}

export const PHASE_12_LABEL_KEYS: readonly (keyof Phase12LabelBundle)[] = [
  "modesTitle",
  "modesDescription",
  "evidenceWorkspaceTitle",
  "evidenceWorkspaceDescription",
  "missionEngineTitle",
  "missionEngineDescription",
  "billingTitle",
  "billingTestModeBanner",
  "digitalTwinTitle",
  "digitalTwinDescription",
  "digitalTwinModules",
  "mobileNavNote",
] as const;
